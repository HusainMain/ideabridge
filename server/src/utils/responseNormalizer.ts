import { StartupAnalysisResponse } from '../types/types';

export function truncateWords(text: string, maxWords = 25): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const words = trimmed.split(/\s+/);
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return trimmed;
}

export function normalizeSection(items: string[]): string[] {
  if (!Array.isArray(items)) {
    return ['Information unavailable.'];
  }

  const cleaned = items
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => truncateWords(item, 25))
    .filter(Boolean);

  const limited = cleaned.slice(0, 2);

  if (limited.length === 0) {
    return ['Information unavailable.'];
  }

  return limited;
}

export function normalizeResponse(rawOutput: string): StartupAnalysisResponse {
  let parsed: any = {};
  
  // Strip code fences if the model output wrapped the JSON
  let cleanOutput = rawOutput.trim();
  if (cleanOutput.startsWith('```')) {
    cleanOutput = cleanOutput.replace(/^```(json)?\s*/i, '');
    cleanOutput = cleanOutput.replace(/```$/, '');
    cleanOutput = cleanOutput.trim();
  }

  try {
    parsed = JSON.parse(cleanOutput);
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON. Output was:', rawOutput, err);
    parsed = {};
  }

  const keys: (keyof StartupAnalysisResponse)[] = [
    'summary',
    'validation',
    'customers',
    'revenue',
    'competitors',
    'roadmap',
    'funding',
    'risks',
    'actions',
  ];

  const normalized: Partial<StartupAnalysisResponse> = {};

  keys.forEach((key) => {
    normalized[key] = normalizeSection(parsed[key]);
  });

  return normalized as StartupAnalysisResponse;
}
