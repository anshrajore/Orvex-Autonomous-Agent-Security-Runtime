export interface SecretMatch {
  type: string;
  start: number;
  end: number;
}

const PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: 'aws_access_key', re: /AKIA[0-9A-Z]{16}/g },
  { type: 'github_token', re: /ghp_[A-Za-z0-9]{20,}/g },
  { type: 'github_pat', re: /github_pat_[A-Za-z0-9_]{20,}/g },
  { type: 'google_api_key', re: /AIza[0-9A-Za-z_-]{35}/g },
  { type: 'stripe_secret', re: /sk_(?:live|test)_[0-9A-Za-z]{16,}/g },
  { type: 'npm_token', re: /npm_[A-Za-z0-9]{20,}/g },
  { type: 'openai_key', re: /sk-[A-Za-z0-9]{20,}/g },
  { type: 'anthropic_key', re: /sk-ant-[A-Za-z0-9\-_]{20,}/g },
  { type: 'jwt', re: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  {
    type: 'private_key',
    re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  { type: 'slack_token', re: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { type: 'database_url', re: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s'"`]+/gi },
  {
    type: 'generic_secret_assignment',
    re: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
  },
];

export class SecretDetector {
  scan(text: string): SecretMatch[] {
    const matches: SecretMatch[] = [];
    for (const { type, re } of PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        matches.push({ type, start: m.index, end: m.index + m[0].length });
        if (m[0].length === 0) re.lastIndex += 1;
      }
    }
    return matches;
  }
}

export class Redactor {
  constructor(
    private readonly detector = new SecretDetector(),
    private readonly replacement = '[SECRET_REDACTED]',
  ) {}

  redact(text: string): { text: string; count: number } {
    const matches = this.detector.scan(text).sort((a, b) => b.start - a.start);
    let output = text;
    for (const match of matches) {
      output = output.slice(0, match.start) + this.replacement + output.slice(match.end);
    }
    return { text: output, count: matches.length };
  }
}

export class SecretVault {
  private readonly ids = new Map<string, string>();

  remember(type: string, hash: string): string {
    const id = `secret_${this.ids.size + 1}`;
    this.ids.set(hash, id);
    return id;
  }
}
