import { Router } from 'express';
import { validateIdea } from '../services/validationService';
import { generateGroqAnalysis } from '../services/groqService';
import { matchIncubators } from '../services/incubatorMatchingService';
import { analysisLimiter } from '../middleware/rateLimiter';
import { analysisSchema } from '../validators/analysisSchema';
import { validateDeterministic } from '../validators/deterministicValidator';
import { analysisCache } from '../utils/cache';
import { normalizeResponse } from '../utils/responseNormalizer';
import { mapGroqError } from '../utils/groqErrorMapper';
import type { ValidationMeta } from '../../../shared/validation/types';
import type { StartupAnalysisRequest, StartupAnalysisResponse } from '../types/types';

const router = Router();

function validationFailureResponse(validation: ValidationMeta) {
  return {
    code: 'VALIDATION_FAILED' as const,
    message: 'Input validation failed.',
    retryAfter: null,
    validation,
  };
}

function attachIncubatorRecommendations(
  requestData: StartupAnalysisRequest,
  analysis: StartupAnalysisResponse
) {
  return {
    ...analysis,
    incubatorRecommendations: matchIncubators(requestData, analysis),
  };
}

router.post('/analyze', analysisLimiter, async (req, res) => {
  console.log('Incoming Request');

  const errorMapper = mapGroqError;

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
    const aiValidation: ValidationMeta = await validateIdea(requestData);

    if (!aiValidation.isValid || aiValidation.quality === 'invalid') {
      console.log('[VALIDATION_FAIL] Groq');
      console.log('Response Sent');
      return res.status(422).json(validationFailureResponse({
        ...aiValidation,
        isValid: false,
        quality: 'invalid',
      }));
    }

    const cacheKey = JSON.stringify(req.body);
    const cachedData = analysisCache.get(cacheKey) as StartupAnalysisResponse | undefined;

    if (cachedData) {
      console.log('[CACHE_HIT]');
      console.log('Response Sent');
      return res.json({
        analysis: attachIncubatorRecommendations(requestData, cachedData),
        validation: aiValidation,
      });
    }

    const rawAnalysisResult = await generateGroqAnalysis(requestData);

    const normalizedResult = normalizeResponse(rawAnalysisResult);

    analysisCache.set(cacheKey, normalizedResult);

    const analysisWithIncubators = attachIncubatorRecommendations(requestData, normalizedResult);

    console.log('FINAL RESPONSE =', JSON.stringify(analysisWithIncubators, null, 2));
    console.log('Response Sent');

    return res.json({
      analysis: analysisWithIncubators,
      validation: aiValidation,
    });
  } catch (error: unknown) {
    const structured = errorMapper(error);
    console.error('API analyze route error:', structured.code, structured.message);
    console.log('Response Sent');
    return res.status(structured.status || 500).json({ error: structured.message });
  }
});

export default router;
