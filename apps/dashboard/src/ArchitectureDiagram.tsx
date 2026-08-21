import { useState } from 'react';

export function ArchitectureDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'agent',
      label: 'Agent Process',
      sublabel: 'Claude, OpenClaw, Codex, Gemini',
      desc: 'Autonomous agent executing commands, generating code, calling tools and modifying workspace files.',
    },
    {
      id: 'runtime',
      label: 'Orvex Control Plane',
      sublabel: 'Central Orchestration & Interceptor',
      desc: 'Intercepts filesystem operations, process spawning, network sockets, secret access, MCP calls, and Git commands.',
    },
    {
      id: 'policy',
      label: 'Policy Engine',
      sublabel: 'Zero-Trust Rule Matching (Zod/YAML)',
      desc: 'Evaluates requests against profile rules (relaxed, balanced, strict, paranoid, ci) with path globs and host filters.',
    },
    {
      id: 'risk',
      label: 'Risk Scorer',
      sublabel: '0-100 Multi-Factor Analysis',
      desc: 'Calculates dynamic composite score based on data sensitivity, prompt injection heuristics, and anomaly frequency baselines.',
    },
    {
      id: 'decision',
      label: 'Decision Gate',
      sublabel: 'ALLOW · ASK · BLOCK · ESCALATE',
      desc: 'Combines policy and risk. High-risk actions trigger interactive user approval; violations are blocked with zero side effects.',
    },
    {
      id: 'sandbox',
      label: 'OS Sandbox',
      sublabel: 'Seatbelt · Bubblewrap · Docker',
      desc: 'Enforces execution in real kernel-isolated boundaries. Honest diagnostic doctor reports true isolation strength.',
    },
    {
      id: 'audit',
      label: 'Flight Recorder',
      sublabel: 'NDJSON Logs & SARIF 2.1.0',
      desc: 'Append-only audit trail with real-time secret redaction, interactive session replay, and GitHub Code Scanning export.',
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-8 lg:p-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] font-mono uppercase tracking-widest text-mute px-3 py-1 rounded-full border border-line bg-surface">
          Execution Lifecycle
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-white mt-4">
          How Orvex Secures Autonomous Agents
        </h3>
        <p className="text-sm text-mute mt-2">
          Every capability request is evaluated through defense-in-depth layers before reaching your host system.
        </p>
      </div>

      {/* Interactive Node Flow */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center relative">
        {nodes.map((node, idx) => {
          const isSelected = activeNode === node.id;
          return (
            <div key={node.id} className="contents md:block">
              <div
                onClick={() => setActiveNode(isSelected ? null : node.id)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-center flex flex-col justify-center min-h-[140px] ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-glow scale-105 z-10'
                    : 'bg-surface/80 border-line hover:border-dim hover:bg-surface text-white'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest mb-1.5 opacity-60">
                  Step {idx + 1}
                </div>
                <div className="text-xs font-bold leading-snug">{node.label}</div>
                <div className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-black/70' : 'text-mute'}`}>
                  {node.sublabel}
                </div>
              </div>

              {/* Arrow on mobile or desktop */}
              {idx < nodes.length - 1 && (
                <div className="hidden md:flex justify-center my-1 text-dim">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Node Detail Drawer */}
      <div className="mt-8 rounded-2xl border border-line bg-black/60 p-6 min-h-[90px] flex items-center justify-between transition-all">
        {activeNode ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              <h4 className="text-sm font-semibold text-white">
                {nodes.find((n) => n.id === activeNode)?.label}
              </h4>
            </div>
            <p className="text-xs text-mute mt-1.5 leading-relaxed">
              {nodes.find((n) => n.id === activeNode)?.desc}
            </p>
          </div>
        ) : (
          <div className="text-center w-full text-xs text-mute font-mono">
            Click on any architectural component above to inspect its security mechanisms & behavior.
          </div>
        )}
      </div>
    </div>
  );
}
