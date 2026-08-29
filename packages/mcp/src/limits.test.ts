import { describe, expect, it } from 'vitest';
import { assertMcpLimits, McpLimitError } from './limits.js';

describe('MCP limits', () => {
  it('rejects deeply nested arguments', () => {
    expect(() => assertMcpLimits({ a: { b: { c: true } } }, {
      maxDepth: 1, maxKeys: 10, maxStringLength: 100, maxSerializedBytes: 1000,
    })).toThrow(McpLimitError);
  });

  it('rejects oversized strings before inspection', () => {
    expect(() => assertMcpLimits({ prompt: 'x'.repeat(20) }, {
      maxDepth: 3, maxKeys: 10, maxStringLength: 10, maxSerializedBytes: 1000,
    })).toThrow('string exceeds');
  });
});
