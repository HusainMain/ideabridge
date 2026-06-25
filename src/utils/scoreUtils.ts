import { ResultsData } from '../stores/useJourneyStore';

export interface ViabilityScores {
  overall: number;
  marketPotential: number;
  innovation: number;
  feasibility: number;
  scalability: number;
  monetization: number;
}

/** Deterministic pseudo-score derived from content richness of each section.
 *  No random numbers — same inputs always produce the same scores. */
export function computeScores(results: ResultsData): ViabilityScores {
  const hash = (arr: string[]) =>
    arr.join(' ').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const clamp = (n: number, lo = 55, hi = 94) =>
    Math.min(hi, Math.max(lo, Math.round(n)));

  const richness = (arr: string[]) => {
    const words = arr.join(' ').split(/\s+/).length;
    return Math.min(1, words / 120); // 120 words = full richness
  };

  const r = richness;

  const marketPotential = clamp(58 + r(results.customers) * 28 + (hash(results.customers) % 9));
  const innovation      = clamp(55 + r(results.summary)   * 25 + (hash(results.summary) % 12));
  const feasibility     = clamp(60 + r(results.roadmap)   * 22 + (hash(results.roadmap) % 8));
  const scalability     = clamp(52 + r(results.revenue)   * 30 + (hash(results.revenue) % 10));
  const monetization    = clamp(56 + r(results.funding)   * 26 + (hash(results.funding) % 11));
  const overall         = clamp(
    Math.round((marketPotential + innovation + feasibility + scalability + monetization) / 5),
    58, 91
  );

  return { overall, marketPotential, innovation, feasibility, scalability, monetization };
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#00f0ff';   // cyan — excellent
  if (score >= 68) return '#a986ff';   // purple — good
  if (score >= 55) return '#ffae42';   // amber — moderate
  return '#f87171';                    // red — low
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 68) return 'Strong';
  if (score >= 55) return 'Moderate';
  return 'Needs Work';
}
