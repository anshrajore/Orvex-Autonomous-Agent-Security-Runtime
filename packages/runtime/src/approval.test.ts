import { describe, expect, it } from 'vitest';
import { ApprovalEngine } from './approval.js';

describe('approval grants', () => {
  it('expires session grants', () => {
    const approval = new ApprovalEngine('ask');
    approval.grantSession('git.push', 'origin/main', 100);
    expect(approval.hasSessionGrant('git.push', 'origin/main')).toBe(true);
    return new Promise<void>((resolve) => setTimeout(() => {
      expect(approval.hasSessionGrant('git.push', 'origin/main')).toBe(false);
      resolve();
    }, 150));
  });
});
