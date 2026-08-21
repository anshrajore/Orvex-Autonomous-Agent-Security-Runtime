import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Capability } from '@anshrajore/orvex-core';

export interface AgentContext {
  cwd: string;
  args: string[];
  env: Record<string, string>;
}

export interface PreparedAgent {
  argv: string[];
  env: Record<string, string>;
  cwd: string;
}

export interface AgentEvent {
  type: string;
  payload: unknown;
}

export interface AgentAdapter {
  id: string;
  name: string;
  detect(): Promise<boolean>;
  prepare(context: AgentContext): Promise<PreparedAgent>;
  capabilities(): Capability[];
  parseEvent(event: unknown): AgentEvent | null;
}

function lookOnPath(bin: string): string | undefined {
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
    const full = path.join(dir, process.platform === 'win32' ? `${bin}.cmd` : bin);
    const unix = path.join(dir, bin);
    if (fs.existsSync(unix)) return unix;
    if (fs.existsSync(full)) return full;
  }
  return undefined;
}

class NamedAdapter implements AgentAdapter {
  constructor(
    readonly id: string,
    readonly name: string,
    private readonly binaries: string[],
  ) {}

  async detect(): Promise<boolean> {
    return this.binaries.some((b) => Boolean(lookOnPath(b)));
  }

  async prepare(context: AgentContext): Promise<PreparedAgent> {
    const bin = this.binaries.map(lookOnPath).find(Boolean);
    if (!bin) {
      throw new Error(`${this.name} is not installed on PATH.`);
    }
    return { argv: [bin, ...context.args], env: context.env, cwd: context.cwd };
  }

  capabilities(): Capability[] {
    return ['filesystem.read', 'filesystem.write', 'process.execute', 'network.connect', 'mcp.call'];
  }

  parseEvent(event: unknown): AgentEvent | null {
    if (event && typeof event === 'object' && 'type' in event) {
      return { type: String((event as { type: string }).type), payload: event };
    }
    return null;
  }
}

class GenericAdapter implements AgentAdapter {
  id = 'generic';
  name = 'Generic executable';

  async detect(): Promise<boolean> {
    return true;
  }

  async prepare(context: AgentContext): Promise<PreparedAgent> {
    if (context.args.length === 0) {
      throw new Error('Generic mode requires an executable after --');
    }
    const target = context.args[0]!;
    const resolved = path.isAbsolute(target) ? target : path.resolve(context.cwd, target);
    if (!fs.existsSync(resolved) && !lookOnPath(target)) {
      throw new Error(`Executable not found: ${target}`);
    }
    return {
      argv: [fs.existsSync(resolved) ? resolved : lookOnPath(target)!, ...context.args.slice(1)],
      env: context.env,
      cwd: context.cwd,
    };
  }

  capabilities(): Capability[] {
    return ['filesystem.read', 'filesystem.write', 'process.execute'];
  }

  parseEvent(): AgentEvent | null {
    return null;
  }
}

export class AgentRegistry {
  private readonly adapters: AgentAdapter[] = [
    new NamedAdapter('openclaw', 'OpenClaw', ['openclaw']),
    new NamedAdapter('claude', 'Claude Code', ['claude']),
    new NamedAdapter('codex', 'Codex', ['codex']),
    new NamedAdapter('gemini', 'Gemini CLI', ['gemini']),
    new NamedAdapter('opencode', 'OpenCode', ['opencode']),
    new GenericAdapter(),
  ];

  register(adapter: AgentAdapter): void {
    this.adapters.unshift(adapter);
  }

  get(id: string): AgentAdapter {
    const found = this.adapters.find((a) => a.id === id);
    if (!found) {
      throw new Error(`Unknown agent adapter: ${id}`);
    }
    return found;
  }

  list(): AgentAdapter[] {
    return [...this.adapters];
  }
}

export function spawnPrepared(prepared: PreparedAgent): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(prepared.argv[0]!, prepared.argv.slice(1), {
      cwd: prepared.cwd,
      env: prepared.env,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}
