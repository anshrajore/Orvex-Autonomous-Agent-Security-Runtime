import { minimatch } from 'minimatch';
import net from 'node:net';
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
  const value = rule.trim().toLowerCase();
  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    const host = end >= 0 ? value.slice(1, end) : value;
    const port = value.slice(end + 1).match(/^:(\d+)$/)?.[1];
    return { host, port: port ? Number(port) : undefined };
  }
  const colon = value.lastIndexOf(':');
  if (colon > 0 && value.indexOf(':') === colon) {
    const port = Number(value.slice(colon + 1));
    if (Number.isInteger(port) && port > 0 && port <= 65535) return { host: value.slice(0, colon), port };
  }
  return { host: value };
}

export function hostMatches(rule: string, hostname: string, port?: number): boolean {
  const parsed = parseHostRule(rule);
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const expected = parsed.host.toLowerCase();
  const cidrMatch = ipv4CidrMatches(expected, host);
  const hostOk =
    cidrMatch ||
    host === expected ||
    host.endsWith(`.${expected}`) ||
    (expected.startsWith('*.') && host.endsWith(expected.slice(1)));
  if (!hostOk) return false;
  if (parsed.port !== undefined && port !== undefined && parsed.port !== port) return false;
  return true;
}

function ipv4CidrMatches(rule: string, host: string): boolean {
  if (!rule.includes('/') || net.isIP(host) !== 4) return false;
  const [base, bitsRaw] = rule.split('/');
  const bits = Number(bitsRaw);
  if (net.isIP(base) !== 4 || !Number.isInteger(bits) || bits < 0 || bits > 32) return false;
  const toInt = (value: string) => value.split('.').reduce((acc, part) => ((acc << 8) | Number(part)) >>> 0, 0);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (toInt(host) & mask) === (toInt(base) & mask);
}
