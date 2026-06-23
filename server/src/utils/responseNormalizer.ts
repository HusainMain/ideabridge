import { StartupAnalysisResponse } from '../types/types';

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
    const value = parsed[key];
    if (Array.isArray(value) && value.length > 0) {
      // Ensure all items are strings and cleaned of unnecessary spaces
      const stringArr = value
        .map((item: any) => String(item).trim())
        .filter((item: string) => item.length > 0);
      
      if (stringArr.length > 0) {
        normalized[key] = stringArr;
      } else {
        normalized[key] = ['Information unavailable.'];
      }
    } else {
      normalized[key] = ['Information unavailable.'];
    }
  });

  return normalized as StartupAnalysisResponse;
}
