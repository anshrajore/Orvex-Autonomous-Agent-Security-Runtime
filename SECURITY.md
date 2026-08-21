# Security Policy

## Reporting

Do not open a public issue for vulnerabilities that could be used to bypass Orvex. Email the maintainers or use GitHub private vulnerability reporting.

## Scope

In-scope: policy bypasses, secret leakage in logs, sandbox profile mistakes, symlink escapes handled by Orvex path classification, audit redaction failures.

Out of scope: claiming Orvex should stop an agent that was never launched through `orvex run`; kernel bugs in bubblewrap/Docker/macOS sandbox-exec.

## Disclosure

Orvex is defense in depth. Fixes should include a regression test under `tests/adversarial` or `tests/security`.
