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
  const idleFrameRef = useRef<number>();

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const eyeX = useSpring(targetX, { stiffness: 220, damping: 30, mass: 0.55 });
  const eyeY = useSpring(targetY, { stiffness: 220, damping: 30, mass: 0.55 });

  const glowStrength = isCompleted ? 0.78 : 0.42 + Math.min(stage, 6) * 0.04;

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
      const x = (event.clientX - centerX) / (rect.width / 2);
      const y = (event.clientY - centerY) / (rect.height / 2);

      targetX.set(clamp(x * 4.2, -4.2, 4.2));
      targetY.set(clamp(y * 2.8, -2.8, 2.8));
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
    window.addEventListener('blur', centerEyes);
    document.documentElement.addEventListener('mouseleave', centerEyes);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('pointermove', moveEyes);
      window.removeEventListener('blur', centerEyes);
      document.documentElement.removeEventListener('mouseleave', centerEyes);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isCompleted, targetX, targetY]);

  useEffect(() => {
    if (isCompleted) return;

    const animateIdle = () => {
      const idleFor = Date.now() - lastPointerMoveRef.current;
      if (lastPointerMoveRef.current === 0 || idleFor > 1400) {
        const t = Date.now() / 1000;
        targetX.set(Math.sin(t * 0.85) * 0.85 + Math.sin(t * 1.35) * 0.28);
        targetY.set(Math.cos(t * 0.7) * 0.55);
      }
      idleFrameRef.current = requestAnimationFrame(animateIdle);
    };

    idleFrameRef.current = requestAnimationFrame(animateIdle);
    return () => {
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current);
    };
  }, [isCompleted, targetX, targetY]);

  useEffect(() => {
    if (isCompleted) return;

    let timeoutId: number;
    const loop = () => {
      timeoutId = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 105);
        loop();
      }, 3200 + Math.random() * 2600);
    };

    loop();
    return () => window.clearTimeout(timeoutId);
  }, [isCompleted]);

  return (
    <div className="relative h-[174px] w-[174px] md:h-[184px] md:w-[184px]">
      <motion.div
        className="absolute left-1/2 top-[78%] h-9 w-36 -translate-x-1/2 rounded-full bg-cyan-300/28 blur-xl"
        animate={{
          opacity: isCompleted ? [0.55, 0.82, 0.58] : [0.32, 0.52, 0.34],
          scaleX: isCompleted ? [1.05, 1.24, 1.08] : [0.92, 1.05, 0.92],
        }}
        transition={{ duration: isCompleted ? 2.4 : 5.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-x-2 top-3 h-36 rounded-full bg-gradient-to-b from-cyan-300/24 via-sky-300/8 to-transparent blur-2xl"
        animate={{ opacity: [glowStrength * 0.68, glowStrength, glowStrength * 0.72], scale: [0.95, 1.05, 0.98] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0"
        animate={
          isCompleted
            ? { y: [0, -8, -4, -5, -4], scaleY: [1, 0.96, 1.02, 1], rotate: [0, 2, -1, 0] }
            : { y: [0, -5, 0], rotate: [0, 0.8, -0.8, 0] }
        }
        transition={
          isCompleted
            ? { duration: 0.85, ease: 'easeOut' }
            : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <div className="absolute left-1/2 top-1 h-7 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-slate-700 to-slate-200" />
        <div className="absolute left-1/2 top-[-4px] h-3 w-3 -translate-x-1/2 rounded-full bg-slate-950 shadow-[inset_0_1px_2px_rgba(255,255,255,0.85),0_0_12px_rgba(103,232,249,0.75)]" />

        <div className="absolute left-[22px] top-[62px] z-10 h-12 w-7 rounded-full border border-cyan-100/20 bg-gradient-to-b from-slate-300 via-slate-700 to-slate-950 shadow-[inset_6px_0_10px_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.36)]" />
        <div className="absolute right-[22px] top-[62px] z-10 h-12 w-7 rounded-full border border-cyan-100/20 bg-gradient-to-b from-slate-300 via-slate-700 to-slate-950 shadow-[inset_-6px_0_10px_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.36)]" />

        <div className="absolute bottom-4 left-1/2 z-10 h-[66px] w-[94px] -translate-x-1/2 rounded-[36px] border border-cyan-100/18 bg-gradient-to-b from-slate-600 via-slate-950 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-18px_26px_rgba(0,0,0,0.58),0_20px_38px_rgba(0,0,0,0.42)]" />

        <motion.div
          className="absolute left-[30px] top-[111px] z-20 h-12 w-6 rounded-full border border-cyan-200/24 bg-gradient-to-b from-slate-400 via-slate-900 to-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
          animate={{ y: [0, 5, 0], rotate: [-8, -3, -8] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[30px] top-[111px] z-20 h-12 w-6 rounded-full border border-cyan-200/24 bg-gradient-to-b from-slate-400 via-slate-900 to-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
          animate={{ y: [3, -3, 3], rotate: [8, 3, 8] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute left-1/2 top-7 z-30 h-[86px] w-[124px] -translate-x-1/2 rounded-[32px] border border-cyan-100/28 bg-gradient-to-b from-slate-100 via-slate-600 to-[#070a11] shadow-[inset_0_2px_0_rgba(255,255,255,0.46),inset_0_-18px_28px_rgba(0,0,0,0.58),0_20px_48px_rgba(0,0,0,0.55),0_0_28px_rgba(34,211,238,0.2)]">
          <div className="absolute inset-[4px] rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.18] via-transparent to-black/28" />
          <div className="absolute left-8 top-2 h-6 w-16 rounded-full bg-white/[0.24] blur-md" />

          <div ref={faceRef} className="absolute left-1/2 top-[30px] h-[39px] w-[92px] -translate-x-1/2 rounded-[19px] border border-cyan-200/24 bg-[#050914] shadow-[inset_0_0_22px_rgba(34,211,238,0.18),0_0_22px_rgba(34,211,238,0.14)]">
            <div className="absolute inset-0 rounded-[19px] bg-gradient-to-b from-cyan-200/[0.08] via-transparent to-black/35" />
            <div className="absolute left-5 right-5 top-1 h-2 rounded-full bg-white/[0.08] blur-sm" />

            {isCompleted ? (
              <motion.svg
                className="absolute left-1/2 top-1/2 h-7 w-[70px] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                viewBox="0 0 96 40"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <path d="M14 24 Q25 10 36 24" stroke="#67e8f9" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                <path d="M60 24 Q71 10 82 24" stroke="#67e8f9" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              </motion.svg>
            ) : (
              <>
                <div className="absolute left-[19px] top-[13px] h-4 w-6 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute left-[4px] top-[2px] h-3 w-[18px] rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.96),0_0_4px_rgba(103,232,249,1)]"
                    style={{ x: eyeX, y: eyeY }}
                  >
                    <span className="absolute left-1 top-0.5 h-1 w-1 rounded-full bg-white/95" />
                  </motion.div>
                  <motion.div className="absolute inset-0 origin-center bg-slate-950" animate={{ scaleY: blink ? 1 : 0 }} transition={{ duration: 0.075, ease: 'easeInOut' }} />
                </div>
                <div className="absolute right-[19px] top-[13px] h-4 w-6 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute left-[4px] top-[2px] h-3 w-[18px] rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.96),0_0_4px_rgba(103,232,249,1)]"
                    style={{ x: eyeX, y: eyeY }}
                  >
                    <span className="absolute left-1 top-0.5 h-1 w-1 rounded-full bg-white/95" />
                  </motion.div>
                  <motion.div className="absolute inset-0 origin-center bg-slate-950" animate={{ scaleY: blink ? 1 : 0 }} transition={{ duration: 0.075, ease: 'easeInOut' }} />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
