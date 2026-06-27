import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useMouseTracking } from '../utils/useMouseTracking';
import { useEffect } from 'react';
import type { AnalysisStatus } from '../stores/useJourneyStore';

interface RobotMascotProps {
  analysisStatus: AnalysisStatus;
  stage?: number;
}

export function RobotMascot({ analysisStatus: status, stage = 0 }: RobotMascotProps) {
  const mousePos = useMouseTracking();
  
  // Smooth cursor tracking with spring easing
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  
  // Target position with bounds (-6 to 6 pixels)
  const targetX = mousePos.x * 6;
  const targetY = mousePos.y * 6;
  
  // Smooth spring animation to target
  useEffect(() => {
    if (status === 'success') return;
    
    const controls = animate(pupilX, targetX, {
      type: "spring",
      stiffness: 200,
      damping: 25,
    });
    
    animate(pupilY, targetY, {
      type: "spring",
      stiffness: 200,
      damping: 25,
    });
    
    return () => controls.stop();
  }, [targetX, targetY, pupilX, pupilY, status]);
  
  // Return eyes to center after cursor stops
  useEffect(() => {
    if (status === 'success') return;
    
    const timer = setTimeout(() => {
      animate(pupilX, 0, { type: "spring", stiffness: 150, damping: 30 });
      animate(pupilY, 0, { type: "spring", stiffness: 150, damping: 30 });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [mousePos.x, mousePos.y, pupilX, pupilY, status]);

  // Stage-specific reactions
  const getEyeGlow = () => {
    if (status === 'success' || stage >= 7) return 'text-cyan-200 shadow-cyan-300/90';
    if (stage >= 5) return 'text-cyan-300 shadow-cyan-400/80';
    if (stage >= 3) return 'text-cyan-400 shadow-cyan-400/60';
    return 'text-cyan-400 shadow-cyan-400/40';
  };

  // Random blink intervals (5-8 seconds)
  const leftBlink = useMotionValue(0);
  const rightBlink = useMotionValue(0);
  
  useEffect(() => {
    if (status === 'success') return;
    
    const blinkLoop = () => {
      setTimeout(() => {
        leftBlink.set(1);
        setTimeout(() => leftBlink.set(0), 150 + Math.random() * 50);
      }, 100 + Math.random() * 200);
      
      setTimeout(() => {
        rightBlink.set(1);
        setTimeout(() => rightBlink.set(0), 150 + Math.random() * 50);
      }, 300 + Math.random() * 200);
    };
    
    const interval = setInterval(blinkLoop, 5000 + Math.random() * 3000);
    blinkLoop();
    
    return () => clearInterval(interval);
  }, [leftBlink, rightBlink, status]);

  // Idle float animation (2-3px)
  const floatY = useTransform(
    useMotionValue(0),
    [0, 0.5, 1],
    [0, -2 - Math.sin(Date.now() * 0.001) * 1, 0]
  );

  return (
    <div className="relative">
      {/* Glow behind robot - intensity increases with stage */}
      <motion.div 
        className="absolute -inset-32 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl"
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Orbiting rings */}
      <div className="absolute -inset-20">
        <motion.div
          className="absolute inset-0 border border-cyan-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-6 border border-blue-500/15 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main robot head */}
      <motion.div
        className="relative w-56 h-56"
        style={{ y: floatY }}
        animate={{
          y: [0, -2, 0, -2, 0]
        }}
        transition={{
          duration: 5 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Head glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-blue-500/15 to-transparent rounded-3xl blur-2xl" />
        
        {/* Head container */}
        <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
          {/* Head inner gradient */}
          <div className="absolute inset-1 bg-gradient-to-b from-slate-800/50 to-slate-900/80 rounded-[24px]" />
          
          {/* Face area */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8">
            {/* Eyes container */}
            <div className="flex gap-8 mb-3">
              {/* Left eye */}
              <div className="relative w-12 h-12 bg-gradient-to-b from-slate-900 to-slate-950 rounded-full border-2 border-cyan-500/50 shadow-inner shadow-cyan-500/10 overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full" />
                <motion.div
                  className={`absolute w-5 h-5 bg-cyan-400 rounded-full shadow-lg ${getEyeGlow()}`}
                  style={{ x: pupilX, y: pupilY }}
                  transition={{ type: "spring", stiffness: 250, damping: 30 }}
                >
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-90" />
                </motion.div>
                {/* Blink layer */}
                <motion.div
                  className="absolute inset-0 bg-slate-900"
                  style={{ scaleY: leftBlink, transformOrigin: 'center' }}
                  transition={{ duration: 0.12 }}
                />
              </div>

              {/* Right eye */}
              <div className="relative w-12 h-12 bg-gradient-to-b from-slate-900 to-slate-950 rounded-full border-2 border-cyan-500/50 shadow-inner shadow-cyan-500/10 overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full" />
                <motion.div
                  className={`absolute w-5 h-5 bg-cyan-400 rounded-full shadow-lg ${getEyeGlow()}`}
                  style={{ x: pupilX, y: pupilY }}
                  transition={{ type: "spring", stiffness: 250, damping: 30 }}
                >
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-90" />
                </motion.div>
                {/* Blink layer */}
                <motion.div
                  className="absolute inset-0 bg-slate-900"
                  style={{ scaleY: rightBlink, transformOrigin: 'center' }}
                  transition={{ duration: 0.12 }}
                />
              </div>
            </div>

            {/* Mouth/antenna line */}
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-full mt-2" />
          </div>

          {/* Head details */}
          <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-cyan-500/60 rounded-full" />
          <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-cyan-500/60 rounded-full" />
        </div>
      </motion.div>

      {/* Ground glow */}
      <motion.div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-10 bg-gradient-to-b from-cyan-500/30 to-transparent rounded-full blur-xl"
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.08, 1]
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