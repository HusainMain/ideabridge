import { generateGroqValidationResponse } from './groqService';
import type { StartupAnalysisRequest } => Promise<ValidationMeta>;
import type { ValidationMeta } from '../../../shared/validation/types';

export async function validateIdea(data: StartupAnalysisRequest): Promise<ValidationMeta> {
  return generateGroqValidationResponse(data.idea);
}
