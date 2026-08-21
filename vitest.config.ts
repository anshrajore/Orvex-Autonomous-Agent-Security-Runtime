import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@anshrajore/orvex-core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@anshrajore/orvex-policy': path.resolve(__dirname, 'packages/policy/src/index.ts'),
      '@anshrajore/orvex-risk': path.resolve(__dirname, 'packages/risk/src/index.ts'),
      '@anshrajore/orvex-runtime': path.resolve(__dirname, 'packages/runtime/src/index.ts'),
      '@anshrajore/orvex-detectors': path.resolve(__dirname, 'packages/detectors/src/index.ts'),
      '@anshrajore/orvex-mcp': path.resolve(__dirname, 'packages/mcp/src/index.ts'),
      '@anshrajore/orvex-audit': path.resolve(__dirname, 'packages/audit/src/index.ts'),
      '@anshrajore/orvex-git': path.resolve(__dirname, 'packages/git/src/index.ts'),
      '@anshrajore/orvex-sandbox': path.resolve(__dirname, 'packages/sandbox/src/index.ts'),
      '@anshrajore/orvex-agents': path.resolve(__dirname, 'packages/agents/src/index.ts'),
    },
  },
});
