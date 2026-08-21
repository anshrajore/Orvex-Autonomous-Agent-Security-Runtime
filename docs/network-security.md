# Network security

Policy matches domain, optional port, and blocks cloud metadata (`169.254.169.254`, `metadata.google.internal`). `orvex network proxy` binds `127.0.0.1:18080` and default-denies. Processes that ignore HTTP(S)_PROXY are not fully contained unless the sandbox backend isolates the network. See `orvex doctor`.
