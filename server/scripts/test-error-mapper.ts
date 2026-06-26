import { mapGeminiError } from '../src/utils/geminiErrorMapper';

const cases = [
  {
    name: 'Daily quota exhausted',
    error: {
      status: 429,
      message: JSON.stringify({
        error: {
          code: 429,
          message: 'You exceeded your current quota.',
          status: 'RESOURCE_EXHAUSTED',
          details: [
            {
              violations: [{ quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }],
            },
          ],
        },
      }),
    },
    expectCode: 'QUOTA_EXCEEDED',
  },
  {
    name: 'Rate limit with retry',
    error: {
      status: 429,
      message: JSON.stringify({
        error: {
          code: 429,
          message: 'Rate limited. Please retry in 7.5s.',
          status: 'RESOURCE_EXhausted',
          details: [{ retryDelay: '7.5s' }],
        },
      }),
    },
    expectCode: 'RATE_LIMIT',
  },
  {
    name: 'Service unavailable',
    error: { status: 503, message: '{"error":{"message":"Service unavailable","status":"UNAVAILABLE"}}' },
    expectCode: 'AI_UNAVAILABLE',
  },
  {
    name: 'Network failure',
    error: { message: 'fetch failed', cause: { code: 'ECONNREFUSED' } },
    expectCode: 'NETWORK_ERROR',
  },
  {
    name: 'Missing API key',
    error: { message: 'GEMINI_API_KEY is not defined' },
    expectCode: 'SERVER_ERROR',
  },
];

let passed = 0;
for (const testCase of cases) {
  const mapped = mapGeminiError(testCase.error);
  const ok = mapped.code === testCase.expectCode;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${testCase.name} → ${mapped.code}`);
  if (ok) passed++;
}

console.log(`\n${passed}/${cases.length} mapper tests passed`);
process.exit(passed === cases.length ? 0 : 1);
