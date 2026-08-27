import fs from 'node:fs';
import path from 'node:path';
import { generateId, orvexPaths, sha256 } from '@anshrajore/orvex-core';

interface CheckpointMeta {
  id: string;
  sessionId: string;
  label: string;
  createdAt: string;
  files: Array<{ rel: string; hash: string; size: number }>;
}

function walkFiles(root: string, dir = root, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(root, full, acc);
    else if (entry.isFile()) acc.push(full);
  }
  return acc;
}

export class CheckpointStore {
  private readonly root = orvexPaths().checkpoints;

  create(sessionId: string, cwd: string, label: string): { id: string; files: number; hash: string } {
    fs.mkdirSync(this.root, { recursive: true });
    fs.chmodSync(this.root, 0o700);
    const id = generateId('chk');
    const dest = path.join(this.root, sessionId, id);
    fs.mkdirSync(dest, { recursive: true });
    fs.chmodSync(dest, 0o700);
    const files = walkFiles(cwd).filter((f) => {
      const rel = path.relative(cwd, f);
      return rel.startsWith('src') || rel === 'important' || rel.endsWith('.yml') || rel.endsWith('.md');
    });
    const metaFiles: CheckpointMeta['files'] = [];
    for (const file of files) {
      const rel = path.relative(cwd, file);
      const buf = fs.readFileSync(file);
      const target = path.join(dest, rel);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
      fs.chmodSync(target, 0o600);
      metaFiles.push({ rel, hash: sha256(buf), size: buf.length });
    }
    const meta: CheckpointMeta = {
      id,
      sessionId,
      label,
      createdAt: new Date().toISOString(),
      files: metaFiles,
    };
    fs.writeFileSync(path.join(dest, 'meta.json'), JSON.stringify(meta, null, 2));
    fs.chmodSync(path.join(dest, 'meta.json'), 0o600);
    return { id, files: metaFiles.length, hash: sha256(JSON.stringify(metaFiles)) };
  }

  list(sessionId: string): CheckpointMeta[] {
    const dir = path.join(this.root, sessionId);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .map((id) => {
        const meta = path.join(dir, id, 'meta.json');
        if (!fs.existsSync(meta)) return null;
        return JSON.parse(fs.readFileSync(meta, 'utf8')) as CheckpointMeta;
      })
      .filter((x): x is CheckpointMeta => Boolean(x));
  }

  rollback(sessionId: string, cwd: string, checkpointId?: string): { ok: boolean; reason: string } {
    const all = this.list(sessionId);
    const meta = checkpointId ? all.find((c) => c.id === checkpointId) : all.at(-1);
    if (!meta) return { ok: false, reason: 'No checkpoint found.' };
    const dest = path.join(this.root, sessionId, meta.id);
    for (const file of meta.files) {
      if (!isSafeRelativePath(file.rel)) {
        return { ok: false, reason: `Rollback refused. Unsafe checkpoint path: ${file.rel}` };
      }
      const current = path.join(cwd, file.rel);
      const snap = path.join(dest, file.rel);
      if (fs.existsSync(current)) {
        const currentHash = sha256(fs.readFileSync(current));
        const snapHash = sha256(fs.readFileSync(snap));
        if (currentHash !== file.hash && currentHash !== snapHash) {
          return {
            ok: false,
            reason: `Rollback refused. The current file differs from the checkpoint state: ${file.rel}`,
          };
        }
      }
    }
    for (const file of meta.files) {
      const current = path.join(cwd, file.rel);
      const snap = path.join(dest, file.rel);
      fs.mkdirSync(path.dirname(current), { recursive: true });
      fs.copyFileSync(snap, current);
    }
    return { ok: true, reason: `Restored checkpoint ${meta.id}` };
  }
}

function isSafeRelativePath(value: string): boolean {
  if (!value || path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  return normalized !== '..' && !normalized.startsWith(`..${path.sep}`);
}
