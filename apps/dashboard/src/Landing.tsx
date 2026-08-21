import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FeatureCard } from './FeatureCard';
import { CodePreview } from './CodePreview';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { DecisionMatrix } from './DecisionMatrix';
import { Terminal } from './Terminal';
import { Mark } from './Mark';

const SAMPLE_POLICY_YAML = `# Zero-Trust Project Configuration for Orvex
version: 1
profile: balanced

# Real kernel sandbox auto-detection
isolation:
  provider: auto
  fallback: allow-with-warning

# File system read/write boundaries
filesystem:
  default: deny
  read:
    allow:
      - './**'
      - '!**/.env*'
      - '!~/.ssh/**'
      - '!~/.aws/**'
  write:
    allow:
      - './src/**'
      - './dist/**'
      - './tests/**'
    deny:
      - './package.json' # Protected manifest

# Network domain & socket security
network:
  default: deny
  allow:
    - 'github.com:443'
    - 'registry.npmjs.org:443'
  block:
    - '169.254.169.254' # Cloud Instance Metadata Protection

# Secret Token redaction and leak prevention
secrets:
  default: deny
  redact: true

# Model Context Protocol server trust
mcp:
  default: deny
  trust:
    - server: 'github.com/modelcontextprotocol/*'
      level: 'verified'

# Version control push protection
git:
  protectedBranches: ['main', 'master', 'production']
  requireApprovalOnPush: true`;

export function Landing({
  onOpenConsole,
  onOpenGuide,
}: {
  onOpenConsole: () => void;
  onOpenGuide: () => void;
}) {
  const [typedText, setTypedText] = useState('execute.');
  const [devTab, setDevTab] = useState<'bio' | 'stack' | 'vision'>('bio');
  const phrases = ['execute.', 'build.', 'touch.', 'run.', 'access.'];
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % phrases.length;
      setTypedText(phrases[index]);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar currentView="product" onNavigate={(v) => { if (v === 'console') onOpenConsole(); if (v === 'guide') onOpenGuide(); }} onScrollTo={scrollToId} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Subtle geometric background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs text-mute backdrop-blur-md mb-8 animate-fade-in">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white">ORVEX 0.1.0</span>
            <span className="h-3 w-[1px] bg-line"></span>
            <span>Autonomous Agent Security Runtime</span>
          </div>

          {/* Headline inspired by xAI / Frontier AI models */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] animate-slide-up">
            Frontier security for everything your agents{' '}
            <span className="inline-block border-b-2 border-white pb-1 min-w-[140px] text-left text-neutral-300">
              {typedText}
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-mute leading-relaxed font-sans">
            A zero-trust local control plane between autonomous AI agents and your machine. Policy enforcement, composite risk scoring, kernel sandboxing, secret redaction, and an immutable flight recorder.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => scrollToId('quick-start')}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-all shadow-glow hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              type="button"
              onClick={onOpenConsole}
              className="rounded-full border border-line bg-surface px-8 py-3.5 text-sm font-semibold text-white hover:border-dim hover:bg-subtle transition-all"
            >
              Open Live Console
            </button>
          </div>

          {/* Author Badge */}
          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-mono text-dim">
            <span>Developed by</span>
            <strong className="text-mute">Ansh Rajore</strong>
            <span>· Dark Arcane · Nashik</span>
          </div>
        </div>
      </section>

      {/* Interactive Code / Terminal Feature Section */}
      <section id="interactive-demo" className="py-20 border-t border-line/50 bg-black/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-mute px-3 py-1 rounded-full border border-line bg-surface">
              Interactive Preview
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-4">
              Real Engine Decisions in Real Time
            </h2>
            <p className="text-sm text-mute mt-2">
              Every system capability is governed through declarative rules and composite 0-100 risk scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <CodePreview code={SAMPLE_POLICY_YAML} filename=".orvex.yml" language="yaml" statusBadge="Protected Runtime Policy" />
            </div>
            <div className="lg:col-span-6">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-24 border-t border-line bg-surface/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-mute px-3 py-1 rounded-full border border-line bg-surface">
                Defense In Depth
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-4">
                Engineered for Complete Agent Containment
              </h2>
            </div>
            <p className="text-sm text-mute max-w-md">
              Six foundational defense layers working synchronously to prevent catastrophic breaches without hampering developer productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              category="Core"
              title="Zero-Trust Policy Engine"
              description="Evaluates every file, process, network socket, git command, and MCP invocation against fine-grained glob schemas."
              details={['5 profiles: relaxed, balanced, strict, paranoid, ci', 'Dynamic YAML hierarchy loading', 'Automated simulation test matrix']}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            <FeatureCard
              category="Math Engine"
              title="Composite Risk Scoring (0-100)"
              description="Continuous multidimensional scoring incorporating data classification, prompt injection signals, and behavioral baseline anomalies."
              details={['Score clamping & risk tiers', 'Frequency burst anomaly detection', 'Critical risks auto-elevate to ASK/BLOCK']}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />

            <FeatureCard
              category="Kernel"
              title="Honest OS Sandboxing"
              description="Real kernel isolation with macOS Seatbelt sandbox-exec, Linux Bubblewrap namespaces, and optional ephemeral Docker containers."
              details={['Dynamic Seatbelt (.sb) generation', 'Bubblewrap PID/IPC unsharing', 'Honest doctor diagnostic reporting']}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />

            <FeatureCard
              category="Privacy"
              title="Secret Vault & Redaction"
              description="Regex pattern detectors scan output streams and agent environments to prevent credential leaks before they touch logs or contexts."
              details={['AWS, OpenAI, Anthropic, GitHub PAT, JWT, SSH', 'Automatic [SECRET_REDACTED] masks', 'Environment token filtering']}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            />

            <FeatureCard
              category="VCS & AST"
              title="Git Protection & Command AST"
              description="Tokenizer & pipeline parser prevents destructive shell escapes (curl | bash, rm -rf /) and protects release branches against force pushes."
              details={['Chained interpreter detection', 'Branch protection (main, release)', 'Interactive readline approval flow']}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />

            <FeatureCard
              category="Compliance"
              title="Flight Recorder & SARIF"
              description="Append-only immutable audit trail recording every intercepted operation, exportable to standard SARIF 2.1.0 format."
              details={['NDJSON session replay', 'SHA-256 workspace rollback checkpoints', 'GitHub Code Scanning SARIF export']}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Architecture Deep Dive */}
      <section id="architecture" className="py-24 border-t border-line">
        <div className="mx-auto max-w-7xl px-6">
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Decision Matrix Table */}
      <section className="py-20 border-t border-line bg-surface/20">
        <div className="mx-auto max-w-7xl px-6">
          <DecisionMatrix />
        </div>
      </section>

      {/* Choose How to Get Started (Inspired by xAI screenshot) */}
      <section id="quick-start" className="py-24 border-t border-line">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Choose how to get started
            </h2>
            <p className="text-sm text-mute mt-3">
              Deploy Orvex as an interactive developer CLI or integrate the runtime into your autonomous agent pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: CLI */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">CLI & Terminal Wrapper</h3>
                <p className="text-xs text-mute leading-relaxed mb-6">
                  Wrap Anthropic Claude Code, OpenClaw, Codex CLI, Google Gemini CLI, or custom local scripts.
                </p>

                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300 mb-6">
                  <p className="text-dim"># Quickstart installation</p>
                  <p className="text-white font-bold mt-1">npm install -g orvex-cli</p>
                  <p className="text-white mt-1">orvex init && orvex run claude</p>
                </div>

                <ul className="space-y-3 text-xs text-mute">
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant interactive terminal approvals</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Preconfigured agent adapters on PATH</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Local flight recorder dashboard at 127.0.0.1</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-line/60">
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="w-full rounded-full bg-white py-3 text-center text-xs font-semibold text-black hover:bg-neutral-200 transition-colors"
                >
                  Explore CLI Reference →
                </button>
              </div>
            </div>

            {/* Card 2: SDK */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">TypeScript / Node.js SDK</h3>
                <p className="text-xs text-mute leading-relaxed mb-6">
                  Embed defense-in-depth policy verification and risk scoring directly inside your agent server code.
                </p>

                <div className="rounded-xl border border-line bg-black p-4 font-mono text-xs text-neutral-300 mb-6">
                  <p className="text-dim"># Add to package dependencies</p>
                  <p className="text-white font-bold mt-1">pnpm add @anshrajore/orvex-sdk</p>
                  <p className="text-dim mt-1">import &#123; Orvex &#125; from '@anshrajore/orvex-sdk';</p>
                </div>

                <ul className="space-y-3 text-xs text-mute">
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Programmatic `PolicyEngine` and `RiskEngine`</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Non-blocking async verification pipeline</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>SARIF 2.1.0 export for automated CI pipelines</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-line/60">
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="w-full rounded-full border border-line bg-surface py-3 text-center text-xs font-semibold text-white hover:bg-subtle hover:border-dim transition-colors"
                >
                  View SDK Documentation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Credits Section */}
      <section id="architect" className="py-24 border-t border-line bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.03),transparent_60%)]"></div>
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-dim px-3 py-1 rounded-full border border-line bg-surface">
              SYSTEM ARCHITECT
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-4">
              Ansh Rajore
            </h2>
            <p className="text-sm text-mute mt-2">
              The engineer behind the Orvex Autonomous Agent Security Runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-5xl mx-auto">
            {/* Left side: Interactive Tab Selector & Bio Display */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-2 border-b border-line pb-4 mb-6">
                  {(['bio', 'stack', 'vision'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDevTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                        devTab === tab
                          ? 'bg-white text-black font-semibold border-white shadow-glow'
                          : 'text-mute hover:text-white border-transparent hover:border-line'
                      }`}
                    >
                      {tab === 'bio' ? '01 // BIO' : tab === 'stack' ? '02 // STACK' : '03 // VISION'}
                    </button>
                  ))}
                </div>

                <div className="min-h-[200px] leading-relaxed">
                  {devTab === 'bio' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">System Architect &amp; R&amp;D Lead</h3>
                      <p className="text-sm text-mute">
                        Ansh Rajore is a full-stack engineer and AI/machine-learning researcher based in Nashik, India. He builds core runtimes, compiler utilities, and zero-trust control planes under the **Dark Arcane** studio moniker.
                      </p>
                      <p className="text-sm text-mute">
                        Recognizing that autonomous coding agents possess the potential to execute untrusted code or exfiltrate private credentials, Ansh designed Orvex as a lightweight, locally contained operating barrier to enforce policy and verify actions in real-time.
                      </p>
                    </div>
                  )}

                  {devTab === 'stack' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">Architectural Engineering Stack</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1">SYSTEMS &amp; CORE</span>
                          <span className="text-white">TypeScript / Node.js<br />Rust Core Runtimes<br />Linux / macOS POSIX API</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1">SECURITY &amp; IAAS</span>
                          <span className="text-white">Bubblewrap (bwrap)<br />macOS Seatbelt (.sb)<br />Docker / Docker Compose</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1">AI &amp; PARSING</span>
                          <span className="text-white">Command AST Tokenizers<br />Heuristic Regex Scanners<br />Model Context Protocol (MCP)</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1">COMPLIANCE &amp; DEVOPS</span>
                          <span className="text-white">SARIF 2.1.0 Outputs<br />Turborepo / pnpm<br />Vitest Suites</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {devTab === 'vision' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">The Vision: Honest Sandbox Reporting</h3>
                      <blockquote className="border-l-2 border-white pl-4 italic text-sm text-neutral-300 my-4 leading-relaxed">
                        "The biggest flaw in current security wrappers is false confidence. An agent started outside a real kernel container is fully vulnerable. We must present honest, diagnostic telemetry to developers, indicating precisely where their systems are strong or weak."
                      </blockquote>
                      <p className="text-sm text-mute">
                        Orvex is engineered with absolute respect for developer workflows: local-first execution, zero cloud telemetry, and complete programmatic embeddability.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-line/60 flex flex-wrap gap-4">
                <a
                  href="https://github.com/anshrajore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-xs font-mono text-mute hover:text-white hover:border-dim transition-all"
                >
                  $ cat ~/.profile/github.info
                </a>
                <a
                  href="https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-5 py-2.5 text-xs font-mono text-black font-bold hover:bg-neutral-200 transition-all"
                >
                  $ git clone orvex-security
                </a>
              </div>
            </div>

            {/* Right side: Styled System Diagnostic Status Code block */}
            <div className="lg:col-span-6 rounded-2xl border border-line bg-surface/40 p-6 flex flex-col justify-between">
              <div className="font-mono text-xs text-neutral-300 space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-line">
                  <span className="text-dim uppercase text-[10px] tracking-wider">Ansh Rajore Specifications</span>
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">AUTHOR:</span>
                  <span className="text-white font-bold">Ansh Rajore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">STUDIO:</span>
                  <span className="text-white">Dark Arcane</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">LOCATION:</span>
                  <span className="text-white">Nashik, MH, IN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">SPECIALTIES:</span>
                  <span className="text-white text-right">Runtimes, Compilers, ML Ops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">FOCUS AREA:</span>
                  <span className="text-white">Agent Capabilities Interception</span>
                </div>
                <div className="flex justify-between border-t border-line/60 pt-3">
                  <span className="text-dim">NPM PROFILE:</span>
                  <span className="text-white">anshdeveloper</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">STATUS:</span>
                  <span className="text-white font-semibold">ACTIVE DEV</span>
                </div>
              </div>

              <div className="border-t border-line/60 pt-6 mt-6">
                <div className="rounded-xl bg-black p-4 text-[11px] font-mono text-dim leading-relaxed">
                  // System baseline verify completed. All diagnostics report ready. Local control plane bound securely to loopback address.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
