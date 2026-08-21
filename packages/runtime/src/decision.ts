import type { Decision, PolicyDecision, RiskAssessment } from '@orvex/core';

export type FinalDecision = Decision;

export interface EvaluatedAction {
  policy: PolicyDecision;
  risk: RiskAssessment;
  decision: FinalDecision;
  reason: string;
  sideEffectAllowed: boolean;
}

export function combineDecision(policy: PolicyDecision, risk: RiskAssessment): EvaluatedAction {
  let decision = policy.decision;
  let reason = policy.reason;
  if (risk.level === 'critical' && decision === 'allow') {
    decision = 'ask';
    reason = `${policy.reason} Elevated to ASK because risk is critical (${risk.score}/100).`;
  }
  return {
    policy,
    risk,
    decision,
    reason,
    sideEffectAllowed: decision === 'allow',
  };
}
