export interface CommandNode {
  binary: string;
  args: string[];
  redirects: string[];
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
}

const INTERPRETERS = new Set(['sh', 'bash', 'zsh', 'dash', 'python', 'python3', 'node', 'perl', 'ruby']);
const DESTRUCTIVE = new Set(['rm', 'dd', 'mkfs', 'shred']);
const PRIVILEGED = new Set(['sudo', 'su', 'doas']);

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '\\' && i + 1 < input.length) {
      current += input[i + 1];
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) tokens.push(current);
      current = '';
      continue;
    }
    if (ch === '|' || ch === ';' || ch === '&') {
      if (current) tokens.push(current);
      current = '';
      const next = input[i + 1];
      if ((ch === '&' || ch === '|') && next === ch) {
        tokens.push(ch + ch);
        i += 1;
      } else {
        tokens.push(ch);
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function splitSegments(tokens: string[]): string[][] {
  const segments: string[][] = [];
  let current: string[] = [];
  for (const token of tokens) {
    if (token === '|' || token === '&&' || token === '||' || token === ';' || token === '&') {
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
  const tokens = tokenize(raw);
  const pipes = tokens.includes('|');
  const chaining = tokens.some((t) => t === '&&' || t === '||' || t === ';');
  const subshell = raw.includes('$(') || raw.includes('`') || raw.includes('(');
  const segments = splitSegments(tokens);
  const nodes: CommandNode[] = segments.map((seg) => {
    const redirects: string[] = [];
    const parts: string[] = [];
    for (const item of seg) {
      if (item.startsWith('>') || item.startsWith('<')) redirects.push(item);
      else parts.push(item);
    }
    return { binary: parts[0] ?? '', args: parts.slice(1), redirects };
  });

  const binaries = nodes.map((n) => n.binary.split(/[\\/]/).pop() ?? n.binary);
  const pipesToInterpreter = pipes && nodes.some((n, i) => i > 0 && INTERPRETERS.has(pathBase(n.binary)));
  const remoteFetch = binaries.some((b) => b === 'curl' || b === 'wget');
  const remoteShell = pipesToInterpreter && remoteFetch;
  const destructive = binaries.some((b) => DESTRUCTIVE.has(b));
  const privileged = binaries.some((b) => PRIVILEGED.has(b));
  const force = nodes.some((n) => n.args.includes('-f') || n.args.includes('--force') || n.args.includes('-rf') || n.args.includes('-fr'));
  const targetPaths = nodes.flatMap((n) => n.args.filter((a) => a.startsWith('.') || a.startsWith('/') || a.startsWith('~') || a === '*'));

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
  };
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
    if (targets.some((t) => t === '/' || t === '/*' || t === '~' || t === '~/' || t === '.' && node.args.includes('/'))) {
      return true;
    }
    if (targets.some((t) => t === '/' || /^\/\*$/.test(t))) return true;
  }
  return false;
}
