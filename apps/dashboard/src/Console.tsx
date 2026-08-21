import { useMemo, useState } from 'react';
import { Mark } from './Mark';

type EventRow = {
  id: string;
  timestamp: string;
  action: string;
  resource?: string;
  decision: 'allow' | 'deny' | 'ask';
  reason: string;
  risk: { score: number; level: string };
};

const NAV = [
  'Overview',
  'Sessions',
  'Live Events',
  'Blocked Actions',
  'Policies',
  'Agents',
  'MCP',
  'Network',
  'Secrets',
  'Risk',
  'Git',
  'Audit',
  'Checkpoints',
] as const;

export function Console({ events, onHome }: { events: EventRow[]; onHome: () => void }) {
  const [page, setPage] = useState<(typeof NAV)[number]>('Overview');
  const blocked = events.filter((e) => e.decision === 'deny');
  const peak = Math.max(0, ...events.map((e) => e.risk.score), 0);

  const body = useMemo(() => {
    if (page === 'Overview') {
      return (
        <div className="grid gap-8">
          <p className="max-w-2xl text-base leading-7 text-mute">
            Local console bound to 127.0.0.1. Events are read from ~/.orvex. Nothing is uploaded.
          </p>
          <dl className="grid max-w-xl grid-cols-2 gap-8">
            <Stat label="Events" value={String(events.length)} />
            <Stat label="Blocked" value={String(blocked.length)} />
            <Stat label="Peak risk" value={`${peak}/100`} />
            <Stat label="Bind" value="127.0.0.1" />
          </dl>
        </div>
      );
    }
    if (page === 'Blocked Actions') return <EventTable events={blocked} />;
    if (page === 'Policies') {
      return (
        <pre className="overflow-auto font-mono text-[13px] leading-7 text-mute">{`version: 1
profile: balanced
filesystem.default: deny
network.default: deny
secrets.default: deny
mcp.default: deny`}</pre>
      );
    }
    return <EventTable events={events} />;
  }, [page, events, blocked, peak]);

  return (
    <div className="min-h-screen bg-void text-white">
      <header className="flex items-center justify-between border-b border-line px-8 py-4">
        <button type="button" onClick={onHome} className="flex items-center gap-3">
          <Mark className="h-8 w-8" />
          <span>Orvex Console</span>
        </button>
        <p className="text-[11px] uppercase tracking-micro text-mute">Developed by Ansh Rajore</p>
      </header>
      <div className="flex">
        <nav className="w-56 shrink-0 border-r border-line px-4 py-8">
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setPage(item)}
                  className={`w-full rounded px-4 py-2 text-left text-sm ${
                    page === item ? 'bg-coral text-black' : 'text-mute hover:text-white'
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 px-8 py-8">{body}</main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-micro text-mute">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tracking-display">{value}</dd>
    </div>
  );
}

function EventTable({ events }: { events: EventRow[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-line text-[11px] uppercase tracking-micro text-mute">
          <th className="py-3 pr-4">Time</th>
          <th className="py-3 pr-4">Action</th>
          <th className="py-3 pr-4">Resource</th>
          <th className="py-3">Decision</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id} className="border-b border-line font-mono text-[13px]">
            <td className="py-3 pr-4">{event.timestamp.slice(11, 19)}</td>
            <td className="py-3 pr-4">{event.action}</td>
            <td className="py-3 pr-4">{event.resource ?? '—'}</td>
            <td className={`py-3 uppercase ${event.decision === 'deny' ? 'text-coral' : ''}`}>
              {event.decision}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
