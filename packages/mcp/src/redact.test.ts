import { describe, expect, it } from 'vitest';
import { redactMcpValue } from './redact.js';

describe('MCP redaction', () => {
  it('redacts secret-shaped keys and embedded secret values', () => {
    const result = redactMcpValue({ headers: { authorization: 'Bearer ghp_12345678901234567890' }, note: 'npm_12345678901234567890' });
    expect(result.value).toEqual({ headers: { authorization: '[SECRET_REDACTED]' }, note: '[SECRET_REDACTED]' });
    expect(result.secretFields).toContain('$.headers.authorization');
    expect(result.redactionCount).toBeGreaterThan(0);
  });
});
