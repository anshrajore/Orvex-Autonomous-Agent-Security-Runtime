import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { ApprovalMode, Decision } from '@anshrajore/orvex-core';
import type { EvaluatedAction } from './decision.js';

export type ApprovalChoice = 'deny' | 'once' | 'session';

export interface ApprovalPrompt {
  agent: string;
  action: string;
  resource: string;
  riskLabel: string;
  reason: string;
}

export class ApprovalEngine {
  private readonly sessionAllows = new Set<string>();

  constructor(private readonly mode: ApprovalMode) {}

  key(action: string, resource: string): string {
    return `${action}::${resource}`;
  }

  grantSession(action: string, resource: string): void {
    this.sessionAllows.add(this.key(action, resource));
  }

  hasSessionGrant(action: string, resource: string): boolean {
    return this.sessionAllows.has(this.key(action, resource));
  }

  resolveNonInteractive(evaluated: EvaluatedAction): Decision {
    if (evaluated.decision !== 'ask') return evaluated.decision;
    if (this.mode === 'auto') return 'allow';
    return 'deny';
  }

  async prompt(data: ApprovalPrompt, interactive: boolean): Promise<ApprovalChoice> {
    if (!interactive) return 'deny';
    const box = [
      '╭──────────────────────────────────────────╮',
      '│              ORVEX APPROVAL              │',
      '├──────────────────────────────────────────┤',
      `│ Agent: ${pad(data.agent)}`,
      `│ Action: ${pad(data.action)}`,
      `│ Target: ${pad(data.resource)}`,
      `│ Risk: ${pad(data.riskLabel)}`,
      `│ Reason: ${pad(data.reason)}`,
      '│                                          │',
      '│ [Deny] [Allow Once] [Allow Session]      │',
      '╰──────────────────────────────────────────╯',
    ].join('\n');
    output.write(`${box}\n`);
    const rl = createInterface({ input, output });
    try {
      const answer = (await rl.question('Choice [deny|once|session]: ')).trim().toLowerCase();
      if (answer === 'once' || answer === 'allow' || answer === 'y') return 'once';
      if (answer === 'session') return 'session';
      return 'deny';
    } finally {
      rl.close();
    }
  }
}

function pad(value: string): string {
  return (value.length > 34 ? `${value.slice(0, 31)}...` : value).padEnd(33) + '│';
}

export function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

export function writeShim(shimDir: string, name: string, runtimeEntry: string): void {
  ensureDir(shimDir);
  const file = path.join(shimDir, name);
  fs.writeFileSync(
    file,
    `#!/bin/sh
exec node ${JSON.stringify(runtimeEntry)} shim ${JSON.stringify(name)} -- "$@"
`,
  );
  fs.chmodSync(file, 0o755);
}
