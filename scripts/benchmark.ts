import { performance } from 'node:perf_hooks';
import { PolicyDocumentSchema, PolicyEngine, applyProfile, policyHash } from '@orvex/policy';

const document = applyProfile('balanced', PolicyDocumentSchema.parse({}));
const engine = new PolicyEngine(document, policyHash(document));
const cwd = process.cwd();
const context = {
  cwd,
  sessionId: 'bench',
  agentId: 'bench',
  profile: 'balanced' as const,
  dryRun: false,
  approvalMode: 'ask' as const,
  env: {},
};

const n = 2000;
const start = performance.now();
for (let i = 0; i < n; i += 1) {
  engine.evaluate({
    actor: { id: 'bench', kind: 'agent' },
    action: { type: 'FILE_READ', capability: 'filesystem.read', verb: 'read' },
    resource: { kind: 'file', value: './src/app.ts' },
    context,
  });
}
const elapsed = performance.now() - start;
const typical = elapsed / n;
process.stdout.write(`policy decisions: ${n}\n`);
process.stdout.write(`avg ms: ${typical.toFixed(3)}\n`);
process.stdout.write(`per-second: ${Math.round(1000 / typical)}\n`);
if (typical > 5) {
  process.stdout.write('warning: typical policy evaluation exceeded 5ms on this machine\n');
}
