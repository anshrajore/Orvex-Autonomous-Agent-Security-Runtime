import pc from 'picocolors';

export function banner(noColor = false): string {
  const c = noColor ? (s: string) => s : pc.cyan;
  const b = noColor ? (s: string) => s : pc.bold;
  return [
    c('╭────────────────────────────────────────────╮'),
    c('│') + b('                    ORVEX                   ') + c('│'),
    c('│') + '       Autonomous Agent Security Runtime    ' + c('│'),
    c('╰────────────────────────────────────────────╯'),
  ].join('\n');
}

export function sessionPanel(input: {
  agent: string;
  profile: string;
  session: string;
  stats: {
    filesA: number;
    filesD: number;
    cmdA: number;
    cmdD: number;
    netA: number;
    netD: number;
    secA: number;
    secD: number;
    mcpA: number;
    mcpD: number;
  };
  risk: number;
}): string {
  const barLen = 20;
  const filled = Math.round((input.risk / 100) * barLen);
  const bar = `${'█'.repeat(filled)}${'░'.repeat(barLen - filled)}`;
  return [
    banner(),
    '',
    `Agent       ${input.agent}`,
    `Profile     ${input.profile}`,
    `Session     ${input.session.slice(0, 12)}`,
    `Status      ● PROTECTED`,
    '',
    '──────────────────────────────────────────────',
    '',
    `Filesystem       ${String(input.stats.filesA).padStart(3)} allowed   ${input.stats.filesD} blocked`,
    `Commands         ${String(input.stats.cmdA).padStart(3)} allowed   ${input.stats.cmdD} blocked`,
    `Network          ${String(input.stats.netA).padStart(3)} allowed   ${input.stats.netD} blocked`,
    `Secrets          ${String(input.stats.secA).padStart(3)} allowed   ${input.stats.secD} blocked`,
    `MCP              ${String(input.stats.mcpA).padStart(3)} allowed   ${input.stats.mcpD} blocked`,
    '',
    'Risk Score',
    `${bar} ${input.risk}/100`,
    input.risk >= 61 ? '\n⚠ High-risk behavior detected.' : '',
  ].join('\n');
}
