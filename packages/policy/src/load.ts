import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { projectPolicyPath, userConfigPath } from '@anshrajore/orvex-core';
import { PolicyDocumentSchema, type PolicyDocument } from './schema.js';
import { applyProfile } from './profiles.js';
import { PolicyEngine, policyHash } from './engine.js';

export interface LoadPolicyOptions {
  cwd?: string;
  profileOverride?: PolicyDocument['profile'];
}

export function parsePolicyYaml(raw: string): PolicyDocument {
  const data = raw.trim() ? parse(raw) : {};
  return PolicyDocumentSchema.parse(data ?? {});
}

export function loadPolicy(options: LoadPolicyOptions = {}): {
  engine: PolicyEngine;
  document: PolicyDocument;
  sources: string[];
} {
  const cwd = options.cwd ?? process.cwd();
  const sources: string[] = [];
  let merged: PolicyDocument = PolicyDocumentSchema.parse({});

  const globalPath = userConfigPath();
  if (fs.existsSync(globalPath)) {
    merged = PolicyDocumentSchema.parse({
      ...merged,
      ...parsePolicyYaml(fs.readFileSync(globalPath, 'utf8')),
    });
    sources.push(globalPath);
  }

  const projectPath = projectPolicyPath(cwd);
  if (fs.existsSync(projectPath)) {
    const project = parsePolicyYaml(fs.readFileSync(projectPath, 'utf8'));
    merged = PolicyDocumentSchema.parse({ ...merged, ...project });
    sources.push(projectPath);
  }

  const profile = options.profileOverride ?? merged.profile;
  const document = applyProfile(profile, { ...merged, profile });
  return {
    engine: new PolicyEngine(document, policyHash(document)),
    document,
    sources,
  };
}

export function writeProjectPolicy(cwd: string, profile = 'balanced'): string {
  const target = path.join(cwd, '.orvex.yml');
  if (!fs.existsSync(target)) {
    const safe = ['relaxed', 'balanced', 'strict', 'paranoid', 'ci'].includes(profile)
      ? profile
      : 'balanced';
    fs.writeFileSync(
      target,
      `version: 1
profile: ${safe}

filesystem:
  default: deny
  read:
    allow:
      - ./**
      - ./README.md
      - ./package.json
  write:
    allow:
      - ./src/**
      - ./tests/**
  delete:
    default: deny

process:
  default: deny
  allow:
    - node
    - npm
    - npx
    - pnpm
    - git
    - python
    - python3

network:
  default: deny
  allow:
    - github.com
    - api.github.com
    - registry.npmjs.org

secrets:
  default: deny

mcp:
  default: deny

git:
  protectedBranches:
    - main
    - production
`,
      'utf8',
    );
  }
  return target;
}
