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

export function normalizeSection(items: any): string[] {
  let arr: any[] = [];
  if (Array.isArray(items)) {
    arr = items;
  } else if (typeof items === 'string') {
    if (items.includes('\n')) {
      arr = items.split('\n');
    } else {
      arr = [items];
    }
  } else {
    return ['Information unavailable.'];
  }

  const cleaned = arr
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

  // Handle case where JSON is wrapped under a single root key (e.g., { "analysis": { "summary": ... } })
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const firstKey = Object.keys(parsed)[0];
    if (
      Object.keys(parsed).length === 1 &&
      parsed[firstKey] &&
      typeof parsed[firstKey] === 'object' &&
      !Array.isArray(parsed[firstKey]) &&
      ('summary' in parsed[firstKey] || 'validation' in parsed[firstKey])
    ) {
      parsed = parsed[firstKey];
    }
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
    normalized[key] = normalizeSection(parsed ? parsed[key] : undefined);
  });

  return normalized as StartupAnalysisResponse;
}
