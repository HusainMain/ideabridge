import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { LoadingWorkspace } from '../components/LoadingWorkspace';
import { AnimatePresence, motion } from 'framer-motion';

export function AnalysisScreen() {
  const navigate = useNavigate();
  const { 
    inputs, 
    setResults, 
    setAnalysisStatus, 
    setErrorMessage, 
    errorMessage, 
    analysisStatus 
  } = useJourneyStore();
  
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const requestTriggered = useRef(false);
  const cooldownTimerRef = useRef<number | null>(null);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Initialize on mount: clear any stale state, immediately reset
  useEffect(() => {
    setErrorMessage(null); // First clear errorMessage which could trigger status change if not fixed
    setAnalysisStatus('idle'); // Then set status to idle explicitly
    setInitialized(true);
  }, [setAnalysisStatus, setErrorMessage]);

  // Guard: redirect if no inputs are present
  useEffect(() => {
    if (!inputs.idea) {
      navigate('/input');
    }
  }, [inputs.idea, navigate]);

  // Log every analysisStatus change
  useEffect(() => {
    console.log('[AnalysisScreen] analysisStatus changed to:', analysisStatus);
  }, [analysisStatus]);



  // Cooldown countdown logic
  useEffect(() => {
    if (analysisStatus !== 'cooldown') return;
    console.log('[AnalysisScreen] entering cooldown');

    const updateCooldown = () => {
      if (!cooldownTimerRef.current) return; // Guard against interval that's been cleared but still running
      const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
      if (cooldownEnd) {
        const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
        console.log('[AnalysisScreen] cooldown remaining:', remaining);
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          // Cooldown is over, start analysis
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
  }, [analysisStatus]);

  const performAnalysis = async () => {
    console.log('[performAnalysis] called!');
    requestTriggered.current = true;
    setAnalysisStatus('analyzing');
    setErrorMessage(null);
    setCooldownRemaining(null);
    
    // Set new 30 second cooldown for next request
    localStorage.setItem('ideabridge_cooldown_end', (Date.now() + 30000).toString());
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
      console.log("API_BASE =", API_BASE);
      const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
      const response = await fetch(`${cleanBase}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      const text = await response.text();

      console.log("HTTP Method:", "POST");
      console.log("Final URL =", `${cleanBase}/api/analyze`);
      console.log("Response Status:", response.status);
      console.log("Response Body:", text);

      if (!response.ok) {
        let errorMsg = "";
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.error;
        } catch (e) {
          // Ignore parse error, fall back to status code
        }

        if (!errorMsg) {
          if (response.status === 429) {
            errorMsg = "Too many requests. Please try again later.";
          } else if (response.status === 408 || response.status === 504) {
            errorMsg = "AI is taking longer than expected.";
          } else if (response.status === 503 || response.status === 500) {
            errorMsg = "AI service is currently unavailable.";
          } else {
            errorMsg = "Server error. Please try again later.";
          }
        }
        throw new Error(errorMsg);
      }

      if (!text || text.trim() === "") {
        throw new Error("Empty response from server.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server returned invalid data.");
      }

      console.log("Backend response =", data);
      setResults(data);
      navigate('/results');
    } catch (err: any) {
      console.error('Analysis API Call failed:', err);
      setAnalysisStatus('error');
      
      let userMessage = "Something went wrong.";
      const msg = err.message || "";
      
      if (msg.includes("Too many requests")) {
        userMessage = "Too many requests. Please try again later.";
      } else if (msg.includes("longer than expected")) {
        userMessage = "AI is taking longer than expected.";
      } else if (msg.includes("currently unavailable")) {
        userMessage = "AI service is currently unavailable.";
      } else if (msg.includes("invalid data") || msg.includes("invalid JSON") || msg.includes("JSON") || msg.includes("Unexpected end of JSON")) {
        userMessage = "Server returned invalid data.";
      } else if (msg.includes("Empty response")) {
        userMessage = "Empty response from server.";
      } else if (msg && msg !== "Something went wrong.") {
        userMessage = msg;
      }
      
      setErrorMessage(userMessage);
    }
  };

  // Main logic: check on mount/initialized
  useEffect(() => {
    if (!initialized || !inputs.idea || requestTriggered.current) return;

    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd && parseInt(cooldownEnd, 10) > Date.now()) {
      // Cooldown active, enter cooldown state
      const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
      setCooldownRemaining(remaining);
      setAnalysisStatus('cooldown');
    } else {
      // No cooldown, start analysis immediately
      performAnalysis();
    }
  }, [initialized, inputs, setAnalysisStatus]);

  const handleRetry = () => {
    // Check if cooldown is finished before allowing retry
    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd && parseInt(cooldownEnd, 10) > Date.now()) {
      alert(`Please wait for the cooldown to end (${cooldownRemaining}s remaining).`);
      return;
    }
    requestTriggered.current = false;
    // Clear cooldown to start fresh
    localStorage.removeItem('ideabridge_cooldown_end');
    // Force re-execution by updating triggering flag
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {!initialized ? (
        // Show minimal state while initializing (prevent stale state render)
        <div key="init" className="min-h-screen bg-slate-950" />
      ) : analysisStatus === 'analyzing' || analysisStatus === 'cooldown' ? (
        <LoadingWorkspace 
          key="loading" 
          cooldownRemaining={analysisStatus === 'cooldown' ? cooldownRemaining ?? 0 : undefined} 
        />
      ) : analysisStatus === 'error' && errorMessage ? (
        (() => {
          console.log('[AnalysisScreen] RENDERING ERROR UI, errorMessage:', errorMessage);
          return (
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
          );
        })() : (
        // Show minimal state while waiting for 500ms delay
        <div className="min-h-screen bg-slate-950" />
      )}
    </AnimatePresence>
  );
}
