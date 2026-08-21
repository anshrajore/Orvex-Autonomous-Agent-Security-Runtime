import type { Decision, SecurityProfile } from '@orvex/core';
import type { PolicyDocument } from './schema.js';

const PROFILE_DEFAULTS: Record<SecurityProfile, Partial<PolicyDocument>> = {
  relaxed: {
    filesystem: {
      default: 'allow',
      delete: { default: 'ask' },
    },
    process: { default: 'allow' },
    network: { default: 'ask' },
    secrets: { default: 'deny' },
    mcp: { default: 'ask' },
  },
  balanced: {
    filesystem: {
      default: 'deny',
      read: { allow: ['./**', './README.md', './package.json'] },
      write: { allow: ['./src/**', './tests/**'] },
      delete: { default: 'deny' },
    },
    process: { default: 'deny', allow: ['node', 'npm', 'npx', 'pnpm', 'git', 'python', 'python3'] },
    network: { default: 'deny', allow: ['github.com', 'api.github.com', 'registry.npmjs.org'] },
    secrets: { default: 'deny' },
    mcp: { default: 'deny' },
    git: { protectedBranches: ['main', 'master', 'production'] },
  },
  strict: {
    filesystem: {
      default: 'deny',
      read: { allow: ['./src/**', './README.md', './package.json'] },
      write: { allow: ['./src/**'] },
      delete: { default: 'deny' },
    },
    process: { default: 'deny', allow: ['node', 'npm', 'git'] },
    network: { default: 'deny', allow: ['github.com'] },
    secrets: { default: 'deny' },
    mcp: { default: 'deny' },
  },
  paranoid: {
    filesystem: {
      default: 'deny',
      read: { allow: ['./README.md'] },
      write: { allow: [] },
      delete: { default: 'deny' },
    },
    process: { default: 'deny', allow: [] },
    network: { default: 'deny', allow: [] },
    secrets: { default: 'deny' },
    mcp: { default: 'deny' },
  },
  ci: {
    filesystem: {
      default: 'deny',
      read: { allow: ['./**'] },
      write: { allow: ['./src/**', './tests/**', './coverage/**'] },
      delete: { default: 'deny' },
    },
    process: { default: 'deny', allow: ['node', 'npm', 'pnpm', 'git'] },
    network: { default: 'deny', allow: ['github.com', 'registry.npmjs.org'] },
    secrets: { default: 'deny' },
    mcp: { default: 'deny' },
  },
};

function mergeSection<T extends Record<string, unknown>>(base: T, overlay?: T): T {
  if (!overlay) return base;
  return { ...base, ...overlay };
}

export function applyProfile(
  profile: SecurityProfile,
  document: PolicyDocument,
): PolicyDocument {
  const defaults = PROFILE_DEFAULTS[profile];
  return {
    ...defaults,
    ...document,
    profile,
    filesystem: mergeSection(defaults.filesystem ?? {}, document.filesystem),
    process: mergeSection(defaults.process ?? {}, document.process),
    network: mergeSection(defaults.network ?? {}, document.network),
    secrets: mergeSection(defaults.secrets ?? {}, document.secrets),
    mcp: mergeSection(defaults.mcp ?? {}, document.mcp),
    git: mergeSection(defaults.git ?? {}, document.git),
  };
}

export function profileAskBecomesDeny(profile: SecurityProfile, decision: Decision): Decision {
  if (profile === 'ci' && decision === 'ask') return 'deny';
  return decision;
}
