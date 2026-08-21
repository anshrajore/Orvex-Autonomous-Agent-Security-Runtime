import type { RiskLevel } from './types.js';

export function riskLevelFromScore(score: number): RiskLevel {
  if (score <= 20) return 'low';
  if (score <= 40) return 'moderate';
  if (score <= 60) return 'elevated';
  if (score <= 80) return 'high';
  return 'critical';
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
