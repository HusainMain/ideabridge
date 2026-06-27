import type { ApiErrorCode, StructuredErrorResponse } from '../../../shared/errors/types';

export class StructuredApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly retryAfter: number | null;

  constructor(response: StructuredErrorResponse, status: number) {
    super(response.message);
    this.name = 'StructuredApiError';
    this.status = status;
    this.code = response.code;
    this.retryAfter = response.retryAfter || null;

    Object.setPrototypeOf(this, StructuredApiError.prototype);
  }
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

export function mapGroqError(error: unknown): StructuredApiError {
  const err = error as {
    status?: number;
    message?: string;
    name?: string;
    cause?: { code?: string; message?: string };
    error?: {
      code?: string;
      message?: string;
      type?: string;
      param?: string;
    };
  };

  const rawMessage = err.message ?? String(error);
  const groqMessage = err.error?.message ?? rawMessage;
  const groqCode = err.error?.code;
  const groqType = err.error?.type;
  const httpStatus = err.status;

  console.error('[GROQ_ERROR_MAP]', {
    name: err.name,
    status: httpStatus,
    groqCode,
    groqType,
    message: groqMessage,
  });

  if (rawMessage.includes('GROQ_API_KEY is not defined')) {
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
        message: "Groq's AI service took too long to respond. Please try again shortly.",
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
    httpStatus === 429 ||
    groqCode === 'rate_limit_exceeded' ||
    groqType === 'rate_limit_error' ||
    rawMessage.toLowerCase().includes('rate limit')
  ) {
    // Groq API does not typically distinguish between daily quota and rate limit in the same way Gemini does.
    // We'll map all 429s or rate limit messages to RATE_LIMIT.
    return new StructuredApiError(
      {
        code: 'RATE_LIMIT',
        message: 'Too many requests to Groq API. Please wait a moment before trying again.',
        retryAfter: null, // Groq API response might not include retry-after header in error body
      },
      429
    );
  }

  if (
    httpStatus === 503 ||
    httpStatus === 500 ||
    httpStatus === 504 ||
    groqType === 'server_error' ||
    rawMessage.toLowerCase().includes('unavailable') ||
    rawMessage.toLowerCase().includes('internal server error')
  ) {
    return new StructuredApiError(
      {
        code: 'AI_UNAVAILABLE',
        message: "Groq's AI service is temporarily unavailable. Please try again shortly.",
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
      message: 'Something unexpected went wrong with Groq API. Please try again.',
      retryAfter: null,
    },
    httpStatusForCode('UNKNOWN_ERROR')
  );
}
