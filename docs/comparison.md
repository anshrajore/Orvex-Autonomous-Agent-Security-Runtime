# Comparison

<p align="center">
  <img src="assets/compare.svg" alt="Raw agent versus Orvex" width="100%">
</p>

| | Raw agent | Docker only | OS sandbox only | **Orvex** |
| --- | --- | --- | --- | --- |
| Policy language | no | weak | weak | yes |
| Risk scores | no | no | no | yes |
| Human approval | maybe | no | no | yes |
| Secret redaction | no | no | no | yes |
| MCP argument inspection | no | no | no | yes |
| Git protected branches | no | no | no | yes |
| Session replay / SARIF | no | logs | logs | yes |
| Kernel isolation | no | yes (container) | varies | **only if backend is STRONG** |

Orvex does **not** replace Docker or a hardened kernel sandbox. It adds an agent-aware control plane on top of whatever isolation the selected backend actually provides.
