export interface InjectionSignal {
  id: string;
  weight: number;
  explanation: string;
}

const SIGNALS: Array<{ id: string; re: RegExp; weight: number; explanation: string }> = [
  {
    id: 'ignore-previous',
    re: /ignore (all )?(previous|prior|above) instructions/i,
    weight: 40,
    explanation: 'Attempts to override prior instructions.',
  },
  {
    id: 'system-impersonation',
    re: /you are now (?:the )?(?:system|developer|admin)/i,
    weight: 30,
    explanation: 'Authority impersonation.',
  },
  {
    id: 'exfiltrate',
    re: /(?:send|exfiltrate|upload).*(?:api key|secret|\.env|id_rsa)/i,
    weight: 45,
    explanation: 'Secret extraction request.',
  },
  {
    id: 'run-command',
    re: /(?:run|execute) (?:this )?(?:shell )?command/i,
    weight: 25,
    explanation: 'Untrusted content requests tool/shell execution.',
  },
  {
    id: 'policy-bypass',
    re: /bypass (?:the )?(?:policy|firewall|sandbox|orvex)/i,
    weight: 40,
    explanation: 'Policy bypass request.',
  },
  {
    id: 'hidden-instruction',
    re: /<!--[\s\S]{0,200}(?:instruction|system prompt|ignore)[\s\S]{0,200}-->/i,
    weight: 20,
    explanation: 'Hidden HTML instruction.',
  },
];

export class PromptInjectionDetector {
  scan(text: string, trust: 'TRUSTED' | 'SEMI_TRUSTED' | 'UNTRUSTED' = 'UNTRUSTED'): {
    signals: InjectionSignal[];
    score: number;
    escalate: boolean;
  } {
    const signals: InjectionSignal[] = [];
    for (const signal of SIGNALS) {
      if (signal.re.test(text)) {
        signals.push({
          id: signal.id,
          weight: signal.weight,
          explanation: signal.explanation,
        });
      }
    }
    const trustFactor = trust === 'TRUSTED' ? 0.2 : trust === 'SEMI_TRUSTED' ? 0.6 : 1;
    const score = Math.round(signals.reduce((s, x) => s + x.weight, 0) * trustFactor);
    return { signals, score, escalate: score >= 25 };
  }
}
