export type ValidationQuality = 'good' | 'weak' | 'invalid';

export interface ValidationMeta {
  isValid: boolean;
  quality: ValidationQuality;
  confidence: number;
  reason?: string;
  warning?: string;
  missing: string[];
  suggestions?: string[];
}

export interface ValidationResult {
  validation: ValidationMeta;
}

export interface IdeaFields {
  idea: string;
  industry: string;
  audience: string;
  problem: string;
  country: string;
  budget: string;
  teamSize: string;
}

export interface AnalysisWithValidation {
  analysis: Record<string, unknown>;
  validation: ValidationMeta;
}
