# OpenClaw

```bash
orvex run openclaw
```

Orvex looks up `openclaw` on PATH, filters the environment, and applies the selected sandbox. It does not patch OpenClaw. If OpenClaw later exposes structured tool events, the adapter `parseEvent` hook is the integration point.
