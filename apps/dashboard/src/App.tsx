import { useEffect, useState } from 'react';
import { Console } from './Console';
import { Landing } from './Landing';

export type EventRow = {
  id: string;
  timestamp: string;
  action: string;
  resource?: string;
  decision: 'allow' | 'deny' | 'ask';
  reason: string;
  risk: { score: number; level: string };
};

export function App() {
  const [view, setView] = useState<'product' | 'console'>('product');
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    void fetch('/api/events')
      .then((r) => r.json())
      .then((data: EventRow[]) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  if (view === 'console') {
    return <Console events={events} onHome={() => setView('product')} />;
  }
  return <Landing events={events} onOpenConsole={() => setView('console')} />;
}
