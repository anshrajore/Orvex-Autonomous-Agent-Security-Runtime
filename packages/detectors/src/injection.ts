export interface InjectionSignal {
  id: string;
  weight: number;
  explanation: string;
}

const SIGNALS: Array<{ id: string; re: RegExp; weight: number; explanation: string }> = [
  {
    id: 'ignore-previous',
    re: /(?:ignore|forget|discard|disregard) (?:all )?(?:previous|prior|above|earlier|system|developer) (?:instructions|rules|constraints|messages)/i,
    weight: 40,
    explanation: 'Attempts to override prior instructions.',
  },
  {
    id: 'system-impersonation',
    re: /you are now (?:the )?(?:system|developer|admin|root|policy|firewall)/i,
    weight: 30,
    explanation: 'Authority impersonation.',
  },
  {
    id: 'jailbreak-persona',
    re: /\b(?:DAN|do anything now|developer mode|evil confidant|jailbreak mode|unfiltered mode|no[- ]?rules mode)\b/i,
    weight: 45,
    explanation: 'Jailbreak persona mimicry.',
  },
  {
    id: 'simulator-without-rules',
    re: /(?:you are|act as|pretend to be|roleplay as).{0,80}(?:simulator|persona|model|assistant).{0,80}(?:no rules|no constraints|unrestricted|uncensored)/i,
    weight: 38,
    explanation: 'Roleplay prompt attempts to remove safety constraints.',
  },
  {
    id: 'system-prompt-leak',
    re: /(?:repeat|print|reveal|output|dump|show).{0,80}(?:above|hidden|system|developer|initialization|initial|internal).{0,40}(?:instructions|prompt|message|policy|rules)/i,
    weight: 50,
    explanation: 'Attempts to leak system or initialization instructions.',
  },
  {
    id: 'system-instructions-reference',
    re: /\b(?:system instructions|developer instructions|initialization prompt|hidden prompt|internal policy|chain[- ]of[- ]thought)\b/i,
    weight: 25,
    explanation: 'References privileged instruction material.',
  },
  {
    id: 'instruction-override',
    re: /(?:from now on|new instructions|override|supersede|highest priority|priority zero|disable).{0,80}(?:rules|policy|firewall|guardrails|safety|constraints|orvex)/i,
    weight: 42,
    explanation: 'Attempts to override firewall or policy rules.',
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
    re: /(?:bypass|evade|disable|turn off|work around) (?:the )?(?:policy|firewall|sandbox|orvex|monitor|detector)/i,
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
    id: 'markdown-image-exfil',
    re: /!\[[^\]]{0,80}\]\(\s*https?:\/\/[^)\s]+(?:\?|%3[fF]).{0,300}(?:secret|token|key|data|env|prompt|base64|b64|payload)=/i,
    weight: 65,
    explanation: 'Hidden markdown image exfiltration vector.',
  },
  {
    id: 'dns-exfiltration',
    re: /\b(?:nslookup|dig|host|curl|wget)\b.{0,160}(?:\$\(.*(?:cat|printenv|env|base64).*\)|`.*(?:cat|printenv|env|base64).*`|[A-Za-z0-9+/]{24,}={0,2})\.[a-z0-9.-]+\.[a-z]{2,}/i,
    weight: 60,
    explanation: 'DNS or URL based exfiltration pattern.',
  },
  {
    id: 'tool-output-smuggling',
    re: /(?:append|encode|base64|compress).{0,100}(?:secret|token|api key|\.env|id_rsa).{0,120}(?:url|dns|query|image|markdown|webhook)/i,
    weight: 45,
    explanation: 'Attempts to smuggle sensitive data through outbound content.',
  },
];

const BASE64_RE = /(?:^|[^A-Za-z0-9+/])([A-Za-z0-9+/]{48,}={0,2})(?=$|[^A-Za-z0-9+/])/g;
const HEX_RE = /(?:^|[^A-Fa-f0-9])((?:0x)?[A-Fa-f0-9]{48,})(?=$|[^A-Fa-f0-9])/g;
const BINARY_RE = /(?:^|[^01])([01]{64,})(?=$|[^01])/g;
const ROT13_MARKER_RE = /\b(?:rot13|tr 'A-Za-z' 'N-ZA-Mn-za-m'|caesar(?: cipher)?|decode this)\b/i;

function entropy(segment: string): number {
  if (segment.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const ch of segment) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let total = 0;
  for (const count of counts.values()) {
    const p = count / segment.length;
    total -= p * Math.log2(p);
  }
  return total;
}

function collectObfuscationSignals(text: string): InjectionSignal[] {
  const signals: InjectionSignal[] = [];
  const addOnce = (signal: InjectionSignal) => {
    if (!signals.some((s) => s.id === signal.id)) signals.push(signal);
  };

  for (const match of text.matchAll(BASE64_RE)) {
    const payload = match[1] ?? '';
    if (entropy(payload) >= 4.6) {
      addOnce({
        id: 'base64-obfuscation',
        weight: 24,
        explanation: 'High-entropy Base64-like payload.',
      });
    }
  }
  for (const match of text.matchAll(HEX_RE)) {
    const payload = (match[1] ?? '').replace(/^0x/i, '');
    if (payload.length >= 48 && entropy(payload) >= 3.2) {
      addOnce({
        id: 'hex-obfuscation',
        weight: 18,
        explanation: 'Long hex-encoded payload.',
      });
    }
  }
  for (const match of text.matchAll(BINARY_RE)) {
    if ((match[1] ?? '').length >= 64) {
      addOnce({
        id: 'binary-obfuscation',
        weight: 18,
        explanation: 'Long binary-encoded payload.',
      });
    }
  }
  if (ROT13_MARKER_RE.test(text)) {
    addOnce({
      id: 'rot13-obfuscation',
      weight: 18,
      explanation: 'ROT13 or Caesar decoding instruction.',
    });
  }

  const words = text.match(/[A-Za-z0-9+/=_-]{32,}/g) ?? [];
  if (words.some((word) => entropy(word) >= 4.8)) {
    addOnce({
      id: 'high-entropy-segment',
      weight: 16,
      explanation: 'High-entropy segment may contain an encoded payload.',
    });
  }
  return signals;
}

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
    signals.push(...collectObfuscationSignals(text));
    const trustFactor = trust === 'TRUSTED' ? 0.2 : trust === 'SEMI_TRUSTED' ? 0.6 : 1;
    const score = Math.round(signals.reduce((s, x) => s + x.weight, 0) * trustFactor);
    return { signals, score, escalate: score >= 25 };
  }
}
