import { GoogleGenAI } from '@google/genai';
import { VALIDATION_SYSTEM_PROMPT } from '../prompts/validationPrompt';
import { StartupAnalysisRequest } from '../types/types';
import { withTimeout } from '../utils/timeout';
import { shouldRetryModel, getBackoffDelay, parseValidationJson } from '../utils/aiResponseParser';
import type { ValidationMeta } from '../../../shared/validation/types';

const MODELS_IN_ORDER = ['gemini-2.5-flash', 'gemini-2.0-flash'];

function buildPromptContent(data: StartupAnalysisRequest): string {
  return `Startup Idea: ${data.idea}
Industry: ${data.industry}
Problem: ${data.problem}
Target Audience: ${data.audience}
Country: ${data.country}
Budget Level: ${data.budget}
Team Size: ${data.teamSize}`;
}

export async function validateIdeaWithGemini(data: StartupAnalysisRequest): Promise<ValidationMeta> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const ai = new GoogleGenAI({ apiKey });
  const promptContent = buildPromptContent(data);

  let lastError: unknown = null;
  let modelIndex = 0;
  let modelRetryCount = 0;
  let jsonRetryCount = 0;

  while (modelIndex < MODELS_IN_ORDER.length) {
    const currentModel = MODELS_IN_ORDER[modelIndex];

    try {
      console.log('[VALIDATION_MODEL]', currentModel);

      const response = await withTimeout(
        ai.models.generateContent({
          model: currentModel,
          contents: promptContent,
          config: {
            systemInstruction: VALIDATION_SYSTEM_PROMPT,
            temperature: 0.1,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
          },
        }),
        20000,
        'Validation is taking longer than expected.'
      );

      const responseText = response.text || '';
      console.log('[VALIDATION_RAW_LENGTH]', responseText.length);
      console.log('[VALIDATION_RAW]', responseText);

      return parseValidationJson(responseText);
    } catch (error: unknown) {
      lastError = error;
      const message = (error as Error).message || '';
      console.error('[VALIDATION_ERROR]', { model: currentModel, error });

      if (message.includes('invalid JSON') && jsonRetryCount < 1) {
        jsonRetryCount++;
        console.log('[VALIDATION_JSON_RETRY]', { model: currentModel });
        continue;
      }

      if (!shouldRetryModel(error)) {
        throw error;
      }

      if (modelRetryCount < 1) {
        modelRetryCount++;
        await new Promise((resolve) => setTimeout(resolve, getBackoffDelay()));
        continue;
      }

      modelIndex++;
      modelRetryCount = 0;
      jsonRetryCount = 0;
    }
  }

  throw lastError ?? new Error('All validation models failed.');
}
