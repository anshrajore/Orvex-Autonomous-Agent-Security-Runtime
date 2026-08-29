import { Redactor, SecretDetector } from '@anshrajore/orvex-detectors';
import { assertMcpLimits, McpLimitError } from './limits.js';
import { DEFAULT_MCP_LIMITS, type McpInspectionLimits } from './types.js';

const SECRET_KEY = /(?:api[_-]?key|authorization|cookie|password|private[_-]?key|secret|token)/i;

export interface RedactedMcpValue {
  value: unknown;
  secretFields: string[];
  redactionCount: number;
}

export function redactMcpValue(value: unknown, limits: McpInspectionLimits = DEFAULT_MCP_LIMITS): RedactedMcpValue {
  assertMcpLimits(value, limits);
  const detector = new SecretDetector();
  const redactor = new Redactor(detector);
  const secretFields: string[] = [];
  let redactionCount = 0;
  const visit = (current: unknown, location: string, depth: number): unknown => {
    if (typeof current === 'string') {
      const redacted = redactor.redact(current);
      redactionCount += redacted.count;
      return redacted.text;
    }
    if (!current || typeof current !== 'object' || depth > limits.maxDepth) return current;
    if (Array.isArray(current)) return current.map((item, index) => visit(item, `${location}[${index}]`, depth + 1));
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(current)) {
      const childLocation = `${location}.${key}`;
      if (SECRET_KEY.test(key)) {
        secretFields.push(childLocation);
        output[key] = '[SECRET_REDACTED]';
        continue;
      }
      output[key] = visit(nested, childLocation, depth + 1);
    }
    return output;
  };
  try {
    return { value: visit(value, '$', 0), secretFields, redactionCount };
  } catch (error) {
    if (error instanceof McpLimitError) throw error;
    throw new Error('MCP value could not be safely redacted.');
  }
}
