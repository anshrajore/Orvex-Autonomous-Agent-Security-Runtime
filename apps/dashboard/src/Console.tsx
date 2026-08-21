import { useMemo, useState } from 'react';
import { Mark } from './Mark';

export type EventRow = {
  id: string;
  timestamp: string;
  action: string;
  resource?: string;
  decision: 'allow' | 'deny' | 'ask';
  reason: string;
  risk: { score: number; level: string };
};

const NAV_TABS = [
  { id: 'Overview', label: 'Overview & Telemetry' },
  { id: 'Live Events', label: 'Live Audit Log' },
  { id: 'Blocked Actions', label: 'Blocked Attacks' },
  { id: 'Policies', label: 'Active Policy Rules' },
  { id: 'Agents', label: 'Agent Adapters' },
  { id: 'Sandbox', label: 'Sandbox Diagnostics' },
  { id: 'Checkpoints', label: 'Workspace Snapshots' },
] as const;

export function Console({
  events,
  onHome,
  onOpenGuide,
}: {
  events: EventRow[];
  onHome: () => void;
  onOpenGuide: () => void;
}) {
  const [activeTab, setActiveTab] = useState<(typeof NAV_TABS)[number]['id']>('Overview');
  const [filterQuery, setFilterQuery] = useState('');

  const blockedEvents = useMemo(() => events.filter((e) => e.decision === 'deny'), [events]);
  const peakRisk = useMemo(() => Math.max(0, ...events.map((e) => e.risk.score), 0), [events]);

  const filteredEvents = useMemo(() => {
    if (!filterQuery) return events;
    return events.filter(
      (e) =>
        e.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (e.resource && e.resource.toLowerCase().includes(filterQuery.toLowerCase())) ||
        e.reason.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [events, filterQuery]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-line bg-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button type="button" onClick={onHome} className="flex items-center gap-3 group focus:outline-none">
            <Mark className="h-6 w-6 transition-transform group-hover:scale-105" />
            <span className="font-bold tracking-tight text-white text-sm">ORVEX CONSOLE</span>
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-mute border-l border-line pl-6">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
            <span>127.0.0.1:4173 (SECURE LOCAL BIND)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-xs font-medium text-mute hover:text-white transition-colors"
          >
            Docs & Manual
          </button>
          <button
            type="button"
            onClick={onHome}
            className="text-xs font-medium rounded-full border border-line bg-surface px-3 py-1 text-neutral-300 hover:text-white hover:border-dim transition-all"
          >
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Console Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-line bg-surface/40 p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-dim px-3 py-2">Navigation</div>
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-glow'
                    : 'text-mute hover:text-white hover:bg-surface'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'Blocked Actions' && blockedEvents.length > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                    {blockedEvents.length}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-8 px-3">
            <div className="rounded-2xl border border-line bg-black/60 p-4 text-xs space-y-2">
              <div className="text-dim text-[10px] uppercase font-mono tracking-wider">Flight Recorder</div>
              <p className="text-mute text-[11px] leading-relaxed">
                Telemetry is never sent to external servers. All session logs persist in ~/.orvex/audit.
              </p>
              <div className="text-white font-mono text-[10px] pt-1">v0.2.0 · Dark Arcane</div>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Runtime Security Telemetry</h2>
                <p className="text-xs text-mute mt-1">Live metrics from active agent interception session.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-mute">Total Events</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{events.length}</div>
                  <div className="text-[11px] text-dim mt-1 font-mono">Real-time evaluated</div>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-5">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-mute">Blocked Incursions</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{blockedEvents.length}</div>
                  <div className="text-[11px] text-dim mt-1 font-mono">Zero side-effects allowed</div>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-5">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-mute">Peak Risk Level</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{peakRisk}<span className="text-sm text-dim">/100</span></div>
                  <div className="text-[11px] text-dim mt-1 font-mono">{peakRisk > 75 ? 'Critical Risk Blocked' : 'Normal Operations'}</div>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-5">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-mute">Sandbox Mode</div>
                  <div className="text-xl font-extrabold text-white mt-2 truncate">sandbox-exec</div>
                  <div className="text-[11px] text-dim mt-1 font-mono">Strength: MODERATE</div>
                </div>
              </div>

              {/* Recent Events Sample */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Recent Security Interceptions</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Live Events')}
                    className="text-xs text-mute hover:text-white font-mono"
                  >
                    View All Logs →
                  </button>
                </div>
                <EventTable events={events.slice(-8)} />
              </div>
            </div>
          )}

          {activeTab === 'Live Events' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Live Event Stream</h2>
                  <p className="text-xs text-mute mt-0.5">Continuous append-only audit trail.</p>
                </div>
                <input
                  type="text"
                  placeholder="Filter by action, path, reason..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-4 py-1.5 text-xs text-white placeholder-dim focus:outline-none focus:border-dim w-full md:w-64"
                />
              </div>
              <EventTable events={filteredEvents} />
            </div>
          )}

          {activeTab === 'Blocked Actions' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Blocked Actions & Policy Violations</h2>
                <p className="text-xs text-mute mt-0.5">Operations terminated before affecting the filesystem or operating system.</p>
              </div>
              <EventTable events={blockedEvents} />
            </div>
          )}

          {activeTab === 'Policies' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Active Policy Schema</h2>
                <p className="text-xs text-mute mt-0.5">Loaded from .orvex.yml with balanced profile defaults.</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-6 font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto">
                <pre>{`version: 1
profile: balanced
isolation:
  provider: auto
  fallback: allow-with-warning

filesystem:
  default: deny
  read:
    allow:
      - './**'
      - '!**/.env*'
      - '!~/.ssh/**'
  write:
    allow:
      - './src/**'
      - './dist/**'
      - './tests/**'

network:
  default: deny
  allow:
    - 'github.com:443'
    - 'registry.npmjs.org:443'
  block:
    - '169.254.169.254' # Cloud Metadata Protection

secrets:
  default: deny
  redact: true

mcp:
  default: deny
  trust:
    - server: 'github.com/modelcontextprotocol/servers/*'
      level: 'verified'

git:
  protectedBranches:
    - 'main'
    - 'master'
  requireApprovalOnPush: true`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'Agents' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Supported Agent Adapters</h2>
                <p className="text-xs text-mute mt-0.5">Pre-configured launchers with environment token scrubbing and sandboxing.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Claude Code', cmd: 'orvex run claude', desc: 'Runs Anthropic Claude Code inside seatbelt sandbox with full argument pass-through.' },
                  { name: 'OpenClaw', cmd: 'orvex run openclaw', desc: 'Interception adapter for OpenClaw autonomous coding workflows.' },
                  { name: 'Codex CLI', cmd: 'orvex run codex', desc: 'Secure executor for OpenAI Codex agent tasks.' },
                  { name: 'Gemini CLI', cmd: 'orvex run gemini', desc: 'Controls Google Gemini terminal assistant processes.' },
                  { name: 'OpenCode', cmd: 'orvex run opencode', desc: 'Lightweight agent wrapper with strict filesystem rules.' },
                  { name: 'Generic Executable', cmd: 'orvex run -- ./my-agent', desc: 'Universal zero-trust launcher for custom binaries and Python/Node scripts.' },
                ].map((a) => (
                  <div key={a.name} className="rounded-2xl border border-line bg-surface p-5">
                    <h3 className="text-sm font-bold text-white">{a.name}</h3>
                    <code className="text-xs font-mono text-dim block mt-1">{a.cmd}</code>
                    <p className="text-xs text-mute mt-3">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Sandbox' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Sandbox Provider Diagnostics</h2>
                <p className="text-xs text-mute mt-0.5">Reported by `orvex doctor` diagnostic engine.</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-line bg-surface p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">macOS Seatbelt (sandbox-exec)</h3>
                    <p className="text-xs text-mute mt-1">Status: AVAILABLE (Active) · Strength: MODERATE</p>
                    <p className="text-xs text-dim mt-2">Dynamic Scheme profile generation active.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold">READY</span>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Linux Bubblewrap (bwrap)</h3>
                    <p className="text-xs text-mute mt-1">Status: NOT DETECTED (Platform is Darwin)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full border border-line text-dim text-[10px] font-bold">N/A</span>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Docker Container Backend</h3>
                    <p className="text-xs text-mute mt-1">Status: OPTIONAL · Strength: STRONG</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full border border-line text-neutral-300 text-[10px] font-bold">STANDBY</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Checkpoints' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Workspace Checkpoints & Rollback</h2>
                <p className="text-xs text-mute mt-0.5">Cryptographically hashed snapshots allowing instant full recovery.</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-6 font-mono text-xs text-neutral-300 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <span className="text-white font-bold">chk_9a18cf42</span>
                    <span className="text-dim text-[11px] ml-3">2026-08-21 08:45:00 · 34 files</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold">ACTIVE BASELINE</span>
                </div>
                <p className="text-mute font-sans text-xs">
                  To restore your workspace to this snapshot state:
                  <br />
                  <code className="text-white font-mono bg-black px-2 py-1 rounded mt-2 inline-block">orvex rollback chk_9a18cf42</code>
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EventTable({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-12 text-center text-xs text-dim font-mono">
        No security events recorded in this view.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-line text-mute uppercase text-[10px] bg-black/40">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Resource Target</th>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Enforcement Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 text-dim text-[11px]">{event.timestamp.slice(11, 19)}</td>
                <td className="py-3 px-4 text-white font-semibold">{event.action}</td>
                <td className="py-3 px-4 text-neutral-300 max-w-[200px] truncate">{event.resource ?? '—'}</td>
                <td className="py-3 px-4">
                  {event.decision === 'allow' && (
                    <span className="inline-block px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold">ALLOW</span>
                  )}
                  {event.decision === 'ask' && (
                    <span className="inline-block px-2 py-0.5 rounded border border-neutral-400 text-neutral-200 text-[10px]">ASK</span>
                  )}
                  {event.decision === 'deny' && (
                    <span className="inline-block px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 text-[10px]">DENY</span>
                  )}
                </td>
                <td className="py-3 px-4 text-neutral-400">{event.risk.score}/100</td>
                <td className="py-3 px-4 text-mute font-sans text-xs max-w-sm truncate">{event.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
