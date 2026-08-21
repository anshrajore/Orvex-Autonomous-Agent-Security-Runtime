import fs from 'node:fs';
import path from 'node:path';

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
  obfuscated: boolean;
  nestedSubshells: boolean;
  background: boolean;
  dangerousNetworkTool: boolean;
  reverseShell: boolean;
  scriptTargets: string[];
  inspectedScripts: Array<{ path: string; exists: boolean; suspicious: boolean }>;
  targetPaths: string[];
}

const INTERPRETERS = new Set(['sh', 'bash', 'zsh', 'dash', 'python', 'python3', 'node', 'perl', 'ruby']);
const DESTRUCTIVE = new Set(['rm', 'dd', 'mkfs', 'shred']);
const PRIVILEGED = new Set(['sudo', 'su', 'doas']);
const NETWORK_TOOLS = new Set(['nc', 'ncat', 'netcat', 'socat', 'nmap', 'masscan', 'iptables', 'ip6tables', 'telnet', 'ssh', 'scp', 'rsync']);
const SCRIPT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.py', '.rb', '.pl', '.sh', '.bash', '.zsh']);
const STRING_CONCAT_RE = /(?:[A-Za-z])(?:['"]\s*['"]|\\['"]?)(?:[A-Za-z])/;
const BACKSLASH_ESCAPE_RE = /(?:^|[^\\])\\[A-Za-z0-9_./-]/;
const REVERSE_SHELL_RE = /(?:\/dev\/tcp\/|bash\s+-i|sh\s+-i|exec\s+\d?<>|nc\s+(?:-[^\s]*e|.*\s-e\s)|ncat\s+(?:-[^\s]*e|.*\s-e\s)|socat\s+.*(?:exec|pty|tcp|openssl))/i;

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
    if (ch === '>' || ch === '<') {
      if (current) tokens.push(current);
      current = ch;
      const next = input[i + 1];
      if (next === ch || next === '&') {
        current += next;
        i += 1;
      }
      tokens.push(current);
      current = '';
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
  const nestedSubshells = subshellDepth(raw) >= 2 || (raw.match(/`/g)?.length ?? 0) >= 4;
  const background = tokens.includes('&') || /^\s*nohup\b/i.test(raw) || /\b(?:nohup|disown|setsid)\b/i.test(raw);
  const obfuscated = STRING_CONCAT_RE.test(raw) || BACKSLASH_ESCAPE_RE.test(raw) || hasSplitBinary(raw);
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
  const dangerousNetworkTool = binaries.some((b) => NETWORK_TOOLS.has(b));
  const reverseShell = REVERSE_SHELL_RE.test(raw);
  const force = nodes.some((n) => n.args.includes('-f') || n.args.includes('--force') || n.args.includes('-rf') || n.args.includes('-fr'));
  const targetPaths = nodes.flatMap((n) => n.args.filter((a) => a.startsWith('.') || a.startsWith('/') || a.startsWith('~') || a === '*'));
  const scriptTargets = nodes.flatMap((node) => scriptTargetsForNode(node));
  const inspectedScripts = scriptTargets.map((scriptPath) => inspectScript(scriptPath));

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
    obfuscated,
    nestedSubshells,
    background,
    dangerousNetworkTool,
    reverseShell,
    scriptTargets,
    inspectedScripts,
    targetPaths,
  };
}

function pathBase(binary: string): string {
  return binary.split(/[\\/]/).pop() ?? binary;
}

function subshellDepth(raw: string): number {
  let depth = 0;
  let max = 0;
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] === '$' && raw[i + 1] === '(') {
      depth += 1;
      max = Math.max(max, depth);
      i += 1;
      continue;
    }
    if (raw[i] === ')' && depth > 0) depth -= 1;
  }
  return max;
}

function hasSplitBinary(raw: string): boolean {
  const compact = raw.replace(/['"\\\s]/g, '').toLowerCase();
  return ['curl', 'wget', 'bash', 'sh', 'python', 'node', 'nc', 'socat'].some(
    (binary) => compact.includes(binary) && !new RegExp(`\\b${binary}\\b`, 'i').test(raw),
  );
}

function scriptTargetsForNode(node: CommandNode): string[] {
  if (!INTERPRETERS.has(pathBase(node.binary))) return [];
  const args = node.args.filter((arg) => !arg.startsWith('-'));
  const firstScript = args.find((arg) => SCRIPT_EXTENSIONS.has(path.extname(arg)) || arg.startsWith('.') || arg.startsWith('/') || arg.startsWith('~'));
  return firstScript ? [firstScript] : [];
}

function inspectScript(scriptPath: string): { path: string; exists: boolean; suspicious: boolean } {
  const resolved = path.resolve(scriptPath.replace(/^~(?=$|\/)/, process.env.HOME ?? '~'));
  try {
    const stat = fs.statSync(resolved);
    if (!stat.isFile() || stat.size > 256_000) return { path: resolved, exists: stat.isFile(), suspicious: false };
    const content = fs.readFileSync(resolved, 'utf8');
    return {
      path: resolved,
      exists: true,
      suspicious: REVERSE_SHELL_RE.test(content) || /\b(?:curl|wget|nc|ncat|socat)\b.{0,120}\b(?:bash|sh|python|node)\b/i.test(content),
    };
  } catch {
    return { path: resolved, exists: false, suspicious: false };
  }
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
