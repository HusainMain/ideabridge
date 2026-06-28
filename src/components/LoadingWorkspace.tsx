import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Target, Users, TrendingUp, Shield, Brain } from 'lucide-react';
import { RobotMascot } from './RobotMascot';
import { useJourneyStore } from '../stores/useJourneyStore';

// Toggle for soft UI sound effects (Default OFF)
const ENABLE_SOUND = false;

const REASONING_STEPS = [
  "Understanding customer problem...",
  "Building market map...",
  "Comparing existing competitors...",
  "Detecting revenue opportunities...",
  "Evaluating execution risk...",
  "Validating assumptions...",
  "Analyzing scalability potential...",
  "Structuring final recommendations...",
  "Performing final data validation...",
  "Compiling AI research report..."
];

const DISCOVERIES = [
  { title: "AI Discovery", label: "Industry detected", value: "FinTech", badge: "Confidence: High" },
  { title: "Customer Segment", label: "Primary demographic", value: "College Students", badge: "Confidence: Medium" },
  { title: "Competitive Landscape", label: "Top competitor", value: "Stripe", badge: "Similarity: 42%" },
  { title: "Business Model", label: "Primary source", value: "Subscription", badge: "Confidence: High" },
  { title: "Market Feasibility", label: "Barrier to entry", value: "Low-Medium", badge: "Validation: Verified" }
];

const KNOWLEDGE_CARDS = [
  { category: "Did you know?", text: "73% of startups fail because they solve the wrong problem." },
  { category: "Interesting", text: "Investors spend under 3 minutes reviewing most pitch decks." },
  { category: "AI Insight", text: "Market size alone never predicts startup success; execution velocity does." },
  { category: "Statistic", text: "Startups with co-founders raise 30% more capital on average." }
];

const TIMELINE_STAGES = [
  { label: 'Understanding', icon: Brain },
  { label: 'Research', icon: Search },
  { label: 'Market', icon: Target },
  { label: 'Competition', icon: Users },
  { label: 'Validation', icon: Shield },
  { label: 'Recommendations', icon: TrendingUp },
  { label: 'Final Review', icon: Brain },
];

interface LoadingWorkspaceProps {
  cooldownRemaining?: number;
  apiFinished?: boolean;
  onComplete?: () => void;
}

// Web Audio API Synthesizer for soft, premium UI sounds
function playSynthSound(freq: number, type: OscillatorType = "sine", duration: number = 0.25) {
  if (!ENABLE_SOUND) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // browser blocked audio or not supported
  }
}

export function LoadingWorkspace({ cooldownRemaining, apiFinished = false, onComplete }: LoadingWorkspaceProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const idea = useJourneyStore(state => state.inputs.idea);
  const ideaPreview = idea.length > 40 ? `${idea.substring(0, 37)}...` : idea;

  const startTimeRef = useRef<number>(Date.now());
  const lastActiveStageRef = useRef<number>(-1);

  // 1. Generate static background particles to avoid garbage collection & layout thrashing
  const particles = useMemo(() => {
    return [...Array(22)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * -15,
    }));
  }, []);

  // 2. Track smart progress bar, stage timeline index, and completion logic
  useEffect(() => {
    if (cooldownRemaining !== undefined) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setElapsedTime(elapsed);

      // If already in completing state, let framer motion handle progress width to 100%
      if (isCompleting) return;

      // Smart Non-linear progression:
      let currentProgress = 0;
      if (elapsed < 1500) {
        // Fast 0 -> 30%
        currentProgress = (elapsed / 1500) * 30;
      } else if (elapsed < 5000) {
        // Normal 30 -> 60%
        currentProgress = 30 + ((elapsed - 1500) / 3500) * 30;
      } else if (elapsed < 10000) {
        // Slow 60 -> 85%
        currentProgress = 60 + ((elapsed - 5000) / 5000) * 25;
      } else if (elapsed < 15000) {
        // Very slow 85 -> 94%
        currentProgress = 85 + ((elapsed - 10000) / 5000) * 9;
      } else {
        // Pause and fluctuate between 93.6% and 94.4%
        currentProgress = 94 + Math.sin(elapsed / 400) * 0.4;
      }

      setProgress(Math.min(currentProgress, 94.5));
    }, 50);

    return () => clearInterval(timer);
  }, [cooldownRemaining, isCompleting]);

  // 3. Rotate Discovery & Fact Cards periodically
  useEffect(() => {
    if (cooldownRemaining !== undefined) return;
    
    const cardTimer = setInterval(() => {
      setDiscoveryIndex(prev => (prev + 1) % DISCOVERIES.length);
    }, 3800);

    const factTimer = setInterval(() => {
      setFactIndex(prev => (prev + 1) % KNOWLEDGE_CARDS.length);
    }, 4500);

    return () => {
      clearInterval(cardTimer);
      clearInterval(factTimer);
    };
  }, [cooldownRemaining]);

  // 4. Calculate current active stage based on elapsed time
  const currentStageIndex = useMemo(() => {
    if (isCompleting) return TIMELINE_STAGES.length - 1;
    if (elapsedTime < 2000) return 0;       // Understanding
    if (elapsedTime < 4500) return 1;       // Research
    if (elapsedTime < 7500) return 2;       // Market
    if (elapsedTime < 10000) return 3;      // Competition
    if (elapsedTime < 12500) return 4;      // Validation
    if (elapsedTime < 15000) return 5;      // Recommendations
    return 6;                               // Final Review
  }, [elapsedTime, isCompleting]);

  // Play a soft sound whenever the active timeline stage advances
  useEffect(() => {
    if (currentStageIndex !== lastActiveStageRef.current) {
      if (lastActiveStageRef.current !== -1) {
        playSynthSound(587.33, "sine", 0.12); // D5 chime
      }
      lastActiveStageRef.current = currentStageIndex;
    }
  }, [currentStageIndex]);

  // 5. Calculate visible steps for the AI Reasoning Feed (show max 6 steps)
  const feedStepIndex = useMemo(() => {
    if (isCompleting) return REASONING_STEPS.length - 1;
    return Math.min(Math.floor(elapsedTime / 1500), REASONING_STEPS.length - 1);
  }, [elapsedTime, isCompleting]);

  const reasoningFeedItems = useMemo(() => {
    const start = Math.max(0, feedStepIndex - 5);
    return REASONING_STEPS.slice(start, feedStepIndex + 1).map((step, idx) => {
      const absoluteIndex = start + idx;
      return {
        text: step,
        isCompleted: absoluteIndex < feedStepIndex || isCompleting,
        isActive: absoluteIndex === feedStepIndex && !isCompleting,
      };
    });
  }, [feedStepIndex, isCompleting]);

  // 6. Monitor both conditions (15-second minimum wait AND API finished) to trigger Completion Sequence
  useEffect(() => {
    if (elapsedTime >= 15000 && apiFinished && !isCompleting) {
      setIsCompleting(true);
      setProgress(100);

      // Play completion chime double-note
      if (ENABLE_SOUND) {
        playSynthSound(523.25, "sine", 0.3); // C5
        setTimeout(() => playSynthSound(659.25, "sine", 0.4), 100); // E5
      }

      // 7-step sequence navigation delay (~700ms)
      const navTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 750);

      return () => clearTimeout(navTimer);
    }
  }, [elapsedTime, apiFinished, isCompleting, onComplete]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      
      {/* BACKGROUND DEPTH LAYERS */}
      {/* Layer 1: Slow-moving, fading CSS radial gradients (light blobs) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[120px]"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-purple-900/10 blur-[120px]"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Layer 2: Moving perspective grid */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
        <motion.div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(0px)'
          }}
          animate={{
            translateY: [0, 40]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Layer 3: Floating Particles (pre-generated for 60 FPS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-cyan-400/20 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -80],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Layer 4: Faint Neural network lines with SVG traversing packets */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none z-0">
        <path id="n-path-1" d="M 50 150 Q 250 80 450 300 T 850 100" stroke="cyan" strokeWidth="1.5" fill="none" />
        <path id="n-path-2" d="M 900 650 Q 700 400 500 700 T 100 500" stroke="purple" strokeWidth="1.5" fill="none" />
        <path id="n-path-3" d="M 100 200 Q 300 450 500 250 T 900 400" stroke="cyan" strokeWidth="1.5" fill="none" />
        
        <circle r="3" fill="#22d3ee" className="shadow-[0_0_8px_#22d3ee]">
          <animateMotion dur="7s" repeatCount="indefinite" path="M 50 150 Q 250 80 450 300 T 850 100" />
        </circle>
        <circle r="3" fill="#c084fc" className="shadow-[0_0_8px_#c084fc]">
          <animateMotion dur="9s" repeatCount="indefinite" path="M 900 650 Q 700 400 500 700 T 100 500" />
        </circle>
        <circle r="3" fill="#22d3ee" className="shadow-[0_0_8px_#22d3ee]">
          <animateMotion dur="8s" repeatCount="indefinite" path="M 100 200 Q 300 450 500 250 T 900 400" />
        </circle>
      </svg>

      {/* GLOBAL AI PULSE CONTAINER */}
      <motion.div 
        className="w-full max-w-5xl relative z-10 flex flex-col items-center"
        animate={{
          opacity: [0.98, 1, 0.98],
          filter: ["brightness(0.99)", "brightness(1.01)", "brightness(0.99)"]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        
        {/* TWO-COLUMN premium SaaS Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: Header, Robot, Progress, Timeline */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-stretch text-center lg:text-left gap-8">
            
            {/* Header Area */}
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-cyan-400/70 font-semibold mb-2 block">
                COGNITIVE ENGINE ACTIVE
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                {isCompleting ? "Analysis Complete" : "Analyzing"}
              </h1>
              <p className="text-slate-400 font-mono text-base font-light tracking-wide truncate max-w-md">
                {isCompleting ? "Preparing your personalized report..." : ideaPreview}
              </p>
            </div>

            {/* Robot Placement */}
            <div className="flex justify-center my-2 relative">
              {/* Layer 5: Soft radial glow behind robot */}
              <div className={`absolute w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl -z-10 transition-all duration-1000 ${isCompleting ? 'scale-125 bg-cyan-400/10' : ''}`} />
              <RobotMascot 
                analysisStatus={isCompleting ? "success" : "analyzing"} 
                stage={currentStageIndex} 
                isCompleted={isCompleting}
              />
            </div>

            {/* Smart Progress Bar */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 tracking-wider mb-2">
                <span>AI RESEARCH DEPTH</span>
                <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden p-[2px] shadow-2xl relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-400 rounded-full relative"
                  style={{ width: `${progress}%` }}
                  animate={{
                    boxShadow: isCompleting ? "0 0 16px rgba(34,211,238,0.7)" : "0 0 6px rgba(34,211,238,0.2)"
                  }}
                  transition={isCompleting ? { type: "spring", stiffness: 45, damping: 15 } : { type: "tween", ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="w-full max-w-lg mx-auto lg:mx-0 flex items-center justify-between gap-1 flex-wrap md:flex-nowrap border border-slate-900 bg-slate-950/40 rounded-xl p-3 backdrop-blur-sm">
              {TIMELINE_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isCompleted = idx < currentStageIndex || isCompleting;
                const isActive = idx === currentStageIndex && !isCompleting;

                return (
                  <div key={idx} className="flex items-center flex-1 last:flex-initial">
                    <div className="flex flex-col items-center relative">
                      <motion.div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-500 ${
                          isCompleted
                            ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                            : isActive
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(167,139,250,0.35)]'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                        animate={isCompleted ? { scale: [1, 1.12, 1] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        {isCompleted ? <Check size={11} className="text-cyan-300" /> : <Icon size={11} />}
                      </motion.div>
                      
                      {/* Floating tooltip/label for Active stage */}
                      {isActive && (
                        <motion.span 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-8 text-[9px] font-mono tracking-wider font-semibold text-purple-400 whitespace-nowrap bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/20"
                        >
                          {stage.label}
                        </motion.span>
                      )}
                    </div>

                    {/* Connecting line */}
                    {idx < TIMELINE_STAGES.length - 1 && (
                      <div className="h-[2px] bg-slate-900 flex-1 mx-1 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-purple-400"
                          initial={{ width: "0%" }}
                          animate={{ width: isCompleted ? "100%" : "0%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Reasoning Feed (Terminal) & Rotating Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full max-w-lg mx-auto lg:max-w-none">
            
            {/* AI Reasoning Feed (Console Style) */}
            <div className="border border-slate-800/80 rounded-xl bg-slate-950/60 p-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="ml-1 text-[9px] uppercase tracking-wider text-slate-500">ANALYSIS_STREAM.LOG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-cyan-400">PROCESSING</span>
                </div>
              </div>

              {/* Feed Items Container */}
              <div className="h-44 flex flex-col justify-end overflow-hidden">
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {reasoningFeedItems.map((step) => (
                      <motion.div
                        key={step.text}
                        initial={{ opacity: 0, y: 12, height: 0 }}
                        animate={{ 
                          opacity: step.isActive ? 1 : 0.5, 
                          y: 0, 
                          height: "auto" 
                        }}
                        exit={{ opacity: 0, y: -12, height: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        className={`flex items-center gap-3 text-xs leading-normal ${
                          step.isActive ? 'text-cyan-300 font-medium' : 'text-slate-400 font-light'
                        }`}
                      >
                        {step.isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 150 }}
                            className="flex-shrink-0 w-4 h-4 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                          >
                            <Check size={9} className="text-cyan-300" />
                          </motion.div>
                        ) : (
                          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                            </span>
                          </div>
                        )}
                        <span className="truncate">{step.text}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Info Cards Row (Discovery & Facts side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Discovery Card (Live rotation) */}
              <div className="h-32 flex flex-col justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-sm relative overflow-hidden shadow-lg">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono block">
                  REALTIME DISCOVERY
                </span>
                
                <div className="flex-1 flex flex-col justify-center my-1.5 h-12 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={discoveryIndex}
                      initial={{ opacity: 0, scale: 1.03, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.97, filter: "blur(2px)" }}
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    >
                      <div className="text-[10px] text-cyan-400 font-mono mb-0.5">
                        {DISCOVERIES[discoveryIndex].title}
                      </div>
                      <div className="text-sm font-semibold text-white tracking-wide truncate">
                        {DISCOVERIES[discoveryIndex].value}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px] font-mono text-slate-500">
                    {DISCOVERIES[discoveryIndex].label}
                  </span>
                  <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-cyan-400">
                    {DISCOVERIES[discoveryIndex].badge}
                  </span>
                </div>
              </div>

              {/* Facts Card (Insight rotation) */}
              <div className="h-32 flex flex-col justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-sm relative overflow-hidden shadow-lg">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono block">
                  STARTUP INSIGHT
                </span>
                
                <div className="flex-1 flex flex-col justify-center my-1.5 h-12 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={factIndex}
                      initial={{ opacity: 0, scale: 1.03, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.97, filter: "blur(2px)" }}
                      transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    >
                      <p className="text-[11px] font-light text-slate-300 leading-normal line-clamp-3">
                        {KNOWLEDGE_CARDS[factIndex].text}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-1 flex items-center justify-between border-t border-slate-900/50 pt-1">
                  <span className="text-[9px] text-purple-400/80 font-mono">
                    {KNOWLEDGE_CARDS[factIndex].category}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Cooldown Timer (Only if applicable) */}
        {cooldownRemaining !== undefined && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center bg-purple-950/20 border border-purple-500/15 px-4 py-2 rounded-full"
          >
            <p className="text-xs font-mono text-purple-400">
              Next analysis available in {cooldownRemaining}s
            </p>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}