export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMIT'
  | 'AI_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface StructuredErrorResponse {
  code: ApiErrorCode;
  message: string;
  retryAfter: number | null;
}

export function isStructuredError(data: unknown): data is StructuredErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'message' in data &&
    typeof (data as StructuredErrorResponse).code === 'string' &&
    typeof (data as StructuredErrorResponse).message === 'string'
  );
}
