export interface StartupAnalysisRequest {
  idea: string;
  industry: string;
  audience: string;
  problem: string;
  country: string;
  budget: string;
  teamSize: string;
}

export interface StartupAnalysisResponse {
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
