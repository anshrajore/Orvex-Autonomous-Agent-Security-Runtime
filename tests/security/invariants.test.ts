import { describe, expect, it } from 'vitest';
import { isProtectedSecretPath } from '@anshrajore/orvex-core';
import { inspectMcpCall } from '@anshrajore/orvex-mcp';

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
});
