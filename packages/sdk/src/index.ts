import { loadPolicy, PolicyEngine } from '@orvex/policy';
import { RiskEngine } from '@orvex/risk';
import { AuditLogger } from '@orvex/audit';
import { OrvexRuntime } from '@orvex/runtime';

export { PolicyEngine, RiskEngine, AuditLogger, OrvexRuntime };

export interface OrvexStartOptions {
  policy?: string;
  cwd?: string;
  agentId?: string;
}

export class Orvex {
  constructor(private readonly options: OrvexStartOptions = {}) {}

  async start(): Promise<OrvexRuntime> {
    const cwd = this.options.cwd ?? process.cwd();
    const loaded = loadPolicy({ cwd });
    return new OrvexRuntime({
      policy: loaded.engine,
      cwd,
      agentId: this.options.agentId ?? 'sdk',
      profile: loaded.document.profile,
      approvalMode: 'balanced',
      interactive: false,
    });
  }
}
