import { describe, expect, it } from 'vitest';
import { parseMcpRequest, requestToMcpCall } from './protocol.js';

describe('MCP JSON-RPC protocol', () => {
  it('normalizes tools/call params into a firewall call', () => {
    const request = parseMcpRequest({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: {
      name: 'read_file', arguments: { path: './README.md' },
    } });
    expect(requestToMcpCall(request, 'filesystem')).toMatchObject({
      server: 'filesystem', tool: 'read_file', requestId: 7,
    });
  });

  it('rejects invalid JSON-RPC envelopes', () => {
    expect(() => parseMcpRequest({ jsonrpc: '1.0', id: 'x', method: 'tools/call' })).toThrow('JSON-RPC 2.0');
    expect(() => parseMcpRequest({ jsonrpc: '2.0', id: {}, method: 'tools/call' })).toThrow('valid id');
  });
});
