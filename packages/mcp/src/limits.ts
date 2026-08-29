import { DEFAULT_MCP_LIMITS, type McpInspectionLimits } from './types.js';

export class McpLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpLimitError';
  }
}

export function assertMcpLimits(value: unknown, limits: McpInspectionLimits = DEFAULT_MCP_LIMITS): void {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new McpLimitError('MCP payload is not JSON serializable.');
  if (Buffer.byteLength(serialized, 'utf8') > limits.maxSerializedBytes) {
    throw new McpLimitError(`MCP payload exceeds ${limits.maxSerializedBytes} bytes.`);
  }
  walk(value, limits, 0, '$');
}

function walk(value: unknown, limits: McpInspectionLimits, depth: number, location: string): void {
  if (depth > limits.maxDepth) throw new McpLimitError(`MCP payload exceeds depth limit at ${location}.`);
  if (typeof value === 'string' && value.length > limits.maxStringLength) {
    throw new McpLimitError(`MCP string exceeds length limit at ${location}.`);
  }
  if (!value || typeof value !== 'object') return;
  const entries = Array.isArray(value) ? value.entries() : Object.entries(value);
  let count = 0;
  for (const [key, nested] of entries) {
    count += 1;
    if (count > limits.maxKeys) throw new McpLimitError(`MCP object exceeds key limit at ${location}.`);
    walk(nested, limits, depth + 1, `${location}.${String(key)}`);
  }
}
