import type {
  Capability,
  ExecutionContext,
  Resource,
  RiskAssessment,
  RiskFactor,
  TrustZone,
} from '@orvex/core';
import { clampScore, riskLevelFromScore } from '@orvex/core';

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
  };
  policyHint?: number;
  anomalyBoost?: number;
  promptInjection?: boolean;
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

    if (input.promptInjection) {
      add('prompt-injection', 'content', 35, 'Prompt-injection signals were detected.');
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

    const score = clampScore(factors.reduce((sum, f) => sum + f.contribution, 0) * 0.55);
    const level = riskLevelFromScore(score);
    const explanation = factors
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 4)
      .map((f) => f.explanation)
      .join(' ');

    return { score, level, factors, explanation };
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
