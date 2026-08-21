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

      {/* Hero Section - Redesigned based on User Mockup */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-36 overflow-hidden">
        {/* Subtle geometric grid and spotlight gradient glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs text-mute backdrop-blur-md mb-8 animate-fade-in">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white">ORVEX 0.1.0</span>
            <span className="h-3 w-[1px] bg-line"></span>
            <span>Autonomous Agent Security Runtime</span>
          </div>

          <div className="relative max-w-5xl mx-auto py-10">
            {/* Floating Visual Badges Mockup elements (Inspired by user image floaters) */}
            <div className="absolute left-[5%] top-[10%] hidden lg:flex flex-col gap-6 rotate-[-8deg] pointer-events-none">
              <div className="px-4 py-2 rounded-xl bg-surface/60 border border-line backdrop-blur-sm text-xs font-mono text-mute shadow-2xl">
                [WEB]
              </div>
              <div className="h-12 w-12 rounded-2xl bg-surface/80 border border-line flex items-center justify-center text-white shadow-2xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a13.978 13.978 0 003.07 9.825L6 21H3v-2.22" />
                </svg>
              </div>
            </div>
            <div className="absolute right-[5%] top-[20%] hidden lg:flex flex-col gap-6 rotate-[8deg] pointer-events-none">
              <div className="px-4 py-2 rounded-xl bg-surface/60 border border-line backdrop-blur-sm text-xs font-mono text-mute shadow-2xl">
                [UI]
              </div>
              <div className="h-12 w-12 rounded-2xl bg-surface/80 border border-line flex items-center justify-center text-white shadow-2xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            {/* Headline matching mockup layout: IDEAS MEET PURPOSE WITH IMPACT */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[1.0] text-gradient">
              IDEAS MEET<br />
              PURPOSE WITH<br />
              IMPACT
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-sm sm:text-base text-mute leading-relaxed font-sans">
              We turn raw agentic potential into secure, sandboxed, and monitored workflows. Zero-trust runtime protection designed with absolute machine integrity.
            </p>

            {/* Action CTAs styling resembling mockup pill buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => scrollToId('quick-start')}
                className="rounded-full bg-white px-8 py-3 text-xs font-mono uppercase tracking-wider text-black hover:bg-neutral-200 transition-all font-bold"
              >
                SEE OUR WORK / GET STARTED
              </button>
              <button
                type="button"
                onClick={onOpenConsole}
                className="rounded-full border border-line bg-black px-8 py-3 text-xs font-mono uppercase tracking-wider text-white hover:border-dim hover:bg-surface transition-all"
              >
                GET A TELEMETRY QUOTE
              </button>
            </div>
          </div>

          {/* Central Circular Stage Spotlight (Directly mirroring the glowing stage in mockup image) */}
          <div className="relative w-full max-w-2xl mx-auto h-[120px] mt-8 mb-16 pointer-events-none">
            <div className="absolute inset-0 rounded-[100%] bg-gradient-to-t from-white/10 to-transparent blur-md"></div>
            <div className="absolute inset-1.5 rounded-[100%] border border-white/20 bg-black shadow-[0_0_80px_10px_rgba(255,255,255,0.15)] flex items-center justify-center">
              <div className="text-[10px] font-mono tracking-widest text-mute uppercase animate-pulse-subtle">
                Orvex Control Plane Stage Active
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-2/3 border border-white/10 rounded-[100%]"></div>
          </div>

          {/* Styled Bottom Metrics Bar (Directly mirroring the colored footer blocks from the user's mockup) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-w-5xl mx-auto border-t border-line mt-12 text-left font-mono">
            <div className="bg-surface/30 p-8 border-b md:border-b-0 md:border-r border-line/60 hover:bg-surface/50 transition-all">
              <div className="flex justify-between items-start">
                <h4 className="text-xs text-dim uppercase tracking-wider">01 / CAPABILITY PROTECTION</h4>
                <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px]">✓</div>
              </div>
              <p className="text-lg font-bold text-white mt-4 leading-tight">TOTAL SECURE PROJECTS ACTIVE</p>
              <span className="text-[10px] text-mute block mt-2">// Default Deny Active</span>
            </div>

            <div className="bg-surface/30 p-8 border-b md:border-b-0 md:border-r border-line/60 hover:bg-surface/50 transition-all">
              <div className="flex justify-between items-start">
                <h4 className="text-xs text-dim uppercase tracking-wider">02 / DESTRUCTIVE COMMANDS</h4>
                <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px]">⚡</div>
              </div>
              <p className="text-lg font-bold text-white mt-4 leading-tight">AGENT INTRUSIONS SOLVED</p>
              <span className="text-[10px] text-mute block mt-2">// Zero Side-Effect Registry</span>
            </div>

            <div className="bg-surface/30 p-8 hover:bg-surface/50 transition-all">
              <div className="flex justify-between items-start">
                <h4 className="text-xs text-dim uppercase tracking-wider">03 / GLOBAL COMPLIANCE</h4>
                <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px]">⚓</div>
              </div>
              <p className="text-lg font-bold text-white mt-4 leading-tight">TRUSTED BY TEAMS WORLDWIDE</p>
              <span className="text-[10px] text-mute block mt-2">// Local First Execution</span>
            </div>
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

      {/* Developer Credits Section — Enhanced */}
      <section id="architect" className="py-28 border-t border-line bg-black relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.04),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">

          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-dim px-4 py-1.5 rounded-full border border-line bg-surface/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Principal Engineer & Creator
            </span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white mt-6 uppercase">
              Ansh Rajore
            </h2>
            <p className="text-base text-mute mt-3 max-w-lg mx-auto">
              Sole architect, engineer, and maintainer of the entire Orvex ecosystem — 13 packages, 1 author.
            </p>
          </div>

          {/* Main content: 3-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">

            {/* Col A: Giant monogram + identity card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Giant "AR" monogram */}
              <div className="rounded-3xl border border-line bg-surface/30 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)]" />
                <div className="relative">
                  <div className="text-[96px] font-black text-white leading-none tracking-tighter select-none opacity-90">AR</div>
                  <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.2em] text-dim">Ansh Rajore</div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-mute">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span>Active · Building in Public</span>
                </div>
              </div>

              {/* Social links */}
              <div className="rounded-2xl border border-line bg-surface/30 p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-dim mb-3">Profiles</p>
                <a
                  href="https://github.com/anshrajore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-mute hover:text-white transition-colors group"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span className="font-mono text-xs">github.com/anshrajore</span>
                </a>
                <a
                  href="https://www.npmjs.com/~anshdeveloper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-mute hover:text-white transition-colors group"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-mono text-xs">npm · anshdeveloper</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-mute">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-mono text-xs">Nashik, MH — India</span>
                </div>
              </div>
            </div>

            {/* Col B: Interactive tabs + bio */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex gap-2 border-b border-line pb-4 mb-6">
                  {(['bio', 'stack', 'vision'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDevTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                        devTab === tab
                          ? 'bg-white text-black font-semibold border-white'
                          : 'text-mute hover:text-white border-transparent hover:border-line'
                      }`}
                    >
                      {tab === 'bio' ? '01 // BIO' : tab === 'stack' ? '02 // STACK' : '03 // VISION'}
                    </button>
                  ))}
                </div>

                <div className="min-h-[220px] leading-relaxed">
                  {devTab === 'bio' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">System Architect &amp; R&amp;D Lead</h3>
                      <p className="text-sm text-mute">
                        Ansh Rajore is a full-stack engineer and AI/ML researcher based in Nashik, India. He builds core runtimes, compiler utilities, and zero-trust control planes under the <strong className="text-white">Dark Arcane</strong> studio moniker.
                      </p>
                      <p className="text-sm text-mute">
                        Recognizing that autonomous coding agents can execute untrusted code or exfiltrate private credentials, Ansh designed Orvex as a locally contained operating barrier — enforcing policy and verifying actions in real-time with zero cloud dependency.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {['Security Runtimes', 'Compiler Design', 'ML Ops', 'Zero-Trust Systems', 'Open Source'].map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-full border border-line bg-surface/50 text-[10px] font-mono text-dim">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {devTab === 'stack' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">Architectural Engineering Stack</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1.5">SYSTEMS &amp; CORE</span>
                          <span className="text-white leading-relaxed">TypeScript / Node.js<br />Rust Core Runtimes<br />Linux / macOS POSIX API</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1.5">SECURITY &amp; IAAS</span>
                          <span className="text-white leading-relaxed">Bubblewrap (bwrap)<br />macOS Seatbelt (.sb)<br />Docker / Docker Compose</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1.5">AI &amp; PARSING</span>
                          <span className="text-white leading-relaxed">Command AST Tokenizers<br />Heuristic Regex Scanners<br />Model Context Protocol</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-line bg-surface/50">
                          <span className="text-dim block mb-1.5">COMPLIANCE &amp; OPS</span>
                          <span className="text-white leading-relaxed">SARIF 2.1.0 Outputs<br />Turborepo / pnpm<br />Vitest Test Suites</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {devTab === 'vision' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">The Vision: Honest Sandbox Reporting</h3>
                      <blockquote className="border-l-2 border-white pl-4 italic text-sm text-neutral-300 my-4 leading-relaxed">
                        "The biggest flaw in current security wrappers is false confidence. An agent started outside a real kernel container is fully vulnerable. We must present honest, diagnostic telemetry to developers — indicating precisely where their systems are strong or weak."
                      </blockquote>
                      <p className="text-sm text-mute">
                        Orvex is engineered with absolute respect for developer workflows: local-first execution, zero cloud telemetry, and complete programmatic embeddability.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-line/60 flex flex-wrap gap-3">
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

            {/* Col C: Live system specs panel */}
            <div className="lg:col-span-3 rounded-2xl border border-line bg-surface/40 p-5 flex flex-col justify-between">
              <div className="font-mono text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-line">
                  <span className="text-dim uppercase text-[10px] tracking-wider">System Specs</span>
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                </div>
                {[
                  ['AUTHOR', 'Ansh Rajore'],
                  ['STUDIO', 'Dark Arcane'],
                  ['LOCATION', 'Nashik, IN'],
                  ['NPM', 'anshdeveloper'],
                  ['PACKAGES', '13 total'],
                  ['LICENSE', 'Apache-2.0'],
                  ['STATUS', 'ACTIVE DEV'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-dim">{label}:</span>
                    <span className={`text-right ${label === 'STATUS' ? 'text-white font-semibold' : label === 'AUTHOR' ? 'text-white font-bold' : 'text-neutral-300'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-line/60 pt-4 mt-4">
                <div className="space-y-2">
                  {[
                    { label: 'Policy Coverage', pct: 98 },
                    { label: 'Test Coverage', pct: 87 },
                    { label: 'Type Safety', pct: 100 },
                  ].map(({ label, pct }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] font-mono text-dim mb-1">
                        <span>{label}</span>
                        <span className="text-white">{pct}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
