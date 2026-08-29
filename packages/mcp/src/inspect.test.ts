import { describe, expect, it } from 'vitest';
import { inspectMcpCall } from './inspect.js';

describe('MCP inspection', () => {
  it('finds every nested file target and classifies it', () => {
    const result = inspectMcpCall({
      server: 'filesystem',
      tool: 'read_many',
      arguments: { requests: [{ path: './src/a.ts' }, { uri: 'file:///tmp/b.txt' }] },
    }, process.cwd(), 'trusted');
    expect(result.resourceTargets).toHaveLength(2);
    expect(result.resourceTargets[1]?.path).toBe('/tmp/b.txt');
    expect(result.resourceTargets[1]?.trustZone).toBe('UNTRUSTED');
  });

  it('fails closed for malformed identifiers', () => {
    const result = inspectMcpCall({ server: 'fs\u0000', tool: 'read', arguments: {} }, process.cwd(), 'trusted');
    expect(result.malformed).toBe(true);
    expect(result.blockedByTrust).toBe(true);
  });
});
