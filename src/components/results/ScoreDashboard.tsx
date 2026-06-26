import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ScoreBreakdown } from '../../stores/useJourneyStore';

// ─── colour helpers (self-contained, no scoreUtils dependency) ───

function scoreColor(score: number): string {
  if (score >= 80) return '#00f0ff';
  if (score >= 68) return '#a986ff';
  if (score >= 55) return '#ffae42';
  return '#f87171';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 68) return 'Strong';
  if (score >= 55) return 'Moderate';
  return 'Needs Work';
}

// ─── sub-components ──────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 52;
    const stepTime = (duration * 1000) / steps;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(Math.round((target * i) / steps));
      if (i >= steps) clearInterval(id);
    }, stepTime);
    return () => clearInterval(id);
  }, [target, duration]);

  return <>{display}</>;
}

function CircularScore({ score, size = 150 }: { score: number; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const radius = 44; // Fits properly in 100x100 viewBox (50 - 44 = 6, 50 + 44 = 94)
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);
  const offset = circumference - (circumference * score) / 100;

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Outer glow ring matching score color */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 28px ${color}22, 0 0 8px ${color}18`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        {/* Subtle bg track glow */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke={`${color}18`} strokeWidth="9" />
        {/* Main arc */}
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="5.5" strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono tabular-nums text-4xl font-bold text-white leading-none tracking-tight">
          {inView ? <AnimatedCounter target={score} /> : 0}
        </span>
        <span className="text-[0.6rem] uppercase tracking-widest mt-1" style={{ color: `${color}99` }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const color = scoreColor(score);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[0.78rem] font-medium text-slate-400">{label}</span>
        <span className="text-[0.78rem] font-semibold tabular-nums font-mono" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 0.75, delay, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

// ─── main export ─────────────────────────────────────────────────

interface ScoreDashboardProps {
  scores: ScoreBreakdown;
}

export function ScoreDashboard({ scores }: ScoreDashboardProps) {
  const color = scoreColor(scores.overall);
  const label = scoreLabel(scores.overall);

  const subScores = [
    { label: 'Market Potential', score: scores.marketPotential },
    { label: 'Innovation',       score: scores.innovation       },
    { label: 'Feasibility',      score: scores.feasibility      },
    { label: 'Scalability',      score: scores.scalability      },
    { label: 'Monetization',     score: scores.monetization     },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-xl border border-white/10 p-5 md:p-6 flex flex-col gap-4"
      style={{
        background: 'rgba(7,13,27,0.9)',
        borderLeft: `3px solid ${color}44`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 40px ${color}08`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-mono text-cyan-400 tracking-widest uppercase">AI Viability Assessment</span>
        <span
          className="text-[0.68rem] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: `${color}15`, color }}
        >
          {label}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Circular score */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <CircularScore score={scores.overall} size={148} />
          <div className="text-center">
            <div className="text-[0.72rem] text-slate-500">Overall Viability</div>
          </div>
        </div>

        {/* Sub-score bars */}
        <div className="flex-1 w-full flex flex-col gap-3 justify-center">
          {subScores.map((s, i) => (
            <SubScoreBar key={s.label} label={s.label} score={s.score} delay={0.1 + i * 0.06} />
          ))}
        </div>
      </div>

      {/* AI rationale */}
      {scores.rationale && (
        <div
          className="text-[0.8rem] leading-relaxed px-4 py-3 rounded-lg border border-white/5 text-slate-400 italic"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          &ldquo;{scores.rationale}&rdquo;
        </div>
      )}
    </motion.div>
  );
}
