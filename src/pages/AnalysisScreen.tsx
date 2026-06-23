import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export function AnalysisScreen() {
  const navigate = useNavigate();
  const { inputs, setResults, setAnalysisStatus, setErrorMessage, errorMessage, analysisStatus } = useJourneyStore();
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const requestTriggered = useRef(false);

  // Cooldown countdown timer
  useEffect(() => {
    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd) {
      const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldownRemaining(remaining);
        const timer = setInterval(() => {
          const currentRemaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
          if (currentRemaining <= 0) {
            setCooldownRemaining(0);
            clearInterval(timer);
          } else {
            setCooldownRemaining(currentRemaining);
          }
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, []);

  // Guard: redirect if no inputs are present
  useEffect(() => {
    if (!inputs.idea) {
      navigate('/input');
    }
  }, [inputs.idea, navigate]);

  useEffect(() => {
    if (!inputs.idea || requestTriggered.current) return;

    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd && parseInt(cooldownEnd, 10) > Date.now()) {
      // Cooldown active, show error message instead of calling API
      setAnalysisStatus('error');
      setErrorMessage(`Please wait ${Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000)}s before making another request.`);
      return;
    }

    // Set 30-second cooldown in localStorage
    localStorage.setItem('ideabridge_cooldown_end', (Date.now() + 30000).toString());
    setCooldownRemaining(30);

    const performAnalysis = async () => {
      requestTriggered.current = true;
      setAnalysisStatus('analyzing');
      setErrorMessage(null);

      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
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
        console.log("Final URL:", `${cleanBase}/api/analyze`);
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

    performAnalysis();
  }, [inputs, navigate, setAnalysisStatus, setErrorMessage, setResults]);

  const handleRetry = () => {
    // Check if cooldown is finished before allowing retry
    const cooldownEnd = localStorage.getItem('ideabridge_cooldown_end');
    if (cooldownEnd && parseInt(cooldownEnd, 10) > Date.now()) {
      alert(`Please wait for the 30-second cooldown to end (${cooldownRemaining}s remaining).`);
      return;
    }
    requestTriggered.current = false;
    // Clear cooldown to start fresh
    localStorage.removeItem('ideabridge_cooldown_end');
    // Force re-execution by updating triggering flag
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
      
      {/* ── Loading View ── */}
      {analysisStatus === 'analyzing' && (
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-12">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-[#00f0ff] rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '2s' }}
            ></div>
            <div className="absolute inset-4 bg-[#00f0ff] rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          
          <div className="h-16 flex items-center justify-center overflow-hidden">
            <p className="text-2xl font-light text-center animate-pulse text-[#00f0ff]">
              Analyzing your startup...
            </p>
          </div>
        </div>
      )}

      {/* ── Error View (Elegantly Styled Card) ── */}
      {analysisStatus === 'error' && (
        <div className="glass-panel--elevated max-w-md w-full p-8 border border-red-500/20 rounded-xl bg-neutral-900/80 backdrop-blur-md flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
            <AlertCircle size={32} />
          </div>
          
          <h2 className="text-2xl font-semibold mb-3 text-white">Analysis Failed</h2>
          <p className="text-neutral-400 mb-6 text-sm leading-relaxed">
            {errorMessage || 'Something went wrong.'}
          </p>

          {cooldownRemaining > 0 && (
            <div className="text-xs text-neutral-500 mb-6">
              Request Cooldown: {cooldownRemaining}s remaining
            </div>
          )}

          <div className="flex gap-4 w-full justify-center">
            <button 
              onClick={() => navigate('/input')} 
              className="px-5 py-2.5 rounded-lg border border-white/10 text-neutral-300 hover:bg-white/5 transition flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={16} /> Edit Inputs
            </button>
            <button 
              onClick={handleRetry} 
              disabled={cooldownRemaining > 0}
              className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 text-sm ${
                cooldownRemaining > 0 
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                  : 'bg-[#00f0ff] text-black hover:opacity-90'
              }`}
            >
              <RotateCcw size={16} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

