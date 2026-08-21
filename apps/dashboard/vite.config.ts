import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function localEvents(): Plugin {
  return {
    name: 'orvex-local-events',
    configureServer(server) {
      server.middlewares.use('/api/events', (_req, res) => {
        const dir = path.join(os.homedir(), '.orvex', 'sessions');
        let events: unknown[] = [];
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ndjson')).sort();
            const latest = files.at(-1);
            if (latest) {
              events = fs
                .readFileSync(path.join(dir, latest), 'utf8')
                .split('\n')
                .filter(Boolean)
                .map((line) => JSON.parse(line) as unknown);
            }
          }
        } catch {
          events = [];
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(events.slice(-200)));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localEvents()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
});
