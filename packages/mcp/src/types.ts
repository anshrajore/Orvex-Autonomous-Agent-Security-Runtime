import type { McpTrust, ResourceClass, TrustZone } from '@anshrajore/orvex-core';

export type JsonRpcId = string | number | null;

export interface McpCall {
  server: string;
  tool: string;
  arguments: Record<string, unknown>;
  requestId?: JsonRpcId;
  method?: string;
}

export interface McpInspectionLimits {
  maxDepth: number;
  maxKeys: number;
  maxStringLength: number;
  maxSerializedBytes: number;
}

export interface McpResourceTarget {
  path?: string;
  uri?: string;
  classification?: ResourceClass;
  trustZone: TrustZone;
}

export interface McpInspection {
  server: string;
  tool: string;
  trust: McpTrust;
  blockedByTrust: boolean;
  malformed: boolean;
  oversized: boolean;
  resourceTargets: McpResourceTarget[];
  secretFields: string[];
  redactedArguments: Record<string, unknown>;
  reason: string;
}

export interface McpResultInspection {
  redactedResult: unknown;
  promptInjectionScore: number;
  secretDetected: boolean;
  oversized: boolean;
  reason: string;
}

export interface McpServerPolicy {
  trust: McpTrust;
  allowTools?: string[];
  denyTools?: string[];
}

export const DEFAULT_MCP_LIMITS: McpInspectionLimits = {
  maxDepth: 8,
  maxKeys: 256,
  maxStringLength: 16_384,
  maxSerializedBytes: 1_048_576,
};
