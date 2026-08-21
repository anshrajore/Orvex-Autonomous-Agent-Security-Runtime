import { Mark } from './Mark';

export function Footer() {
  return (
    <footer className="border-t border-line bg-black text-white">

      {/* ── CREATOR SPOTLIGHT STRIP ── */}
      <div className="relative overflow-hidden border-b border-line">
        {/* Glow blobs */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-64 h-32 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-24 bg-white/4 blur-[60px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left: Identity block */}
            <div className="flex items-start gap-6">
              {/* Avatar initial ring */}
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-white select-none">AR</span>
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white animate-pulse border-2 border-black" />
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-dim mb-1">
                  Architected & Engineered by
                </p>
                <h3 className="text-2xl font-black tracking-tight text-white">Ansh Rajore</h3>
                <p className="text-sm text-mute mt-1">
                  Creator · Lead Architect · Principal Engineer
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-dim">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Nashik, India
                  </span>
                  <span className="text-dim/40">·</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-dim">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Dark Arcane Studio
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Package ownership stat grid */}
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="rounded-xl border border-line bg-surface/40 px-3 py-4">
                <span className="block text-2xl font-black text-white">13</span>
                <span className="block text-[10px] text-dim uppercase tracking-wider mt-1">Packages</span>
              </div>
              <div className="rounded-xl border border-line bg-surface/40 px-3 py-4">
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="block text-[10px] text-dim uppercase tracking-wider mt-1">Sole Author</span>
              </div>
              <div className="rounded-xl border border-line bg-surface/40 px-3 py-4">
                <span className="block text-2xl font-black text-white">v0.1</span>
                <span className="block text-[10px] text-dim uppercase tracking-wider mt-1">Runtime</span>
              </div>
            </div>
          </div>

          {/* Package chips row */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              'orvex-core', 'orvex-agents', 'orvex-audit', 'orvex-detectors',
              'orvex-git', 'orvex-mcp', 'orvex-policy', 'orvex-risk',
              'orvex-runtime', 'orvex-sandbox', 'orvex-sdk', 'orvex-cli',
            ].map((pkg) => (
              <a
                key={pkg}
                href={`https://www.npmjs.com/package/@anshrajore/${pkg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/30 px-3 py-1 text-[10px] font-mono text-dim hover:text-white hover:border-dim transition-all"
              >
                <span className="text-dim/60">@anshrajore/</span>
                <span className="text-white">{pkg}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER GRID ── */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Mark className="h-7 w-7" />
              <span className="text-lg font-bold tracking-tight text-white">ORVEX</span>
            </div>
            <p className="text-sm text-mute leading-relaxed max-w-sm">
              The defense-in-depth security runtime for autonomous AI agents. Policy, risk, approval, OS sandboxing, and full flight recorder — all local, zero cloud telemetry.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-mute w-fit">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>Developed by <strong className="text-white">Ansh Rajore</strong></span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-mute w-fit">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Apache-2.0 Open Source</span>
              </div>
            </div>
          </div>

          {/* Col 1: Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mute mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-sm text-mute">
              <li><span className="hover:text-white transition-colors cursor-pointer">Policy Engine</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Risk Scoring (0-100)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">OS Sandbox (Seatbelt/bwrap)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Secret Vault & Redaction</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Prompt Injection Shield</span></li>
            </ul>
          </div>

          {/* Col 2: Governance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mute mb-4">Governance</h4>
            <ul className="space-y-2.5 text-sm text-mute">
              <li><span className="hover:text-white transition-colors cursor-pointer">MCP Tool Inspection</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Git Branch Guard</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Process AST Pipeline</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">SHA-256 Checkpoints</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">SARIF 2.1.0 CI/CD</span></li>
            </ul>
          </div>

          {/* Col 3: Developer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mute mb-4">Developer & Studio</h4>
            <ul className="space-y-2.5 text-sm text-mute">
              <li>
                <a href="https://github.com/anshrajore" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub Profile
                </a>
              </li>
              <li>
                <a href="https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Repository
                </a>
              </li>
              <li>
                <a href="https://www.npmjs.com/~anshdeveloper" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  npm · anshdeveloper
                </a>
              </li>
              <li><span className="text-mute">Studio: Dark Arcane</span></li>
              <li><span className="text-mute">License: Apache-2.0</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom credit bar */}
        <div className="mt-16 pt-8 border-t border-line">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dim">
            <p>© {new Date().getFullYear()} Orvex · All rights reserved · Local-first · Zero Telemetry · Binds 127.0.0.1.</p>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-dim">Created, Architected & Engineered by</span>
              <a
                href="https://github.com/anshrajore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-bold hover:underline"
              >
                Ansh Rajore
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
