# Threat model

## Assets

- Host filesystem, including secrets (`~/.ssh`, `.env`, cloud credentials)
- Agent session audit logs
- Git repositories and protected branches
- MCP tool arguments and results
- Environment variables
- Network identity (cloud metadata, localhost)

## Threat actors

- Prompt-injected agent following untrusted content
- Malicious or compromised MCP server
- Over-privileged agent binary
- Confused-deputy tool calls

## Trust boundaries

- User vs agent
- Project tree vs home/system
- Trusted local source vs untrusted tool output
- Orvex control plane vs wrapped process

## Attack surfaces

- Shell syntax bypasses (pipes, chaining)
- Path traversal and symlinks
- DNS rebinding / metadata IPs
- Environment leakage
- Policy default-allow mistakes
- Untrusted plugins

## Mitigations

- Default deny profiles
- Command graph parsing before policy
- Realpath classification for secrets
- Env allowlist
- MCP argument inspection
- Approval for Git protected branches
- Audit redaction
- Honest sandbox strength

## Known limitations / residual risk

- Fallback backend is not a kernel jail
- Agents can use absolute binaries that skip PATH shims
- Prompt-injection detection is heuristic
- Applications that ignore proxy settings bypass the optional proxy
- TOCTOU remains if the OS sandbox is WEAK
- Orvex cannot protect agents it does not launch
