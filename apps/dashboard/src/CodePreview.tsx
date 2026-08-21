import { useState } from 'react';

interface CodePreviewProps {
  filename?: string;
  code: string;
  language?: string;
  statusBadge?: string;
}

export function CodePreview({
  filename = '.orvex.yml',
  code,
  language = 'yaml',
  statusBadge = 'Active Policy',
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-2xl border border-line bg-surface/90 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-black/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#333333]"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-[#333333]"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-[#333333]"></div>
          </div>
          <span className="text-xs font-mono text-mute pl-2">{filename}</span>
        </div>

        <div className="flex items-center gap-3">
          {statusBadge && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-black px-2.5 py-0.5 text-[10px] font-mono text-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {statusBadge}
            </span>
          )}
          <button
            type="button"
            onClick={copyCode}
            className="text-[11px] font-mono text-mute hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-6 font-mono text-xs md:text-[13px] leading-relaxed overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="pr-4 py-0.5 select-none text-right text-dim text-[11px] w-8">
                  {idx + 1}
                </td>
                <td className="py-0.5 text-neutral-300 whitespace-pre">
                  {line.startsWith('#') ? (
                    <span className="text-dim italic">{line}</span>
                  ) : line.includes(':') && language === 'yaml' ? (
                    <>
                      <span className="text-white font-medium">{line.split(':')[0]}:</span>
                      <span className="text-neutral-400">{line.substring(line.indexOf(':') + 1)}</span>
                    </>
                  ) : (
                    line
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
