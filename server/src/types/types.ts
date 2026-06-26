export interface StartupAnalysisRequest {
  idea: string;
  industry: string;
  audience: string;
  problem: string;
  country: string;
  budget: string;
  teamSize: string;
}

/** AI-generated business viability scores (0–100 each). */
export interface ScoreBreakdown {
  overall: number;
  marketPotential: number;
  innovation: number;
  feasibility: number;
  scalability: number;
  monetization: number;
  /** One sentence from the AI explaining the overall score. */
  rationale: string;
}

/** Structured competitor entry returned by the AI. */
export interface CompetitorCard {
  name: string;
  weakness: string;
  yourEdge: string;
}

/** Four hard-truth questions the AI answers honestly about the idea. */
export interface RealityCheck {
  biggestAssumption: string;
  biggestRisk: string;
  whyItCouldFail: string;
  hardestExecutionChallenge: string;
}

export interface StartupAnalysisResponse {
  scores: ScoreBreakdown;
  realityCheck: RealityCheck;
  summary: string[];
  validation: string[];
  customers: string[];
  revenue: string[];
  competitors: CompetitorCard[];
  roadmap: string[];
  funding: string[];
  risks: string[];
  actions: string[];
  nextSevenDays: string[];
  /** Deterministic incubator matches — added post-analysis, optional for backwards compatibility */
  incubatorRecommendations?: IncubatorRecommendation[];
}

export interface IncubatorRecommendation {
  id: string;
  name: string;
  matchPercent: number;
  description: string;
  funding: string;
  equity: string | null;
  startupStages: string[];
  industries: string[];
  country: string;
  acceptsInternational: boolean;
  remote: boolean;
  website: string;
  matchReason: string;
}
