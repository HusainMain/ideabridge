import type { ApiErrorCode, StructuredErrorResponse } from '../../../shared/errors/types';

interface GeminiErrorDetail {
  '@type'?: string;
  retryDelay?: string;
  violations?: Array<{
    quotaId?: string;
    quotaMetric?: string;
    quotaValue?: string;
  }>;
}

interface GeminiErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: GeminiErrorDetail[];
  };
}

export class StructuredApiError extends Error {
  readonly code: ApiErrorCode;
  readonly retryAfter: number | null;
  readonly httpStatus: number;

  constructor(payload: StructuredErrorResponse, httpStatus: number) {
    super(payload.message);
    this.name = 'StructuredApiError';
    this.code = payload.code;
    this.retryAfter = payload.retryAfter;
    this.httpStatus = httpStatus;
  }

  toJSON(): StructuredErrorResponse {
    return {
      code: this.code,
      message: this.message,
      retryAfter: this.retryAfter,
    };
  }
}

function parseEmbeddedGeminiJson(message: string): GeminiErrorBody | null {
  const start = message.indexOf('{');
  if (start === -1) return null;
  try {
    return JSON.parse(message.slice(start)) as GeminiErrorBody;
  } catch {
    return null;
  }
}

function extractRetryAfterSeconds(
  message: string,
  details: GeminiErrorDetail[] | undefined
): number | null {
  for (const detail of details ?? []) {
    if (detail.retryDelay) {
      const match = detail.retryDelay.match(/([\d.]+)s/);
      if (match) return Math.ceil(parseFloat(match[1]));
    }
  }

  const messageMatch = message.match(/retry in ([\d.]+)s/i);
  if (messageMatch) return Math.ceil(parseFloat(messageMatch[1]));

  return null;
}

function isDailyQuotaExhausted(
  message: string,
  details: GeminiErrorDetail[] | undefined
): boolean {
  const lower = message.toLowerCase();
  if (lower.includes('per day') || lower.includes('perday')) return true;

  return (details ?? []).some((detail) =>
    detail.violations?.some((violation) => {
      const id = (violation.quotaId ?? '').toLowerCase();
      const metric = (violation.quotaMetric ?? '').toLowerCase();
      return id.includes('perday') || metric.includes('perday');
    })
  );
}

function httpStatusForCode(code: ApiErrorCode): number {
  switch (code) {
    case 'QUOTA_EXCEEDED':
    case 'RATE_LIMIT':
      return 429;
    case 'AI_UNAVAILABLE':
      return 503;
    case 'NETWORK_ERROR':
      return 503;
    case 'SERVER_ERROR':
    case 'UNKNOWN_ERROR':
      return 500;
    default:
      return 500;
  }
}

export function mapGeminiError(error: unknown): StructuredApiError {
  const err = error as {
    status?: number;
    message?: string;
    name?: string;
    cause?: { code?: string; message?: string };
  };

  const rawMessage = err.message ?? String(error);
  const body = parseEmbeddedGeminiJson(rawMessage);
  const geminiMessage = body?.error?.message ?? rawMessage;
  const geminiStatus = err.status ?? body?.error?.code;
  const geminiState = body?.error?.status ?? '';
  const details = body?.error?.details;
  const retryAfter = extractRetryAfterSeconds(geminiMessage, details);

  console.error('[GEMINI_ERROR_MAP]', {
    name: err.name,
    status: geminiStatus,
    geminiState,
    message: geminiMessage,
    retryAfter,
  });

  if (rawMessage.includes('GEMINI_API_KEY is not defined')) {
    return new StructuredApiError(
      {
        code: 'SERVER_ERROR',
        message: 'The analysis service is not configured correctly. Please contact support.',
        retryAfter: null,
      },
      500
    );
  }

  if (
    rawMessage.includes('AI is taking longer than expected') ||
    rawMessage.includes('Validation is taking longer than expected')
  ) {
    return new StructuredApiError(
      {
        code: 'AI_UNAVAILABLE',
        message: "Google's AI service took too long to respond. Please try again shortly.",
        retryAfter: null,
      },
      408
    );
  }

  const networkCodes = ['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN'];
  const causeCode = err.cause?.code ?? '';
  if (
    networkCodes.includes(causeCode) ||
    rawMessage.toLowerCase().includes('fetch failed') ||
    rawMessage.toLowerCase().includes('network') ||
    rawMessage.toLowerCase().includes('socket hang up')
  ) {
    return new StructuredApiError(
      {
        code: 'NETWORK_ERROR',
        message: 'Could not reach the AI service. Check your connection and try again.',
        retryAfter: null,
      },
      503
    );
  }

  if (
    geminiStatus === 429 ||
    geminiState === 'RESOURCE_EXHAUSTED' ||
    rawMessage.toLowerCase().includes('resource_exhausted')
  ) {
    if (isDailyQuotaExhausted(geminiMessage, details)) {
      return new StructuredApiError(
        {
          code: 'QUOTA_EXCEEDED',
          message:
            "IdeaBridge has reached today's AI request limit. Please try again after the quota resets or use another API key.",
          retryAfter: null,
        },
        429
      );
    }

    return new StructuredApiError(
      {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please wait a moment before trying again.',
        retryAfter,
      },
      429
    );
  }

  if (
    geminiStatus === 503 ||
    geminiStatus === 500 ||
    geminiStatus === 504 ||
    geminiState === 'UNAVAILABLE' ||
    rawMessage.toLowerCase().includes('unavailable') ||
    rawMessage.toLowerCase().includes('high demand')
  ) {
    return new StructuredApiError(
      {
        code: 'AI_UNAVAILABLE',
        message: "Google's AI service is temporarily unavailable. Please try again shortly.",
        retryAfter: null,
      },
      503
    );
  }

  if (rawMessage.includes('invalid JSON') || rawMessage.includes('unexpected shape')) {
    return new StructuredApiError(
      {
        code: 'SERVER_ERROR',
        message: 'The analysis service returned an unexpected response. Please try again.',
        retryAfter: null,
      },
      500
    );
  }

  return new StructuredApiError(
    {
      code: 'UNKNOWN_ERROR',
      message: 'Something unexpected went wrong. Please try again.',
      retryAfter: null,
    },
    httpStatusForCode('UNKNOWN_ERROR')
  );
}

export function mapUnknownError(error: unknown): StructuredApiError {
  if (error instanceof StructuredApiError) return error;
  return mapGeminiError(error);
}

export function sendStructuredError(
  res: { status: (code: number) => { json: (body: StructuredErrorResponse) => unknown } },
  error: StructuredApiError
) {
  return res.status(error.httpStatus).json(error.toJSON());
}
