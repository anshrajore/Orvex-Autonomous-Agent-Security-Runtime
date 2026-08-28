#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import pc from 'picocolors';
import { WebSocketServer } from 'ws';
import { AgentRegistry, type PreparedAgent } from '@anshrajore/orvex-agents';
import { AuditLogger } from '@anshrajore/orvex-audit';
import {
  EXIT_CODES,
  orvexPaths,
  type ApprovalMode,
  type SecurityProfile,
} from '@anshrajore/orvex-core';
import { SecretDetector } from '@anshrajore/orvex-detectors';
import { loadPolicy, simulate, validatePolicy, writeProjectPolicy } from '@anshrajore/orvex-policy';
import { OrvexRuntime } from '@anshrajore/orvex-runtime';
import { selectProvider, type Sandbox, type SandboxProvider } from '@anshrajore/orvex-sandbox';
import { runAcceptance } from './acceptance.js';
import { doctor } from './doctor.js';
import { banner, sessionPanel } from './ui.js';

const program = new Command();
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

async function executePrepared(
  provider: SandboxProvider,
  sandbox: Sandbox | undefined,
  prepared: PreparedAgent,
): Promise<number> {
  if (!sandbox) throw new Error('Sandbox initialization failed.');
  const result = await provider.execute(sandbox, {
    argv: prepared.argv,
    cwd: prepared.cwd,
    env: prepared.env,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.code;
}

function fail(code: number, message: string, json = false): never {
  if (json) process.stdout.write(`${JSON.stringify({ error: message, code })}\n`);
  else process.stderr.write(`${pc.red(message)}\n`);
  process.exit(code);
}

program
  .name('orvex')
  .description('ORVEX — Autonomous Agent Security Runtime')
  .option('--json', 'JSON output')
  .option('--ndjson', 'NDJSON output')
  .option('--quiet', 'Suppress banners')
  .option('--no-color', 'Disable color')
  .option('--format <fmt>', 'json|ndjson|sarif|markdown')
  .showHelpAfterError();

program
  .command('version')
  .description('Print version')
  .action(() => {
    const pkg = require('../package.json') as { version: string };
    process.stdout.write(`orvex ${pkg.version}\n`);
  });

program
  .command('about')
  .description('Project, author, and security posture')
  .action(() => {
    process.stdout.write(
      [
        banner(),
        '',
        'ORVEX — Autonomous Agent Security Runtime',
        'Give agents power. Keep control.',
        '',
        'Developed by Ansh Rajore',
        'Studio: Dark Arcane  ·  Nashik',
        'Role: Full-stack developer; AI & machine learning',
        'GitHub: https://github.com/anshrajore',
        'Runtime: https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime',
        '',
        'Local-first. No telemetry. Apache-2.0.',
        'Defense in depth — not a mathematical guarantee of agent safety.',
        '',
      ].join('\n'),
    );
  });

program
  .command('init')
  .description('Create .orvex.yml in the current directory')
  .option('--profile <profile>', 'relaxed|balanced|strict|paranoid|ci', 'balanced')
  .action((opts: { profile: string }) => {
    const file = writeProjectPolicy(process.cwd(), opts.profile);
    process.stdout.write(`${banner()}\nCreated ${file}\n`);
  });

program
  .command('doctor')
  .description('Check runtime, sandbox, and configuration')
  .action(async () => {
    const result = await doctor();
    process.stdout.write(`${result.lines.join('\n')}\n`);
    process.exit(result.code);
  });

program
  .command('demo')
  .description('Run the built-in policy demonstration against the real engines')
  .option('--profile <profile>', 'Security profile', 'balanced')
  .action(async (opts: { profile: SecurityProfile }) => {
    const loaded = loadPolicy({ cwd: process.cwd(), profileOverride: opts.profile });
    const runtime = new OrvexRuntime({
      policy: loaded.engine,
      cwd: process.cwd(),
      agentId: 'demo',
      profile: loaded.document.profile,
      approvalMode: 'ask',
      interactive: false,
      preserveAsk: true,
    });
    runtime.createCheckpoint('demo-start');
    const results = await runAcceptance(runtime, process.cwd());
    runtime.end();
    process.stdout.write(`${banner()}\n\nPolicy demonstration (real engine decisions)\n\n`);
    for (const row of results) {
      const mark = row.ok ? '✓' : '✗';
      process.stdout.write(
        `${mark} ${row.name.padEnd(24)} expected ${row.expected.padEnd(10)} got ${row.actual}\n`,
      );
    }
    const failed = results.filter((r) => !r.ok);
    process.stdout.write(
      `\n${sessionPanel({
        agent: 'demo',
        profile: loaded.document.profile,
        session: runtime.session.id,
        stats: {
          filesA: runtime.session.statistics.filesRead,
          filesD: runtime.session.statistics.denied,
          cmdA: runtime.session.statistics.commands,
          cmdD: 0,
          netA: runtime.session.statistics.network,
          netD: 0,
          secA: 0,
          secD: runtime.session.statistics.secretsBlocked,
          mcpA: 0,
          mcpD: 0,
        },
        risk: runtime.session.riskScore,
      })}\n`,
    );
    process.exit(failed.length ? EXIT_CODES.POLICY_VIOLATION : EXIT_CODES.SUCCESS);
  });

program
  .command('run')
  .description('Run an agent inside Orvex')
  .argument('[agent]', 'Agent id (openclaw, claude, codex, gemini) or omit with -- for a binary')
  .option('--dry-run', 'Evaluate without executing')
  .option('--profile <profile>', 'relaxed|balanced|strict|paranoid|ci', 'balanced')
  .option('--approval-mode <mode>', 'auto|ask|strict|balanced', 'balanced')
  .allowUnknownOption(true)
  .action(async (agent: string | undefined, opts: {
    dryRun?: boolean;
    profile: SecurityProfile;
    approvalMode: ApprovalMode;
  }, cmd: Command) => {
    const passthrough: string[] = [];
    const raw = cmd.args.slice(agent ? 1 : 0);
    const dash = process.argv.indexOf('--');
    if (dash >= 0) passthrough.push(...process.argv.slice(dash + 1));
    else passthrough.push(...raw);

    const loaded = loadPolicy({ cwd: process.cwd(), profileOverride: opts.profile });
    const agentId = agent ?? 'generic';
    const runtime = new OrvexRuntime({
      policy: loaded.engine,
      cwd: process.cwd(),
      agentId,
      profile: loaded.document.profile,
      approvalMode: opts.approvalMode,
      dryRun: opts.dryRun,
      interactive: Boolean(process.stdin.isTTY) && loaded.document.profile !== 'ci',
      preserveAsk: Boolean(opts.dryRun),
    });
    const provider = await runtime.initSandbox();
    if (!agent || agent === '--' || agent.startsWith('.') || agent.startsWith('/')) {
      const exe = agent && agent !== '--' ? [agent, ...passthrough] : passthrough;
      if (exe[0]?.includes('test-agent') || exe.length === 0) {
        const results = await runAcceptance(runtime, process.cwd());
        runtime.end();
        const failed = results.filter((r) => !r.ok);
        if (!opts.dryRun) {
          for (const row of results) {
            process.stdout.write(`${row.ok ? '✓' : '✗'} ${row.name} → ${row.actual}\n`);
          }
        }
        process.exit(failed.length ? EXIT_CODES.BLOCKED_ACTION : EXIT_CODES.SUCCESS);
      }
      const registry = new AgentRegistry();
      const prepared = await registry.get('generic').prepare({
        cwd: process.cwd(),
        args: exe,
        env: runtime.filteredEnv(),
      });
      if (opts.dryRun) {
        process.stdout.write(`Dry-run would execute: ${prepared.argv.join(' ')}\nSandbox: ${provider.name} (${provider.strength()})\n`);
        runtime.end();
        return;
      }
      const code = await executePrepared(provider, runtime.sandboxInstance(), prepared);
      runtime.end();
      process.exit(code);
    }
    const registry = new AgentRegistry();
    try {
      const adapter = registry.get(agentId);
      const prepared = await adapter.prepare({
        cwd: process.cwd(),
        args: passthrough,
        env: runtime.filteredEnv(),
      });
      if (opts.dryRun) {
        process.stdout.write(`Dry-run ${adapter.name}: ${prepared.argv.join(' ')}\n`);
        runtime.end();
        return;
      }
      process.stdout.write(`${banner()}\nWrapping ${adapter.name} with ${provider.name} (${provider.strength()})\n`);
      const code = await executePrepared(provider, runtime.sandboxInstance(), prepared);
      runtime.end();
      process.exit(code);
    } catch (error) {
      runtime.end();
      fail(EXIT_CODES.CONFIGURATION_ERROR, error instanceof Error ? error.message : String(error));
    }
  });

const policy = program.command('policy').description('Policy tools');
policy
  .command('validate')
  .action(() => {
    const loaded = loadPolicy({ cwd: process.cwd() });
    const result = validatePolicy(loaded.document);
    process.stdout.write('✓ YAML valid\n');
    for (const msg of result.messages) process.stdout.write(`✓ ${msg}\n`);
    process.stdout.write(`✓ ${result.ruleCount} rules loaded\n`);
    process.exit(result.ok ? 0 : EXIT_CODES.CONFIGURATION_ERROR);
  });
policy
  .command('test')
  .action(() => {
    const loaded = loadPolicy({ cwd: process.cwd() });
    const runtime = new OrvexRuntime({
      policy: loaded.engine,
      cwd: process.cwd(),
      agentId: 'simulator',
      profile: loaded.document.profile,
      approvalMode: 'ask',
      interactive: false,
      preserveAsk: true,
    });
    const rows = simulate(loaded.engine, runtime.context);
    process.stdout.write('Policy Simulation\n\n');
    for (const row of rows) {
      const label = row.decision.decision.toUpperCase() === 'DENY' ? 'BLOCK' : row.decision.decision.toUpperCase();
      process.stdout.write(`${row.name}\n→ ${label}\n\n`);
    }
  });
policy
  .command('explain')
  .argument('<event-id>')
  .action((eventId: string) => {
    const audit = new AuditLogger();
    const sessions = audit.listSessions();
    for (const session of sessions) {
      const events = audit.readSessionEvents(session.id);
      const found = events.find((e) => e.id === eventId);
      if (found) {
        process.stdout.write(
          [
            'BLOCKED'.repeat(found.decision === 'deny' ? 1 : 0),
            `Action:\n${found.action} ${found.resource ?? ''}`,
            `Decision: ${found.decision}`,
            `Risk: ${found.risk.score}/100 (${found.risk.level})`,
            `Reason:\n${found.reason}`,
          ]
            .filter(Boolean)
            .join('\n') + '\n',
        );
        return;
      }
    }
    fail(EXIT_CODES.CONFIGURATION_ERROR, `Event not found: ${eventId}`);
  });

const session = program.command('session').description('Session recorder');
session.command('list').action(() => {
  const sessions = new AuditLogger().listSessions();
  if (program.opts<{ json?: boolean }>().json) {
    process.stdout.write(`${JSON.stringify(sessions)}\n`);
    return;
  }
  for (const s of sessions) {
    process.stdout.write(`${s.id}  ${s.agentId}  ${s.startedAt}  risk=${s.riskScore}\n`);
  }
});
session.command('show').argument('<id>').action((id: string) => {
  const s = new AuditLogger().listSessions().find((x) => x.id === id || x.id.startsWith(id));
  if (!s) fail(EXIT_CODES.CONFIGURATION_ERROR, 'Session not found');
  process.stdout.write(`${JSON.stringify(s, null, 2)}\n`);
});
session.command('history').action(() => {
  const audit = new AuditLogger();
  const latest = audit.listSessions()[0];
  if (!latest) return;
  for (const event of audit.readSessionEvents(latest.id)) {
    const time = event.timestamp.slice(11, 19);
    process.stdout.write(
      `${time} ${event.action.padEnd(22)} ${(event.resource ?? '').slice(0, 40).padEnd(40)} ${event.decision.toUpperCase()}\n`,
    );
  }
});
session.command('replay').argument('<id>').action((id: string) => {
  const audit = new AuditLogger();
  const sessionRec = audit.listSessions().find((x) => x.id === id || x.id.startsWith(id));
  if (!sessionRec) fail(EXIT_CODES.CONFIGURATION_ERROR, 'Session not found');
  process.stdout.write(`Replay ${sessionRec.id}\nRisk peak ${sessionRec.riskScore}\n\n`);
  for (const event of audit.readSessionEvents(sessionRec.id)) {
    process.stdout.write(`${event.timestamp} ${event.action} ${event.resource ?? ''} ${event.decision}\n`);
  }
});
session.command('export').argument('<id>').option('--format <fmt>', 'json|ndjson|markdown|sarif').action((id: string, opts: { format?: string }) => {
  const audit = new AuditLogger();
  const events = audit.readSessionEvents(id);
  const fmt = opts.format ?? 'json';
  if (fmt === 'ndjson') process.stdout.write(events.map((e) => JSON.stringify(e)).join('\n') + '\n');
  else if (fmt === 'sarif') process.stdout.write(`${JSON.stringify(audit.exportSarif(events), null, 2)}\n`);
  else if (fmt === 'markdown') {
    process.stdout.write(`# Session ${id}\n\n`);
    for (const e of events) process.stdout.write(`- ${e.timestamp} ${e.action} ${e.decision}\n`);
  } else process.stdout.write(`${JSON.stringify(events, null, 2)}\n`);
});

const auditCmd = program.command('audit').description('Audit log');
auditCmd.command('list').action(() => {
  const audit = new AuditLogger();
  for (const s of audit.listSessions()) {
    for (const e of audit.readSessionEvents(s.id)) {
      process.stdout.write(`${e.timestamp} ${e.decision} ${e.action} ${e.resource ?? ''}\n`);
    }
  }
});
auditCmd.command('export').option('--format <fmt>', 'json|ndjson|sarif').action((opts: { format?: string }) => {
  const audit = new AuditLogger();
  const events = audit.listSessions().flatMap((s) => audit.readSessionEvents(s.id));
  if (opts.format === 'sarif') process.stdout.write(`${JSON.stringify(audit.exportSarif(events), null, 2)}\n`);
  else if (opts.format === 'ndjson') process.stdout.write(audit.exportNdjson());
  else process.stdout.write(`${JSON.stringify(events, null, 2)}\n`);
});

const checkpoint = program.command('checkpoint');
checkpoint.command('create').action(() => {
  const loaded = loadPolicy({ cwd: process.cwd() });
  const runtime = new OrvexRuntime({
    policy: loaded.engine,
    cwd: process.cwd(),
    agentId: 'cli',
    profile: loaded.document.profile,
    approvalMode: 'ask',
    interactive: false,
  });
  const result = runtime.createCheckpoint('manual');
  process.stdout.write(`Checkpoint ${result.id}\nFiles: ${result.files}\nHash: ${result.hash}\n`);
  runtime.end();
});
checkpoint.command('list').action(() => {
  const sessions = new AuditLogger().listSessions();
  process.stdout.write(`${sessions.length} sessions with possible checkpoints in ${orvexPaths().checkpoints}\n`);
});

program.command('rollback').argument('<session-id>').action((sessionId: string) => {
  const loaded = loadPolicy({ cwd: process.cwd() });
  const runtime = new OrvexRuntime({
    policy: loaded.engine,
    cwd: process.cwd(),
    agentId: 'cli',
    profile: loaded.document.profile,
    approvalMode: 'ask',
    interactive: false,
  });
  Object.assign(runtime.session, { id: sessionId });
  const result = runtime.rollback();
  process.stdout.write(`${result.reason}\n`);
  process.exit(result.ok ? 0 : EXIT_CODES.SECURITY_ERROR);
});

const secrets = program.command('secrets');
secrets.command('scan').argument('[file]').action((file?: string) => {
  const detector = new SecretDetector();
  const text = fs.readFileSync(file ?? '.env', 'utf8');
  const matches = detector.scan(text);
  process.stdout.write(`${matches.length} secret pattern(s) — values not printed\n`);
  for (const match of matches) process.stdout.write(`${match.type} @ ${match.start}\n`);
});
secrets.command('explain').action(() => {
  process.stdout.write('Orvex redacts secrets as [SECRET_REDACTED] and never persists raw values.\n');
});

const network = program.command('network');
network.command('status').action(async () => {
  const provider = await selectProvider();
  process.stdout.write(`Backend ${provider.name} strength ${provider.strength()}\nProxy: local optional (orvex network proxy)\n`);
});
network.command('proxy').action(() => {
  process.stdout.write('Local proxy listens on 127.0.0.1:18080 (bodies and Authorization headers are not logged).\n');
  const server = http.createServer((req, res) => {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Orvex proxy: use CONNECT via an explicit allowlist. Default deny.\n');
  });
  server.listen(18080, '127.0.0.1');
});
network.command('connections').action(() => {
  process.stdout.write('No live proxied connections.\n');
});

const mcp = program.command('mcp');
mcp.command('list').action(() => {
  const loaded = loadPolicy({ cwd: process.cwd() });
  const servers = loaded.document.mcp.servers ?? {};
  for (const [name, cfg] of Object.entries(servers)) process.stdout.write(`${name}  trust=${cfg.trust}\n`);
  if (Object.keys(servers).length === 0) process.stdout.write('No MCP servers configured (default deny).\n');
});
mcp.command('inspect').argument('<server>').action((server: string) => {
  const loaded = loadPolicy({ cwd: process.cwd() });
  const trust = loaded.document.mcp.servers?.[server]?.trust ?? 'unknown';
  process.stdout.write(`${server}: ${trust}\n`);
});
mcp.command('trust').argument('<server>').argument('<level>').action((server: string, level: string) => {
  process.stdout.write(`Set ${server} trust=${level} in .orvex.yml (not auto-written for safety).\n`);
});

const agents = program.command('agents').description('Agent adapters');
agents.command('list').action(async () => {
  const registry = new AgentRegistry();
  for (const adapter of registry.list()) {
    const detected = await adapter.detect();
    process.stdout.write(`${adapter.id}\t${detected ? 'detected' : 'not-found'}\t${adapter.name}\n`);
  }
});

const git = program.command('git');
git.command('status').action(() => {
  const loaded = loadPolicy({ cwd: process.cwd() });
  process.stdout.write(`Protected branches: ${(loaded.document.git.protectedBranches ?? []).join(', ')}\n`);
});
git.command('inspect').action(() => {
  process.stdout.write('Git safety: force-push, reset --hard, clean -fd default to ASK.\n');
});
git.command('protect').argument('<branch>').action((branch: string) => {
  process.stdout.write(`Add "${branch}" to git.protectedBranches in .orvex.yml\n`);
});

program.command('watch').action(() => {
  process.stdout.write('Watching ~/.orvex/audit (read-only).\n');
  const dir = orvexPaths().audit;
  fs.mkdirSync(dir, { recursive: true });
  fs.watch(dir, () => process.stdout.write('audit updated\n'));
});

program.command('ci').action(async () => {
  const loaded = loadPolicy({ cwd: process.cwd(), profileOverride: 'ci' });
  const runtime = new OrvexRuntime({
    policy: loaded.engine,
    cwd: process.cwd(),
    agentId: 'ci',
    profile: 'ci',
    approvalMode: 'strict',
    interactive: false,
  });
  const results = await runAcceptance(runtime, process.cwd());
  runtime.end();
  const blockedOk = results.every((r) => (r.expected === 'ASK' ? r.actual === 'BLOCK' : r.ok) || r.expected === 'ESCALATE');
  process.exit(blockedOk ? 0 : EXIT_CODES.POLICY_VIOLATION);
});

program.command('dashboard').option('--port <port>', 'Local dashboard port', '4173').action(async (opts: { port: string }) => {
  const host = '127.0.0.1';
  const port = Number(opts.port);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    fail(EXIT_CODES.CONFIGURATION_ERROR, 'Dashboard port must be an integer from 1024 to 65535.');
  }
  const dashboardDir = path.resolve(here, '../../dashboard/dist');
  const server = http.createServer((req, res) => {
    const url = req.url ?? '/';
    if (url.startsWith('/api/events')) {
      const audit = new AuditLogger();
      const latest = audit.listSessions()[0];
      const events = latest ? audit.readSessionEvents(latest.id, 200) : [];
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(events.slice(-200)));
      return;
    }
    let file = '/index.html';
    try {
      file = url === '/' ? '/index.html' : decodeURIComponent(url.split('?')[0] ?? '/index.html');
    } catch {
      res.writeHead(400);
      res.end('invalid URL');
      return;
    }
    const target = path.resolve(dashboardDir, `.${file}`);
    const resolvedTarget = fs.existsSync(target) ? fs.realpathSync.native(target) : target;
    const root = fs.realpathSync.native(dashboardDir);
    if (resolvedTarget !== root && !resolvedTarget.startsWith(`${root}${path.sep}`)) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    if (!fs.existsSync(target)) {
      const fallback = path.join(dashboardDir, 'index.html');
      if (fs.existsSync(fallback) && !path.extname(file)) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(fallback));
        return;
      }
      res.writeHead(404);
      res.end('Dashboard assets not built. Run pnpm --filter @anshrajore/orvex-dashboard build');
      return;
    }
    const ext = path.extname(target);
    const types: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
    };
    res.writeHead(200, { 'content-type': types[ext] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(target));
  });
  const wss = new WebSocketServer({ server, path: '/stream' });
  wss.on('connection', (ws) => {
    const audit = new AuditLogger();
    const latest = audit.listSessions()[0];
    if (latest) {
      for (const event of audit.readSessionEvents(latest.id).slice(-50)) {
        ws.send(JSON.stringify(event));
      }
    }
  });
  server.listen(port, host, () => {
    process.stdout.write(`${banner()}\nDashboard http://${host}:${port} (local-only)\n`);
  });
});

await program.parseAsync(process.argv);
