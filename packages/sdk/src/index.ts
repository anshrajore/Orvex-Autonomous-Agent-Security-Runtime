import { loadPolicy, PolicyEngine } from '@anshrajore/orvex-policy';
import { RiskEngine } from '@anshrajore/orvex-risk';
import { AuditLogger } from '@anshrajore/orvex-audit';
import { OrvexRuntime } from '@anshrajore/orvex-runtime';

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
