import { GoogleGenAI } from '@google/genai';
import { VALIDATION_SYSTEM_PROMPT } from '../prompts/validationPrompt';
import { StartupAnalysisRequest } from '../types/types';
import { withTimeout } from '../utils/timeout';
import type { ValidationMeta } from '../../../shared/validation/types';

const MODELS_IN_ORDER = ['gemini-2.5-flash', 'gemini-2.0-flash'];

function shouldRetryModel(error: unknown): boolean {
  const message = ((error as Error).message || '').toLowerCase();
  return (
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit')
  );
}

function getBackoffDelay(): number {
  return 3000 + Math.random() * 2000;
}

function buildPromptContent(data: StartupAnalysisRequest): string {
  return `Startup Idea: ${data.idea}
Industry: ${data.industry}
Problem: ${data.problem}
Target Audience: ${data.audience}
Country: ${data.country}
Budget Level: ${data.budget}
Team Size: ${data.teamSize}`;
}

function extractJsonObject(raw: string): string {
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function parsePartialValidation(raw: string): ValidationMeta | null {
  const qualityMatch = raw.match(/"quality"\s*:\s*"(good|weak|invalid)"/);
  const isValidMatch = raw.match(/"isValid"\s*:\s*(true|false)/);
  if (!qualityMatch || !isValidMatch) return null;

  const quality = qualityMatch[1] as ValidationMeta['quality'];
  const isValid = isValidMatch[1] === 'true';
  const confidenceMatch = raw.match(/"confidence"\s*:\s*([\d.]+)/);
  const confidence = confidenceMatch ? Number(confidenceMatch[1]) : 0.8;

  const warningMatch = raw.match(/"warning"\s*:\s*"([^"]*)/);
  const reasonMatch = raw.match(/"reason"\s*:\s*"([^"]*)/);

  const meta: ValidationMeta = {
    isValid: quality === 'invalid' ? false : isValid,
    quality,
    confidence: Number.isFinite(confidence) ? confidence : 0.8,
    missing: [],
  };

  if (warningMatch?.[1]) meta.warning = warningMatch[1];
  if (reasonMatch?.[1]) meta.reason = reasonMatch[1];

  if (quality === 'invalid') {
    meta.isValid = false;
    if (!meta.reason) meta.reason = 'This input cannot be meaningfully analyzed as a startup idea.';
  }

  return meta;
}

function parseValidationJson(raw: string): ValidationMeta {
  let parsed: Record<string, unknown>;
  const jsonStr = extractJsonObject(raw);
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    const partial = parsePartialValidation(raw);
    if (partial) {
      console.log('[VALIDATION_PARTIAL_PARSE] recovered truncated response');
      return partial;
    }
    throw new Error('Validation service returned invalid JSON.');
  }

  const quality = parsed.quality;
  const isValid = parsed.isValid;
  const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;

  if (
    typeof isValid !== 'boolean' ||
    quality !== 'good' &&
    quality !== 'weak' &&
    quality !== 'invalid'
  ) {
    throw new Error('Validation service returned an unexpected shape.');
  }

  const missing = Array.isArray(parsed.missing)
    ? parsed.missing.filter((m): m is string => typeof m === 'string')
    : [];

  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.filter((s): s is string => typeof s === 'string')
    : undefined;

  const meta: ValidationMeta = {
    isValid,
    quality,
    confidence,
    missing,
    suggestions,
  };

  if (typeof parsed.reason === 'string' && parsed.reason.trim()) {
    meta.reason = parsed.reason.trim();
  }
  if (typeof parsed.warning === 'string' && parsed.warning.trim()) {
    meta.warning = parsed.warning.trim();
  }

  if (quality === 'invalid') {
    meta.isValid = false;
    if (!meta.reason) {
      meta.reason = 'This input cannot be meaningfully analyzed as a startup idea.';
    }
  } else {
    meta.isValid = true;
  }

  return meta;
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
