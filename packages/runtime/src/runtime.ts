// Advanced AI firewall runtime context orchestration
import type {
  ApprovalMode,
  AuditEvent,
  Capability,
  CapabilityGrant,
  Decision,
  ExecutionContext,
  Resource,
  SecurityEvent,
  SecurityProfile,
  Session,
  SessionStatistics,
} from '@anshrajore/orvex-core';
import {
  classifyPath,
  filterEnvironment,
  generateId,
  nowIso,
  sha256,
  SECURITY_EVENT_TYPES,
  type SecurityEventType,
} from '@anshrajore/orvex-core';
import { AuditLogger } from '@anshrajore/orvex-audit';
import { PromptInjectionDetector, Redactor } from '@anshrajore/orvex-detectors';
import { analyzeGitArgs } from '@anshrajore/orvex-git';
import { inspectMcpCall, type McpCall } from '@anshrajore/orvex-mcp';
import { PolicyEngine, type PolicyRequest } from '@anshrajore/orvex-policy';
import { BehaviorBaseline, RiskEngine } from '@anshrajore/orvex-risk';
import { selectProvider, type Sandbox, type SandboxProvider } from '@anshrajore/orvex-sandbox';
import { ApprovalEngine } from './approval.js';
import { isDangerousRm, parseCommand } from './command.js';
import { combineDecision, type EvaluatedAction } from './decision.js';
import { CheckpointStore } from './checkpoint.js';
import { isSensitiveDestination } from './network.js';

export interface OrvexOptions {
  policy: PolicyEngine;
  cwd: string;
  agentId: string;
  profile: SecurityProfile;
  approvalMode: ApprovalMode;
  dryRun?: boolean;
  interactive?: boolean;
  preserveAsk?: boolean;
  envPolicy?: { allow?: string[]; deny?: string[] };
}

export class OrvexRuntime {
  readonly session: Session;
  readonly context: ExecutionContext;
  readonly grants: CapabilityGrant[] = [];
  private readonly audit = new AuditLogger();
  private readonly risk = new RiskEngine();
  private readonly baseline = new BehaviorBaseline();
  private readonly injection = new PromptInjectionDetector();
  private readonly redactor = new Redactor();
  private readonly approval: ApprovalEngine;
  private readonly checkpoints = new CheckpointStore();
  private sandboxProvider?: SandboxProvider;
  private sandbox?: Sandbox;
  private readonly listeners = new Set<(event: AuditEvent) => void>();

  constructor(private readonly options: OrvexOptions) {
    const id = generateId('ses');
    this.session = {
      id,
      agentId: options.agentId,
      startedAt: nowIso(),
      profile: options.profile,
      riskScore: 0,
      cwd: options.cwd,
      statistics: emptyStats(),
    };
    this.context = {
      cwd: options.cwd,
      sessionId: id,
      agentId: options.agentId,
      profile: options.profile,
      dryRun: Boolean(options.dryRun),
      approvalMode: options.approvalMode,
      env: filterEnvironment(process.env, options.envPolicy),
    };
    this.approval = new ApprovalEngine(
      options.profile === 'ci' ? 'strict' : options.approvalMode,
    );
    this.record('SESSION_START', 'process.execute', { kind: 'other', value: options.agentId }, {
      decision: 'allow',
      reason: 'Session started.',
      matchedRules: [],
      riskScore: 0,
    });
  }

  onEvent(listener: (event: AuditEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async initSandbox(): Promise<SandboxProvider> {
    this.sandboxProvider = await selectProvider();
    this.sandbox = await this.sandboxProvider.create({
      cwd: this.options.cwd,
      env: this.context.env,
      readPaths: [this.options.cwd],
      writePaths: [this.options.cwd],
      networkAllow: this.options.policy.documentSnapshot().network.allow ?? [],
    });
    return this.sandboxProvider;
  }

  filteredEnv(): Record<string, string> {
    return { ...this.context.env, ORVEX_SESSION: this.session.id };
  }

  async evaluate(request: PolicyRequest): Promise<EvaluatedAction> {
    const policy = this.options.policy.evaluate(request);
    const prefix = request.resource.value.split(/[\\/]/).slice(0, 2).join('/');
    const anomalyBoost = this.baseline.anomalyBoost(request.action.capability, prefix);
    const graph =
      request.action.capability === 'process.execute'
        ? parseCommand(request.resource.value)
        : undefined;
    if (graph) {
      // Diagnostic log for advanced firewall parsing
      // console.log(`[FIREWALL] Tokenized: ${graph.raw} | Obfuscated: ${graph.obfuscated}`);
    }
    const risk = this.risk.assess({
      capability: request.action.capability,
      resource: request.resource,
      context: request.context,
      commandSemantics: graph
        ? {
            remoteShell: graph.remoteShell,
            force: graph.force,
            destructive: graph.destructive || (graph ? isDangerousRm(graph) : false),
            pipesToInterpreter: graph.pipesToInterpreter,
            privileged: graph.privileged,
          }
        : undefined,
      policyHint: policy.riskScore,
      anomalyBoost,
      promptInjection: request.context.provenance?.trustZone === 'UNTRUSTED' && policy.riskScore > 40,
    });
    let evaluated = combineDecision(policy, risk);
    if (graph?.remoteShell || (graph && isDangerousRm(graph))) {
      evaluated = {
        ...evaluated,
        decision: 'deny',
        sideEffectAllowed: false,
        reason: graph.remoteShell
          ? 'Remote code execution via piped interpreter is blocked.'
          : 'Recursive delete of a dangerous target is blocked.',
      };
    }
    if (this.approval.hasSessionGrant(request.action.capability, request.resource.value)) {
      evaluated = { ...evaluated, decision: 'allow', sideEffectAllowed: true, reason: 'Session grant.' };
    }
    if (evaluated.decision === 'ask') {
      if (this.options.preserveAsk) {
        evaluated = { ...evaluated, sideEffectAllowed: false };
      } else if (this.options.profile === 'ci' || this.options.approvalMode === 'strict' || !this.options.interactive) {
        const mapped = this.approval.resolveNonInteractive(evaluated);
        evaluated = {
          ...evaluated,
          decision: mapped,
          sideEffectAllowed: mapped === 'allow',
          reason: mapped === 'deny' ? `${evaluated.reason} Approval denied in non-interactive mode.` : evaluated.reason,
        };
      } else {
        const choice = await this.approval.prompt(
          {
            agent: this.options.agentId,
            action: request.action.capability,
            resource: request.resource.value,
            riskLabel: `${risk.level.toUpperCase()} — ${risk.score}/100`,
            reason: evaluated.reason,
          },
          true,
        );
        if (choice === 'deny') {
          evaluated = { ...evaluated, decision: 'deny', sideEffectAllowed: false, reason: 'Human denied the action.' };
        } else {
          if (choice === 'session') {
            this.approval.grantSession(request.action.capability, request.resource.value);
            this.grants.push({
              id: generateId('cap'),
              agentId: this.options.agentId,
              capability: request.action.capability,
              scope: request.resource.value,
              issuedAt: nowIso(),
              source: 'human',
            });
          }
          evaluated = { ...evaluated, decision: 'allow', sideEffectAllowed: true, reason: 'Human approved.' };
        }
      }
    }
    if (this.options.dryRun && evaluated.decision === 'allow') {
      evaluated = { ...evaluated, sideEffectAllowed: false, reason: `${evaluated.reason} Dry-run: not executed.` };
    }
    this.baseline.observe(request.action.capability, prefix);
    const eventType: SecurityEventType = SECURITY_EVENT_TYPES.includes(
      request.action.type as SecurityEventType,
    )
      ? (request.action.type as SecurityEventType)
      : 'POLICY_DECISION';
    this.record(eventType, request.action.capability, request.resource, {
      ...policy,
      decision: evaluated.decision,
      reason: evaluated.reason,
      riskScore: risk.score,
    }, risk);
    return evaluated;
  }

  async evaluateFile(verb: 'read' | 'write' | 'create' | 'delete', filePath: string): Promise<EvaluatedAction> {
    const absHint = filePath;
    const resource: Resource = {
      kind: 'file',
      value: absHint,
      classification: classifyPath(filePath, this.options.cwd),
    };
    const capability = `filesystem.${verb}` as Capability;
    return this.evaluate({
      actor: { id: this.options.agentId, kind: 'agent' },
      action: {
        type: verb === 'read' ? 'FILE_READ' : verb === 'delete' ? 'FILE_DELETE' : 'FILE_WRITE',
        capability,
        verb,
      },
      resource,
      context: this.context,
    });
  }

  async evaluateCommand(command: string): Promise<EvaluatedAction> {
    const graph = parseCommand(command);
    const binary = graph.nodes[0]?.binary ?? command;
    if (binary === 'git' || binary.endsWith('/git')) {
      const analysis = analyzeGitArgs(graph.nodes[0]?.args ?? []);
      return this.evaluate({
        actor: { id: this.options.agentId, kind: 'agent' },
        action: { type: analysis.capability === 'git.push' || analysis.capability === 'git.forcePush' ? 'GIT_PUSH' : 'GIT_WRITE', capability: analysis.capability, verb: 'git' },
        resource: { kind: 'git', value: analysis.branch ?? analysis.summary },
        context: this.context,
      });
    }
    for (const node of graph.nodes) {
      const segmentPolicy = this.options.policy.evaluate({
        actor: { id: this.options.agentId, kind: 'agent' },
        action: { type: 'PROCESS_EXEC', capability: 'process.execute', verb: 'exec' },
        resource: { kind: 'command', value: node.binary },
        context: this.context,
      });
      if (segmentPolicy.decision === 'deny') {
        const evaluated = await this.evaluate({
          actor: { id: this.options.agentId, kind: 'agent' },
          action: { type: 'PROCESS_EXEC', capability: 'process.execute', verb: 'exec' },
          resource: { kind: 'command', value: command },
          context: this.context,
        });
        return {
          ...evaluated,
          decision: 'deny',
          sideEffectAllowed: false,
          reason: `Command segment ${node.binary} is denied: ${segmentPolicy.reason}`,
        };
      }
    }
    return this.evaluate({
      actor: { id: this.options.agentId, kind: 'agent' },
      action: { type: 'PROCESS_EXEC', capability: 'process.execute', verb: 'exec' },
      resource: { kind: 'command', value: command },
      context: this.context,
    });
  }

  sandboxInstance(): Sandbox | undefined {
    return this.sandbox;
  }

  async evaluateNetwork(host: string): Promise<EvaluatedAction> {
    if (isSensitiveDestination(host)) {
      const resource: Resource = { kind: 'host', value: host, classification: 'CRITICAL' };
      return this.evaluate({
        actor: { id: this.options.agentId, kind: 'agent' },
        action: { type: 'NETWORK_CONNECT', capability: 'network.connect', verb: 'connect' },
        resource,
        context: this.context,
      });
    }
    return this.evaluate({
      actor: { id: this.options.agentId, kind: 'agent' },
      action: { type: 'NETWORK_CONNECT', capability: 'network.connect', verb: 'connect' },
      resource: { kind: 'host', value: host },
      context: this.context,
    });
  }

  async evaluateMcp(call: McpCall): Promise<EvaluatedAction> {
    const trust = this.options.policy.documentSnapshot().mcp.servers?.[call.server]?.trust ?? 'unknown';
    const inspected = inspectMcpCall(call, this.options.cwd, trust);
    if (inspected.resourcePath) {
      const fileDecision = await this.evaluateFile('read', inspected.resourcePath);
      if (fileDecision.decision === 'deny') return fileDecision;
    }
    return this.evaluate({
      actor: { id: this.options.agentId, kind: 'agent' },
      action: { type: 'MCP_CALL', capability: 'mcp.call', verb: call.tool },
      resource: { kind: 'mcp', value: `${call.server}/${call.tool}` },
      context: this.context,
    });
  }

  scanUntrustedText(text: string, label: string): { escalate: boolean; score: number } {
    const result = this.injection.scan(text, 'UNTRUSTED');
    if (result.escalate) {
      this.record(
        'PROMPT_INJECTION_DETECTED',
        'mcp.call',
        { kind: 'other', value: label },
        {
          decision: 'ask',
          reason: `Untrusted document attempted to instruct the agent. ${result.signals.map((s) => s.explanation).join(' ')}`,
          matchedRules: [{ id: 'prompt-injection', effect: 'ask', priority: 60 }],
          riskScore: result.score,
        },
      );
    }
    return { escalate: result.escalate, score: result.score };
  }

  createCheckpoint(label = 'auto'): { id: string; files: number; hash: string } {
    const result = this.checkpoints.create(this.session.id, this.options.cwd, label);
    this.record('CHECKPOINT_CREATED', 'filesystem.write', { kind: 'other', value: result.id }, {
      decision: 'allow',
      reason: `Checkpoint ${label}`,
      matchedRules: [],
      riskScore: 0,
    });
    return result;
  }

  rollback(checkpointId?: string): { ok: boolean; reason: string } {
    const result = this.checkpoints.rollback(this.session.id, this.options.cwd, checkpointId);
    this.record('ROLLBACK_EXECUTED', 'filesystem.write', { kind: 'other', value: checkpointId ?? 'latest' }, {
      decision: result.ok ? 'allow' : 'deny',
      reason: result.reason,
      matchedRules: [],
      riskScore: 20,
    });
    return result;
  }

  end(): void {
    this.session.endedAt = nowIso();
    this.audit.writeSession(this.session);
    this.record('SESSION_END', 'process.execute', { kind: 'other', value: this.session.id }, {
      decision: 'allow',
      reason: 'Session ended.',
      matchedRules: [],
      riskScore: this.session.riskScore,
    });
  }

  redact(text: string): string {
    return this.redactor.redact(text).text;
  }

  private record(
    type: SecurityEvent['type'],
    capability: Capability,
    resource: Resource,
    policy: { decision: Decision; reason: string; matchedRules: AuditEvent['reason'] extends string ? unknown[] : never; riskScore: number } & {
      decision: Decision;
      reason: string;
      matchedRules: { id: string; effect: Decision; priority: number }[];
      riskScore: number;
    },
    risk = this.risk.assess({
      capability,
      resource,
      context: this.context,
      policyHint: policy.riskScore,
    }),
  ): void {
    const event: AuditEvent = {
      id: generateId('evt'),
      timestamp: nowIso(),
      sessionId: this.session.id,
      agentId: this.session.agentId,
      action: type,
      resource: resource.value,
      decision: policy.decision,
      risk,
      reason: this.redact(policy.reason),
    };
    this.audit.append(event);
    this.session.riskScore = Math.max(this.session.riskScore, risk.score);
    bumpStats(this.session.statistics, event);
    this.audit.writeSession(this.session);
    for (const listener of this.listeners) listener(event);
    void sha256(event.id);
  }
}

function emptyStats(): SessionStatistics {
  return {
    allowed: 0,
    denied: 0,
    asked: 0,
    filesRead: 0,
    filesWritten: 0,
    commands: 0,
    network: 0,
    secretsBlocked: 0,
    mcpCalls: 0,
  };
}

function bumpStats(stats: SessionStatistics, event: AuditEvent): void {
  if (event.decision === 'allow') stats.allowed += 1;
  if (event.decision === 'deny') stats.denied += 1;
  if (event.decision === 'ask') stats.asked += 1;
  if (event.action.startsWith('FILE_READ')) stats.filesRead += 1;
  if (event.action.startsWith('FILE_WRITE') || event.action === 'FILE_CREATE') stats.filesWritten += 1;
  if (event.action === 'PROCESS_EXEC') stats.commands += 1;
  if (event.action.startsWith('NETWORK')) stats.network += 1;
  if (event.action.includes('SECRET') && event.decision === 'deny') stats.secretsBlocked += 1;
  if (event.action.startsWith('MCP')) stats.mcpCalls += 1;
}
