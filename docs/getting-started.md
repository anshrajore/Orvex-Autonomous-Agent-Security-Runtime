# Getting started

```bash
pnpm install
pnpm build
node apps/cli/dist/index.js init
node apps/cli/dist/index.js doctor
node apps/cli/dist/index.js demo
node apps/cli/dist/index.js about
```

Project policy lives in `.orvex.yml`. Global config: `~/.config/orvex/config.yml`.

Exit codes: 0 success, 1 policy violation, 2 blocked action, 3 security error, 4 configuration, 5 sandbox unavailable, 6 approval denied.
