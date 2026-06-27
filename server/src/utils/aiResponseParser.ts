import type { ValidationMeta } from '../../../shared/validation/types';

export function shouldRetryModel(error: unknown): boolean {
  const message = ((error as Error).message || '').toLowerCase();
  return (
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit')
  );
}

export function getBackoffDelay(): number {
  return 3000 + Math.random() * 2000;
}

export function extractJsonObject(raw: string): string {
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

export function parsePartialValidation(raw: string): ValidationMeta | null {
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

export function parseValidationJson(raw: string): ValidationMeta {
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
