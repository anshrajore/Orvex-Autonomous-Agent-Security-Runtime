import { PromptInjectionDetector, Redactor } from '@anshrajore/orvex-detectors';
import { assertMcpLimits } from './limits.js';
import { DEFAULT_MCP_LIMITS, type McpInspectionLimits, type McpResultInspection } from './types.js';

export function inspectMcpResult(
  result: unknown,
  limits: McpInspectionLimits = DEFAULT_MCP_LIMITS,
): McpResultInspection {
  assertMcpLimits(result, limits);
  const serialized = typeof result === 'string' ? result : JSON.stringify(result) ?? '';
  const injection = new PromptInjectionDetector().scan(serialized, 'UNTRUSTED');
  const redacted = new Redactor().redact(serialized);
  let redactedResult: unknown = result;
  if (typeof result !== 'string') {
    try { redactedResult = JSON.parse(redacted.text); } catch { redactedResult = '[MCP_RESULT_REDACTED]'; }
  } else {
    redactedResult = redacted.text;
  }
  return {
    redactedResult,
    promptInjectionScore: injection.score,
    secretDetected: redacted.count > 0,
    oversized: false,
    reason: injection.escalate
      ? `MCP result contains instruction-like content (score ${injection.score}/100).`
      : redacted.count > 0
        ? 'MCP result contained redacted secret material.'
        : 'MCP result passed redaction and prompt-injection checks.',
  };
}
