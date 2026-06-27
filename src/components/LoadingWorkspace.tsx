import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Target, Users, TrendingUp, Shield, ClipboardList } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

const STAGES = [
  { icon: Search, label: 'Understanding Idea' },
  { icon: Target, label: 'Market Validation' },
  { icon: Users, label: 'Customer Discovery' },
  { icon: TrendingUp, label: 'Revenue Modeling' },
  { icon: Target, label: 'Competitor Analysis' },
  { icon: Shield, label: 'Risk Assessment' },
  { icon: ClipboardList, label: 'Final Recommendations' },
];

const DEFAULT_MESSAGES = [
  "Analyzing startup concept...",
  "Identifying customer pain points...",
  "Researching competitors...",
  "Designing revenue strategy...",
  "Building MVP roadmap...",
  "Assessing startup risks...",
  "Preparing recommendations...",
];

interface LoadingWorkspaceProps {
  cooldownRemaining?: number;
}

export function LoadingWorkspace({ cooldownRemaining }: LoadingWorkspaceProps) {
  console.log("LoadingWorkspace rendered");
  const [currentStage, setCurrentStage] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const messages = cooldownRemaining !== undefined 
    ? ["Preparing your AI advisor..."] 
    : DEFAULT_MESSAGES;

  useEffect(() => {
    if (cooldownRemaining !== undefined) return; // Don't animate stages if in cooldown
    
    // Animate through stages
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => Math.min(prev + 1, STAGES.length - 1));
    }, 1500);

    // Animate through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 95));
    }, 800);

    return () => {
      clearInterval(stageInterval);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [messages.length, cooldownRemaining]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid/wave effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, #00f0ff10 1px, transparent 1px), linear-gradient(to bottom, #00f0ff10 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-950/30 via-transparent to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 0.6, 0],
              x: [null, Math.random() * 40 - 20]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Robot Mascot */}
        <div className="flex justify-center mb-16">
          <RobotMascot />
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xl mx-auto mb-10">
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 rounded-full shadow-lg shadow-cyan-400/40"
              initial={{ width: 0 }}
              animate={{ width: cooldownRemaining !== undefined ? '0%' : `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        {/* Animated Message */}
        <div className="h-12 flex items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg text-cyan-300 font-light tracking-wide"
            >
              {messages[currentMessage % messages.length]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Cooldown Timer */}
        {cooldownRemaining !== undefined && (
          <div className="h-10 flex items-center justify-center mb-6">
            <AnimatePresence>
              <motion.div
                key={cooldownRemaining}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-semibold text-purple-400"
              >
                Next analysis available in {cooldownRemaining} second{cooldownRemaining !== 1 ? 's' : ''}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Stages indicator (only show if not in cooldown) */}
        {cooldownRemaining === undefined && (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index < currentStage;
              const isActive = index === currentStage;

              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300'
                        : isActive
                        ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-300 scale-110 shadow-lg shadow-purple-500/30'
                        : 'bg-slate-800/50 border-2 border-slate-700/30 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  {index < STAGES.length - 1 && (
                    <div className={`w-6 h-0.5 ${
                      isCompleted ? 'bg-cyan-500/40' : 'bg-slate-700/30'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stage label (only show if not in cooldown) */}
        {cooldownRemaining === undefined && (
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-400">
              {STAGES[currentStage].label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
