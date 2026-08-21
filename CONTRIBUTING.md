# Contributing

1. Read `docs/threat-model.md` and `docs/architecture.md`.
2. Do not add fake sandbox implementations or `return true` security stubs.
3. If a platform feature is unavailable, detect it, report it in `orvex doctor`, and document the reduced strength.
4. New bypasses become adversarial tests.
5. Run `pnpm test && pnpm test:adversarial && pnpm typecheck` before opening a PR.

No telemetry. Do not log secrets.
