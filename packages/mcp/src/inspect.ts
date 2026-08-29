import { classifyPath, type McpTrust } from '@anshrajore/orvex-core';
import { assertMcpLimits } from './limits.js';
import { normalizeMcpName } from './normalize.js';
import { DEFAULT_MCP_LIMITS, type McpInspection, type McpInspectionLimits } from './types.js';

export interface McpCall {
  server: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export function extractMcpPath(call: McpCall): string | undefined {
  return findTargets(call.arguments, 0, DEFAULT_MCP_LIMITS).find((target) => target.path)?.path;
}

export function inspectMcpCall(
  call: McpCall,
  cwd: string,
  trust: McpTrust,
  limits: McpInspectionLimits = DEFAULT_MCP_LIMITS,
): McpInspection {
  let server = call.server;
  let tool = call.tool;
  try {
    server = normalizeMcpName(call.server, 'server');
    tool = normalizeMcpName(call.tool, 'tool');
    assertMcpLimits(call.arguments, limits);
  } catch (error) {
    return {
      server,
      tool,
      trust,
      blockedByTrust: true,
      malformed: true,
      oversized: error instanceof Error && error.message.includes('exceeds'),
      resourceTargets: [],
      secretFields: [],
      redactedArguments: {},
      reason: error instanceof Error ? error.message : 'Malformed MCP payload.',
    };
  }
  const resourceTargets = findTargets(call.arguments, 0, limits).map((target) => ({
    ...target,
    classification: target.path ? classifyPath(target.path, cwd) : undefined,
  }));
  const blockedByTrust = trust === 'blocked' || trust === 'unknown';
  return {
    server,
    tool,
    trust,
    blockedByTrust,
    malformed: false,
    oversized: false,
    resourceTargets,
    secretFields: [],
    redactedArguments: call.arguments,
    reason: blockedByTrust
      ? `MCP server ${server} trust level is ${trust}.`
      : `MCP ${server}.${tool} contains ${resourceTargets.length} inspected resource target(s).`,
  };
}

function findTargets(value: unknown, depth: number, limits: McpInspectionLimits): Array<{ path: string; uri?: string; trustZone: 'UNTRUSTED' }> {
  if (depth > limits.maxDepth || !value || typeof value !== 'object') return [];
  const results: Array<{ path: string; uri?: string; trustZone: 'UNTRUSTED' }> = [];
  for (const [key, nested] of Object.entries(value)) {
    if (['path', 'file', 'filepath', 'filename', 'uri', 'target', 'resource'].includes(key.toLowerCase()) && typeof nested === 'string') {
      const uri = nested.startsWith('file://') ? nested : undefined;
      let path = nested;
      if (uri) {
        try { path = decodeURIComponent(new URL(nested).pathname); } catch { path = nested; }
      }
      results.push({ path, uri, trustZone: 'UNTRUSTED' });
    }
    results.push(...findTargets(nested, depth + 1, limits));
  }
  return results;
}
