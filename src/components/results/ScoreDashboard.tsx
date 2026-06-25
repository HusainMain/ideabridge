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
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);
  const offset = circumference - (circumference * score) / 100;

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        {/* main arc */}
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="5" strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold text-white leading-none">
          {inView ? <AnimatedCounter target={score} /> : 0}
        </span>
        <span className="text-xs uppercase tracking-widest mt-1 text-slate-500">
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
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
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
      className="rounded-xl border border-white/10 bg-slate-900/80 p-5 md:p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] font-mono text-cyan-400 tracking-widest uppercase">AI Viability Assessment</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-7 items-center">
        {/* Circular score */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <CircularScore score={scores.overall} size={150} />
          <div className="text-center">
            <div className="text-base font-semibold" style={{ color }}>{label}</div>
            <div className="text-sm text-slate-500">Overall Viability</div>
          </div>
        </div>

        {/* Sub-score bars */}
        <div className="flex-1 w-full flex flex-col gap-4 justify-center">
          {subScores.map((s, i) => (
            <SubScoreBar key={s.label} label={s.label} score={s.score} delay={0.1 + i * 0.06} />
          ))}
        </div>
      </div>

      {/* AI rationale */}
      {scores.rationale && (
        <div
          className="text-sm leading-relaxed px-4 py-3 rounded-lg bg-slate-950/50 border border-white/5 text-slate-400 italic"
        >
          "{scores.rationale}"
        </div>
      )}
    </motion.div>
  );
}
