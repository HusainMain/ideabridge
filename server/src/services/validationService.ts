import { validateIdeaWithGemini } from './geminiValidationService';
import { generateGroqValidationResponse } from './groqService';
import type { StartupAnalysisRequest } from '../types/types';
import type { ValidationMeta } from '../../../shared/validation/types';

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

export async function validateIdea(data: StartupAnalysisRequest): Promise<ValidationMeta> {
  if (AI_PROVIDER === 'groq') {
    return generateGroqValidationResponse(data.idea);
  } else {
    return validateIdeaWithGemini(data);
  }
}
