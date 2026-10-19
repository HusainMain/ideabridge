/**
 * One score-to-verdict scale shared by the results screen, the exported HTML
 * report, and the copy-able share summary. Keeping these in a single place
 * prevents the same score from being described two different ways depending
 * on where the user reads it.
 */
export function getVerdict(score: number): string {
  if (score >= 85) return 'Exceptional Potential';
  if (score >= 75) return 'Strong Opportunity';
  if (score >= 65) return 'Viable with Refinement';
  if (score >= 50) return 'Needs Validation';
  return 'High Risk Concept';
}

export function getVerdictDescription(score: number): string {
  if (score >= 80) {
    return 'Your idea shows exceptional market viability and execution potential. The analysis indicates strong differentiation and clear path to market.';
  }
  if (score >= 65) {
    return 'Your idea addresses a genuine market need with reasonable execution risk. Refinement in specific areas could significantly improve outcomes.';
  }
  return 'Your idea has potential but faces notable challenges. Consider validating core assumptions before significant investment.';
}
