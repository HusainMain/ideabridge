import { Router } from 'express';
import { generateGeminiAnalysis } from '../services/geminiService';
import { validateIdeaWithGemini } from '../services/validationService';
import { analysisLimiter } from '../middleware/rateLimiter';
import { analysisSchema } from '../validators/analysisSchema';
import { validateDeterministic } from '../validators/deterministicValidator';
import { analysisCache } from '../utils/cache';
import { normalizeResponse } from '../utils/responseNormalizer';
import type { ValidationMeta } from '../../../shared/validation/types';

const router = Router();

function validationFailureResponse(validation: ValidationMeta) {
  return { validation };
}

router.post('/analyze', analysisLimiter, async (req, res) => {
  console.log('Incoming Request');

  const parseResult = analysisSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log('Response Sent');
    return res.status(400).json({ error: 'Please fill all required fields correctly.' });
  }

  const requestData = parseResult.data;

  const deterministicResult = validateDeterministic(requestData);
  if (deterministicResult) {
    console.log('[VALIDATION_FAIL] deterministic');
    console.log('Response Sent');
    return res.status(422).json(validationFailureResponse(deterministicResult));
  }

  try {
    const geminiValidation = await validateIdeaWithGemini(requestData);
    if (!geminiValidation.isValid || geminiValidation.quality === 'invalid') {
      console.log('[VALIDATION_FAIL] gemini');
      console.log('Response Sent');
      return res.status(422).json(validationFailureResponse({
        ...geminiValidation,
        isValid: false,
        quality: 'invalid',
      }));
    }

    const cacheKey = JSON.stringify(req.body);
    const cachedData = analysisCache.get(cacheKey);
    if (cachedData) {
      console.log('[CACHE_HIT]');
      console.log('Response Sent');
      return res.json({
        analysis: cachedData,
        validation: geminiValidation,
      });
    }

    const rawResult = await generateGeminiAnalysis(requestData);
    const normalizedResult = normalizeResponse(rawResult);

    analysisCache.set(cacheKey, normalizedResult);

    console.log('FINAL RESPONSE =', JSON.stringify(normalizedResult, null, 2));
    console.log('Response Sent');

    return res.json({
      analysis: normalizedResult,
      validation: geminiValidation,
    });
  } catch (error: unknown) {
    const message = (error as Error).message || String(error);
    console.error('API analyze route error:', message);
    console.log('Response Sent');

    if (message === 'AI is taking longer than expected.') {
      return res.status(408).json({ error: 'AI is taking longer than expected.' });
    }

    if (message.includes('AI provider is experiencing temporary high demand')) {
      return res.status(503).json({ error: message });
    }

    if (message === 'AI service is currently unavailable.') {
      return res.status(503).json({ error: message });
    }

    return res.status(500).json({ error: 'Analysis service is busy. A retry is recommended.' });
  }
});

export default router;
