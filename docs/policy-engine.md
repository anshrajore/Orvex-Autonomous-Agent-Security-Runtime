# Policy engine

`.orvex.yml` is parsed with Zod, compiled into allow/deny/ask rules, and cached by document hash. Path globs, host:port rules, process names, MCP trust, and Git protected branches are first-class.

`orvex policy test` runs the simulator. `orvex policy explain <event-id>` prints the matched rule and risk factors from the audit log.
