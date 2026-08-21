import type { Capability } from '@anshrajore/orvex-core';

export interface GitAnalysis {
  capability: Capability;
  destructive: boolean;
  force: boolean;
  branch?: string;
  summary: string;
}

export function analyzeGitArgs(args: string[]): GitAnalysis {
  const sub = args[0] ?? '';
  const rest = args.slice(1);
  const joined = rest.join(' ');
  const force = rest.includes('--force') || rest.includes('-f') || joined.includes('--force-with-lease');
  if (sub === 'push') {
    const branch = rest.find((a) => !a.startsWith('-') && a !== 'origin' && a !== 'upstream') ?? 'HEAD';
    return {
      capability: force ? 'git.forcePush' : 'git.push',
      destructive: force,
      force,
      branch,
      summary: `git push ${joined}`.trim(),
    };
  }
  if (sub === 'reset' && (rest.includes('--hard') || rest.includes('--merge'))) {
    return {
      capability: 'git.write',
      destructive: true,
      force: true,
      summary: 'git reset --hard',
    };
  }
  if (sub === 'clean' && (rest.includes('-fd') || rest.includes('-f') || rest.includes('-d'))) {
    return {
      capability: 'git.write',
      destructive: true,
      force: true,
      summary: 'git clean',
    };
  }
  if (sub === 'branch' && (rest.includes('-D') || rest.includes('-d'))) {
    return {
      capability: 'git.write',
      destructive: true,
      force: rest.includes('-D'),
      summary: 'git branch delete',
    };
  }
  if (['commit', 'checkout', 'switch', 'stash', 'rebase', 'merge'].includes(sub)) {
    return { capability: 'git.write', destructive: false, force, summary: `git ${sub}` };
  }
  return { capability: 'git.read', destructive: false, force: false, summary: `git ${sub}` };
}
