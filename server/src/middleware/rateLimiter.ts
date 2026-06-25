import rateLimit from 'express-rate-limit';

export const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 15,                   // raised from 6 — allows real usage without shared-IP issues
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Skip OPTIONS preflight requests so CORS handshakes don't consume the budget
  skip: (req) => req.method === 'OPTIONS',
  handler: (_req, res, _next, options) => {
    // Read the reset timestamp from the standard header already set by the limiter
    const resetHeader = res.getHeader('RateLimit-Reset');
    const retryAfterSeconds =
      typeof resetHeader === 'string' || typeof resetHeader === 'number'
        ? Math.max(0, Math.ceil((Number(resetHeader) * 1000 - Date.now()) / 1000))
        : 3600;

    res.status(options.statusCode).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: retryAfterSeconds,
    });
  },
});
