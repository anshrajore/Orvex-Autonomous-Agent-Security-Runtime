import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@orvex/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@orvex/policy': path.resolve(__dirname, 'packages/policy/src/index.ts'),
      '@orvex/risk': path.resolve(__dirname, 'packages/risk/src/index.ts'),
      '@orvex/runtime': path.resolve(__dirname, 'packages/runtime/src/index.ts'),
      '@orvex/detectors': path.resolve(__dirname, 'packages/detectors/src/index.ts'),
      '@orvex/mcp': path.resolve(__dirname, 'packages/mcp/src/index.ts'),
      '@orvex/audit': path.resolve(__dirname, 'packages/audit/src/index.ts'),
      '@orvex/git': path.resolve(__dirname, 'packages/git/src/index.ts'),
      '@orvex/sandbox': path.resolve(__dirname, 'packages/sandbox/src/index.ts'),
      '@orvex/agents': path.resolve(__dirname, 'packages/agents/src/index.ts'),
    },
  },
});
