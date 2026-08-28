# Autonomous operation

Orvex can run agents without an interactive approval prompt in CI and service
workflows. Non-interactive operation does not weaken policy: `deny` remains a
hard stop, `ask` is denied unless the selected profile explicitly resolves it,
and every decision is written to the local flight recorder.

For high-volume sessions, the dashboard reads a bounded event window. Audit
exports remain complete, while live telemetry avoids repeatedly loading an
unbounded session file. Use `orvex session export <id>` when a complete record
is required.

Autonomous operation is still defense in depth. OS sandbox availability,
network controls, and agent-specific interception vary by platform. Run
`orvex doctor` before enabling unattended workflows and treat a `WEAK`
fallback provider as monitoring rather than kernel isolation.
