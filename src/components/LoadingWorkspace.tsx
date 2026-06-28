import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Lock, Sparkles } from 'lucide-react';
import { RobotMascot } from './RobotMascot';
import { useJourneyStore } from '../stores/useJourneyStore';

const ENABLE_SOUND = false;

const REASONING_STEPS = [
  'Understanding customer problem...',
  'Building market map...',
  'Comparing existing competitors...',
  'Detecting revenue opportunities...',
  'Evaluating execution risk...',
  'Validating assumptions...',
  'Analyzing scalability potential...',
  'Structuring final recommendations...',
  'Performing final data validation...',
  'Compiling AI research report...',
];

const TIMELINE_ITEMS = [
  'Business model recognized',
  'Industry detected',
  'Customer segment identified',
  'Searching competitors...',
  'Market sizing',
  'Risk analysis',
  'AI recommendations',
];

const STATUS_LINES = [
  'Reading the shape of your startup...',
  'Understanding your market...',
  'Searching for competitors...',
  'Mapping customer demand...',
  'Checking business model strength...',
  'Drafting strategic recommendations...',
  'Preparing your final report...',
];

interface LoadingWorkspaceProps {
  cooldownRemaining?: number;
  apiFinished?: boolean;
  onComplete?: () => void;
}

function playSynthSound(freq: number, type: OscillatorType = 'sine', duration = 0.25) {
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
    // Sound is intentionally optional.
  }
}

export function LoadingWorkspace({ cooldownRemaining, apiFinished = false, onComplete }: LoadingWorkspaceProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const idea = useJourneyStore(state => state.inputs.idea);
  const ideaPreview = idea?.trim() || 'Helping local businesses connect with college students';

  const startTimeRef = useRef<number>(Date.now());
  const lastActiveStageRef = useRef<number>(-1);
  const isCompletingRef = useRef(false);

  useEffect(() => {
    isCompletingRef.current = isCompleting;
  }, [isCompleting]);

  const particles = useMemo(() => {
    return [...Array(18)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * -18,
    }));
  }, []);

  useEffect(() => {
    if (cooldownRemaining !== undefined) return;

    const timer = setInterval(() => {
      if (isCompletingRef.current) {
        clearInterval(timer);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      setElapsedTime(elapsed);

      let currentProgress = 0;
      if (elapsed < 1500) {
        currentProgress = (elapsed / 1500) * 30;
      } else if (elapsed < 5000) {
        currentProgress = 30 + ((elapsed - 1500) / 3500) * 30;
      } else if (elapsed < 10000) {
        currentProgress = 60 + ((elapsed - 5000) / 5000) * 25;
      } else if (elapsed < 15000) {
        currentProgress = 85 + ((elapsed - 10000) / 5000) * 9;
      } else {
        currentProgress = 94 + Math.sin(elapsed / 400) * 0.4;
      }

      setProgress(Math.min(currentProgress, 94.5));
    }, 50);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const currentStageIndex = useMemo(() => {
    if (isCompleting) return 6;
    if (elapsedTime < 2000) return 0;
    if (elapsedTime < 4500) return 1;
    if (elapsedTime < 7500) return 2;
    if (elapsedTime < 10000) return 3;
    if (elapsedTime < 12500) return 4;
    if (elapsedTime < 15000) return 5;
    return 6;
  }, [elapsedTime, isCompleting]);

  useEffect(() => {
    if (currentStageIndex !== lastActiveStageRef.current) {
      if (lastActiveStageRef.current !== -1) {
        playSynthSound(587.33, 'sine', 0.12);
      }
      lastActiveStageRef.current = currentStageIndex;
    }
  }, [currentStageIndex]);

  const feedStepIndex = useMemo(() => {
    if (isCompleting) return REASONING_STEPS.length - 1;
    return Math.min(Math.floor(elapsedTime / 1500), REASONING_STEPS.length - 1);
  }, [elapsedTime, isCompleting]);

  const visibleThinking = useMemo(() => {
    const start = Math.max(0, feedStepIndex - 4);
    return REASONING_STEPS.slice(start, feedStepIndex + 1).map((step, index) => {
      const absoluteIndex = start + index;
      return {
        text: step,
        isActive: absoluteIndex === feedStepIndex && !isCompleting,
      };
    });
  }, [feedStepIndex, isCompleting]);

  useEffect(() => {
    if (elapsedTime >= 15000 && apiFinished && !isCompleting) {
      setIsCompleting(true);
      setProgress(100);

      if (ENABLE_SOUND) {
        playSynthSound(523.25, 'sine', 0.3);
        setTimeout(() => playSynthSound(659.25, 'sine', 0.4), 100);
      }
    }
  }, [elapsedTime, apiFinished, isCompleting]);

  useEffect(() => {
    if (!isCompleting || !onComplete) return;
    const timer = setTimeout(onComplete, 750);
    return () => clearTimeout(timer);
  }, [isCompleting, onComplete]);

  const timelineActiveIndex = Math.min(Math.max(currentStageIndex, 0), TIMELINE_ITEMS.length - 1);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#060a14] px-5 py-5 font-sans text-white select-none md:px-9 md:py-6">
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute left-[22%] top-[-20%] h-[570px] w-[570px] rounded-full bg-cyan-400/16 blur-[120px]"
          animate={{ x: [0, 18, -12, 0], y: [0, 10, -14, 0], opacity: [0.66, 0.9, 0.7] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[14%] top-[-12%] h-[540px] w-[540px] rounded-full bg-violet-500/15 blur-[130px]"
          animate={{ x: [0, -22, 14, 0], y: [0, -12, 16, 0], opacity: [0.55, 0.82, 0.58] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(circle at 50% 24%, black 0%, transparent 58%)',
          }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 1200 720" preserveAspectRatio="none">
          <path d="M210 155 C360 95 445 170 575 155 S795 88 990 135" stroke="#67e8f9" strokeWidth="0.7" fill="none" />
          <path d="M170 205 C340 150 470 228 595 195 S770 158 1050 228" stroke="#818cf8" strokeWidth="0.7" fill="none" />
          <path d="M220 250 C400 205 505 282 618 240 S835 205 1015 282" stroke="#67e8f9" strokeWidth="0.6" fill="none" />
          <path d="M260 125 L565 210 L930 112" stroke="#94a3b8" strokeWidth="0.45" fill="none" />
          <path d="M250 285 L590 185 L980 305" stroke="#94a3b8" strokeWidth="0.45" fill="none" />
          {[178, 238, 412, 520, 730, 856, 1035].map((cx, index) => (
            <circle key={cx} cx={cx} cy={index % 2 ? 160 + index * 14 : 115 + index * 21} r={index % 3 === 0 ? 2.2 : 1.4} fill={index % 2 ? '#a5b4fc' : '#67e8f9'} />
          ))}
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,transparent_0%,rgba(6,10,20,0.2)_42%,rgba(3,6,14,0.92)_100%)]" />
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-cyan-200/25"
            style={{
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
            }}
            animate={{ opacity: [0, 0.55, 0], y: [0, -70] }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <header className="relative z-10 flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-6 w-6">
            <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.65)]" />
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            <span className="absolute bottom-0 left-2 h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.55)]" />
            <span className="absolute left-[7px] top-[8px] h-2 w-2 rotate-45 rounded-sm bg-white/30" />
          </div>
          <span className="text-lg font-semibold tracking-[-0.01em] text-white/95">IdeaBridge</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-200/35 bg-cyan-100/[0.09] px-3.5 py-1.5 text-sm font-medium text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(34,211,238,0.08)] backdrop-blur-md">
          <Sparkles size={13} className="text-cyan-200" strokeWidth={2.2} />
          <span>AI Analysis</span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-76px)] flex-col items-center min-h-[610px]">
        <section className="flex w-full max-w-[1080px] flex-col items-center pt-2 text-center">
          <div className="relative flex h-[174px] w-full items-center justify-center md:h-[184px]">
            <RobotMascot analysisStatus={isCompleting ? 'success' : 'analyzing'} stage={currentStageIndex} isCompleted={isCompleting} />
          </div>

          <motion.div
            className="w-full max-w-2xl"
            animate={{ opacity: [0.96, 1, 0.96] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-200/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              {isCompleting ? 'Analysis Complete' : 'Analyzing Your Startup'}
            </div>
            <h1 className="mx-auto max-w-[560px] text-balance text-[28px] font-semibold leading-[1.05] tracking-[-0.02em] text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.08)] md:text-[32px]">
              {isCompleting ? 'Your analysis is ready' : ideaPreview}
            </h1>

            <div className="mx-auto mt-4 w-full max-w-[360px]">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/12 shadow-[0_0_16px_rgba(148,163,184,0.08)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #67e8f9, #22d3ee, #67e8f9)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      boxShadow: isCompleting ? '0 0 18px rgba(103,232,249,0.72)' : '0 0 10px rgba(103,232,249,0.3)'
                    }}
                    transition={{
                      backgroundPosition: { duration: 2.5, repeat: Infinity, ease: 'linear' },
                      boxShadow: { duration: 0.8 }
                    }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium tabular-nums text-slate-300">{Math.round(progress)}%</span>
              </div>
              <p className="text-sm tracking-normal text-slate-300/72">
                {isCompleting ? 'Preparing your personalized report...' : STATUS_LINES[currentStageIndex]}
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mt-auto w-full max-w-[1080px] pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[232px_1fr_248px] md:items-end md:gap-16">
            <div className="rounded-lg border border-slate-300/18 bg-slate-900/38 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl md:min-h-[198px]">
              <div className="mb-3.5 text-base font-semibold tracking-[-0.01em] text-white/92">
                Analysis Timeline
              </div>
              <div className="space-y-2.5">
                {TIMELINE_ITEMS.map((item, index) => {
                  const complete = index < timelineActiveIndex || isCompleting;
                  const active = index === timelineActiveIndex && !isCompleting;
                  return (
                    <div key={item} className="flex items-center gap-2.5 text-xs">
                      <div className="flex h-3.5 w-3.5 items-center justify-center">
                        {complete ? (
                          <span className="flex h-3.5 w-3.5 items-center justify-center text-cyan-300">
                            <Check size={12} strokeWidth={2.4} />
                          </span>
                        ) : active ? (
                          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                            <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-300/35" />
                            <span className="relative h-2.5 w-2.5 rounded-full border border-cyan-200/80 bg-slate-900 shadow-[0_0_10px_rgba(103,232,249,0.72)]">
                              <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300" />
                            </span>
                          </span>
                        ) : (
                          <Circle size={11} className="text-slate-300/35" />
                        )}
                      </div>
                      <span className={complete ? 'text-slate-400' : active ? 'font-semibold text-white' : 'text-slate-300/78'}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="order-last mx-auto flex w-full max-w-[300px] items-center gap-3 self-end rounded-lg border border-slate-200/25 bg-slate-200/[0.13] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl md:order-none md:mb-0">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Lock size={18} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-white/90">Private AI Analysis</p>
                <p className="truncate text-[11px] text-slate-300/72">Your startup idea is encrypted and never shared.</p>
              </div>
            </div>

            <div className="relative rounded-lg border border-slate-300/18 bg-slate-900/38 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl md:min-h-[198px]">
            <div className="mb-3.5 text-base font-semibold tracking-[-0.01em] text-white/92">
              AI Thinking
            </div>
            <div className="flex h-[126px] flex-col justify-start overflow-hidden">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {visibleThinking.map((step) => (
                    <motion.div
                      key={step.text}
                      initial={{ opacity: 0, y: 4, filter: 'blur(2px)' }}
                      animate={{ opacity: step.isActive ? 0.92 : 0.62, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                      className={step.isActive ? 'truncate text-sm font-medium text-white' : 'truncate text-sm font-normal text-slate-300/86'}
                    >
                      {step.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {[0, 1, 2].map(dot => (
                <span key={dot} className={`h-1.5 rounded-full ${dot === 0 ? 'w-1.5 bg-cyan-200' : 'w-1.5 bg-white/28'}`} />
              ))}
            </div>
            <div className="absolute -bottom-1 -right-4 h-12 w-12 text-slate-200/75">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 0C27.5 14.5 33.5 20.5 48 24C33.5 27.5 27.5 33.5 24 48C20.5 33.5 14.5 27.5 0 24C14.5 20.5 20.5 14.5 24 0Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          </div>
        </section>

        {cooldownRemaining !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-violet-300/15 bg-violet-400/10 px-4 py-2 text-center"
          >
            <p className="font-mono text-xs text-violet-100/80">Next analysis available in {cooldownRemaining}s</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
