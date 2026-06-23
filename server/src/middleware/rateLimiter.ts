import rateLimit from 'express-rate-limit';

export const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 6, // Limit each IP to 6 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  },
  statusCode: 429,
});
