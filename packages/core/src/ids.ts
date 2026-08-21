import { createHash, randomBytes } from 'node:crypto';

export function generateId(prefix = 'evt'): string {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}

export function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function nowIso(): string {
  return new Date().toISOString();
}
