export function normalizeMcpName(value: string, label: string): string {
  const normalized = value.normalize('NFKC').trim();
  if (!normalized || normalized.length > 256 || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new Error(`Invalid MCP ${label}.`);
  }
  return normalized;
}

export function normalizeToolPattern(value: string): string {
  const normalized = normalizeMcpName(value, 'tool pattern');
  if (normalized.includes('..') || normalized.includes('\\')) throw new Error('Invalid MCP tool pattern.');
  return normalized;
}
