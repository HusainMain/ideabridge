import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Check, Search, Target, Users, TrendingUp, Shield, Brain } from 'lucide-react';
import { RobotMascot } from './RobotMascot';
import { useJourneyStore } from '../stores/useJourneyStore';

const ANALYSIS_STAGES = [
  { icon: Brain, label: 'Understanding your idea...' },
  { icon: Search, label: 'Mapping your market...' },
  { icon: Target, label: 'Finding hidden opportunities...' },
  { icon: Users, label: 'Evaluating competition...' },
  { icon: TrendingUp, label: 'Estimating feasibility...' },
  { icon: Shield, label: 'Detecting potential risks...' },
];

const DISCOVERY_MESSAGES = [
  "✓ Core problem identified",
  "✓ Relevant competitors discovered",
  "✓ Market gap detected",
  "✓ Technical risks evaluated",
  "✓ Strategic roadmap prepared",
];

interface LoadingWorkspaceProps {
  cooldownRemaining?: number;
}

export function LoadingWorkspace({ cooldownRemaining }: LoadingWorkspaceProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visibleDiscovery, setVisibleDiscovery] = useState(-1);
  
  const analysisStatus = useJourneyStore(state => state.analysisStatus);
  const idea = useJourneyStore(state => state.inputs.idea);
  
  const stageControls = useAnimation();
  const progressControls = useAnimation();

  useEffect(() => {
    if (cooldownRemaining !== undefined) return;

    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        const next = Math.min(prev + 1, ANALYSIS_STAGES.length - 1);
        if (prev < next) {
          stageControls.start({
            scale: [1, 1.15, 1],
            transition: { duration: 0.4 }
          });
        }
        return next;
      });
    }, 2000);

    const discoveryInterval = setInterval(() => {
      setVisibleDiscovery(prev => (prev + 1) % DISCOVERY_MESSAGES.length);
    }, 4000);

    // Non-linear progress animation
    let currentProgress: number = 0;
    const progressTimers: number[] = [];
    
    const progressStages = [25, 55, 80, 95];
    const stageDurations = [3000, 4000, 4000, 8000];

    progressStages.forEach((target, i) => {
      const timer = setTimeout(() => {
        const increment = (target - (i === 0 ? 0 : progressStages[i - 1])) / 20;
        const interval = setInterval(() => {
          currentProgress += increment;
          if (currentProgress >= target) {
            currentProgress = target;
            clearInterval(interval);
          }
          setProgress(Math.min(currentProgress, target));
        }, stageDurations[i] / 20);
        progressTimers.push(interval as unknown as number);
      }, stageDurations.slice(0, i).reduce((a, b) => a + b, 0));
      progressTimers.push(timer);
    });

    return () => {
      clearInterval(stageInterval);
      clearInterval(discoveryInterval);
      progressTimers.forEach(t => {
        if (typeof t === 'number') clearInterval(t);
        else clearTimeout(t);
      });
    };
  }, [cooldownRemaining, stageControls]);

  useEffect(() => {
    if (analysisStatus === 'success') {
      progressControls.start({
        width: "100%",
        transition: { duration: 0.6, ease: "easeOut" }
      });
      
      const timer = setTimeout(() => {
        setVisibleDiscovery(DISCOVERY_MESSAGES.length - 1);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [analysisStatus, progressControls]);

  const getProgressWidth = () => {
    if (cooldownRemaining !== undefined) return '0%';
    if (analysisStatus === 'success') return '100%';
    return `${progress}%`;
  };

  const ideaPreview = idea.length > 30 ? `${idea.substring(0, 27)}...` : idea;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 grid-shimmer" 
          style={{
            backgroundImage: 'linear-gradient(to right, #0ea5e905 1px, transparent 1px), linear-gradient(to bottom, #0ea5e905 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} 
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-cyan-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 0.3, 0],
              x: [null, Math.random() * 40 - 20]
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-12">
          <RobotMascot analysisStatus={analysisStatus} stage={currentStage} />
        </div>

        {/* Personalized header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-white mb-2">Analyzing</h1>
          <p className="text-cyan-400/80 text-lg font-mono tracking-wider">{ideaPreview}</p>
          <p className="text-slate-500/70 text-sm mt-2 max-w-md mx-auto">
            Our AI is validating your idea, researching the market, and preparing actionable insights.
          </p>
        </div>

        {/* Discovery messages */}
        <div className="h-6 text-center mb-8">
          <AnimatePresence mode="wait">
            {visibleDiscovery >= 0 && (
              <motion.p
                key={visibleDiscovery}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="text-cyan-300/70 text-sm"
              >
                {DISCOVERY_MESSAGES[visibleDiscovery]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xl mx-auto mb-10">
          <div className="h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: getProgressWidth() }}
              transition={{ type: "spring", stiffness: 50, damping: 30 }}
            />
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {ANALYSIS_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStage;
            const isActive = index === currentStage;

            return (
              <div key={index} className="flex items-center gap-1.5">
                <motion.div
                  animate={stageControls}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-cyan-500/30 border border-cyan-400/50 text-cyan-300'
                      : isActive
                      ? 'bg-purple-500/30 border border-purple-400/50 text-purple-300'
                      : 'bg-slate-800/20 border border-slate-700/10 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check size={14} className="text-cyan-300" />
                    </motion.div>
                  ) : (
                    <Icon size={14} />
                  )}
                </motion.div>
                {index < ANALYSIS_STAGES.length - 1 && (
                  <div className={`w-3 h-0.5 ${
                    isCompleted ? 'bg-cyan-500/40' : 'bg-slate-700/10'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {cooldownRemaining !== undefined && (
          <div className="mt-8 text-center">
            <p className="text-lg text-purple-400">
              Next analysis available in {cooldownRemaining} second{cooldownRemaining !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}