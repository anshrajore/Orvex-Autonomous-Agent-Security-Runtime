import type {
  Capability,
  ExecutionContext,
  Resource,
  RiskAssessment,
  RiskFactor,
  TrustZone,
} from '@anshrajore/orvex-core';
import { clampScore, riskLevelFromScore } from '@anshrajore/orvex-core';

export interface RiskInput {
  capability: Capability;
  resource: Resource;
  context: ExecutionContext;
  commandSemantics?: {
    remoteShell?: boolean;
    force?: boolean;
    destructive?: boolean;
    pipesToInterpreter?: boolean;
    privileged?: boolean;
    obfuscated?: boolean;
    nestedSubshells?: boolean;
    background?: boolean;
    dangerousNetworkTool?: boolean;
    reverseShell?: boolean;
    suspiciousScript?: boolean;
  };
  policyHint?: number;
  anomalyBoost?: number;
  promptInjection?: boolean | number;
  observe?: boolean;
}

const CAP_BASE: Record<string, number> = {
  'filesystem.read': 4,
  'filesystem.write': 12,
  'filesystem.create': 10,
  'filesystem.delete': 55,
  'process.execute': 22,
  'network.connect': 28,
  'network.listen': 40,
  'dns.resolve': 15,
  'secret.read': 90,
  'git.read': 8,
  'git.write': 45,
  'git.push': 61,
  'git.forcePush': 82,
  'mcp.call': 35,
  'browser.navigate': 30,
  'clipboard.read': 40,
  'clipboard.write': 25,
};

export class RiskEngine {
  private readonly secretReadSessions = new Set<string>();
  private readonly recentActions = new Map<string, Array<{ capability: Capability; at: number }>>();

  assess(input: RiskInput): RiskAssessment {
    const factors: RiskFactor[] = [];
    const add = (id: string, category: string, contribution: number, explanation: string) => {
      if (contribution === 0) return;
      factors.push({ id, category, contribution, explanation });
    };

    add(
      'action',
      'action',
      CAP_BASE[input.capability] ?? 20,
      `Capability ${input.capability} has a baseline risk contribution.`,
    );

    const cls = input.resource.classification;
    if (cls === 'SECRET') add('secret-resource', 'data', 70, 'Target is classified as a secret.');
    if (cls === 'CRITICAL') add('critical-resource', 'data', 40, 'Target is a critical resource.');
    if (cls === 'SYSTEM') add('system-resource', 'data', 50, 'Target is a system path.');
    if (cls === 'SENSITIVE') add('sensitive', 'data', 25, 'Target is outside the project tree.');

    const zone: TrustZone = input.context.provenance?.trustZone ?? 'TRUSTED';
    if (zone === 'UNTRUSTED') {
      add('untrusted-origin', 'trust', 25, 'Action originated from an untrusted source.');
    } else if (zone === 'SEMI_TRUSTED') {
      add('semi-trusted', 'trust', 10, 'Action originated from a semi-trusted source.');
    }

    const sem = input.commandSemantics;
    if (sem?.pipesToInterpreter || sem?.remoteShell) {
      add('remote-shell', 'command', 80, 'Command graph indicates remote code execution.');
    }
    if (sem?.destructive) add('destructive', 'command', 35, 'Command is destructive.');
    if (sem?.force) add('force', 'command', 20, 'Command uses a force flag.');
    if (sem?.privileged) add('privileged', 'command', 40, 'Command requests elevated privileges.');
    if (sem?.obfuscated) add('command-obfuscation', 'command', 34, 'Command uses quote or escape obfuscation.');
    if (sem?.nestedSubshells) add('nested-subshell', 'command', 30, 'Command contains nested subshell execution.');
    if (sem?.background) add('background-execution', 'command', 28, 'Command attempts background or detached execution.');
    if (sem?.dangerousNetworkTool) add('network-tool', 'command', 36, 'Command invokes a high-risk network tool.');
    if (sem?.reverseShell) add('reverse-shell', 'command', 85, 'Command resembles a reverse shell.');
    if (sem?.suspiciousScript) add('script-target', 'command', 45, 'Interpreter target script contains suspicious execution patterns.');

    if (input.promptInjection) {
      const promptContribution =
        typeof input.promptInjection === 'number'
          ? Math.min(70, Math.max(20, Math.round(input.promptInjection * 0.5)))
          : 35;
      add('prompt-injection', 'content', promptContribution, 'Prompt-injection signals were detected.');
    }
    if (input.anomalyBoost) {
      add(
        'baseline-anomaly',
        'behavior',
        input.anomalyBoost,
        'Action diverges from observed agent baseline.',
      );
    }
    if (typeof input.policyHint === 'number') {
      add('policy-hint', 'policy', Math.round(input.policyHint * 0.15), 'Policy engine risk hint.');
    }

    const host = input.resource.value;
    if (host.includes('169.254.169.254') || host.includes('metadata.google.internal')) {
      add('metadata', 'network', 90, 'Cloud metadata endpoint.');
    }

    const coOccurrenceBoost = this.contextualBoost(input);
    if (coOccurrenceBoost) {
      add(
        'secret-egress-cooccurrence',
        'behavior',
        coOccurrenceBoost,
        'Session read secret material before an outbound or executable action.',
      );
    }

    const frequencyBoost = this.frequencyBoost(input);
    if (frequencyBoost) {
      add(
        'bursty-anomaly',
        'behavior',
        frequencyBoost,
        'Action frequency spiked above the session baseline.',
      );
    }

    const multiplier = factors.some((f) => f.id === 'secret-egress-cooccurrence') ? 0.78 : 0.55;
    const score = clampScore(factors.reduce((sum, f) => sum + f.contribution, 0) * multiplier);
    const level = riskLevelFromScore(score);
    const explanation = factors
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 4)
      .map((f) => f.explanation)
      .join(' ');

    if (input.observe !== false) this.observe(input);
    return { score, level, factors, explanation };
  }

  private contextualBoost(input: RiskInput): number {
    const sessionId = input.context.sessionId;
    if (!this.secretReadSessions.has(sessionId)) return 0;
    if (input.capability === 'network.connect' || input.capability === 'dns.resolve') return 90;
    if (input.capability === 'process.execute') return 78;
    return 0;
  }

  private frequencyBoost(input: RiskInput): number {
    const now = Date.now();
    const sessionId = input.context.sessionId;
    const recent = (this.recentActions.get(sessionId) ?? []).filter((event) => now - event.at <= 10_000);
    const sameCapability = recent.filter((event) => event.capability === input.capability).length;
    if ((input.capability === 'filesystem.read' || input.capability === 'process.execute') && sameCapability >= 12) {
      return 36;
    }
    if (sameCapability >= 20) return 24;
    return 0;
  }

  observe(input: RiskInput): void {
    const sessionId = input.context.sessionId;
    const now = Date.now();
    const recent = (this.recentActions.get(sessionId) ?? []).filter((event) => now - event.at <= 10_000);
    recent.push({ capability: input.capability, at: now });
    this.recentActions.set(sessionId, recent);
    if (
      input.capability === 'secret.read' ||
      input.resource.classification === 'SECRET' ||
      /\.env(?:\.|$|\/|\\)|id_rsa|id_ed25519|secret/i.test(input.resource.value)
    ) {
      this.secretReadSessions.add(sessionId);
    }
  }
}

export class BehaviorBaseline {
  private readonly counts = new Map<string, number>();

  observe(capability: Capability, resourcePrefix: string): void {
    const key = `${capability}:${resourcePrefix}`;
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
  }

  anomalyBoost(capability: Capability, resourcePrefix: string): number {
    if (this.counts.size < 8) return 0;
    const key = `${capability}:${resourcePrefix}`;
    if (this.counts.has(key)) return 0;
    if (capability === 'secret.read' || resourcePrefix.includes('.ssh')) return 31;
    if (capability.startsWith('git.') || capability === 'network.connect') return 12;
    return 8;
  }
}
