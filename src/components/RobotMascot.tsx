import { motion } from 'framer-motion';
import { useMouseTracking } from '../utils/useMouseTracking';

export function RobotMascot() {
  const mousePos = useMouseTracking();
  
  // Calculate pupil position with bounds
  const pupilOffsetX = Math.max(-6, Math.min(6, mousePos.x * 8));
  const pupilOffsetY = Math.max(-6, Math.min(6, mousePos.y * 8));

  return (
    <div className="relative">
      {/* Glow behind robot */}
      <div className="absolute -inset-24 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
      
      {/* Orbiting rings */}
      <div className="absolute -inset-16">
        <motion.div
          className="absolute inset-0 border border-cyan-500/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border border-blue-500/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-8 border border-cyan-400/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Ring particles */}
        <motion.div
          className="absolute left-1/2 top-0 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
          style={{ transformOrigin: '50% 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
          style={{ transformOrigin: '100px 50%' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main robot head */}
      <motion.div
        className="relative w-48 h-48"
        animate={{
          y: [0, -12, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Head glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-transparent rounded-3xl blur-2xl" />
        
        {/* Head container */}
        <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
          {/* Head inner gradient */}
          <div className="absolute inset-1 bg-gradient-to-b from-slate-800/50 to-slate-900/80 rounded-[20px]" />
          
          {/* Face area */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-6">
            {/* Eyes container */}
            <div className="flex gap-6 mb-2">
              {/* Left eye */}
              <div className="relative w-10 h-10 bg-gradient-to-b from-slate-900 to-slate-950 rounded-full border-2 border-cyan-500/50 shadow-inner shadow-cyan-500/10 overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full" />
                <motion.div
                  className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/70"
                  initial={{ x: 12, y: 12 }}
                  animate={{
                    x: 12 + pupilOffsetX,
                    y: 12 + pupilOffsetY
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                >
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                </motion.div>
                {/* Blink layer */}
                <motion.div
                  className="absolute inset-0 bg-slate-900"
                  initial={{ scaleY: 0 }}
                  animate={{
                    scaleY: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.15,
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                    repeatDelay: 3 + Math.random() * 2
                  }}
                  style={{ transformOrigin: 'center' }}
                />
              </div>

              {/* Right eye */}
              <div className="relative w-10 h-10 bg-gradient-to-b from-slate-900 to-slate-950 rounded-full border-2 border-cyan-500/50 shadow-inner shadow-cyan-500/10 overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full" />
                <motion.div
                  className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/70"
                  initial={{ x: 12, y: 12 }}
                  animate={{
                    x: 12 + pupilOffsetX,
                    y: 12 + pupilOffsetY
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                >
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                </motion.div>
                {/* Blink layer */}
                <motion.div
                  className="absolute inset-0 bg-slate-900"
                  initial={{ scaleY: 0 }}
                  animate={{
                    scaleY: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.15,
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                    repeatDelay: 3.5 + Math.random() * 2
                  }}
                  style={{ transformOrigin: 'center' }}
                />
              </div>
            </div>

            {/* Mouth/antenna line */}
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-full mt-1" />
          </div>

          {/* Head details */}
          <div className="absolute top-3 left-3 w-2 h-2 bg-cyan-500/60 rounded-full" />
          <div className="absolute top-3 right-3 w-2 h-2 bg-cyan-500/60 rounded-full" />
        </div>
      </motion.div>

      {/* Ground glow */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-cyan-500/30 to-transparent rounded-full blur-xl"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
