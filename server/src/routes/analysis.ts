import { Router } from 'express';
import { generateGeminiAnalysis } from '../services/geminiService';
import { analysisLimiter } from '../middleware/rateLimiter';
import { analysisSchema } from '../validators/analysisSchema';
import { analysisCache } from '../utils/cache';
import { normalizeResponse } from '../utils/responseNormalizer';

const router = Router();

router.post('/analyze', analysisLimiter, async (req, res) => {
  console.log("Incoming Request");

  // 1. Zod input validation
  const parseResult = analysisSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log("Response Sent");
    return res.status(400).json({ error: 'Please fill all required fields correctly.' });
  }

  // 2. Response Caching check using stringified body as cache key
  const cacheKey = JSON.stringify(req.body);
  const cachedData = analysisCache.get(cacheKey);
  if (cachedData) {
    console.log('[CACHE_HIT]');
    console.log("Response Sent");
    return res.json(cachedData);
  }

  try {
    // 3. Call Gemini service
    const rawResult = await generateGeminiAnalysis(parseResult.data);
    
    // 4. Normalize response to guarantee 9 cards are present
    const normalizedResult = normalizeResponse(rawResult);

    // 5. Save normalized data to cache (TTL = 3600 seconds)
    analysisCache.set(cacheKey, normalizedResult);

    console.log(
      "FINAL RESPONSE =",
      JSON.stringify(normalizedResult, null, 2)
    );
    
    console.log("Response Sent");
    return res.json(normalizedResult);
  } catch (error: any) {
    console.error('API analyze route error:', error.message || error);
    
    console.log("Response Sent");

    if (error.message === 'AI is taking longer than expected.') {
      return res.status(408).json({ error: 'AI is taking longer than expected.' });
    }
    
    if (error.message.includes('AI provider is experiencing temporary high demand')) {
      return res.status(503).json({ error: error.message });
    }

    if (error.message === 'AI service is currently unavailable.') {
      return res.status(503).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Analysis service is busy. A retry is recommended.' });
  }
});

export default router;
