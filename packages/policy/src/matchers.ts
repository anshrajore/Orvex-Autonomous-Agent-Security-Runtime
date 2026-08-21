import { minimatch } from 'minimatch';
import path from 'node:path';

export function pathMatches(pattern: string, target: string, cwd: string): boolean {
  const absTarget = path.isAbsolute(target) ? path.normalize(target) : path.resolve(cwd, target);
  const rel = path.relative(cwd, absTarget).split(path.sep).join('/');
  const patterns = [pattern, pattern.replace(/^\.\//, ''), `./${pattern.replace(/^\.\//, '')}`];
  for (const p of patterns) {
    if (minimatch(rel, p.replace(/^\.\//, ''), { dot: true, nocase: process.platform === 'win32' })) {
      return true;
    }
    if (minimatch(`./${rel}`, p, { dot: true })) return true;
    const absPattern = path.isAbsolute(p) ? p : path.resolve(cwd, p);
    if (minimatch(absTarget, absPattern, { dot: true, nocase: process.platform === 'win32' })) return true;
  }
  if (pattern === './**' || pattern === '**' || pattern === './**/**') return !rel.startsWith('..');
  return false;
}

export function parseHostRule(rule: string): {
  host: string;
  port?: number;
} {
  const [host, portRaw] = rule.split(':');
  const port = portRaw ? Number(portRaw) : undefined;
  return { host: host ?? rule, port: Number.isFinite(port) ? port : undefined };
}

export function hostMatches(rule: string, hostname: string, port?: number): boolean {
  const parsed = parseHostRule(rule);
  const host = hostname.toLowerCase();
  const expected = parsed.host.toLowerCase();
  const hostOk =
    host === expected ||
    host.endsWith(`.${expected}`) ||
    (expected.startsWith('*.') && host.endsWith(expected.slice(1)));
  if (!hostOk) return false;
  if (parsed.port !== undefined && port !== undefined && parsed.port !== port) return false;
  return true;
}
