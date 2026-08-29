import type {
  Actor,
  Capability,
  Decision,
  ExecutionContext,
  PolicyDecision,
  Resource,
  Action,
  Rule,
} from '@anshrajore/orvex-core';
import { classifyPath, isProtectedSecretPath, resolvePathForPolicy, sha256 } from '@anshrajore/orvex-core';
import type { PolicyDocument } from './schema.js';
import { hostMatches, pathMatches } from './matchers.js';
import { profileAskBecomesDeny } from './profiles.js';
import { minimatch } from 'minimatch';

export interface PolicyRequest {
  actor: Actor;
  action: Action;
  resource: Resource;
  context: ExecutionContext;
}

export class PolicyEngine {
  constructor(
    private readonly document: PolicyDocument,
    private readonly compiledHash: string,
  ) {}

  hash(): string {
    return this.compiledHash;
  }

  documentSnapshot(): PolicyDocument {
    return this.document;
  }

  evaluate(request: PolicyRequest): PolicyDecision {
    const { action, resource, context } = request;
    const cap = action.capability;
    const rules: Rule[] = [];

    if (cap.startsWith('filesystem.')) {
      return this.evaluateFilesystem(cap, resource, context, rules);
    }
    if (cap === 'process.execute') {
      return this.evaluateProcess(resource, context, rules);
    }
    if (cap === 'network.connect' || cap === 'network.listen' || cap === 'dns.resolve') {
      return this.evaluateNetwork(resource, context, rules);
    }
    if (cap === 'secret.read') {
      return this.finish('deny', 'Secrets are denied by default.', 90, rules, context, {
        id: 'secrets.default-deny',
        effect: 'deny',
        priority: 100,
        capability: cap,
      });
    }
    if (cap.startsWith('git.')) {
      return this.evaluateGit(cap, resource, context, rules);
    }
    if (cap === 'mcp.call') {
      return this.evaluateMcp(resource, context, rules);
    }
    return this.finish('deny', 'No capability grant matched this action.', 50, rules, context, {
      id: 'default.deny',
      effect: 'deny',
      priority: 0,
    });
  }

  private evaluateFilesystem(
    cap: Capability,
    resource: Resource,
    context: ExecutionContext,
    rules: Rule[],
  ): PolicyDecision {
    const raw = resource.value;
    if (raw.includes('\0')) {
      return this.finish('deny', 'NUL-byte paths are invalid and blocked.', 90, rules, context, {
        id: 'filesystem.invalid-path',
        effect: 'deny',
        priority: 150,
        capability: cap,
      });
    }
    const abs = resolvePathForPolicy(raw, context.cwd);
    const classification = classifyPath(abs, context.cwd);
    resource.classification = classification;

    if (isProtectedSecretPath(abs, context.cwd) || classification === 'SECRET') {
      return this.finish(
        'deny',
        'Private credentials and secret files are protected resources.',
        95,
        rules,
        context,
        { id: 'secrets.default-deny', effect: 'deny', priority: 200, capability: cap },
      );
    }

    const op = cap.split('.')[1] ?? 'read';
    const fs = this.document.filesystem;
    const section =
      op === 'read' ? fs.read : op === 'write' || op === 'create' ? fs.write : fs.delete;

    const denyList = section?.deny ?? [];
    for (const pattern of denyList) {
      if (pathMatches(pattern, abs, context.cwd)) {
        return this.finish('deny', `Path matches deny rule ${pattern}.`, 70, rules, context, {
          id: `filesystem.${op}.deny`,
          effect: 'deny',
          priority: 80,
          capability: cap,
        });
      }
    }

    const allowList = section?.allow ?? [];
    for (const pattern of allowList) {
      if (pathMatches(pattern, abs, context.cwd)) {
        if (op === 'delete' && (classification === 'CRITICAL' || /important$/i.test(abs))) {
          return this.finish(
            'deny',
            'Destructive delete of a protected project file is blocked.',
            90,
            rules,
            context,
            { id: 'filesystem.delete.protected', effect: 'deny', priority: 90, capability: cap },
          );
        }
        return this.finish('allow', `Path matches allow rule ${pattern}.`, 10, rules, context, {
          id: `filesystem.${op}.allow`,
          effect: 'allow',
          priority: 50,
          capability: cap,
        });
      }
    }

    const fallback: Decision =
      op === 'delete'
        ? (fs.delete?.default ?? fs.default ?? 'deny')
        : (fs.default ?? 'deny');
    return this.finish(
      fallback,
      `Filesystem ${op} default policy is ${fallback}.`,
      fallback === 'allow' ? 12 : 55,
      rules,
      context,
      { id: `filesystem.${op}.default`, effect: fallback, priority: 1, capability: cap },
    );
  }

  private evaluateProcess(
    resource: Resource,
    context: ExecutionContext,
    rules: Rule[],
  ): PolicyDecision {
    const binary = executableFromCommand(resource.value);
    const base = binary.split(/[\\/]/).pop()?.toLowerCase() ?? binary.toLowerCase();
    const proc = this.document.process;
    if (proc.deny?.some((name) => name.toLowerCase() === base)) {
      return this.finish('deny', `Process ${base} is explicitly denied.`, 70, rules, context, {
        id: 'process.deny',
        effect: 'deny',
        priority: 80,
        capability: 'process.execute',
      });
    }
    if (proc.allow?.some((name) => name.toLowerCase() === base)) {
      return this.finish('allow', `Process ${base} is on the allow list.`, 20, rules, context, {
        id: 'process.allow',
        effect: 'allow',
        priority: 50,
        capability: 'process.execute',
      });
    }
    const fallback = proc.default ?? 'deny';
    return this.finish(
      fallback,
      `Process default policy is ${fallback}.`,
      40,
      rules,
      context,
      { id: 'process.default', effect: fallback, priority: 1, capability: 'process.execute' },
    );
  }

  private evaluateNetwork(
    resource: Resource,
    context: ExecutionContext,
    rules: Rule[],
  ): PolicyDecision {
    const net = this.document.network;
    const value = resource.value;
    const host = value.replace(/^[a-z]+:\/\//, '').split('/')[0] ?? value;
    const [hostname, portRaw] = host.split(':');
    const port = portRaw ? Number(portRaw) : 443;
    const hn = hostname ?? host;

    if (
      hn === '169.254.169.254' ||
      hn === 'metadata.google.internal' ||
      hn.endsWith('.internal')
    ) {
      return this.finish(
        'deny',
        'Cloud metadata and internal endpoints are blocked.',
        100,
        rules,
        context,
        { id: 'network.metadata', effect: 'deny', priority: 200, capability: 'network.connect' },
      );
    }

    for (const rule of net.deny ?? []) {
      if (hostMatches(rule, hn, port)) {
        return this.finish('deny', `Host matches deny rule ${rule}.`, 80, rules, context, {
          id: 'network.deny',
          effect: 'deny',
          priority: 80,
          capability: 'network.connect',
        });
      }
    }
    for (const rule of net.allow ?? []) {
      if (hostMatches(rule, hn, port)) {
        return this.finish('allow', `Host matches allow rule ${rule}.`, 18, rules, context, {
          id: 'network.allow',
          effect: 'allow',
          priority: 50,
          capability: 'network.connect',
        });
      }
    }
    const fallback = net.default ?? 'deny';
    return this.finish(
      fallback,
      `Network default policy is ${fallback}.`,
      fallback === 'allow' ? 25 : 70,
      rules,
      context,
      { id: 'network.default', effect: fallback, priority: 1, capability: 'network.connect' },
    );
  }

  private evaluateGit(
    cap: Capability,
    resource: Resource,
    context: ExecutionContext,
    rules: Rule[],
  ): PolicyDecision {
    const protectedBranches = this.document.git.protectedBranches ?? ['main', 'production'];
    const target = resource.value;
    if (cap === 'git.forcePush' || cap === 'git.push') {
      if (protectedBranches.some((b) => target.includes(b))) {
        return this.finish(
          'ask',
          'Protected branch requires human approval.',
          78,
          rules,
          context,
          { id: 'git.protected-branch', effect: 'ask', priority: 90, capability: cap },
        );
      }
      return this.finish('ask', 'Git push requires human approval by default.', 61, rules, context, {
        id: 'git.push.ask',
        effect: 'ask',
        priority: 40,
        capability: cap,
      });
    }
    if (cap === 'git.write') {
      return this.finish('ask', 'Destructive git writes require approval.', 70, rules, context, {
        id: 'git.write.ask',
        effect: 'ask',
        priority: 40,
        capability: cap,
      });
    }
    return this.finish('allow', 'Git read is allowed.', 8, rules, context, {
      id: 'git.read.allow',
      effect: 'allow',
      priority: 10,
      capability: cap,
    });
  }

  private evaluateMcp(
    resource: Resource,
    context: ExecutionContext,
    rules: Rule[],
  ): PolicyDecision {
    const [server, tool = ''] = resource.value.split('/', 2);
    const trust = this.document.mcp.servers?.[server]?.trust;
    const serverPolicy = this.document.mcp.servers?.[server];
    if (serverPolicy?.denyTools?.some((pattern) => minimatch(tool, pattern, { nocase: true }))) {
      return this.finish('deny', `MCP tool ${server}.${tool} is explicitly denied.`, 90, rules, context, {
        id: 'mcp.tool-deny', effect: 'deny', priority: 100, capability: 'mcp.call',
      });
    }
    if (serverPolicy?.allowTools && !serverPolicy.allowTools.some((pattern) => minimatch(tool, pattern, { nocase: true }))) {
      return this.finish('deny', `MCP tool ${server}.${tool} is outside the server allowlist.`, 85, rules, context, {
        id: 'mcp.tool-not-allowed', effect: 'deny', priority: 95, capability: 'mcp.call',
      });
    }
    if (trust === 'blocked' || !trust) {
      const fallback = this.document.mcp.default ?? 'deny';
      return this.finish(
        fallback === 'allow' && !trust ? 'deny' : fallback,
        trust === 'blocked'
          ? `MCP server ${server} is blocked.`
          : `Unknown MCP server ${server} is not trusted.`,
        85,
        rules,
        context,
        { id: 'mcp.untrusted', effect: 'deny', priority: 80, capability: 'mcp.call' },
      );
    }
    if (trust === 'restricted') {
      return this.finish('ask', `MCP server ${server} is restricted.`, 55, rules, context, {
        id: 'mcp.restricted',
        effect: 'ask',
        priority: 40,
        capability: 'mcp.call',
      });
    }
    return this.finish('allow', `MCP server ${server} trust is ${trust}.`, 20, rules, context, {
      id: 'mcp.allow',
      effect: 'allow',
      priority: 30,
      capability: 'mcp.call',
    });
  }

  private finish(
    decision: Decision,
    reason: string,
    riskScore: number,
    rules: Rule[],
    context: ExecutionContext,
    rule: Rule,
  ): PolicyDecision {
    rules.push(rule);
    const mapped = profileAskBecomesDeny(context.profile, decision);
    return {
      decision: mapped,
      reason,
      matchedRules: rules,
      riskScore,
    };
  }
}

export function policyHash(document: PolicyDocument): string {
  return sha256(JSON.stringify(document));
}

function executableFromCommand(command: string): string {
  const tokens = command.trim().split(/\s+/);
  return tokens.find((token) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) ?? command;
}
