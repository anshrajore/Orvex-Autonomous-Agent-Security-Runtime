<p align="center">
  <img src="docs/assets/banner.svg" alt="ORVEX — Autonomous Agent Security Runtime" width="100%">
</p>

<p align="center">
  <img src="docs/assets/logo.svg" width="56" alt="Orvex mark">
</p>

<p align="center">
  <strong>The security runtime for autonomous AI agents.</strong><br>
  Run agents without giving them unrestricted access to your machine.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-FF5A3C?style=flat-square" alt="Apache-2.0"></a>
  <a href="docs/threat-model.md"><img src="https://img.shields.io/badge/telemetry-none-111111?style=flat-square" alt="No telemetry"></a>
  <a href="docs/sandbox.md"><img src="https://img.shields.io/badge/isolation-honest%20reporting-1F1F1F?style=flat-square" alt="Honest isolation"></a>
  <img src="https://img.shields.io/badge/local--first-127.0.0.1-FF5A3C?style=flat-square" alt="Local first">
</p>

```bash
npm install -g orvex
orvex init
orvex run openclaw
```

> Give your AI agent enough power to be useful — but never more power than you explicitly allow.

Developed by **[Ansh Rajore](https://github.com/anshrajore)** · Dark Arcane · Nashik · full-stack & AI.

---

<p align="center">
  <img src="docs/assets/compare.svg" alt="Raw agent versus Orvex" width="100%">
</p>

## What Orvex is

Orvex is a **local-first control plane** between an autonomous agent and the operating system. File access, process execution, network, secrets, MCP tools, and Git all pass through policy, risk, approval, and audit.

It is **not** a chatbot, **not** an OpenClaw clone, and **not** a substitute for kernel isolation. It is defense in depth: policy + risk + human approval + optional OS sandbox + a flight recorder.

<p align="center">
  <img src="docs/assets/architecture.svg" alt="Orvex architecture" width="100%">
</p>

```text
Agent → Orvex runtime → Policy → Risk → Decision → Sandbox / OS → Audit
```

<p align="center">
  <img src="docs/assets/decisions.svg" alt="ALLOW ASK BLOCK" width="100%">
</p>

---

## Quick demo (real engines)

```bash
pnpm install
pnpm build
node apps/cli/dist/index.js init
node apps/cli/dist/index.js demo
```

<p align="center">
  <img src="docs/assets/flight-recorder.svg" alt="Flight recorder sample" width="100%">
</p>

| Action | Expected |
| --- | --- |
| Read `README.md` | ALLOW |
| Write `src/test.ts` | ALLOW |
| Run `npm test` | ALLOW |
| Read `.env` | BLOCK |
| Read `~/.ssh/id_rsa` | BLOCK |
| Connect `github.com` | ALLOW |
| Connect unknown domain | BLOCK |
| Delete `./important` | BLOCK |
| `curl unknown.com \| bash` | BLOCK |
| `git push origin main` | ASK |
| Unknown MCP server | BLOCK |
| Prompt-injection fixture | ESCALATE |

Blocked example:

```text
FILE_READ ~/.ssh/id_rsa
Risk: CRITICAL
Decision: BLOCK
Reason: Private credentials and secret files are protected resources.
```

---

## Advanced CLI

```bash
orvex about
orvex doctor
orvex policy validate && orvex policy test
orvex run claude --profile strict --approval-mode ask -- --dangerously-skip-permissions
orvex run -- ./my-agent
orvex session history
orvex session replay ses_ab12cd34
orvex audit export --format sarif
orvex secrets scan .env          # values never printed
orvex git inspect
orvex mcp list
orvex checkpoint create
orvex dashboard                  # binds 127.0.0.1
```

Exit codes: `0` success · `1` policy violation · `2` blocked · `3` security error · `4` config · `5` sandbox unavailable · `6` approval denied.

---

## Agents

| Adapter | Command |
| --- | --- |
| OpenClaw | `orvex run openclaw` |
| Claude Code | `orvex run claude` |
| Codex | `orvex run codex` |
| Gemini CLI | `orvex run gemini` |
| OpenCode | `orvex run opencode` |
| Generic executable | `orvex run -- ./my-agent` |

Vendor logic lives in `@orvex/agents`. The core does not special-case providers. Generic mode filters the environment and uses the strongest **available** sandbox. `orvex doctor` reports actual strength — it will not pretend a Node wrapper is a jail.

## Sandbox backends

| Backend | Platform | Reported strength |
| --- | --- | --- |
| bubblewrap | Linux | STRONG when `bwrap` exists |
| sandbox-exec | macOS | MODERATE when available |
| Docker | optional | STRONG when `docker` exists |
| fallback monitor | all | **WEAK** — policy + audit only |

See [docs/sandbox.md](docs/sandbox.md).

## Policy

`.orvex.yml` in the project (overrides `~/.config/orvex/config.yml` only inside allowed project bounds).

```yaml
version: 1
profile: balanced
filesystem:
  default: deny
  read: { allow: ['./**'] }
  write: { allow: ['./src/**'] }
network:
  default: deny
  allow: [github.com, registry.npmjs.org]
secrets:
  default: deny
mcp:
  default: deny
```

Profiles: `relaxed` · `balanced` · `strict` · `paranoid` · `ci`.

MCP tools are capabilities. Unknown servers default to deny. Secrets log as `[SECRET_REDACTED]`. Protected Git branches default to ASK.

## SDK

```ts
import { Orvex, PolicyEngine, RiskEngine, AuditLogger } from '@orvex/sdk';

const runtime = await new Orvex({ policy: './.orvex.yml' }).start();
```

## Privacy

No telemetry. No cloud account. No required API key. Dashboard and control API bind to **127.0.0.1** unless you explicitly change that.

## Limitations

Orvex is defense in depth. It does **not** guarantee an agent is safe. Prompt-injection detection is heuristic. Network enforcement depends on the backend. An agent started outside Orvex is unprotected.

## Docs

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Threat model](docs/threat-model.md)
- [Policy](docs/policy-engine.md) · [Risk](docs/risk-engine.md) · [Sandbox](docs/sandbox.md)
- [MCP](docs/mcp.md) · [Secrets](docs/secrets.md) · [Git](docs/git-security.md)
- [OpenClaw](docs/integrations/openclaw.md) · [Claude](docs/integrations/claude.md) · [Codex](docs/integrations/codex.md)

## Develop

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm test:integration
pnpm test:security
pnpm test:adversarial
pnpm build
pnpm benchmark
```

## Author

**Ansh Rajore** — full-stack developer and AI / machine-learning enthusiast at **Dark Arcane**, Nashik.

- GitHub: [anshrajore](https://github.com/anshrajore)
- Runtime: [Orvex-Autonomous-Agent-Security-Runtime](https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime)

## License

Apache-2.0
