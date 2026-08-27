import { classifyPath, type McpTrust } from '@anshrajore/orvex-core';

export interface McpCall {
  server: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export function extractMcpPath(call: McpCall): string | undefined {
  const keys = ['path', 'file', 'filepath', 'uri', 'target'];
  const visit = (value: unknown, depth: number): string | undefined => {
    if (depth > 6 || value === null || typeof value !== 'object') return undefined;
    for (const [key, nested] of Object.entries(value)) {
      if (keys.includes(key.toLowerCase()) && typeof nested === 'string') {
        if (nested.startsWith('file://')) {
          try { return decodeURIComponent(new URL(nested).pathname); } catch { return nested; }
        }
        return nested;
      }
      const found = visit(nested, depth + 1);
      if (found) return found;
    }
    return undefined;
  };
  return visit(call.arguments, 0);
}

export function inspectMcpCall(
  call: McpCall,
  cwd: string,
  trust: McpTrust,
): {
  resourcePath?: string;
  classification?: string;
  blockedByTrust: boolean;
  reason: string;
} {
  if (trust === 'blocked' || trust === 'unknown') {
    return {
      blockedByTrust: true,
      reason: `MCP server ${call.server} trust level is ${trust}.`,
    };
  }
  const resourcePath = extractMcpPath(call);
  if (resourcePath) {
    const classification = classifyPath(resourcePath, cwd);
    return {
      resourcePath,
      classification,
      blockedByTrust: false,
      reason: `MCP ${call.server}.${call.tool} targets ${resourcePath} (${classification}).`,
    };
  }
  return {
    blockedByTrust: false,
    reason: `MCP ${call.server}.${call.tool} with ${Object.keys(call.arguments).length} arguments.`,
  };
}
