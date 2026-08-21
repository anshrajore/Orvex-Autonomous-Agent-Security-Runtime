import React from 'react';

interface FeatureCardProps {
  title: string;
  category: string;
  description: string;
  details?: string[];
  icon: React.ReactNode;
}

export function FeatureCard({ title, category, description, details, icon }: FeatureCardProps) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-7 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-line text-white group-hover:border-white/40 transition-colors">
            {icon}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-mute px-2.5 py-1 rounded-full border border-line bg-surface">
            {category}
          </span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-white mb-2.5 group-hover:text-white transition-colors">
          {title}
        </h3>

        <p className="text-sm text-mute leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {details && details.length > 0 && (
        <div className="pt-4 border-t border-line/60">
          <ul className="space-y-2 text-xs font-mono text-dim group-hover:text-mute transition-colors">
            {details.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/60"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
