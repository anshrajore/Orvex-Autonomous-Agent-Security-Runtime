import { Mark } from './Mark';
import { Terminal } from './Terminal';

type EventRow = {
  id: string;
  timestamp: string;
  action: string;
  resource?: string;
  decision: 'allow' | 'deny' | 'ask';
  reason: string;
  risk: { score: number; level: string };
};

export function Landing({
  onOpenConsole,
  events,
}: {
  onOpenConsole: () => void;
  events: EventRow[];
}) {
  return (
    <div className="bg-void text-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Mark className="h-8 w-8" />
            <span className="text-base font-medium">Orvex</span>
          </div>
          <nav className="hidden gap-8 text-sm text-mute md:flex">
            <a className="text-coral" href="#product">
              Product
            </a>
            <a href="#quick-start">Install</a>
            <button type="button" onClick={onOpenConsole}>
              Console
            </button>
            <a href="https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime">
              Docs
            </a>
          </nav>
          <a
            href="https://github.com/anshrajore/Orvex-Autonomous-Agent-Security-Runtime"
            className="text-sm text-mute"
          >
            GitHub
          </a>
        </div>
      </header>

      <section id="product" className="border-b border-line">
        <div className="mx-auto max-w-3xl px-8 py-24 text-center">
          <Mark className="mx-auto mb-8 h-16 w-16" />
          <p className="text-[11px] font-medium uppercase tracking-micro text-coral">
            Open source · Runs on your machine
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-display">
            The runtime that{' '}
            <em className="font-serif font-medium italic text-coral">actually</em> controls agents.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-7 text-mute">
            Policy, risk, approval, sandboxing, secrets, MCP, and audit — between autonomous AI
            agents and your operating system. Local-first. Default deny.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="#quick-start"
              className="rounded bg-coral px-6 py-3 text-sm font-medium text-black"
            >
              Get started
            </a>
            <button
              type="button"
              onClick={onOpenConsole}
              className="rounded border border-white px-6 py-3 text-sm font-medium text-white"
            >
              Open console
            </button>
          </div>
          {events.length > 0 ? (
            <p className="mt-8 font-mono text-[13px] text-mute">
              Last local decision: {events[events.length - 1]?.action}{' '}
              {events[events.length - 1]?.decision.toUpperCase()}
            </p>
          ) : null}
        </div>
      </section>

      <Terminal />

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-5xl gap-8 px-8 py-16 md:grid-cols-3">
          {[
            ['Zero trust', 'Every file, process, network, secret, and MCP call is evaluated.'],
            ['Honest isolation', 'Doctor reports WEAK / MODERATE / STRONG. No fake jails.'],
            ['Full flight recorder', 'Replay sessions, export SARIF, roll back checkpoints.'],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-line pt-8">
              <h2 className="text-lg font-medium tracking-display">{title}</h2>
              <p className="mt-4 text-sm leading-6 text-mute">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-8 py-16">
          <p className="text-[11px] font-medium uppercase tracking-micro text-coral">Developed by</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-display">Ansh Rajore</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mute">
            Full-stack developer and AI / machine-learning enthusiast at Dark Arcane, based in
            Nashik. Orvex is an independent security runtime — not a chatbot and not a fork of
            OpenClaw.
          </p>
          <dl className="mt-8 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-micro text-mute">Studio</dt>
              <dd className="mt-2">Dark Arcane</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-micro text-mute">Location</dt>
              <dd className="mt-2">Nashik</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-micro text-mute">GitHub</dt>
              <dd className="mt-2">
                <a href="https://github.com/anshrajore" className="text-coral">
                  github.com/anshrajore
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-12 text-[13px] text-mute">
            Apache-2.0 · No telemetry · Bind 127.0.0.1 by default
          </p>
        </div>
      </footer>
    </div>
  );
}
