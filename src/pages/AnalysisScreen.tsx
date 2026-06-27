import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../stores/useJourneyStore';
import { LoadingWorkspace } from '../components/LoadingWorkspace';
import { ImproveYourIdeaScreen } from '../components/ImproveYourIdeaScreen';
import { AnalysisErrorScreen } from '../components/AnalysisErrorScreen';
import { validateInputsDeterministic } from '../utils/deterministicValidation';
import type { ValidationMeta } from '../../shared/validation/types';
import type { StructuredErrorResponse, ApiErrorCode } from '../../shared/errors/types';
import { isStructuredError } from '../../shared/errors/types';
import type { ResultsData } from '../stores/useJourneyStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';

function isValidationPayload(
  data: unknown
): data is { validation: ValidationMeta; code?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'validation' in data &&
    typeof (data as { validation: ValidationMeta }).validation === 'object'
  );
}

function isAnalysisPayload(
  data: unknown
): data is { analysis: ResultsData; validation: ValidationMeta } {
  return (
    isValidationPayload(data) &&
    'analysis' in data &&
    typeof (data as { analysis: ResultsData }).analysis === 'object'
  );
}

function parseErrorResponse(text: string, status: number): StructuredErrorResponse | null {
  try {
    const data = JSON.parse(text);
    if (isStructuredError(data)) return data;
    if (typeof data?.error === 'string') {
      const code: ApiErrorCode =
        status === 429 ? 'RATE_LIMIT' : status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR';
      return {
        code,
        message: data.error,
        retryAfter: typeof data.retryAfter === 'number' ? data.retryAfter : null,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function AnalysisScreen() {
  const navigate = useNavigate();
  const {
    inputs,
    setResults,
    setAnalysisStatus,
    setApiError,
    clearResults,
    setValidationResult,
    validationResult,
    errorCode,
    errorMessage,
    analysisStatus,
  } = useJourneyStore();

  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const requestTriggered = useRef(false);
  const cooldownTimerRef = useRef<number | null>(null);
  const rateLimitTimerRef = useRef<number | null>(null);
  const hasAutoRetriedRateLimit = useRef(false);
  const rateLimitRetryStarted = useRef(false);

  const handleInvalidValidation = useCallback(
    (validation: ValidationMeta) => {
      setValidationResult(validation);
      setAnalysisStatus('invalid_input');
    },
    [setAnalysisStatus, setValidationResult]
  );

  const handleStructuredError = useCallback(
    (error: StructuredErrorResponse) => {
      if (
        error.code === 'RATE_LIMIT' &&
        !hasAutoRetriedRateLimit.current &&
        (error.retryAfter ?? 0) > 0
      ) {
        hasAutoRetriedRateLimit.current = true;
        rateLimitRetryStarted.current = false;
        setRateLimitCountdown(error.retryAfter ?? 10);
        setAnalysisStatus('rate_limit_wait');
        return;
      }

      setApiError(error);
    },
    [setAnalysisStatus, setApiError]
  );

  const runAnalysisRequest = useCallback(async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

    const response = await fetch(`${cleanBase}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    });

    const text = await response.text();

    if (response.status === 422) {
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        throw Object.assign(new Error('Server returned invalid data.'), {
          structured: {
            code: 'SERVER_ERROR' as const,
            message: 'Server returned invalid data.',
            retryAfter: null,
          },
        });
      }
      if (isValidationPayload(payload)) {
        handleInvalidValidation(payload.validation);
        return;
      }
      throw Object.assign(new Error('Validation failed unexpectedly.'), {
        structured: {
          code: 'SERVER_ERROR' as const,
          message: 'Validation failed unexpectedly.',
          retryAfter: null,
        },
      });
    }

    if (!response.ok) {
      const structured = parseErrorResponse(text, response.status);
      if (structured) {
        throw Object.assign(new Error(structured.message), { structured });
      }
      throw Object.assign(new Error('Request failed.'), {
        structured: {
          code: 'UNKNOWN_ERROR' as const,
          message: 'Something unexpected went wrong. Please try again.',
          retryAfter: null,
        },
      });
    }

    localStorage.setItem('ideabridge_cooldown_end', (Date.now() + 30000).toString());

    if (!text || text.trim() === '') {
      throw Object.assign(new Error('Empty response from server.'), {
        structured: {
          code: 'SERVER_ERROR' as const,
          message: 'Empty response from server.',
          retryAfter: null,
        },
      });
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw Object.assign(new Error('Server returned invalid data.'), {
        structured: {
          code: 'SERVER_ERROR' as const,
          message: 'Server returned invalid data.',
          retryAfter: null,
        },
      });
    }

    if (!isAnalysisPayload(data)) {
      throw Object.assign(new Error('Unexpected response shape.'), {
        structured: {
          code: 'SERVER_ERROR' as const,
          message: 'Server returned an unexpected response.',
          retryAfter: null,
        },
      });
    }

    setResults(data.analysis, data.validation);
    navigate('/results');
  }, [inputs, navigate, setResults, handleInvalidValidation]);

  const performAnalysis = useCallback(async () => {
    requestTriggered.current = true;

    const clientValidation = validateInputsDeterministic(inputs);
    if (clientValidation) {
      handleInvalidValidation(clientValidation);
      return;
    }

    setAnalysisStatus('analyzing');
    setApiError(null);
    setCooldownRemaining(null);
    setRateLimitCountdown(null);

    try {
      await runAnalysisRequest();
    } catch (err: unknown) {
      const structured = (err as { structured?: StructuredErrorResponse }).structured;

      if (structured) {
        handleStructuredError(structured);
        return;
      }

      if (err instanceof TypeError || (err as Error).message?.includes('Failed to fetch')) {
        setApiError({
          code: 'NETWORK_ERROR',
          message: 'Check your internet connection and try again.',
          retryAfter: null,
        });
        return;
      }

      setApiError({
        code: 'UNKNOWN_ERROR',
        message: (err as Error).message || 'Something unexpected went wrong.',
        retryAfter: null,
      });
    }
  }, [inputs, runAnalysisRequest, handleInvalidValidation, handleStructuredError, setAnalysisStatus, setApiError]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    clearResults();
    setApiError(null);
    setValidationResult(null);
    hasAutoRetriedRateLimit.current = false;
    rateLimitRetryStarted.current = false;
    setInitialized(true);

    if (inputs.idea) {
      performAnalysis();
    }
  }, [setAnalysisStatus, setApiError, clearResults, setValidationResult, inputs.idea, performAnalysis]);

  useEffect(() => {
    if (!inputs.idea) navigate('/input');
  }, [inputs.idea, navigate]);

  useEffect(() => {
    if (analysisStatus !== 'cooldown') return;

    const updateCooldown = () => {
      if (!cooldownTimerRef.current) return;
      const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
      if (cooldownEnd) {
        const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          performAnalysis();
        }
      }
    };

    updateCooldown();
    cooldownTimerRef.current = setInterval(updateCooldown, 1000);

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [analysisStatus, performAnalysis]);

  useEffect(() => {
    if (analysisStatus !== 'rate_limit_wait' || rateLimitCountdown === null) return;

    if (rateLimitCountdown <= 0) {
      if (rateLimitRetryStarted.current) return;
      rateLimitRetryStarted.current = true;
      setAnalysisStatus('analyzing');
      runAnalysisRequest().catch((err: unknown) => {
        const structured = (err as { structured?: StructuredErrorResponse }).structured;
        if (structured) {
          setApiError(structured);
        } else if (err instanceof TypeError || (err as Error).message?.includes('Failed to fetch')) {
          setApiError({
            code: 'NETWORK_ERROR',
            message: 'Check your internet connection and try again.',
            retryAfter: null,
          });
        } else {
          setApiError({
            code: 'UNKNOWN_ERROR',
            message: 'Retry failed. Please try again.',
            retryAfter: null,
          });
        }
      });
      return;
    }

    rateLimitTimerRef.current = setInterval(() => {
      setRateLimitCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (rateLimitTimerRef.current) {
        clearInterval(rateLimitTimerRef.current);
        rateLimitTimerRef.current = null;
      }
    };
  }, [analysisStatus, rateLimitCountdown, runAnalysisRequest, setAnalysisStatus, setApiError]);

  useEffect(() => {
    if (!initialized || !inputs.idea || requestTriggered.current) return;

    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd && parseInt(cooldownEnd, 10) > Date.now()) {
      const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
      setCooldownRemaining(remaining);
      setAnalysisStatus('cooldown');
    } else {
      performAnalysis();
    }
  }, [initialized, inputs, setAnalysisStatus, performAnalysis]);

  const handleRetry = () => {
    requestTriggered.current = false;
    hasAutoRetriedRateLimit.current = false;
    rateLimitRetryStarted.current = false;
    localStorage.removeItem('ideabridge_cooldown_end');
    window.location.reload();
  };

  const handleBackToEdit = () => {
    setValidationResult(null);
    setApiError(null);
    setAnalysisStatus('idle');
    requestTriggered.current = false;
    hasAutoRetriedRateLimit.current = false;
    rateLimitRetryStarted.current = false;
    navigate('/input');
  };

  return (
    <AnimatePresence>
      {(!initialized && inputs.idea) || analysisStatus === 'analyzing' || analysisStatus === 'cooldown' || analysisStatus === 'success' ? (
        <LoadingWorkspace
          key="loading"
          cooldownRemaining={analysisStatus === 'cooldown' ? cooldownRemaining ?? 0 : undefined}
        />
      ) : analysisStatus === 'invalid_input' && validationResult ? (
        <ImproveYourIdeaScreen
          key="invalid"
          validation={validationResult}
          onBackToEdit={handleBackToEdit}
        />
      ) : analysisStatus === 'rate_limit_wait' ? (
        <motion.div
          key="rate-limit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-md w-full p-8 border border-yellow-500/20 rounded-xl bg-slate-900/80 backdrop-blur-md text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Too many requests</h2>
            <p className="text-slate-400 mb-2 text-sm">Retrying automatically...</p>
            <p className="text-yellow-400 text-lg font-mono">
              Retrying in {rateLimitCountdown ?? 0}s...
            </p>
          </div>
        </motion.div>
      ) : analysisStatus === 'error' && errorCode && errorMessage ? (
        <AnalysisErrorScreen
          key="error"
          code={errorCode}
          message={errorMessage}
          onRetry={errorCode !== 'QUOTA_EXCEEDED' ? handleRetry : undefined}
          onEditIdea={handleBackToEdit}
        />
      ) : (
        <div key="waiting" className="min-h-screen bg-slate-950" />
      )}
    </AnimatePresence>
  );
}
