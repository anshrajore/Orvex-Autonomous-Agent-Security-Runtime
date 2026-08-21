# Secrets

Detectors look for common token shapes. Logs store `[SECRET_REDACTED]`. Environment filtering drops `AWS_*`, `*_TOKEN`, API keys unless explicitly allowed. This is pattern-based, not a complete secret manager.
