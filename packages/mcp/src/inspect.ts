import { classifyPath, type McpTrust } from '@anshrajore/orvex-core';

export interface McpCall {
  server: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export function extractMcpPath(call: McpCall): string | undefined {
  const args = call.arguments;
  const keys = ['path', 'file', 'filepath', 'uri', 'target'];
  for (const key of keys) {
    const value = args[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
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
