import { PromptInjectionDetector } from '@anshrajore/orvex-detectors';

export interface CommandNode {
  binary: string;
  args: string[];
  redirects: string[];
  redirectTargets: string[];
  envAssignments: string[];
}

export interface CommandGraph {
  raw: string;
  nodes: CommandNode[];
  pipes: boolean;
  chaining: boolean;
  subshell: boolean;
  pipesToInterpreter: boolean;
  remoteShell: boolean;
  destructive: boolean;
  privileged: boolean;
  force: boolean;
  targetPaths: string[];
  background: boolean;
  obfuscated: boolean;
  evasionTool: boolean;
}

interface Token {
  value: string;
  hasQuotes: boolean;
}

const INTERPRETERS = new Set(['sh', 'bash', 'zsh', 'dash', 'python', 'python3', 'node', 'perl', 'ruby', 'php']);
const DESTRUCTIVE = new Set(['rm', 'dd', 'mkfs', 'shred']);
const PRIVILEGED = new Set(['sudo', 'su', 'doas']);
const EVASION_TOOLS = new Set(['nc', 'ncat', 'netcat', 'socat', 'telnet', 'nmap', 'tcpdump', 'iptables', 'ufw', 'dig', 'nslookup']);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let current = '';
  let quote: string | null = null;
  let hasQuotes = false;

  const commitToken = () => {
    if (current) {
      tokens.push({ value: current, hasQuotes });
    }
    current = '';
    hasQuotes = false;
  };

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    if (quote) {
      if (ch === quote) {
        quote = null;
        hasQuotes = true;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      hasQuotes = true;
      continue;
    }
    if (ch === '\\' && i + 1 < input.length) {
      current += input[i + 1];
      hasQuotes = true;
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) commitToken();
      continue;
    }
    if (ch === '|' || ch === ';' || ch === '&' || ch === '>' || ch === '<') {
      commitToken();
      const next = input[i + 1];
      if ((ch === '&' || ch === '|' || ch === '>' || ch === '<') && next === ch) {
        tokens.push({ value: ch + ch, hasQuotes: false });
        i += 1;
      } else {
        tokens.push({ value: ch, hasQuotes: false });
      }
      continue;
    }
    current += ch;
  }
  commitToken();
  return tokens;
}

function splitSegments(tokens: Token[]): Token[][] {
  const segments: Token[][] = [];
  let current: Token[] = [];
  for (const token of tokens) {
    const t = token.value;
    if (t === '|' || t === '&&' || t === '||' || t === ';' || t === '&') {
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    current.push(token);
  }
  if (current.length) segments.push(current);
  return segments;
}

export function parseCommand(raw: string): CommandGraph {
  // Dynamic pipeline base64 script inspector
  let pipelineDecodedInjection = false;
  if (raw.includes('|') && raw.includes('base64')) {
    const base64Match = /\b[A-Za-z0-9+/]{24,}=*\b/.exec(raw);
    if (base64Match) {
      try {
        const decoded = Buffer.from(base64Match[0], 'base64').toString('utf8');
        const scanRes = new PromptInjectionDetector().scan(decoded, 'UNTRUSTED');
        if (scanRes.escalate) {
          pipelineDecodedInjection = true;
        }
      } catch {
        // Ignore decoding errors
      }
    }
  }

  // Dynamic pipeline hex script inspector
  let hexDecodedInjection = false;
  if (raw.includes('|') && (raw.includes('xxd') || raw.includes('hex'))) {
    const hexMatch = /\b[0-9a-fA-F]{32,}\b/.exec(raw);
    if (hexMatch) {
      try {
        const decoded = Buffer.from(hexMatch[0], 'hex').toString('utf8');
        const scanRes = new PromptInjectionDetector().scan(decoded, 'UNTRUSTED');
        if (scanRes.escalate) {
          hexDecodedInjection = true;
        }
      } catch {
        // Ignore decoding errors
      }
    }
  }

  const tokens = tokenize(raw);
  const tokenValues = tokens.map((t) => t.value);
  const pipes = tokenValues.includes('|');
  const chaining = tokenValues.some((t) => t === '&&' || t === '||' || t === ';');
  const subshell = raw.includes('$(') || raw.includes('`') || raw.includes('(');
  const segments = splitSegments(tokens);

  let commandObfuscated = false;
  const nodes: CommandNode[] = segments.map((seg) => {
    const redirects: string[] = [];
    const args: string[] = [];
    const redirectTargets: string[] = [];
    const envAssignments: string[] = [];
    let awaitingRedirectTarget = false;
    let binary = '';
    
    for (let i = 0; i < seg.length; i += 1) {
      const item = seg[i]!;
      if (item.value.startsWith('>') || item.value.startsWith('<')) {
        redirects.push(item.value);
        awaitingRedirectTarget = true;
      } else if (awaitingRedirectTarget) {
        redirectTargets.push(item.value);
        awaitingRedirectTarget = false;
      } else if (!binary && isEnvironmentAssignment(item.value)) {
        envAssignments.push(item.value);
      } else if (!binary) {
        binary = item.value;
        if (item.hasQuotes) {
          commandObfuscated = true;
        }
      } else {
        args.push(item.value);
      }
    }

    return { binary, args, redirects, redirectTargets, envAssignments };
  });

  const binaries = nodes.map((n) => n.binary.split(/[\\/]/).pop() ?? n.binary);
  const pipesToInterpreter = pipes && nodes.some((n, i) => i > 0 && INTERPRETERS.has(pathBase(n.binary)));
  const remoteFetch = binaries.some((b) => b === 'curl' || b === 'wget');
  const remoteShell = (pipesToInterpreter && remoteFetch) || raw.includes('/dev/tcp/') || pipelineDecodedInjection || hexDecodedInjection;
  const destructive = binaries.some((b) => DESTRUCTIVE.has(b));
  const privileged = binaries.some((b) => PRIVILEGED.has(b));
  const force = nodes.some((n) => n.args.includes('-f') || n.args.includes('--force') || n.args.includes('-rf') || n.args.includes('-fr'));

  // Script and path parsing
  const targetPaths = nodes.flatMap((n) => {
    const paths = n.args.filter((a) => a.startsWith('.') || a.startsWith('/') || a.startsWith('~') || a === '*');
    const firstArg = n.args[0];
    if (INTERPRETERS.has(pathBase(n.binary)) && firstArg && !firstArg.startsWith('-')) {
      if (!paths.includes(firstArg)) {
        paths.push(firstArg);
      }
    }
    return paths;
  });

  const background = tokenValues.includes('&') || binaries.some((b) => b === 'nohup' || b === 'disown');
  const evasionTool = binaries.some((b) => EVASION_TOOLS.has(b));

  return {
    raw,
    nodes,
    pipes,
    chaining,
    subshell,
    pipesToInterpreter,
    remoteShell,
    destructive,
    privileged,
    force,
    targetPaths,
    background,
    obfuscated: commandObfuscated || pipelineDecodedInjection || hexDecodedInjection,
    evasionTool,
  };
}

function isEnvironmentAssignment(value: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(value);
}

function pathBase(binary: string): string {
  return binary.split(/[\\/]/).pop() ?? binary;
}

export function isDangerousRm(graph: CommandGraph): boolean {
  for (const node of graph.nodes) {
    if (pathBase(node.binary) !== 'rm') continue;
    const recursive = node.args.some((a) => a.includes('r'));
    if (!recursive) continue;
    const targets = node.args.filter((a) => !a.startsWith('-'));
    if (targets.some((t) => t === '/' || t === '/*' || t === '~' || t === '~/' || (t === '.' && node.args.includes('/')))) {
      return true;
    }
    if (targets.some((t) => t === '/' || /^\/\*$/.test(t))) return true;
  }
  return false;
}
