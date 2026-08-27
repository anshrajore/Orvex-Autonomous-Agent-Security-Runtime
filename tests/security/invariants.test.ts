import { describe, expect, it } from 'vitest';
import { isProtectedSecretPath } from '@anshrajore/orvex-core';
import { inspectMcpCall } from '@anshrajore/orvex-mcp';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { classifyPath, resolvePathForPolicy } from '@anshrajore/orvex-core';

describe('security properties', () => {
  it('treats env files as secrets', () => {
    expect(isProtectedSecretPath('.env', process.cwd())).toBe(true);
  });

  it('inspects MCP arguments not just tool names', () => {
    const result = inspectMcpCall(
      { server: 'filesystem', tool: 'read_file', arguments: { path: '~/.ssh/id_rsa' } },
      process.cwd(),
      'trusted',
    );
    expect(result.resourcePath).toContain('id_rsa');
    expect(result.classification === 'SECRET' || result.classification === 'CRITICAL').toBe(true);
  });

  it('resolves a new file below a symlink before policy matching', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'orvex-path-'));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'orvex-outside-'));
    fs.symlinkSync(outside, path.join(root, 'allowed-link'));
    const resolved = resolvePathForPolicy('./allowed-link/new-file.txt', root);
    expect(resolved.startsWith(fs.realpathSync.native(outside))).toBe(true);
    expect(classifyPath('./allowed-link/new-file.txt', root)).toBe('SENSITIVE');
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });
});
