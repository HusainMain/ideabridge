import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { LoadingWorkspace } from '../components/LoadingWorkspace';
import { ImproveYourIdeaScreen } from '../components/ImproveYourIdeaScreen';
import { validateInputsDeterministic } from '../utils/deterministicValidation';
import type { ValidationMeta } from '../../shared/validation/types';
import type { ResultsData } from '../stores/useJourneyStore';
import { AnimatePresence, motion } from 'framer-motion';

function isValidationPayload(data: unknown): data is { validation: ValidationMeta } {
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

export function AnalysisScreen() {
  const navigate = useNavigate();
  const {
    inputs,
    setResults,
    setAnalysisStatus,
    setErrorMessage,
    clearResults,
    setValidationResult,
    validationResult,
    errorMessage,
    analysisStatus,
  } = useJourneyStore();

  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const requestTriggered = useRef(false);
  const cooldownTimerRef = useRef<number | null>(null);

  const handleInvalidValidation = useCallback(
    (validation: ValidationMeta) => {
      setValidationResult(validation);
      setAnalysisStatus('invalid_input');
    },
    [setAnalysisStatus, setValidationResult]
  );

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    clearResults();
    setErrorMessage(null);
    setValidationResult(null);
    setAnalysisStatus('idle');
    setInitialized(true);
  }, [setAnalysisStatus, setErrorMessage, clearResults, setValidationResult]);

  useEffect(() => {
    if (!inputs.idea) {
      navigate('/input');
    }
  }, [inputs.idea, navigate]);

  useEffect(() => {
    console.log('[AnalysisScreen] analysisStatus changed to:', analysisStatus);
  }, [analysisStatus]);

  const performAnalysis = useCallback(async () => {
    console.log('[performAnalysis] called!');
    requestTriggered.current = true;

    const clientValidation = validateInputsDeterministic(inputs);
    if (clientValidation) {
      console.log('[performAnalysis] client deterministic validation failed');
      handleInvalidValidation(clientValidation);
      return;
    }

    setAnalysisStatus('analyzing');
    setErrorMessage(null);
    setCooldownRemaining(null);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      console.log('API_BASE =', API_BASE);
      const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
      const response = await fetch(`${cleanBase}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      const text = await response.text();

      console.log('HTTP Method:', 'POST');
      console.log('Final URL =', `${cleanBase}/api/analyze`);
      console.log('Response Status:', response.status);
      console.log('Response Body:', text);

      if (response.status === 422) {
        let payload: unknown;
        try {
          payload = JSON.parse(text);
        } catch {
          throw new Error('Server returned invalid data.');
        }
        if (isValidationPayload(payload)) {
          handleInvalidValidation(payload.validation);
          return;
        }
        throw new Error('Validation failed but the server response was unexpected.');
      }

      if (!response.ok) {
        let errorMsg = '';
        let retryAfterSeconds: number | null = null;

        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.error;
          if (typeof errorData.retryAfter === 'number') {
            retryAfterSeconds = errorData.retryAfter;
          }
        } catch {
          // fall back to status code
        }

        if (!errorMsg) {
          if (response.status === 429) {
            errorMsg = 'Too many requests. Please try again later.';
          } else if (response.status === 408 || response.status === 504) {
            errorMsg = 'AI is taking longer than expected.';
          } else if (response.status === 503 || response.status === 500) {
            errorMsg = 'AI service is currently unavailable.';
          } else {
            errorMsg = 'Server error. Please try again later.';
          }
        }

        if (response.status === 429) {
          const waitMs = retryAfterSeconds != null ? retryAfterSeconds * 1000 : 60000;
          localStorage.setItem('ideabridge_cooldown_end', (Date.now() + waitMs).toString());
          setCooldownRemaining(Math.ceil(waitMs / 1000));
        }

        throw new Error(errorMsg);
      }

      localStorage.setItem('ideabridge_cooldown_end', (Date.now() + 30000).toString());

      if (!text || text.trim() === '') {
        throw new Error('Empty response from server.');
      }

      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid data.');
      }

      if (!isAnalysisPayload(data)) {
        throw new Error('Server returned an unexpected response shape.');
      }

      console.log('Backend response =', data);
      setResults(data.analysis, data.validation);
      navigate('/results');
    } catch (err: unknown) {
      console.error('Analysis API Call failed:', err);
      setAnalysisStatus('error');

      let userMessage = 'Something went wrong.';
      const msg = (err as Error).message || '';

      if (msg.includes('Too many requests')) {
        userMessage = 'Too many requests. Please try again later.';
      } else if (msg.includes('longer than expected')) {
        userMessage = 'AI is taking longer than expected.';
      } else if (msg.includes('currently unavailable')) {
        userMessage = 'AI service is currently unavailable.';
      } else if (
        msg.includes('invalid data') ||
        msg.includes('invalid JSON') ||
        msg.includes('JSON') ||
        msg.includes('Unexpected end of JSON')
      ) {
        userMessage = 'Server returned invalid data.';
      } else if (msg.includes('Empty response')) {
        userMessage = 'Empty response from server.';
      } else if (msg && msg !== 'Something went wrong.') {
        userMessage = msg;
      }

      setErrorMessage(userMessage);
    }
  }, [inputs, navigate, setAnalysisStatus, setErrorMessage, setResults, handleInvalidValidation]);

  useEffect(() => {
    if (analysisStatus !== 'cooldown') return;
    console.log('[AnalysisScreen] entering cooldown');

    const updateCooldown = () => {
      if (!cooldownTimerRef.current) return;
      const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
      if (cooldownEnd) {
        const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
        console.log('[AnalysisScreen] cooldown remaining:', remaining);
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          console.log('[AnalysisScreen] cooldown over, calling performAnalysis');
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
      console.log('[AnalysisScreen] cleaning up cooldown interval');
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [analysisStatus, performAnalysis]);

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
    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd && parseInt(cooldownEnd, 10) > Date.now()) {
      return;
    }
    requestTriggered.current = false;
    localStorage.removeItem('ideabridge_cooldown_end');
    window.location.reload();
  };

  const handleBackToEdit = () => {
    setValidationResult(null);
    setAnalysisStatus('idle');
    requestTriggered.current = false;
    navigate('/input');
  };

  useEffect(() => {
    if (analysisStatus === 'error' && errorMessage) {
      console.log('[AnalysisScreen] ABOUT TO RENDER ERROR UI, errorMessage:', errorMessage);
    }
  }, [analysisStatus, errorMessage]);

  return (
    <AnimatePresence>
      {!initialized ? (
        <div key="init" className="min-h-screen bg-slate-950" />
      ) : analysisStatus === 'invalid_input' && validationResult ? (
        <ImproveYourIdeaScreen
          key="invalid"
          validation={validationResult}
          onBackToEdit={handleBackToEdit}
        />
      ) : analysisStatus === 'analyzing' || analysisStatus === 'cooldown' ? (
        <LoadingWorkspace
          key="loading"
          cooldownRemaining={analysisStatus === 'cooldown' ? cooldownRemaining ?? 0 : undefined}
        />
      ) : analysisStatus === 'error' && errorMessage ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-md w-full p-8 border border-red-500/20 rounded-xl bg-slate-900/80 backdrop-blur-md flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
              <AlertCircle size={32} />
            </div>

            <h2 className="text-2xl font-semibold mb-3 text-white">Analysis Failed</h2>
            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
              {errorMessage || 'Something went wrong.'}
            </p>

            {cooldownRemaining !== null && cooldownRemaining > 0 && (
              <div className="text-xs text-slate-500 mb-6">
                Request Cooldown: {cooldownRemaining}s remaining
              </div>
            )}

            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={() => navigate('/input')}
                className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={16} /> Edit Inputs
              </button>
              <button
                onClick={handleRetry}
                disabled={cooldownRemaining !== null && cooldownRemaining > 0}
                className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 text-sm ${
                  cooldownRemaining !== null && cooldownRemaining > 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-400 text-slate-950 hover:opacity-90'
                }`}
              >
                <RotateCcw size={16} /> Try Again
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div key="waiting" className="min-h-screen bg-slate-950" />
      )}
    </AnimatePresence>
  );
}
