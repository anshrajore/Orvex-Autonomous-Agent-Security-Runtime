import { Mark } from './Mark';

export function Footer() {
  return (
    <footer className="border-t border-line bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mark className="h-6 w-6" />
              <span className="text-sm font-bold tracking-tight text-white">ORVEX</span>
            </div>
            <p className="text-xs text-mute leading-relaxed max-w-xs">
              The defense-in-depth security runtime for autonomous AI agents. Policy, risk, approval, OS sandboxing, and full flight recorder.
            </p>
          </div>

          {/* Col 1: Architecture */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-mute mb-3">Architecture</h4>
            <ul className="space-y-1.5 text-xs text-mute">
              <li><span className="hover:text-white transition-colors cursor-pointer">Policy Engine</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Risk Scoring (0-100)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">OS Sandbox (Seatbelt/bwrap)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Secret Vault & Redaction</span></li>
            </ul>
          </div>

          {/* Col 2: Governance */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-mute mb-3">Governance</h4>
            <ul className="space-y-1.5 text-xs text-mute">
              <li><span className="hover:text-white transition-colors cursor-pointer">MCP Tool Inspection</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Git Branch Guard</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Process AST Pipeline</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">SARIF 2.1.0 CI/CD</span></li>
            </ul>
          </div>

          {/* Col 3: Developer */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-mute mb-3">Ecosystem</h4>
            <ul className="space-y-1.5 text-xs text-mute">
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
              <li>
                <a href="https://www.npmjs.com/~anshdeveloper" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  npm · anshdeveloper
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credit bar */}
        <div className="mt-12 pt-6 border-t border-line">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-dim">
            <p>© ${new Date().getFullYear()} Orvex. Local-first · Zero Telemetry.</p>
            <p>Developed by Ansh Rajore</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
