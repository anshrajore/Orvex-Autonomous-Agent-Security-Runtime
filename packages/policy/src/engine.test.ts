import { describe, expect, it } from 'vitest';
import { PolicyDocumentSchema } from '../src/schema.js';
import { applyProfile } from '../src/profiles.js';
import { PolicyEngine, policyHash } from '../src/engine.js';
import { hostMatches, pathMatches } from '../src/matchers.js';
import type { ExecutionContext } from '@anshrajore/orvex-core';

const cwd = process.cwd();

function ctx(): ExecutionContext {
  return {
    cwd,
    sessionId: 's',
    agentId: 't',
    profile: 'balanced',
    dryRun: false,
    approvalMode: 'ask',
    env: {},
  };
}

function engine() {
  const document = applyProfile('balanced', PolicyDocumentSchema.parse({}));
  return new PolicyEngine(document, policyHash(document));
}

describe('policy engine', () => {
  it('allows project source reads and blocks secrets', () => {
    const e = engine();
    const read = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'FILE_READ', capability: 'filesystem.read', verb: 'read' },
      resource: { kind: 'file', value: './src/app.ts' },
      context: ctx(),
    });
    expect(read.decision).toBe('allow');
    const secret = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'FILE_READ', capability: 'filesystem.read', verb: 'read' },
      resource: { kind: 'file', value: './.env' },
      context: ctx(),
    });
    expect(secret.decision).toBe('deny');
    const ssh = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'FILE_READ', capability: 'filesystem.read', verb: 'read' },
      resource: { kind: 'file', value: '~/.ssh/id_rsa' },
      context: ctx(),
    });
    expect(ssh.decision).toBe('deny');
  });

  it('asks for protected git push', () => {
    const e = engine();
    const d = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'GIT_PUSH', capability: 'git.push', verb: 'push' },
      resource: { kind: 'git', value: 'origin/main' },
      context: ctx(),
    });
    expect(d.decision).toBe('ask');
  });

  it('blocks unknown hosts and allows github', () => {
    const e = engine();
    const gh = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'NETWORK_CONNECT', capability: 'network.connect', verb: 'connect' },
      resource: { kind: 'host', value: 'github.com' },
      context: ctx(),
    });
    const bad = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'NETWORK_CONNECT', capability: 'network.connect', verb: 'connect' },
      resource: { kind: 'host', value: 'unknown.com' },
      context: ctx(),
    });
    expect(gh.decision).toBe('allow');
    expect(bad.decision).toBe('deny');
  });

  it('matches project globs', () => {
    expect(pathMatches('./src/**', `${cwd}/src/app.ts`, cwd)).toBe(true);
    expect(pathMatches('./**', `${cwd}/README.md`, cwd)).toBe(true);
    expect(hostMatches('10.0.0.0/8:443', '10.8.2.4', 443)).toBe(true);
    expect(hostMatches('[::1]:443', '::1', 443)).toBe(true);
  });

  it('does not let environment assignments bypass process policy', () => {
    const e = engine();
    const decision = e.evaluate({
      actor: { id: 't', kind: 'agent' },
      action: { type: 'PROCESS_EXEC', capability: 'process.execute', verb: 'exec' },
      resource: { kind: 'command', value: 'NODE_OPTIONS=--trace-warnings curl https://unknown.com' },
      context: ctx(),
    });
    expect(decision.decision).toBe('deny');
  });
});
