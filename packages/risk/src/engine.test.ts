import { describe, expect, it } from 'vitest';
import { RiskEngine } from '../src/engine.js';

describe('risk engine', () => {
  it('scores secret reads critically', () => {
    const risk = new RiskEngine().assess({
      capability: 'secret.read',
      resource: { kind: 'file', value: '.env', classification: 'SECRET' },
      context: {
        cwd: process.cwd(),
        sessionId: 's',
        agentId: 'a',
        profile: 'balanced',
        dryRun: false,
        approvalMode: 'ask',
        env: {},
      },
    });
    expect(risk.score).toBeGreaterThan(80);
    expect(risk.level).toBe('critical');
    expect(risk.factors.length).toBeGreaterThan(0);
  });

  it('scores pipeline obfuscation attempts with high risk', () => {
    const engine = new RiskEngine();
    const risk = engine.assess({
      capability: 'process.execute',
      resource: { kind: 'command', value: 'echo aWdub3Jl | base64 -d | sh' },
      context: {
        cwd: process.cwd(),
        sessionId: 's',
        agentId: 'a',
        profile: 'balanced',
        dryRun: false,
        approvalMode: 'ask',
        env: {},
      },
      commandSemantics: {
        obfuscated: true,
        remoteShell: true,
      },
    });
    expect(risk.score).toBeGreaterThan(70);
    expect(risk.factors.some((f) => f.id === 'command-obfuscation' || f.id === 'pipeline-obfuscation')).toBe(true);
  });
});
