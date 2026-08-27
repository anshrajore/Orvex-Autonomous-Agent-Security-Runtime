import { describe, expect, it } from 'vitest';
import { FallbackProvider } from './providers.js';

describe('sandbox execution limits', () => {
  it('terminates a command that exceeds its execution budget', async () => {
    const provider = new FallbackProvider();
    const sandbox = await provider.create({
      cwd: process.cwd(),
      env: process.env as Record<string, string>,
      readPaths: [process.cwd()],
      writePaths: [process.cwd()],
      networkAllow: [],
      maxExecutionMinutes: 0.001,
    });
    const result = await provider.execute(sandbox, {
      argv: [process.execPath, '-e', 'setTimeout(() => {}, 1000)'],
    });
    expect(result.code).toBe(124);
    await provider.destroy(sandbox.id);
  });
});
