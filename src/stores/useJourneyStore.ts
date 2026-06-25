import { create } from 'zustand';

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error' | 'cooldown';

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
}

interface JourneyState {
  inputs: IdeaInputs;
  analysisStatus: AnalysisStatus;
  results: ResultsData | null;
  errorMessage: string | null;
  setInputs: (inputs: Partial<IdeaInputs>) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setResults: (results: ResultsData) => void;
  // setErrorMessage ONLY sets the message — no hidden analysisStatus side-effect.
  setErrorMessage: (msg: string | null) => void;
  // clearResults wipes stale data before a new analysis begins.
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
  setInputs: (inputs) => set((state) => ({ inputs: { ...state.inputs, ...inputs } })),
  setAnalysisStatus: (status) => {
    console.log('[setAnalysisStatus] called with:', status);
    return set({ analysisStatus: status });
  },
  setResults: (results) => set({ results, analysisStatus: 'success', errorMessage: null }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  clearResults: () => set({ results: null }),
  resetJourney: () => set({ inputs: initialInputs, analysisStatus: 'idle', results: null, errorMessage: null }),
}));
