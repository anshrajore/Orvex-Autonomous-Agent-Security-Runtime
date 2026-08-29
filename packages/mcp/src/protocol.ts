import type { JsonRpcId, McpCall } from './types.js';

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: JsonRpcId;
  method: string;
  params?: unknown;
}

export function parseMcpRequest(input: unknown): McpJsonRpcRequest {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('MCP request must be a JSON object.');
  }
  const request = input as Record<string, unknown>;
  if (request.jsonrpc !== '2.0' || typeof request.method !== 'string' || request.method.length === 0) {
    throw new Error('MCP request must use JSON-RPC 2.0 with a method.');
  }
  if (!('id' in request) || !isJsonRpcId(request.id)) throw new Error('MCP request must have a valid id.');
  if ('params' in request && request.params !== undefined && (typeof request.params !== 'object' || request.params === null)) {
    throw new Error('MCP request params must be an object or array.');
  }
  return request as unknown as McpJsonRpcRequest;
}

export function requestToMcpCall(request: McpJsonRpcRequest, server: string): McpCall {
  const params = (request.params && typeof request.params === 'object' && !Array.isArray(request.params))
    ? request.params as Record<string, unknown>
    : {};
  const tool = typeof params.name === 'string' ? params.name : request.method;
  const args = params.arguments;
  return {
    server,
    tool,
    arguments: args && typeof args === 'object' && !Array.isArray(args) ? args as Record<string, unknown> : {},
    requestId: request.id,
    method: request.method,
  };
}

function isJsonRpcId(value: unknown): value is JsonRpcId {
  return value === null || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}
