import { Mark } from './Mark';

export function Footer() {
  return (
    <footer className="border-t border-line bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Attribution */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Mark className="h-7 w-7" />
              <span className="text-lg font-bold tracking-tight text-white">ORVEX</span>
            </div>
            <p className="text-sm text-mute leading-relaxed max-w-sm">
              The defense-in-depth security runtime for autonomous AI agents. Policy, risk, approval, OS sandboxing, and full flight recorder.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-mute">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                <span>Created & Developed by <strong className="text-white">Ansh Rajore</strong></span>
              </div>
            </div>
          </div>

          {/* Column 1: Core Architecture */}
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

          {/* Column 2: Governance & Tools */}
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

          {/* Column 3: Ecosystem & Studio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mute mb-4">Developer & Studio</h4>
            <ul className="space-y-2.5 text-sm text-mute">
              <li>
                <a href="https://github.com/anshrajore" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub Profile
                </a>
              </li>
              <li>
                <a href="https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Repository
                </a>
              </li>
              <li><span className="text-mute">Studio: Dark Arcane</span></li>
              <li><span className="text-mute">Location: Nashik, India</span></li>
              <li><span className="text-mute">License: Apache-2.0</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dim">
          <p>© {new Date().getFullYear()} ORVEX. Local-first · Zero Telemetry · Binds 127.0.0.1.</p>
          <div className="flex items-center gap-6">
            <span className="text-mute">Architected by Ansh Rajore</span>
            <span>·</span>
            <span>Apache 2.0 Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
