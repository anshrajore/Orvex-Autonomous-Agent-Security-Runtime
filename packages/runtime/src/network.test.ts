import { describe, expect, it } from 'vitest';
import { isSensitiveDestination } from './network.js';
import { parseCidrMatch } from './network.js';

describe('network destination normalization', () => {
  it('blocks loopback and metadata URLs across common spellings', () => {
    expect(isSensitiveDestination('http://localhost:8080')).toBe(true);
    expect(isSensitiveDestination('https://[::1]:443')).toBe(true);
    expect(isSensitiveDestination('tcp://[::ffff:127.0.0.1]:80')).toBe(true);
    expect(isSensitiveDestination('https://[fd00::10]:443')).toBe(true);
    expect(isSensitiveDestination('https://[fe80::1]:443')).toBe(true);
    expect(isSensitiveDestination('https://[::ffff:10.0.0.5]:443')).toBe(true);
    expect(isSensitiveDestination('169.254.169.254:80')).toBe(true);
  });

  it('does not classify a public host as private', () => {
    expect(isSensitiveDestination('https://github.com:443')).toBe(false);
  });

  it('rejects malformed CIDR masks', () => {
    expect(parseCidrMatch('10.0.0.0/40', '10.0.0.1')).toBe(false);
  });
});
