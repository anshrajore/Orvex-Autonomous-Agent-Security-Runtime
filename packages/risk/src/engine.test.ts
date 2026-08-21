import { describe, expect, it } from 'vitest';
import { RiskEngine } from '../src/engine.js';
import type { ExecutionContext } from '@anshrajore/orvex-core';

function context(sessionId = 's'): ExecutionContext {
  return {
    cwd: process.cwd(),
    sessionId,
    agentId: 'a',
    profile: 'balanced',
    dryRun: false,
    approvalMode: 'ask',
    env: {},
  };
}

describe('risk engine', () => {
  it('scores secret reads critically', () => {
    const risk = new RiskEngine().assess({
      capability: 'secret.read',
      resource: { kind: 'file', value: '.env', classification: 'SECRET' },
      context: context(),
    });
    expect(risk.score).toBeGreaterThan(80);
    expect(risk.level).toBe('critical');
    expect(risk.factors.length).toBeGreaterThan(0);
  });

  it('escalates network activity after a secret read in the same session', () => {
    const engine = new RiskEngine();
    engine.assess({
      capability: 'secret.read',
      resource: { kind: 'file', value: '.env', classification: 'SECRET' },
      context: context('co-occur'),
    });

    const risk = engine.assess({
      capability: 'network.connect',
      resource: { kind: 'host', value: 'api.evil.test' },
      context: context('co-occur'),
    });

    expect(risk.score).toBeGreaterThanOrEqual(90);
    expect(risk.level).toBe('critical');
    expect(risk.factors.some((factor) => factor.id === 'secret-egress-cooccurrence')).toBe(true);
  });

  it('flags bursty process execution anomalies', () => {
    const engine = new RiskEngine();
    for (let i = 0; i < 12; i += 1) {
      engine.assess({
        capability: 'process.execute',
        resource: { kind: 'command', value: `node task-${i}.js` },
        context: context('burst'),
      });
    }

    const risk = engine.assess({
      capability: 'process.execute',
      resource: { kind: 'command', value: 'node task-final.js' },
      context: context('burst'),
    });

    expect(risk.factors.some((factor) => factor.id === 'bursty-anomaly')).toBe(true);
  });
});
