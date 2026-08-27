import { DEFAULT_SAFE_ENV, SENSITIVE_ENV_PATTERNS } from './types.js';

export interface EnvironmentPolicy {
  allow?: string[];
  deny?: string[];
}

function matchesPattern(name: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i').test(name);
}

export function isSensitiveEnvName(name: string): boolean {
  return SENSITIVE_ENV_PATTERNS.some((re) => re.test(name));
}

export function filterEnvironment(
  source: NodeJS.ProcessEnv,
  policy: EnvironmentPolicy = {},
): Record<string, string> {
  const result: Record<string, string> = {};
  const allow = policy.allow ?? DEFAULT_SAFE_ENV;
  const deny = policy.deny ?? [];

  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (deny.some((pattern) => matchesPattern(key, pattern))) continue;
    const explicitlyAllowed = allow.some((pattern) => matchesPattern(key, pattern));
    const safelyAllowed = DEFAULT_SAFE_ENV.some((safeName) => safeName.toLowerCase() === key.toLowerCase());
    if (!explicitlyAllowed && isSensitiveEnvName(key)) continue;
    if (explicitlyAllowed || safelyAllowed) {
      result[key] = value;
    }
  }
  return result;
}
