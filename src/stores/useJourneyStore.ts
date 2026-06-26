import { create } from 'zustand';
import type { ValidationMeta } from '../../shared/validation/types';
import type { ApiErrorCode, StructuredErrorResponse } from '../../shared/errors/types';

export type AnalysisStatus =
  | 'idle'
  | 'analyzing'
  | 'success'
  | 'error'
  | 'cooldown'
  | 'invalid_input'
  | 'rate_limit_wait';

export interface IdeaInputs {
  idea: string;
  industry: string;
  audience: string;
  problem: string;
  country: string;
  budget: string;
  teamSize: string;
}

/** AI-generated viability scores (0–100). */
export interface ScoreBreakdown {
  overall: number;
  marketPotential: number;
  innovation: number;
  feasibility: number;
  scalability: number;
  monetization: number;
  rationale: string;
}

/** Structured competitor entry from AI. */
export interface CompetitorCard {
  name: string;
  weakness: string;
  yourEdge: string;
}

/** Four hard-truth reality-check fields from AI. */
export interface RealityCheck {
  biggestAssumption: string;
  biggestRisk: string;
  whyItCouldFail: string;
  hardestExecutionChallenge: string;
}

export interface ResultsData {
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

interface JourneyState {
  inputs: IdeaInputs;
  analysisStatus: AnalysisStatus;
  results: ResultsData | null;
  errorMessage: string | null;
  errorCode: ApiErrorCode | null;
  errorRetryAfter: number | null;
  validationResult: ValidationMeta | null;
  validationMeta: ValidationMeta | null;
  setInputs: (inputs: Partial<IdeaInputs>) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setResults: (results: ResultsData, validationMeta?: ValidationMeta | null) => void;
  setErrorMessage: (msg: string | null) => void;
  setApiError: (error: StructuredErrorResponse | null) => void;
  setValidationResult: (result: ValidationMeta | null) => void;
  setValidationMeta: (meta: ValidationMeta | null) => void;
  clearResults: () => void;
  resetJourney: () => void;
}

const initialInputs: IdeaInputs = {
  idea: '',
  industry: '',
  audience: '',
  problem: '',
  country: '',
  budget: '',
  teamSize: '',
};

export const useJourneyStore = create<JourneyState>((set) => ({
  inputs: initialInputs,
  analysisStatus: 'idle',
  results: null,
  errorMessage: null,
  errorCode: null,
  errorRetryAfter: null,
  validationResult: null,
  validationMeta: null,
  setInputs: (inputs) => set((state) => ({ inputs: { ...state.inputs, ...inputs } })),
  setAnalysisStatus: (status) => {
    console.log('[setAnalysisStatus] called with:', status);
    return set({ analysisStatus: status });
  },
  setResults: (results, validationMeta = null) =>
    set({
      results,
      validationMeta,
      analysisStatus: 'success',
      errorMessage: null,
      validationResult: null,
      errorCode: null,
      errorRetryAfter: null,
    }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  setApiError: (error) =>
    set({
      errorCode: error?.code ?? null,
      errorMessage: error?.message ?? null,
      errorRetryAfter: error?.retryAfter ?? null,
      analysisStatus: 'error',
    }),
  setValidationResult: (result) => set({ validationResult: result }),
  setValidationMeta: (meta) => set({ validationMeta: meta }),
  clearResults: () => set({ results: null, validationMeta: null }),
  resetJourney: () =>
    set({
      inputs: initialInputs,
      analysisStatus: 'idle',
      results: null,
      errorMessage: null,
      errorCode: null,
      errorRetryAfter: null,
      validationResult: null,
      validationMeta: null,
    }),
}));
