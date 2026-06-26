import type { IdeaFields, ValidationMeta } from './types';

const KEYBOARD_PATTERNS = [
  'asdf', 'qwer', 'zxcv', 'hjkl', 'fdsa', 'ytrew', 'qwerty', 'abcdef',
];

const TEXT_FIELDS: Array<{ key: keyof IdeaFields; label: string }> = [
  { key: 'idea', label: 'Your startup idea' },
  { key: 'industry', label: 'Industry' },
  { key: 'problem', label: 'The problem you are solving' },
  { key: 'audience', label: 'Your target customer' },
  { key: 'country', label: 'Target country or region' },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isWhitespaceOnly(value: string): boolean {
  return value.trim().length === 0;
}

function isNumbersOnly(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && /^\d+$/.test(trimmed);
}

function isPunctuationOnly(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[^\p{L}\p{N}]+$/u.test(trimmed);
}

function hasRepeatedCharacters(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 4) return false;
  return /(.)\1{3,}/.test(trimmed) || /^(.+)\1+$/.test(trimmed.replace(/\s/g, ''));
}

function hasRepeatedWords(value: string): boolean {
  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  const unique = new Set(words);
  return unique.size === 1;
}

function vowelRatio(value: string): number {
  const letters = value.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return 0;
  const vowels = letters.replace(/[^aeiouAEIOU]/g, '').length;
  return vowels / letters.length;
}

function isSingleTokenGibberish(token: string): boolean {
  const lower = normalize(token).replace(/[^a-z-]/g, '');
  if (lower.length < 6) return false;

  if (KEYBOARD_PATTERNS.some((p) => lower.includes(p))) return true;

  const letterLen = lettersOnlyLength(lower);
  const vowel = vowelRatio(lower);

  if (letterLen >= 8 && vowel < 0.15) return true;
  if (letterLen >= 10 && vowel < 0.22) return true;

  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(lower)) return true;

  return false;
}

function looksLikeKeyboardSmash(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6) return false;

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  // Multi-word descriptive text is usually legitimate unless a token is gibberish
  if (tokens.length >= 3) {
    return tokens.some((token) => {
      const letters = lettersOnlyLength(token);
      return letters >= 8 && isSingleTokenGibberish(token);
    });
  }

  if (tokens.length === 1) {
    return isSingleTokenGibberish(tokens[0]);
  }

  // Two-word phrases: only flag if a long token looks like gibberish
  return tokens.some((token) => {
    const letters = lettersOnlyLength(token);
    return letters >= 8 && isSingleTokenGibberish(token);
  });
}

function lettersOnlyLength(value: string): number {
  return value.replace(/[^a-zA-Z]/g, '').length;
}

function isMostlySymbols(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 4) return false;
  const alphanumeric = trimmed.replace(/[^a-zA-Z0-9]/g, '').length;
  return alphanumeric / trimmed.length < 0.3;
}

function hasLowInformation(value: string): boolean {
  const trimmed = value.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const letterCount = lettersOnlyLength(trimmed);

  if (trimmed.length >= 10 && words.length === 1 && letterCount < 12) {
    return looksLikeKeyboardSmash(trimmed) || isMostlySymbols(trimmed);
  }

  return false;
}

function fieldsAreIdentical(fields: IdeaFields): boolean {
  const textValues = TEXT_FIELDS.map(({ key }) => normalize(fields[key]));
  const nonEmpty = textValues.filter((v) => v.length > 0);
  if (nonEmpty.length < 3) return false;
  return nonEmpty.every((v) => v === nonEmpty[0]);
}

function checkField(value: string, label: string): string[] {
  const issues: string[] = [];
  if (isWhitespaceOnly(value)) {
    issues.push(`${label} is empty`);
    return issues;
  }
  if (isNumbersOnly(value)) issues.push(`${label} contains only numbers`);
  if (isPunctuationOnly(value)) issues.push(`${label} contains only punctuation or symbols`);
  if (hasRepeatedCharacters(value)) issues.push(`${label} has excessive repeated characters`);
  if (hasRepeatedWords(value)) issues.push(`${label} repeats the same word`);
  if (looksLikeKeyboardSmash(value)) issues.push(`${label} looks like random keyboard input`);
  if (isMostlySymbols(value)) issues.push(`${label} is mostly symbols`);
  if (hasLowInformation(value)) issues.push(`${label} has too little meaningful information`);
  return issues;
}

export function runDeterministicValidation(fields: IdeaFields): ValidationMeta | null {
  const missing: string[] = [];
  const suggestions: string[] = [];
  const fieldIssues: string[] = [];

  for (const { key, label } of TEXT_FIELDS) {
    const value = fields[key];
    if (isWhitespaceOnly(value)) {
      missing.push(label);
      continue;
    }
    fieldIssues.push(...checkField(value, label));
  }

  if (fieldsAreIdentical(fields)) {
    fieldIssues.push('Several fields contain identical text — please describe each part of your idea separately');
    suggestions.push('Use different details for your idea, problem, audience, and industry instead of copying the same phrase');
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      quality: 'invalid',
      confidence: 1,
      reason: 'Some required fields are empty or missing.',
      missing,
      suggestions: [
        'Fill in every step of the idea wizard before analyzing.',
        'Describe what you are building, who it is for, and the problem you solve.',
      ],
    };
  }

  if (fieldIssues.length > 0) {
    const reason = fieldIssues[0];
    const derivedMissing = deriveMissingFromIssues(fields, fieldIssues);
    return {
      isValid: false,
      quality: 'invalid',
      confidence: 0.99,
      reason,
      missing: derivedMissing.length > 0 ? derivedMissing : ['A clear, meaningful description of your startup idea'],
      suggestions: suggestions.length > 0
        ? suggestions
        : [
            'Replace random text with a short sentence about what your startup does.',
            'Mention who you help and what problem you solve.',
          ],
    };
  }

  return null;
}

function deriveMissingFromIssues(fields: IdeaFields, issues: string[]): string[] {
  const missing: string[] = [];
  for (const { key, label } of TEXT_FIELDS) {
    const value = fields[key];
    const related = issues.some((i) => i.startsWith(label));
    if (related || looksLikeKeyboardSmash(value) || isNumbersOnly(value) || isPunctuationOnly(value)) {
      if (!missing.includes(label)) missing.push(label);
    }
  }
  return missing;
}
