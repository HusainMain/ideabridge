import { create } from 'zustand';

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface IdeaInputs {
  idea: string;
  audience: string;
  stage: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  whyMatched: string;
  avatarUrl?: string;
}

export interface FundingSource {
  id: string;
  name: string;
  type: string;
  eligibility: string;
  fitScore: number;
  deadline?: string;
}

export interface Incubator {
  id: string;
  name: string;
  stage: string;
  location: string;
  benefits: string[];
}

export interface ResultsData {
  readinessScore: number;
  topRecommendation: {
    nextStep: string;
    actions: string[];
  };
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
  mentors: Mentor[];
  funding: FundingSource[];
  incubators: Incubator[];
}

interface JourneyState {
  inputs: IdeaInputs;
  analysisStatus: AnalysisStatus;
  results: ResultsData | null;
  setInputs: (inputs: Partial<IdeaInputs>) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setResults: (results: ResultsData) => void;
  resetJourney: () => void;
}

const initialInputs: IdeaInputs = {
  idea: '',
  audience: '',
  stage: 'Just an idea',
};

export const useJourneyStore = create<JourneyState>((set) => ({
  inputs: initialInputs,
  analysisStatus: 'idle',
  results: null,
  setInputs: (inputs) => set((state) => ({ inputs: { ...state.inputs, ...inputs } })),
  setAnalysisStatus: (status) => set({ analysisStatus: status }),
  setResults: (results) => set({ results, analysisStatus: 'success' }),
  resetJourney: () => set({ inputs: initialInputs, analysisStatus: 'idle', results: null }),
}));
