# Sandbox backends

Orvex never claims a Node.js wrapper is kernel isolation.

| Provider | Availability | Strength | What it actually does |
| --- | --- | --- | --- |
| bubblewrap | Linux, `bwrap` on PATH | STRONG | Namespaces + bind mounts for the wrapped command |
| sandbox-exec | macOS | MODERATE | Seatbelt profile generated from cwd write/read paths. Network rules are coarse. |
| docker | `docker` on PATH | STRONG | Optional container run with `--network none`; domain allowlists require a controlled proxy |
| fallback-monitor | always | WEAK | Policy evaluation, env filter, audit. No syscall isolation. |

`orvex doctor` prints the provider that `selectProvider()` actually chose.

## macOS notes

`sandbox-exec` profiles can break GUI apps and some language runtimes. Failures are returned as command errors, not silently ignored.

## Linux notes

Without bubblewrap, Orvex will not pretend namespaces are active.

## Windows notes

No equivalent provider ships in 0.1.0. Doctor reports WEAK fallback. Contributions for Job Objects / AppContainers should implement `SandboxProvider` honestly.
