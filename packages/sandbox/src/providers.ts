import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { filterEnvironment, generateId, type SandboxStrength } from '@anshrajore/orvex-core';

export interface SandboxOptions {
  cwd: string;
  env: Record<string, string>;
  readPaths: string[];
  writePaths: string[];
  networkAllow: string[];
  maxMemoryMb?: number;
  maxExecutionMinutes?: number;
}

export interface CommandRequest {
  argv: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface Sandbox {
  id: string;
  provider: string;
  strength: SandboxStrength;
}

export interface SandboxProvider {
  name: string;
  available(): Promise<boolean>;
  strength(): SandboxStrength;
  create(options: SandboxOptions): Promise<Sandbox>;
  execute(sandbox: Sandbox, request: CommandRequest): Promise<CommandResult>;
  destroy(sandboxId: string): Promise<void>;
}

function which(bin: string): string | undefined {
  const paths = (process.env.PATH ?? '').split(path.delimiter);
  for (const dir of paths) {
    const full = path.join(dir, bin);
    if (fs.existsSync(full)) return full;
  }
  return undefined;
}

function run(argv: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number }): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(argv[0] ?? '', argv.slice(1), {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = options.timeoutMs ? setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, options.timeoutMs) : undefined;
    child.stdout?.on('data', (d) => {
      stdout += String(d);
    });
    child.stderr?.on('data', (d) => {
      stderr += String(d);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code: timedOut ? 124 : code ?? 1, stdout, stderr: timedOut ? `${stderr}Execution timed out.\n` : stderr });
    });
  });
}

const sandboxes = new Map<string, SandboxOptions>();
const sandboxProfiles = new Map<string, string>();

export class FallbackProvider implements SandboxProvider {
  name = 'fallback-monitor';

  async available(): Promise<boolean> {
    return true;
  }

  strength(): SandboxStrength {
    return 'WEAK';
  }

  async create(options: SandboxOptions): Promise<Sandbox> {
    const id = generateId('sbx');
    sandboxes.set(id, options);
    return { id, provider: this.name, strength: this.strength() };
  }

  async execute(sandbox: Sandbox, request: CommandRequest): Promise<CommandResult> {
    const options = sandboxes.get(sandbox.id);
    if (!options) {
      return { code: 5, stdout: '', stderr: 'sandbox not found' };
    }
    return run(request.argv, {
      cwd: request.cwd ?? options.cwd,
      env: mergeSandboxEnv(options.env, request.env),
      timeoutMs: options.maxExecutionMinutes ? options.maxExecutionMinutes * 60_000 : undefined,
    });
  }

  async destroy(sandboxId: string): Promise<void> {
    sandboxes.delete(sandboxId);
  }
}

export class BubblewrapProvider implements SandboxProvider {
  name = 'bubblewrap';

  async available(): Promise<boolean> {
    return Boolean(which('bwrap'));
  }

  strength(): SandboxStrength {
    return 'STRONG';
  }

  async create(options: SandboxOptions): Promise<Sandbox> {
    const id = generateId('sbx');
    sandboxes.set(id, options);
    return { id, provider: this.name, strength: this.strength() };
  }

  async execute(sandbox: Sandbox, request: CommandRequest): Promise<CommandResult> {
    const options = sandboxes.get(sandbox.id);
    if (!options) return { code: 5, stdout: '', stderr: 'sandbox not found' };
    const bwrap = which('bwrap');
    if (!bwrap) return { code: 5, stdout: '', stderr: 'bubblewrap unavailable' };
    const argv = [
      bwrap,
      '--die-with-parent',
      '--unshare-pid',
      ...(options.networkAllow.length === 0 ? ['--unshare-net'] : []),
      '--ro-bind',
      '/usr',
      '/usr',
      '--ro-bind',
      '/bin',
      '/bin',
      '--ro-bind',
      '/lib',
      '/lib',
      '--dev',
      '/dev',
      '--proc',
      '/proc',
      '--ro-bind',
      options.cwd,
      options.cwd,
      ...options.writePaths.flatMap((writePath) => ['--bind', writePath, writePath]),
      '--chdir',
      request.cwd ?? options.cwd,
      ...request.argv,
    ];
    return run(argv, {
      env: mergeSandboxEnv(options.env, request.env),
      timeoutMs: options.maxExecutionMinutes ? options.maxExecutionMinutes * 60_000 : undefined,
    });
  }

  async destroy(sandboxId: string): Promise<void> {
    sandboxes.delete(sandboxId);
  }
}

export class MacosSandboxExecProvider implements SandboxProvider {
  name = 'sandbox-exec';

  async available(): Promise<boolean> {
    return process.platform === 'darwin' && Boolean(which('sandbox-exec'));
  }

  strength(): SandboxStrength {
    return 'MODERATE';
  }

  async create(options: SandboxOptions): Promise<Sandbox> {
    const id = generateId('sbx');
    sandboxes.set(id, options);
    return { id, provider: this.name, strength: this.strength() };
  }

  async execute(sandbox: Sandbox, request: CommandRequest): Promise<CommandResult> {
    const options = sandboxes.get(sandbox.id);
    if (!options) return { code: 5, stdout: '', stderr: 'sandbox not found' };
    const bin = which('sandbox-exec');
    if (!bin) return { code: 5, stdout: '', stderr: 'sandbox-exec unavailable' };
    const networkRule = options.networkAllow.length > 0 ? '(allow network-outbound)' : '';
    const profile = `(version 1)
(deny default)
(allow process-exec)
(allow process-fork)
(allow signal)
(allow sysctl-read)
(allow file-read* (subpath "/usr") (subpath "/bin") (subpath "/opt") (subpath "/System") (subpath "/Library") (subpath "/private/tmp") (subpath "${options.cwd}") (subpath "${os.homedir()}/.orvex"))
(allow file-write* (subpath "${options.cwd}") (subpath "/private/tmp") (subpath "${os.tmpdir()}"))
(allow file-ioctl)
(allow file-read-metadata)
${networkRule}
(allow mach-lookup)
`;
    const profilePath = path.join(os.tmpdir(), `orvex-${sandbox.id}.sb`);
    fs.writeFileSync(profilePath, profile, 'utf8');
    sandboxProfiles.set(sandbox.id, profilePath);
    return run([bin, '-f', profilePath, ...request.argv], {
      cwd: request.cwd ?? options.cwd,
      env: mergeSandboxEnv(options.env, request.env),
      timeoutMs: options.maxExecutionMinutes ? options.maxExecutionMinutes * 60_000 : undefined,
    });
  }

  async destroy(sandboxId: string): Promise<void> {
    sandboxes.delete(sandboxId);
    const profilePath = sandboxProfiles.get(sandboxId);
    if (profilePath) {
      fs.rmSync(profilePath, { force: true });
      sandboxProfiles.delete(sandboxId);
    }
  }
}

export class DockerProvider implements SandboxProvider {
  name = 'docker';

  async available(): Promise<boolean> {
    return Boolean(which('docker'));
  }

  strength(): SandboxStrength {
    return 'STRONG';
  }

  async create(options: SandboxOptions): Promise<Sandbox> {
    const id = generateId('sbx');
    sandboxes.set(id, options);
    return { id, provider: this.name, strength: this.strength() };
  }

  async execute(sandbox: Sandbox, request: CommandRequest): Promise<CommandResult> {
    const options = sandboxes.get(sandbox.id);
    if (!options) return { code: 5, stdout: '', stderr: 'sandbox not found' };
    const docker = which('docker');
    if (!docker) return { code: 5, stdout: '', stderr: 'docker unavailable' };
    const argv = [
      docker,
      'run',
      '--rm',
      '-v',
      `${options.cwd}:/work`,
      '-w',
      '/work',
      '--network',
      'none',
      'node:22-alpine',
      ...request.argv,
    ];
    return run(argv, { env: mergeSandboxEnv(options.env, request.env), timeoutMs: options.maxExecutionMinutes ? options.maxExecutionMinutes * 60_000 : undefined });
  }

  async destroy(sandboxId: string): Promise<void> {
    sandboxes.delete(sandboxId);
  }
}

function mergeSandboxEnv(base: Record<string, string>, override?: Record<string, string>): Record<string, string> {
  return { ...base, ...filterEnvironment(override ?? {}) };
}

export async function selectProvider(): Promise<SandboxProvider> {
  const candidates: SandboxProvider[] = [
    new BubblewrapProvider(),
    new MacosSandboxExecProvider(),
    new DockerProvider(),
    new FallbackProvider(),
  ];
  for (const provider of candidates) {
    if (await provider.available()) return provider;
  }
  return new FallbackProvider();
}
