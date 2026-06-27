import { Groq } from 'groq-sdk';
import { SYSTEM_PROMPT } from '../prompts/startupPrompt';
import { VALIDATION_SYSTEM_PROMPT } from '../prompts/validationPrompt';
import { StartupAnalysisRequest } from '../types/types';
import { withTimeout } from '../utils/timeout';
import { shouldRetryModel, getBackoffDelay, parseValidationJson } from '../utils/aiResponseParser';
import type { ValidationMeta } from '../../../shared/validation/types';

const GROQ_VALIDATION_MODEL = process.env.GROQ_VALIDATION_MODEL || 'llama-3.1-8b-instant';
const GROQ_ANALYSIS_MODEL = process.env.GROQ_ANALYSIS_MODEL || 'llama-3.3-70b-versatile';

function buildPromptContent(data: StartupAnalysisRequest): string {
  return `Startup Idea: ${data.idea}
Industry: ${data.industry}
Problem: ${data.problem}
Target Audience: ${data.audience}
Country: ${data.country}
Budget Level: ${data.budget}
Team Size: ${data.teamSize}`;
}

export async function generateGroqAnalysis(data: StartupAnalysisRequest): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined');
  }

  const groq = new Groq({ apiKey });

  const promptContent = buildPromptContent(data);

  let lastError: unknown = null;
  let retryCount = 0;

  while (retryCount < 2) { // Allow 2 retries
    try {
      console.log('[MODEL_USED]', GROQ_ANALYSIS_MODEL);

      const chatCompletion = await withTimeout(
        groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: promptContent },
          ],
          model: GROQ_ANALYSIS_MODEL,
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
        30000,
        'AI is taking longer than expected.'
      );

      const responseText = chatCompletion.choices[0]?.message?.content || '';
      console.log("========== RAW GROQ ANALYSIS START ==========");
      console.log(responseText);
      console.log("========== RAW GROQ ANALYSIS END ==========");

      return responseText;

    } catch (error: unknown) {
      lastError = error;
      console.error('[ERROR_TYPE]', {
        model: GROQ_ANALYSIS_MODEL,
        message: (error as Error).message || error,
        error,
      });

      if (!shouldRetryModel(error)) {
        throw error;
      }

      retryCount++;
      console.log('[RETRY]', { model: GROQ_ANALYSIS_MODEL, attempt: retryCount });
      const delayMs = getBackoffDelay();
      console.log('[RETRY_DELAY_MS]', delayMs);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError ?? new Error('Groq analysis failed after multiple retries.');
}

export async function generateGroqValidationResponse(idea: string): Promise<ValidationMeta> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined');
  }

  const groq = new Groq({ apiKey });

  let lastError: unknown = null;
  let retryCount = 0;
  let jsonRetryCount = 0;

  while (retryCount < 2) { // Allow 2 retries
    try {
      console.log('[VALIDATION_MODEL]', GROQ_VALIDATION_MODEL);

      const chatCompletion = await withTimeout(
        groq.chat.completions.create({
          messages: [
            { role: 'system', content: VALIDATION_SYSTEM_PROMPT },
            { role: 'user', content: idea },
          ],
          model: GROQ_VALIDATION_MODEL,
          temperature: 0.1,
          max_tokens: 512,
          response_format: { type: 'json_object' },
        }),
        20000,
        'Validation is taking longer than expected.'
      );

      const responseText = chatCompletion.choices[0]?.message?.content || '';
      console.log('[VALIDATION_RAW_LENGTH]', responseText.length);
      console.log('[VALIDATION_RAW]', responseText);

      return parseValidationJson(responseText);

    } catch (error: unknown) {
      lastError = error;
      const message = (error as Error).message || '';
      console.error('[VALIDATION_ERROR]', { model: GROQ_VALIDATION_MODEL, error });

      if (message.includes('invalid JSON') && jsonRetryCount < 1) {
        jsonRetryCount++;
        console.log('[VALIDATION_JSON_RETRY]', { model: GROQ_VALIDATION_MODEL });
        continue;
      }

      if (!shouldRetryModel(error)) {
        throw error;
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, getBackoffDelay()));
    }
  }

  throw lastError ?? new Error('Groq validation failed after multiple retries.');
}
