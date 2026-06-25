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

export interface ResultsData {
  summary: string[];
  validation: string[];
  customers: string[];
  revenue: string[];
  competitors: string[];
  roadmap: string[];
  funding: string[];
  risks: string[];
  actions: string[];
}

interface JourneyState {
  inputs: IdeaInputs;
  analysisStatus: AnalysisStatus;
  results: ResultsData | null;
  errorMessage: string | null;
  setInputs: (inputs: Partial<IdeaInputs>) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setResults: (results: ResultsData) => void;
  setErrorMessage: (msg: string | null) => void;
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
  setErrorMessage: (msg) => set(() => ({ 
    errorMessage: msg, 
    ...(msg ? { analysisStatus: 'error' } : {}) 
  })),
  resetJourney: () => set({ inputs: initialInputs, analysisStatus: 'idle', results: null, errorMessage: null }),
}));

