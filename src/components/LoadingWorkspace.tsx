import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Target, Users, TrendingUp, Shield, Brain, Sparkles } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

const ANALYSIS_STAGES = [
  { icon: Brain, label: 'Understanding your idea...' },
  { icon: Search, label: 'Mapping your market...' },
  { icon: Target, label: 'Finding hidden opportunities...' },
  { icon: Users, label: 'Evaluating competition...' },
  { icon: TrendingUp, label: 'Estimating feasibility...' },
  { icon: Shield, label: 'Detecting potential risks...' },
  { icon: Sparkles, label: 'Building strategic insights...' },
];

const ANALYSIS_MESSAGES = [
  "Understanding your vision...",
  "Mapping your market...",
  "Finding hidden opportunities...",
  "Evaluating competition...",
  "Preparing strategic insights...",
  "Building your roadmap...",
  "Finalizing recommendations...",
];

interface LoadingWorkspaceProps {
  cooldownRemaining?: number;
}

export function LoadingWorkspace({ cooldownRemaining }: LoadingWorkspaceProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  
  const messages = cooldownRemaining !== undefined 
    ? ["Preparing your AI advisor..."] 
    : ANALYSIS_MESSAGES;

  useEffect(() => {
    if (cooldownRemaining !== undefined) return;

    const stageInterval = setInterval(() => {
      setCurrentStage(prev => Math.min(prev + 1, ANALYSIS_STAGES.length - 1));
    }, 2000);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2500);

    let progressInterval: number;
    let currentProgress: number = 0;

    progressInterval = window.setInterval(() => {
      if (currentProgress >= 92 && currentProgress <= 95) {
        if (Math.random() < 0.3) return;
      }
      const increment = Math.random() * 3 + 1;
      currentProgress = Math.min(currentProgress + increment, 95);
      setProgress(currentProgress);
    }, 150);

    const sparkleInterval = setInterval(() => {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 300);
    }, 3000 + Math.random() * 2000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearInterval(sparkleInterval);
    };
  }, [messages.length, cooldownRemaining]);

  const getProgressWidth = () => {
    if (cooldownRemaining !== undefined) return '0%';
    if (progress >= 95) return '95%';
    return `${progress}%`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, #0ea5e908 1px, transparent 1px), linear-gradient(to bottom, #0ea5e908 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 0.4, 0],
              x: [null, Math.random() * 40 - 20]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-16">
          <RobotMascot />
        </div>

        <div className="text-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-2xl text-cyan-300/90 font-light tracking-wide mb-2"
            >
              {messages[currentMessage % messages.length]}
            </motion.div>
          </AnimatePresence>
          
          <AnimatePresence>
            {showSparkle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 -right-2 text-yellow-400"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full max-w-xl mx-auto mb-10">
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: getProgressWidth() }}
              transition={{ type: "spring", stiffness: 40, damping: 25 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {ANALYSIS_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStage;
            const isActive = index === currentStage;

            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-cyan-500/30 border-2 border-cyan-400/50 text-cyan-300'
                      : isActive
                      ? 'bg-purple-500/30 border-2 border-purple-400/50 text-purple-300 scale-110'
                      : 'bg-slate-800/30 border-2 border-slate-700/20 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-cyan-300" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                {index < ANALYSIS_STAGES.length - 1 && (
                  <div className={`w-4 h-0.5 ${
                    isCompleted ? 'bg-cyan-500/40' : 'bg-slate-700/20'
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