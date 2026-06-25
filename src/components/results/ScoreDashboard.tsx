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

function AnimatedCounter({ target, duration = 1.4 }: { target: number; duration?: number }) {
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

function CircularScore({ score, size = 148 }: { score: number; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);
  const offset = circumference - (circumference * score) / 100;

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        {/* glow layer */}
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${color})`, opacity: 0.25 }}
        />
        {/* main arc */}
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold text-white leading-none">
          {inView ? <AnimatedCounter target={score} /> : 0}
        </span>
        <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--act-muted)' }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function SubScoreBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const color = scoreColor(score);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 8px ${color}44` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay, ease: [0.34, 1.56, 0.64, 1] }}
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-2xl border p-6 md:p-8 flex flex-col gap-6"
      style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(0,240,255,0.06) 0%, transparent 55%), #0d0d0d',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <span className="act-label" style={{ margin: 0 }}>AI Viability Assessment</span>

      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {/* Circular score */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <CircularScore score={scores.overall} size={148} />
          <div className="text-center">
            <div className="text-sm font-semibold" style={{ color }}>{label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--act-muted)' }}>Overall Viability</div>
          </div>
        </div>

        {/* Sub-score bars */}
        <div className="flex-1 w-full flex flex-col gap-4 justify-center">
          {subScores.map((s, i) => (
            <SubScoreBar key={s.label} label={s.label} score={s.score} delay={0.1 + i * 0.08} />
          ))}
        </div>
      </div>

      {/* AI rationale */}
      {scores.rationale && (
        <div
          className="text-xs leading-relaxed px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.5)',
            fontStyle: 'italic',
          }}
        >
          "{scores.rationale}"
        </div>
      )}
    </motion.div>
  );
}
