import { Router } from 'express';
import { generateGeminiAnalysis } from '../services/geminiService';
import { analysisLimiter } from '../middleware/rateLimiter';
import { analysisSchema } from '../validators/analysisSchema';
import { analysisCache } from '../utils/cache';
import { normalizeResponse } from '../utils/responseNormalizer';

const router = Router();

router.post('/analyze', analysisLimiter, async (req, res) => {
  // 1. Zod input validation
  const parseResult = analysisSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Please fill all required fields correctly.' });
  }

  // 2. Response Caching check using stringified body as cache key
  const cacheKey = JSON.stringify(req.body);
  const cachedData = analysisCache.get(cacheKey);
  if (cachedData) {
    console.log('Cache hit - returning cached response');
    return res.json(cachedData);
  }

  try {
    // 3. Call Gemini service
    const rawResult = await generateGeminiAnalysis(parseResult.data);
    
    // 4. Normalize response to guarantee 9 cards are present
    const normalizedResult = normalizeResponse(rawResult);

    // 5. Save normalized data to cache (TTL = 3600 seconds)
    analysisCache.set(cacheKey, normalizedResult);

    return res.json(normalizedResult);
  } catch (error: any) {
    console.error('API analyze route error:', error.message || error);
    
    if (error.message === 'AI is taking longer than expected.') {
      return res.status(408).json({ error: 'AI is taking longer than expected.' });
    }
    
    if (error.message === 'AI service is currently unavailable.') {
      return res.status(503).json({ error: 'AI service is currently unavailable.' });
    }

    return res.status(500).json({ error: 'Something went wrong.' });
  }
});

export default router;
