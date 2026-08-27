import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ResourceClass } from './types.js';

const SECRET_BASENAMES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.npmrc',
  '.pypirc',
  'credentials',
  'id_rsa',
  'id_ed25519',
  'id_ecdsa',
  'id_dsa',
]);

const SECRET_DIR_PARTS = new Set(['.ssh', '.aws', '.gnupg', '.kube', '.docker', '.config']);

const SYSTEM_PREFIXES = (): string[] => {
  if (process.platform === 'win32') {
    return ['C:\\Windows', 'C:\\Program Files'];
  }
  return ['/etc', '/usr', '/bin', '/sbin', '/System', '/private/etc', '/var/root'];
};

export function expandHome(input: string): string {
  if (input === '~') return os.homedir();
  if (input.startsWith('~/') || input.startsWith('~\\')) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

export function normalizePathInput(input: string, cwd: string): string {
  const expanded = expandHome(input);
  const resolved = path.resolve(cwd, expanded);
  return path.normalize(resolved);
}

export function tryRealpath(input: string): { real: string; symlink: boolean } {
  try {
    const real = fs.realpathSync.native(input);
    const normalized = path.normalize(input);
    return { real, symlink: path.normalize(real) !== normalized };
  } catch {
    return { real: input, symlink: false };
  }
}

export function resolvePathForPolicy(input: string, cwd: string): string {
  const requested = normalizePathInput(input, cwd);
  let probe = requested;
  const suffix: string[] = [];

  while (!fs.existsSync(probe)) {
    const parent = path.dirname(probe);
    if (parent === probe) return requested;
    suffix.unshift(path.basename(probe));
    probe = parent;
  }

  try {
    return path.normalize(path.join(fs.realpathSync.native(probe), ...suffix));
  } catch {
    return requested;
  }
}

export function detectSymlinkEscape(requested: string, allowedRoot: string): boolean {
  const req = tryRealpath(requested).real;
  const root = tryRealpath(allowedRoot).real;
  const rel = path.relative(root, req);
  return rel.startsWith('..') || path.isAbsolute(rel);
}

export function classifyPath(filePath: string, projectRoot: string): ResourceClass {
  const real = resolvePathForPolicy(filePath, projectRoot);
  const base = path.basename(real);
  const parts = real.split(path.sep);

  if (SECRET_BASENAMES.has(base) || base.startsWith('.env')) {
    return 'SECRET';
  }
  if (parts.some((p) => SECRET_DIR_PARTS.has(p))) {
    return 'SECRET';
  }
  if (/\.(pem|key|p12|pfx|crt|cer)$/i.test(base)) {
    return 'SECRET';
  }
  if (SYSTEM_PREFIXES().some((prefix) => real === prefix || real.startsWith(prefix + path.sep))) {
    return 'SYSTEM';
  }
  const rel = path.relative(projectRoot, real);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    if (real.includes(`${path.sep}.ssh${path.sep}`) || real.endsWith(`${path.sep}.ssh`)) {
      return 'CRITICAL';
    }
    return 'SENSITIVE';
  }
  if (base === 'important' || rel === 'important' || rel.endsWith(`${path.sep}important`)) {
    return 'CRITICAL';
  }
  return 'PROJECT';
}

export function isProtectedSecretPath(filePath: string, projectRoot: string): boolean {
  const cls = classifyPath(filePath, projectRoot);
  return cls === 'SECRET' || cls === 'CRITICAL' || cls === 'SYSTEM';
}
