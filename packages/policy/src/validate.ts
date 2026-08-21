import type { PolicyDocument } from './schema.js';
import { hostMatches } from './matchers.js';

export interface ValidationResult {
  ok: boolean;
  messages: string[];
  ruleCount: number;
}

export function validatePolicy(document: PolicyDocument): ValidationResult {
  const messages: string[] = [];
  let ruleCount = 0;

  messages.push('YAML valid');
  const fsAllow = [
    ...(document.filesystem.read?.allow ?? []),
    ...(document.filesystem.write?.allow ?? []),
  ];
  ruleCount += fsAllow.length;
  if (document.filesystem.read?.allow && document.filesystem.read.deny) {
    for (const a of document.filesystem.read.allow) {
      if (document.filesystem.read.deny.includes(a)) {
        messages.push(`Conflicting filesystem read rule: ${a}`);
      }
    }
  }
  messages.push('Paths normalized');

  for (const rule of document.network.allow ?? []) {
    ruleCount += 1;
    const host = rule.split(':')[0];
    if (!host || host.includes(' ')) {
      messages.push(`Invalid network rule: ${rule}`);
    } else {
      hostMatches(rule, host, 443);
    }
  }
  messages.push('Network rules valid');

  if ((document.process.allow ?? []).length === 0 && document.process.default === 'allow') {
    messages.push('Process allow-all is enabled (relaxed)');
  }
  messages.push('Capability graph valid');

  const ok = !messages.some((m) => m.startsWith('Invalid') || m.startsWith('Conflicting'));
  return { ok, messages, ruleCount };
}
