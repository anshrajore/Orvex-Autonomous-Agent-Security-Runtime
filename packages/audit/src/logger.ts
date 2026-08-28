import fs from 'node:fs';
import path from 'node:path';
import { orvexPaths, type AuditEvent, type Session } from '@anshrajore/orvex-core';
import { Redactor } from '@anshrajore/orvex-detectors';

export class AuditLogger {
  private readonly redactor = new Redactor();

  constructor(private readonly root = orvexPaths()) {
    fs.mkdirSync(this.root.audit, { recursive: true });
    fs.mkdirSync(this.root.sessions, { recursive: true });
    fs.chmodSync(this.root.audit, 0o700);
    fs.chmodSync(this.root.sessions, 0o700);
  }

  append(event: AuditEvent): void {
    assertSafeIdentifier(event.sessionId);
    const safe: AuditEvent = {
      ...event,
      resource: event.resource ? this.redactor.redact(event.resource).text : undefined,
      reason: this.redactor.redact(event.reason).text,
    };
    const file = path.join(this.root.audit, `${event.sessionId}.ndjson`);
    fs.appendFileSync(file, `${JSON.stringify(safe)}\n`, 'utf8');
    fs.chmodSync(file, 0o600);
    const sessionFile = path.join(this.root.sessions, `${event.sessionId}.ndjson`);
    fs.appendFileSync(sessionFile, `${JSON.stringify(safe)}\n`, 'utf8');
    fs.chmodSync(sessionFile, 0o600);
  }

  writeSession(session: Session): void {
    assertSafeIdentifier(session.id);
    fs.mkdirSync(this.root.sessions, { recursive: true });
    const target = path.join(this.root.sessions, `${session.id}.json`);
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(session, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.chmodSync(temporary, 0o600);
    fs.renameSync(temporary, target);
  }

  listSessions(): Session[] {
    if (!fs.existsSync(this.root.sessions)) return [];
    return fs
      .readdirSync(this.root.sessions)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(this.root.sessions, f), 'utf8')) as Session)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  readSessionEvents(sessionId: string): AuditEvent[] {
    assertSafeIdentifier(sessionId);
    const file = path.join(this.root.sessions, `${sessionId}.ndjson`);
    if (!fs.existsSync(file)) return [];
    return fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditEvent);
  }

  exportNdjson(sessionId?: string): string {
    if (sessionId) {
      assertSafeIdentifier(sessionId);
      const file = path.join(this.root.sessions, `${sessionId}.ndjson`);
      return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    }
    if (!fs.existsSync(this.root.audit)) return '';
    return fs
      .readdirSync(this.root.audit)
      .filter((f) => f.endsWith('.ndjson'))
      .map((f) => fs.readFileSync(path.join(this.root.audit, f), 'utf8'))
      .join('');
  }

  exportSarif(events: AuditEvent[]): unknown {
    return {
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'Orvex',
              informationUri: 'https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime',
              rules: [
                {
                  id: 'orvex.blocked',
                  shortDescription: { text: 'Blocked agent action' },
                },
              ],
            },
          },
          results: events
            .filter((e) => e.decision === 'deny')
            .map((e) => ({
              ruleId: 'orvex.blocked',
              level: e.risk.level === 'critical' || e.risk.level === 'high' ? 'error' : 'warning',
              message: { text: this.redactor.redact(`${e.action}: ${e.reason}`).text },
              locations: e.resource
                ? [{ physicalLocation: { artifactLocation: { uri: e.resource } } }]
                : [],
            })),
        },
      ],
    };
  }
}

function assertSafeIdentifier(value: string): void {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error('Unsafe audit identifier.');
  }
}
