import { useState } from 'react';

type GuideTopic =
  | 'quickstart'
  | 'policy-engine'
  | 'risk-engine'
  | 'sandbox-isolation'
  | 'detectors-secrets'
  | 'prompt-injection'
  | 'mcp-governance'
  | 'git-security'
  | 'audit-sarif'
  | 'checkpoints'
  | 'cli-reference'
  | 'sdk-integration';

export function Guide() {
  const [activeTopic, setActiveTopic] = useState<GuideTopic>('quickstart');

  const topics = [
    { id: 'quickstart', title: '1. Quick Start & Setup', tag: 'Basics' },
    { id: 'policy-engine', title: '2. Policy Engine & Rules', tag: 'Core' },
    { id: 'risk-engine', title: '3. Risk Scoring (0-100)', tag: 'Engine' },
    { id: 'sandbox-isolation', title: '4. OS Sandbox Backends', tag: 'Kernel' },
    { id: 'detectors-secrets', title: '5. Secret Vault & Redaction', tag: 'Security' },
    { id: 'prompt-injection', title: '6. Prompt Injection Defense', tag: 'Heuristics' },
    { id: 'mcp-governance', title: '7. MCP Tool Inspection', tag: 'Protocol' },
    { id: 'git-security', title: '8. Git & Branch Protection', tag: 'VCS' },
    { id: 'audit-sarif', title: '9. Audit Logger & SARIF', tag: 'Compliance' },
    { id: 'checkpoints', title: '10. Checkpoints & Rollback', tag: 'Integrity' },
    { id: 'cli-reference', title: '11. Full CLI Reference', tag: 'CLI' },
    { id: 'sdk-integration', title: '12. TypeScript SDK API', tag: 'Developers' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-mute mb-3">
            <span>ORVEX 0.1.0 DOCUMENTATION & SECURITY MANUAL</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Complete Architectural Guide & Reference
          </h1>
          <p className="text-sm text-mute mt-2 max-w-2xl">
            Everything you need to configure, operate, embed, and deploy Orvex as the security control plane for your autonomous AI agents.
          </p>
        </div>

        {/* Sidebar + Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Topic Navigation */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-widest text-dim px-3 mb-3">
              Table of Contents
            </div>
            {topics.map((t) => {
              const active = activeTopic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTopic(t.id as GuideTopic)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-medium transition-all ${
                    active
                      ? 'bg-white text-black font-semibold shadow-glow'
                      : 'text-mute hover:text-white hover:bg-surface border border-transparent hover:border-line'
                  }`}
                >
                  <span>{t.title}</span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                      active ? 'bg-black text-white' : 'border border-line text-dim'
                    }`}
                  >
                    {t.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Topic Body */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-8 lg:p-10 border border-line">
            {activeTopic === 'quickstart' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">1. Quick Start & Setup</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Orvex is distributed via npm and runs completely locally. It requires Node.js ≥ 20.11.0.
                </p>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Installation</h3>
                  <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300">
                    <p className="text-dim"># Install the CLI globally</p>
                    <p className="text-white font-bold mt-1">npm install -g orvex</p>
                    <p className="text-dim mt-4"># Or install locally in your project</p>
                    <p className="text-white font-bold mt-1">pnpm add -D orvex</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Initialisation Workflow</h3>
                  <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300 space-y-3">
                    <p><span className="text-dim">$</span> orvex init --profile balanced</p>
                    <p className="text-dim"># Validates your environment and sandbox strengths</p>
                    <p><span className="text-dim">$</span> orvex doctor</p>
                    <p className="text-dim"># Run Claude Code safely inside Orvex</p>
                    <p><span className="text-dim">$</span> orvex run claude --profile strict --approval-mode ask</p>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'policy-engine' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">2. Policy Engine & Rules</h2>
                <p className="text-sm text-mute leading-relaxed">
                  The policy engine enforces a declarative zero-trust model defined in <code className="text-white font-mono bg-surface px-1.5 py-0.5 rounded border border-line">.orvex.yml</code>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-line p-4 bg-surface">
                    <h4 className="text-xs font-bold text-white uppercase">Security Profiles</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-mute">
                      <li><strong className="text-white">relaxed</strong> — Permissive for fast development</li>
                      <li><strong className="text-white">balanced</strong> — Standard default protection</li>
                      <li><strong className="text-white">strict</strong> — Read-only repo + ask on net/git</li>
                      <li><strong className="text-white">paranoid</strong> — No network, zero disk writes</li>
                      <li><strong className="text-white">ci</strong> — Headless non-interactive ask-to-deny</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-line p-4 bg-surface">
                    <h4 className="text-xs font-bold text-white uppercase">Evaluated Domains</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-mute">
                      <li>• Filesystem (read, write, delete)</li>
                      <li>• Process spawning & CLI command AST</li>
                      <li>• Network hosts & CIDR ranges</li>
                      <li>• Secret detection & Vault access</li>
                      <li>• MCP Tools & Server trust</li>
                      <li>• Git branch writes & destructive flags</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'risk-engine' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">3. Composite Risk Scoring (0-100)</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Orvex computes a mathematical risk score for every event. When the score exceeds policy thresholds, Orvex escalates the decision from automated ALLOW to interactive ASK or immediate BLOCK.
                </p>
                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between border-b border-line pb-2">
                    <span className="text-dim">00 - 25: LOW</span>
                    <span className="text-white">Standard project file reads/writes</span>
                  </div>
                  <div className="flex justify-between border-b border-line pb-2">
                    <span className="text-dim">26 - 50: MODERATE</span>
                    <span className="text-white">Network connections to allowed hosts</span>
                  </div>
                  <div className="flex justify-between border-b border-line pb-2">
                    <span className="text-dim">51 - 75: ELEVATED</span>
                    <span className="text-white">Git branch pushes, package install scripts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dim">76 - 100: CRITICAL</span>
                    <span className="text-white">Secret credential reads, chained shells, rm -rf</span>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'sandbox-isolation' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">4. OS Sandbox Backends</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Orvex integrates with real OS-level primitives. Running <code className="text-white font-mono bg-surface px-1 py-0.5 rounded">orvex doctor</code> honestly tests the environment.
                </p>
                <div className="space-y-3">
                  <div className="rounded-xl border border-line p-4 bg-surface flex items-start gap-4">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black border border-line text-white">macOS</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">sandbox-exec (Seatbelt)</h4>
                      <p className="text-xs text-mute mt-1">Generates dynamic Scheme (.sb) profiles restricting filesystem traversal and subprocess fork privileges.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-line p-4 bg-surface flex items-start gap-4">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black border border-line text-white">Linux</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Bubblewrap (bwrap)</h4>
                      <p className="text-xs text-mute mt-1">Unshares PID/IPC/Network namespaces, mounting read-only host systems and isolated temporary directories.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-line p-4 bg-surface flex items-start gap-4">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black border border-line text-white">Docker</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Containerized Isolation</h4>
                      <p className="text-xs text-mute mt-1">Spawns clean ephemeral containers with locked filesystem mounts and strict port mappings.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'detectors-secrets' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">5. Secret Detection & Redaction</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Real-time pattern scanning identifies credentials before they appear in prompt contexts, outputs, or audit logs.
                </p>
                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs space-y-2 text-neutral-300">
                  <p>• AWS Access Keys (<code className="text-dim">AKIA[0-9A-Z]{'{16}'}</code>)</p>
                  <p>• GitHub Personal Access Tokens (<code className="text-dim">ghp_[0-9a-zA-Z]{'{36}'}</code>)</p>
                  <p>• OpenAI / Anthropic API Keys (<code className="text-dim">sk-proj-..., sk-ant-...</code>)</p>
                  <p>• Private RSA / SSH Keys (<code className="text-dim">-----BEGIN OPENSSH PRIVATE KEY-----</code>)</p>
                  <p>• JSON Web Tokens (<code className="text-dim">eyJ...</code>)</p>
                  <p>• Slack Bot & User Tokens (<code className="text-dim">xoxb-..., xoxp-...</code>)</p>
                </div>
              </div>
            )}

            {activeTopic === 'prompt-injection' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">6. Prompt Injection Defense</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Weighted heuristic detection analyzes incoming instructions, external web pages, PR comments, and untrusted files for override triggers, role hijacking, and exfiltration lures.
                </p>
                <div className="p-4 rounded-xl border border-line bg-surface text-xs text-mute leading-relaxed space-y-2">
                  <p><strong className="text-white">Signal Analysis:</strong> Detects phrases like <em>"Ignore all previous instructions"</em>, <em>"You are now in debug mode"</em>, <em>"Print your system prompt"</em>, and hidden HTML comments containing command injections.</p>
                  <p><strong className="text-white">Trust Zone Multipliers:</strong> Data ingested from untrusted sources (e.g. untrusted repo issues or downloaded files) is assigned higher suspicion weighting.</p>
                </div>
              </div>
            )}

            {activeTopic === 'mcp-governance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">7. Model Context Protocol (MCP) Governance</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Treats MCP tools as high-privilege capabilities. Inspects all tool call arguments for embedded filepaths and enforces trust boundaries on MCP servers.
                </p>
                <div className="rounded-xl border border-line bg-surface p-4 text-xs text-mute space-y-2">
                  <p>• <strong>Trust Levels:</strong> <code className="text-white font-mono">trusted</code>, <code className="text-white font-mono">verified</code>, <code className="text-white font-mono">restricted</code>, <code className="text-white font-mono">unknown</code>, <code className="text-white font-mono">blocked</code>.</p>
                  <p>• <strong>Deep Argument Extraction:</strong> Analyzes parameters like <code className="text-white font-mono">path</code>, <code className="text-white font-mono">filepath</code>, <code className="text-white font-mono">uri</code>, and blocks hidden attacks such as calling an MCP tool targeting <code className="text-white font-mono">~/.ssh/id_rsa</code>.</p>
                </div>
              </div>
            )}

            {activeTopic === 'git-security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">8. Git & Branch Protection</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Prevents destructive version control commands and inadvertent pushes to production branches.
                </p>
                <ul className="space-y-2 text-xs text-mute list-disc pl-4">
                  <li>Protected branches (<code className="text-white font-mono">main</code>, <code className="text-white font-mono">master</code>, <code className="text-white font-mono">release/*</code>) trigger interactive human confirmation (<code className="text-white font-mono">ASK</code>).</li>
                  <li>Destructive flags like <code className="text-white font-mono">--force</code>, <code className="text-white font-mono">--force-with-lease</code>, <code className="text-white font-mono">reset --hard</code>, and <code className="text-white font-mono">clean -fd</code> are flagged as critical risk.</li>
                </ul>
              </div>
            )}

            {activeTopic === 'audit-sarif' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">9. Audit Flight Recorder & SARIF</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Every decision, rule match, and risk score is written to an immutable append-only NDJSON log in <code className="text-white font-mono">~/.orvex/audit/</code>.
                </p>
                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300 space-y-2">
                  <p className="text-dim"># Replay a past session event by event</p>
                  <p className="text-white">orvex session replay ses_ab12cd34 --format markdown</p>
                  <p className="text-dim mt-3"># Export audit trail to SARIF 2.1.0 for GitHub Security scanning</p>
                  <p className="text-white">orvex audit export --format sarif &gt; results.sarif</p>
                </div>
              </div>
            )}

            {activeTopic === 'checkpoints' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">10. SHA-256 Checkpoints & Rollback</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Snapshot the full workspace state before agent execution. If an agent causes unwanted modifications, revert the entire file tree in one command.
                </p>
                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300 space-y-2">
                  <p><span className="text-dim">$</span> orvex checkpoint create</p>
                  <p className="text-dim">✓ Checkpoint chk_4f8e21 generated (34 files, sha256: 9b2d...)</p>
                  <p className="mt-3"><span className="text-dim">$</span> orvex rollback chk_4f8e21</p>
                  <p className="text-dim">✓ Workspace cleanly restored to checkpoint state</p>
                </div>
              </div>
            )}

            {activeTopic === 'cli-reference' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">11. Full CLI Reference</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-line text-mute uppercase text-[10px]">
                        <th className="pb-2">Command</th>
                        <th className="pb-2">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40 text-neutral-300">
                      <tr><td className="py-2 text-white">orvex init</td><td className="py-2 text-mute font-sans">Generate .orvex.yml with chosen security profile</td></tr>
                      <tr><td className="py-2 text-white">orvex doctor</td><td className="py-2 text-mute font-sans">Diagnose platform, sandbox strength, and policy validity</td></tr>
                      <tr><td className="py-2 text-white">orvex demo</td><td className="py-2 text-mute font-sans">Run 12 real security engine scenarios</td></tr>
                      <tr><td className="py-2 text-white">orvex run [agent]</td><td className="py-2 text-mute font-sans">Wrap agent (claude, openclaw, codex, gemini, or generic)</td></tr>
                      <tr><td className="py-2 text-white">orvex policy validate</td><td className="py-2 text-mute font-sans">Verify syntax and check for policy rule conflicts</td></tr>
                      <tr><td className="py-2 text-white">orvex policy test</td><td className="py-2 text-mute font-sans">Run simulation test matrix against local policy</td></tr>
                      <tr><td className="py-2 text-white">orvex secrets scan [path]</td><td className="py-2 text-mute font-sans">Scan files for sensitive credentials without printing values</td></tr>
                      <tr><td className="py-2 text-white">orvex session history</td><td className="py-2 text-mute font-sans">List and inspect past agent execution sessions</td></tr>
                      <tr><td className="py-2 text-white">orvex dashboard</td><td className="py-2 text-mute font-sans">Start local web console bound to 127.0.0.1:4173</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTopic === 'sdk-integration' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">12. TypeScript SDK API</h2>
                <p className="text-sm text-mute leading-relaxed">
                  Embed Orvex security evaluation directly into your custom TypeScript/Node.js agent architectures.
                </p>
                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto">
                  <p className="text-dim">// Install via npm or pnpm</p>
                  <p className="text-dim">// pnpm add @orvex/sdk</p>
                  <p className="text-white font-bold mt-2">import &#123; Orvex &#125; from '@orvex/sdk';</p>
                  <br />
                  <p><span className="text-neutral-400">const</span> runtime = <span className="text-neutral-400">await new</span> <span className="text-white">Orvex</span>(&#123;</p>
                  <p className="pl-4">policy: <span className="text-neutral-400">'./.orvex.yml'</span>,</p>
                  <p className="pl-4">profile: <span className="text-neutral-400">'strict'</span>,</p>
                  <p>&#125;).<span className="text-white">start()</span>;</p>
                  <br />
                  <p className="text-dim">// Evaluate actions before execution</p>
                  <p><span className="text-neutral-400">const</span> decision = <span className="text-neutral-400">await</span> runtime.<span className="text-white">evaluate</span>(&#123;</p>
                  <p className="pl-4">capability: <span className="text-neutral-400">'filesystem.read'</span>,</p>
                  <p className="pl-4">target: <span className="text-neutral-400">'./src/app.ts'</span>,</p>
                  <p>&#125;);</p>
                  <br />
                  <p><span className="text-neutral-400">if</span> (decision.verdict === <span className="text-neutral-400">'allow'</span>) &#123;</p>
                  <p className="pl-4 text-dim">// Safe to proceed</p>
                  <p>&#125;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
