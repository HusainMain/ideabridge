import { motion } from 'framer-motion';
import { useMouseTracking } from '../utils/useMouseTracking';
import { useEffect, useState } from 'react';
import type { AnalysisStatus } from '../stores/useJourneyStore';

interface RobotMascotProps {
  analysisStatus: AnalysisStatus;
  stage?: number;
  isCompleted?: boolean;
}

export function RobotMascot({ stage = 0, isCompleted = false }: RobotMascotProps) {
  const mousePos = useMouseTracking();
  const [blink, setBlink] = useState(false);

  // Smooth mouse coordinates mapped to bounding box (-6 to +6 pixels)
  const targetX = mousePos.x * 6;
  const targetY = mousePos.y * 6;

  // Random blink interval (every 4-7 seconds, blink lasts 150ms)
  useEffect(() => {
    if (isCompleted) return;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    };

    const interval = setInterval(triggerBlink, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Stage-specific reactions
  const getEyeGlowClass = () => {
    if (isCompleted || stage >= 6) return 'bg-cyan-200 shadow-[0_0_20px_#22d3ee,0_0_8px_#22d3ee]';
    if (stage >= 4) return 'bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.8)]';
    if (stage >= 2) return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]';
    return 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.4)]';
  };

  return (
    <div className="relative">
      {/* Glow behind robot - intensity increases with stage and completions */}
      <motion.div 
        className="absolute -inset-32 bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
        animate={{
          opacity: isCompleted ? [0.6, 0.8, 0.6] : [0.35, 0.5, 0.35],
          scale: isCompleted ? [1.1, 1.25, 1.1] : [0.95, 1.05, 0.95]
        }}
        transition={{ 
          duration: isCompleted ? 3 : 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Orbiting rings */}
      <div className="absolute -inset-20 pointer-events-none">
        <motion.div
          className="absolute inset-0 border border-cyan-500/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-6 border border-purple-500/10 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Antenna structure */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[85%] flex flex-col items-center z-0 pointer-events-none">
        {/* Antenna rod */}
        <motion.div
          className="w-1 bg-gradient-to-t from-slate-700 to-cyan-500/80"
          style={{ height: 28, originY: 1 }}
          animate={isCompleted ? { scaleY: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : { rotate: [0, -1.5, 1.5, 0] }}
          transition={{ duration: 0.5, repeat: isCompleted ? 1 : Infinity, repeatDelay: 5 }}
        />
        {/* Antenna Tip LED */}
        <motion.div
          className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] relative"
          animate={{
            scale: isCompleted ? [1, 1.3, 1] : [1, 0.85, 1],
            backgroundColor: isCompleted ? "#22d3ee" : ["#22d3ee", "#a78bfa", "#22d3ee"]
          }}
          transition={{ duration: isCompleted ? 1 : 3, repeat: Infinity }}
        >
          {/* Sparkle effect */}
          <motion.div
            className="absolute -inset-3.5 pointer-events-none"
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.6, 1.4, 0.6],
              rotate: [0, 45, 90]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 0.2,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-300">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Main robot head */}
      <motion.div
        className="relative w-56 h-56"
        animate={isCompleted ? {
          y: [0, -14, -8, -10, -8],
          rotate: [0, 3, -2, 1, 0],
          scaleY: [1, 0.95, 1.02, 1]
        } : {
          // Floating and Breathing combined
          y: [0, -6, 0],
          scaleY: [1, 0.98, 1],
          rotate: [0, 1.2, -1.2, 0]
        }}
        transition={isCompleted ? {
          duration: 0.85,
          ease: "easeOut"
        } : {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Head glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
        
        {/* Head container */}
        <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-cyan-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.05)] overflow-hidden">
          {/* Head inner gradient */}
          <div className="absolute inset-1 bg-gradient-to-b from-slate-800/40 to-slate-900/80 rounded-[24px]" />
          
          {/* Face area */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8">
            {/* Eyes container */}
            <div className="flex gap-9 mb-4">
              {/* Left eye */}
              <div className="relative w-12 h-12 bg-gradient-to-b from-slate-950 to-slate-900 rounded-full border border-cyan-500/30 shadow-inner overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/5 rounded-full" />
                <motion.div
                  className={`absolute w-5 h-5 rounded-full ${getEyeGlowClass()}`}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: isCompleted ? 1.2 : [1, 0.85, 1.15, 1]
                  }}
                  transition={{
                    scale: isCompleted ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    x: { type: "spring", stiffness: 180, damping: 22 },
                    y: { type: "spring", stiffness: 180, damping: 22 }
                  }}
                >
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white rounded-full opacity-95" />
                </motion.div>
                {/* Blink layer */}
                <motion.div
                  className="absolute inset-0 bg-slate-950 origin-top"
                  animate={{ scaleY: blink ? 1 : 0 }}
                  transition={{ duration: 0.08, ease: "easeInOut" }}
                />
              </div>

              {/* Right eye */}
              <div className="relative w-12 h-12 bg-gradient-to-b from-slate-950 to-slate-900 rounded-full border border-cyan-500/30 shadow-inner overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/10 to-purple-500/5 rounded-full" />
                <motion.div
                  className={`absolute w-5 h-5 rounded-full ${getEyeGlowClass()}`}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: isCompleted ? 1.2 : [1, 0.85, 1.15, 1]
                  }}
                  transition={{
                    scale: isCompleted ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    x: { type: "spring", stiffness: 180, damping: 22 },
                    y: { type: "spring", stiffness: 180, damping: 22 }
                  }}
                >
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white rounded-full opacity-95" />
                </motion.div>
                {/* Blink layer */}
                <motion.div
                  className="absolute inset-0 bg-slate-950 origin-top"
                  animate={{ scaleY: blink ? 1 : 0 }}
                  transition={{ duration: 0.08, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Mouth */}
            <svg width="80" height="20" viewBox="0 0 80 20" className="mt-2 text-cyan-400">
              <motion.path
                d={isCompleted ? "M 20 5 Q 40 16 60 5" : "M 20 8 Q 40 8 60 8"}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                animate={{ d: isCompleted ? "M 20 5 Q 40 16 60 5" : "M 20 8 Q 40 8 60 8" }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
              />
            </svg>
          </div>

          {/* Head details */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-500/40 rounded-full" />
          <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500/40 rounded-full" />
        </div>
      </motion.div>

      {/* Ground shadow/glow */}
      <motion.div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-44 h-8 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-full blur-xl pointer-events-none"
        animate={{
          opacity: isCompleted ? [0.4, 0.7, 0.4] : [0.4, 0.6, 0.4],
          scale: isCompleted ? [1.1, 1.2, 1.1] : [1, 1.06, 1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}