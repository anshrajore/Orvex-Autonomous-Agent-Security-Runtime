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
  {
    id: 'prompt-leak',
    re: /(?:reveal|show|dump|leak).*system.*prompt/i,
    weight: 35,
    explanation: 'Attempts to retrieve the system instructions.',
  },
  {
    id: 'markdown-exfiltration',
    re: /!\[.*\]\(https?:/i,
    weight: 30,
    explanation: 'Potential image-based data exfiltration vector.',
  },
];

/**
 * PromptInjectionDetector scans untrusted agent contexts and user inputs
 * for jailbreak attempts, authority impersonation, exfiltration requests,
 * and base64/hex obfuscated instruction injection payloads.
 */
export class PromptInjectionDetector {
  /**
   * Scan prompt text with a custom escalation score threshold.
   */
  scanWithOptions(
    text: string,
    options: { threshold?: number; trust?: 'TRUSTED' | 'SEMI_TRUSTED' | 'UNTRUSTED' }
  ) {
    const res = this.scan(text, options.trust);
    return {
      ...res,
      escalate: res.score >= (options.threshold ?? 25),
    };
  }

  scan(text: string, trust: 'TRUSTED' | 'SEMI_TRUSTED' | 'UNTRUSTED' = 'UNTRUSTED'): {
    signals: InjectionSignal[];
    score: number;
    escalate: boolean;
  } {
    const signals: InjectionSignal[] = [];
    const normalizedText = text.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 1. Direct scanning
    for (const signal of SIGNALS) {
      if (signal.re.test(normalizedText)) {
        signals.push({
          id: signal.id,
          weight: signal.weight,
          explanation: signal.explanation,
        });
      }
    }

    // 2. Base64 payload scanning
    const base64Matches = normalizedText.match(/[A-Za-z0-9+/]{16,}=*/g) || [];
    for (const match of base64Matches) {
      try {
        const decoded = Buffer.from(match, 'base64').toString('utf8');
        for (const signal of SIGNALS) {
          if (signal.re.test(decoded)) {
            // Avoid duplicate signals
            if (!signals.some(s => s.id === `obfuscated-base64-${signal.id}`)) {
              signals.push({
                id: `obfuscated-base64-${signal.id}`,
                weight: Math.round(signal.weight * 0.8),
                explanation: `Obfuscated base64 payload matching ${signal.id}: ${signal.explanation}`,
              });
            }
          }
        }
      } catch {
        // Ignore decoding errors
      }
    }

    // 3. Hex payload scanning
    const hexMatches = normalizedText.match(/[0-9a-fA-F]{24,}/g) || [];
    for (const match of hexMatches) {
      try {
        const decoded = Buffer.from(match, 'hex').toString('utf8');
        for (const signal of SIGNALS) {
          if (signal.re.test(decoded)) {
            // Avoid duplicate signals
            if (!signals.some(s => s.id === `obfuscated-hex-${signal.id}`)) {
              signals.push({
                id: `obfuscated-hex-${signal.id}`,
                weight: Math.round(signal.weight * 0.8),
                explanation: `Obfuscated hex payload matching ${signal.id}: ${signal.explanation}`,
              });
            }
          }
        }
      } catch {
        // Ignore decoding errors
      }
    }

    const trustFactor = trust === 'TRUSTED' ? 0.2 : trust === 'SEMI_TRUSTED' ? 0.6 : 1;
    const score = Math.round(signals.reduce((s, x) => s + x.weight, 0) * trustFactor);
    return { signals, score, escalate: score >= 25 };
  }
}
