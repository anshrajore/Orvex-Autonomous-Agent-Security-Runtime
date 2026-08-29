# MCP Security

Orvex treats Model Context Protocol servers as privileged, untrusted
boundaries. A tool name is never sufficient authorization: server trust,
tool patterns, nested resource arguments, path classification, payload limits,
secret redaction, and result scanning are evaluated together.

## Policy

Use a default-deny policy and grant only the servers and tools required by the
agent:

```yaml
mcp:
  default: deny
  servers:
    github:
      trust: verified
      allowTools:
        - search_*
        - read_issue
      denyTools:
        - delete_*
    filesystem:
      trust: restricted
      allowTools:
        - read_file
    unknown-server:
      trust: blocked
```

Trust values are `trusted`, `verified`, `restricted`, `unknown`, and
`blocked`. Unknown and blocked servers fail closed. Restricted servers require
approval, and tool allowlists are checked before server trust can allow a
call.

## Inspection boundary

For JSON-RPC requests, Orvex validates the `2.0` envelope, request id, method,
and params before normalizing `tools/call` requests. Payloads are bounded by
depth, key count, string length, and serialized byte size. Malformed or
oversized requests are denied before execution.

Nested values named `path`, `file`, `filepath`, `filename`, `uri`, `target`, or
`resource` are inspected. `file://` URIs are decoded, project paths are
classified, and symlink/path policy is delegated to the core filesystem guard.

## Result handling

MCP results are untrusted data. When passed through the runtime result API,
Orvex:

- scans result text for prompt-injection signals;
- redacts secret-shaped keys and token values;
- preserves scalar and structured result types where possible;
- emits an audit event for suspicious results.

Prompt-injection detection is heuristic. A clean scan does not prove that a
result is safe, and results must not be promoted into trusted instructions or
persistent agent memory without an explicit trust decision.

## Terminal inspection

Inspect configured server trust and tool patterns locally:

```bash
orvex mcp list
orvex mcp inspect github
orvex mcp inspect github search_code
```

The command does not rewrite policy automatically. Edit `.orvex.yml`, run
`orvex policy validate`, and then use `orvex policy test` before launching an
agent.

## Limitations

Orvex can enforce MCP calls only when they pass through an adapter, runtime
hook, or controlled MCP transport. An opaque process that speaks directly to
an external server may bypass MCP-level visibility, although OS-level
filesystem, process, network, and sandbox controls can still apply. Run
`orvex doctor` to see the active enforcement strength.

Every tool call is a capability. Trust: trusted, verified, restricted, unknown, blocked. Unknown defaults to deny. Arguments such as `path` are classified with the filesystem engine even if the server is trusted.
