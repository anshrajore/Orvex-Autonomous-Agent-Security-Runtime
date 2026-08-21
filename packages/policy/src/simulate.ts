import type { Actor, Capability, ExecutionContext, Resource } from '@anshrajore/orvex-core';
import type { PolicyEngine, PolicyRequest } from './engine.js';

export interface SimulationCase {
  name: string;
  capability: Capability;
  resource: string;
  kind?: Resource['kind'];
  extra?: Partial<PolicyRequest['action']>;
}

export const DEFAULT_SIMULATION: SimulationCase[] = [
  { name: 'READ ./src/app.ts', capability: 'filesystem.read', resource: './src/app.ts', kind: 'file' },
  { name: 'WRITE ./src/app.ts', capability: 'filesystem.write', resource: './src/app.ts', kind: 'file' },
  { name: 'READ ~/.ssh/id_rsa', capability: 'filesystem.read', resource: '~/.ssh/id_rsa', kind: 'file' },
  { name: 'NETWORK github.com', capability: 'network.connect', resource: 'github.com', kind: 'host' },
  { name: 'NETWORK unknown.com', capability: 'network.connect', resource: 'unknown.com', kind: 'host' },
  { name: 'git push origin main', capability: 'git.push', resource: 'origin/main', kind: 'git' },
  { name: 'MCP unknown-server', capability: 'mcp.call', resource: 'unknown-server', kind: 'mcp' },
];

export function simulate(
  engine: PolicyEngine,
  context: ExecutionContext,
  cases: SimulationCase[] = DEFAULT_SIMULATION,
) {
  const actor: Actor = { id: context.agentId, kind: 'agent' };
  return cases.map((c) => {
    const decision = engine.evaluate({
      actor,
      action: {
        type: 'POLICY_DECISION',
        capability: c.capability,
        verb: c.capability.split('.')[1] ?? 'act',
        ...c.extra,
      },
      resource: { kind: c.kind ?? 'other', value: c.resource },
      context,
    });
    return { name: c.name, decision };
  });
}
