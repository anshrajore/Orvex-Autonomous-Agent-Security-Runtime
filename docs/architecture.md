# Architecture

Orvex is a control plane, not an agent.

```text
USER
  │
  ▼
ORVEX CLI / SDK
  │
  ├── Identity (agent adapter id + session)
  ├── Policy engine (declarative .orvex.yml)
  ├── Risk engine (0–100, explainable factors)
  ├── Decision engine (allow / ask / deny)
  ├── Sandbox provider (OS-specific, honest strength)
  └── Audit + checkpoints
  │
  ▼
Agent process (filtered environment)
  │
  ▼
OS / network
```

Normalized `SecurityEvent` records are the internal currency. Adapters parse vendor-specific streams into those events when hooks exist. Generic mode still filters environment, applies the selected sandbox, and evaluates filesystem/process/network/MCP operations that go through the runtime API or demo/acceptance agent.

Package map:

- `@orvex/core` — types, path classification, env filter
- `@orvex/policy` — YAML policy, profiles, simulation
- `@orvex/risk` — scoring + optional baseline
- `@orvex/runtime` — session, approval, commands, checkpoints
- `@orvex/sandbox` — bubblewrap, sandbox-exec, docker, fallback
- `@orvex/agents` — adapters
- `@orvex/detectors` — secrets + prompt-injection heuristics
- `@orvex/mcp` `@orvex/git` `@orvex/audit`
- `@orvex/sdk` — programmatic entry
- `orvex` CLI and `@orvex/dashboard`
