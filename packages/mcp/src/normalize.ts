export function normalizeMcpName(value: string, label: string): string {
  const normalized = value.normalize('NFKC').trim();
  if (!normalized || normalized.length > 256 || hasControlCharacter(normalized)) {
    throw new Error(`Invalid MCP ${label}.`);
  }
  return normalized;
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });
}

export function normalizeToolPattern(value: string): string {
  const normalized = normalizeMcpName(value, 'tool pattern');
  if (normalized.includes('..') || normalized.includes('\\')) throw new Error('Invalid MCP tool pattern.');
  return normalized;
}
