import { generateGroqValidationResponse } from './groqService';
import type { StartupAnalysisRequest } from '../types/types';
import type { ValidationMeta } from '../../../shared/validation/types';

export async function validateIdea(data: StartupAnalysisRequest): Promise<ValidationMeta> {
  return generateGroqValidationResponse(data.idea);
}
