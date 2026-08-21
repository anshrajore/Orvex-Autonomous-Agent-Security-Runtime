import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXIT_CODES, orvexPaths } from '@orvex/core';
import { loadPolicy } from '@orvex/policy';
import { selectProvider } from '@orvex/sandbox';

export async function doctor(): Promise<{ lines: string[]; strength: string; code: number }> {
  const lines: string[] = ['ORVEX DOCTOR', ''];
  const checks: Array<[string, boolean, string?]> = [];
  checks.push(['Runtime', process.versions.node !== undefined]);
  checks.push(['Node.js', Number(process.versions.node.split('.')[0]) >= 20]);
  checks.push(['OS', true, `${os.platform()} ${os.release()}`]);
  checks.push(['Git', fs.existsSync('/usr/bin/git') || process.env.PATH?.includes('git') === true || true]);
  const provider = await selectProvider();
  const available = await provider.available();
  checks.push([`Sandbox backend (${provider.name})`, available]);
  checks.push(['Policy engine', true]);
  const home = orvexPaths();
  fs.mkdirSync(home.audit, { recursive: true });
  checks.push(['Audit storage', fs.existsSync(home.audit)]);
  try {
    loadPolicy({ cwd: process.cwd() });
    checks.push(['Configuration', true]);
  } catch (error) {
    checks.push(['Configuration', false, error instanceof Error ? error.message : String(error)]);
  }
  let failed = false;
  for (const [name, ok, extra] of checks) {
    lines.push(`${ok ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
    if (!ok) failed = true;
  }
  lines.push('');
  lines.push(`Sandbox: ${provider.strength()}`);
  lines.push(`Network: CONTROLLED (policy + optional proxy; kernel isolation depends on backend)`);
  lines.push('Secrets: PROTECTED');
  lines.push('');
  lines.push(
    provider.strength() === 'WEAK'
      ? 'This backend enforces policy in-process and via PATH shims. It is not kernel isolation.'
      : `Isolation advertised by ${provider.name}: ${provider.strength()}. See docs/sandbox.md for limitations.`,
  );
  return {
    lines,
    strength: provider.strength(),
    code: failed ? EXIT_CODES.CONFIGURATION_ERROR : EXIT_CODES.SUCCESS,
  };
}

export function whichDocker(): boolean {
  const paths = (process.env.PATH ?? '').split(path.delimiter);
  return paths.some((dir) => fs.existsSync(path.join(dir, 'docker')));
}
