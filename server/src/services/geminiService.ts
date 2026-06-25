import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../prompts/startupPrompt';
import { StartupAnalysisRequest } from '../types/types';
import { withTimeout } from '../utils/timeout';

const MODELS_IN_ORDER = ['gemini-2.5-flash', 'gemini-2.0-flash'];

function shouldRetryModel(error: any): boolean {
  const message = (error.message || '').toLowerCase();
  return (
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit')
  );
}

function getBackoffDelay(): number {
  // 3000ms to 5000ms random jitter
  return 3000 + Math.random() * 2000;
}

export async function generateGeminiAnalysis(data: StartupAnalysisRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const ai = new GoogleGenAI({ apiKey });

  const promptContent = `Startup Idea: ${data.idea}
Industry: ${data.industry}
Problem: ${data.problem}
Target Audience: ${data.audience}
Country: ${data.country}
Budget Level: ${data.budget}
Team Size: ${data.teamSize}`;

  let lastError: any = null;
  let fallbackUsed = false;
  let modelIndex = 0;
  let retryCount = 0;
  const startTime = Date.now();

  while (modelIndex < MODELS_IN_ORDER.length) {
    const currentModel = MODELS_IN_ORDER[modelIndex];
    const modelStartTime = Date.now();
    
    try {
      console.log('[MODEL_USED]', currentModel);
      if (fallbackUsed) {
        console.log('[FALLBACK_USED]', currentModel);
      }

      const response = await withTimeout(
        ai.models.generateContent({
          model: currentModel,
          contents: promptContent,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.2,
            maxOutputTokens: 4000,
            responseMimeType: 'application/json',
          },
        }),
        30000,
        'AI is taking longer than expected.'
      );

      const modelResponseTime = Date.now() - modelStartTime;
      const totalResponseTime = Date.now() - startTime;
      console.log('[RESPONSE_TIME]', { model: currentModel, modelMs: modelResponseTime, totalMs: totalResponseTime });
      
      if (response.usageMetadata) {
        console.log('[TOKEN_USAGE]', {
          model: currentModel,
          ...response.usageMetadata,
        });
      }

      const responseText = response.text || '';
      console.log("========== RAW GEMINI START ==========");
      console.log(responseText);
      console.log("========== RAW GEMINI END ==========");

      return responseText;

    } catch (error: any) {
      lastError = error;
      console.error('[ERROR_TYPE]', {
        model: currentModel,
        message: error.message || error,
        error,
      });

      if (!shouldRetryModel(error)) {
        // Non-retryable error, rethrow immediately
        throw error;
      }

      // Retry logic
      if (retryCount < 1) { // 1 retry per model = 2 attempts total per model
        retryCount++;
        console.log('[RETRY]', { model: currentModel, attempt: retryCount + 1 });
        const delayMs = getBackoffDelay();
        console.log('[RETRY_DELAY_MS]', delayMs);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      } else {
        // Exhausted retries for current model, try next
        modelIndex++;
        if (modelIndex < MODELS_IN_ORDER.length) {
          fallbackUsed = true;
          retryCount = 0;
          console.log('[FALLBACK_TO_NEXT_MODEL]', { from: currentModel, to: MODELS_IN_ORDER[modelIndex] });
        }
      }
    }
  }

  // All models failed
  console.error('[ALL_MODELS_FAILED]');
  
  const errorMessage = lastError?.message?.includes('AI is taking longer than expected.')
    ? lastError.message
    : 'AI provider is experiencing temporary high demand. Please retry in 30 seconds.';
  
  throw new Error(errorMessage);
}
