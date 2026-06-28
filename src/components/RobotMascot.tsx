import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { AnalysisStatus } from '../stores/useJourneyStore';

interface RobotMascotProps {
  analysisStatus: AnalysisStatus;
  stage?: number;
  isCompleted?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function RobotMascot({ stage = 0, isCompleted = false }: RobotMascotProps) {
  const [blink, setBlink] = useState(false);
  const faceRef = useRef<HTMLDivElement>(null);
  const lastPointerMoveRef = useRef(0);
  const animationRef = useRef<number>();

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const eyeX = useSpring(targetX, { stiffness: 260, damping: 32, mass: 0.52 });
  const eyeY = useSpring(targetY, { stiffness: 260, damping: 32, mass: 0.52 });

  const glowOpacity = isCompleted ? 0.88 : 0.46 + Math.min(stage, 6) * 0.045;

  useEffect(() => {
    if (isCompleted) {
      targetX.set(0);
      targetY.set(0);
      return;
    }

    const moveEyes = (event: PointerEvent) => {
      const face = faceRef.current;
      if (!face) return;
      lastPointerMoveRef.current = Date.now();
      const rect = face.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normalizedX = (event.clientX - centerX) / (rect.width / 2);
      const normalizedY = (event.clientY - centerY) / (rect.height / 2);
      targetX.set(clamp(normalizedX * 5.4, -5.4, 5.4));
      targetY.set(clamp(normalizedY * 3.8, -3.8, 3.8));
    };

    const centerEyes = () => {
      targetX.set(0);
      targetY.set(0);
      lastPointerMoveRef.current = 0;
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) centerEyes();
    };

    window.addEventListener('pointermove', moveEyes, { passive: true });
    document.documentElement.addEventListener('mouseleave', centerEyes);
    document.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('blur', centerEyes);

    return () => {
      window.removeEventListener('pointermove', moveEyes);
      document.documentElement.removeEventListener('mouseleave', centerEyes);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('blur', centerEyes);
    };
  }, [isCompleted, targetX, targetY]);

  useEffect(() => {
    if (isCompleted) return;

    const animateIdle = () => {
      const idleFor = Date.now() - lastPointerMoveRef.current;
      if (lastPointerMoveRef.current === 0 || idleFor > 1500) {
        const t = Date.now() / 1000;
        targetX.set(Math.sin(t * 0.9) * 1.05 + Math.sin(t * 1.7) * 0.35);
        targetY.set(Math.cos(t * 0.72) * 0.72);
      }
      animationRef.current = requestAnimationFrame(animateIdle);
    };

    animationRef.current = requestAnimationFrame(animateIdle);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isCompleted, targetX, targetY]);

  useEffect(() => {
    if (isCompleted) return;

    let timeoutId: number;
    const blinkLoop = () => {
      timeoutId = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 115);
        blinkLoop();
      }, 3000 + Math.random() * 2800);
    };

    blinkLoop();
    return () => window.clearTimeout(timeoutId);
  }, [isCompleted]);

  return (
    <div className="relative h-[222px] w-[222px] md:h-[238px] md:w-[238px]">
      <motion.div
        className="absolute left-1/2 top-[74%] h-12 w-40 -translate-x-1/2 rounded-full bg-cyan-300/24 blur-xl"
        animate={{
          opacity: isCompleted ? [0.46, 0.78, 0.5] : [0.28, 0.48, 0.28],
          scaleX: isCompleted ? [1.1, 1.35, 1.12] : [0.95, 1.08, 0.95],
        }}
        transition={{ duration: isCompleted ? 2.4 : 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-x-7 top-8 h-[178px] rounded-full bg-gradient-to-b from-cyan-300/22 via-violet-300/10 to-transparent blur-2xl"
        animate={{ opacity: [glowOpacity * 0.65, glowOpacity, glowOpacity * 0.7], scale: [0.95, 1.06, 0.98] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-x-0 top-3 mx-auto h-[204px] w-[204px] md:h-[216px] md:w-[216px]"
        animate={
          isCompleted
            ? { y: [0, -13, -7, -9, -7], scaleY: [1, 0.94, 1.03, 1], rotate: [0, 2.5, -1.5, 0] }
            : { y: [0, -7, 0], rotate: [0, 1.1, -1.1, 0] }
        }
        transition={
          isCompleted
            ? { duration: 0.9, ease: 'easeOut' }
            : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <div className="absolute left-[13px] top-[76px] z-0 h-[58px] w-[31px] rounded-full border border-cyan-100/18 bg-gradient-to-b from-slate-400 via-slate-800 to-slate-950 shadow-[inset_7px_0_12px_rgba(255,255,255,0.1),0_12px_28px_rgba(0,0,0,0.42)]" />
        <div className="absolute right-[13px] top-[76px] z-0 h-[58px] w-[31px] rounded-full border border-cyan-100/18 bg-gradient-to-b from-slate-400 via-slate-800 to-slate-950 shadow-[inset_-7px_0_12px_rgba(255,255,255,0.1),0_12px_28px_rgba(0,0,0,0.42)]" />

        <motion.div
          className="absolute left-[24px] top-[132px] z-20 h-14 w-6 rounded-full border border-cyan-200/24 bg-gradient-to-b from-slate-500 via-slate-900 to-slate-950 shadow-[inset_5px_0_10px_rgba(255,255,255,0.08),0_0_18px_rgba(34,211,238,0.12)]"
          animate={{ y: [0, 8, 0], rotate: [-8, -2, -8] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[24px] top-[132px] z-20 h-14 w-6 rounded-full border border-cyan-200/24 bg-gradient-to-b from-slate-500 via-slate-900 to-slate-950 shadow-[inset_-5px_0_10px_rgba(255,255,255,0.08),0_0_18px_rgba(34,211,238,0.12)]"
          animate={{ y: [4, -4, 4], rotate: [8, 2, 8] }}
          transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute left-1/2 top-0 h-8 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-slate-700 to-cyan-200/80" />
        <motion.div
          className="absolute left-1/2 top-[-9px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-cyan-100/60 bg-slate-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.55),0_0_12px_rgba(103,232,249,0.72)]"
          animate={{ scale: isCompleted ? [1, 1.32, 1] : [0.9, 1.08, 0.9] }}
          transition={{ duration: isCompleted ? 1.2 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute left-1/2 top-8 z-10 h-[110px] w-[146px] -translate-x-1/2 rounded-[34px] border border-cyan-100/22 bg-gradient-to-b from-slate-200 via-slate-700 to-[#080b12] shadow-[inset_0_2px_0_rgba(255,255,255,0.42),inset_0_-18px_32px_rgba(0,0,0,0.58),0_22px_54px_rgba(0,0,0,0.56),0_0_30px_rgba(34,211,238,0.22)] md:h-[116px] md:w-[154px]">
          <div className="absolute inset-[5px] rounded-[29px] border border-white/[0.08] bg-gradient-to-b from-white/[0.22] via-white/[0.025] to-black/30" />
          <div className="absolute left-8 top-2 h-7 w-20 rounded-full bg-white/[0.28] blur-md" />
          <div className="absolute right-4 top-6 h-16 w-5 rounded-full bg-cyan-200/[0.08] blur-md" />

          <div ref={faceRef} className="absolute left-1/2 top-[35px] h-[52px] w-[112px] -translate-x-1/2 rounded-[22px] border border-cyan-200/24 bg-[#050912] shadow-[inset_0_0_26px_rgba(34,211,238,0.18),0_0_24px_rgba(34,211,238,0.13)] md:w-[118px]">
            <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-cyan-200/[0.08] via-transparent to-black/30" />
            <div className="absolute left-4 right-4 top-1 h-3 rounded-full bg-white/[0.07] blur-sm" />

            {isCompleted ? (
              <motion.svg
                className="absolute left-1/2 top-1/2 h-8 w-20 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                viewBox="0 0 96 40"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <path d="M14 24 Q25 10 36 24" stroke="#67e8f9" strokeWidth="5.5" strokeLinecap="round" fill="none" filter="url(#happyGlow)" />
                <path d="M60 24 Q71 10 82 24" stroke="#67e8f9" strokeWidth="5.5" strokeLinecap="round" fill="none" filter="url(#happyGlow)" />
                <defs>
                  <filter id="happyGlow" x="-30%" y="-70%" width="160%" height="220%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </motion.svg>
            ) : (
              <>
                <div className="absolute left-[24px] top-[17px] h-5 w-7 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute left-[4px] top-[3px] h-3.5 w-5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.96),0_0_5px_rgba(103,232,249,1)]"
                    style={{ x: eyeX, y: eyeY }}
                  >
                    <span className="absolute left-1 top-0.5 h-1 w-1 rounded-full bg-white/95" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 origin-center bg-slate-950"
                    animate={{ scaleY: blink ? 1 : 0 }}
                    transition={{ duration: 0.075, ease: 'easeInOut' }}
                  />
                </div>
                <div className="absolute right-[24px] top-[17px] h-5 w-7 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute left-[4px] top-[3px] h-3.5 w-5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.96),0_0_5px_rgba(103,232,249,1)]"
                    style={{ x: eyeX, y: eyeY }}
                  >
                    <span className="absolute left-1 top-0.5 h-1 w-1 rounded-full bg-white/95" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 origin-center bg-slate-950"
                    animate={{ scaleY: blink ? 1 : 0 }}
                    transition={{ duration: 0.075, ease: 'easeInOut' }}
                  />
                </div>
              </>
            )}

            <motion.div
              className="absolute bottom-2.5 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-cyan-200/36 shadow-[0_0_10px_rgba(103,232,249,0.42)]"
              animate={{ width: isCompleted ? 30 : [26, 36, 26], opacity: isCompleted ? 0.75 : [0.28, 0.48, 0.28] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="absolute bottom-3 left-1/2 h-2 w-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent" />
        </div>

        <div className="absolute bottom-[18px] left-1/2 h-[76px] w-[118px] -translate-x-1/2 rounded-[42px] border border-cyan-100/16 bg-gradient-to-b from-slate-600 via-slate-950 to-[#050712] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-22px_28px_rgba(0,0,0,0.48),0_24px_48px_rgba(0,0,0,0.48)]" />
        <div className="absolute bottom-[74px] left-1/2 h-4 w-[86px] -translate-x-1/2 rounded-full bg-black/36 blur-sm" />
        <div className="absolute bottom-[38px] left-1/2 h-10 w-[94px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-200/12 to-transparent blur-sm" />
      </motion.div>
    </div>
  );
}
