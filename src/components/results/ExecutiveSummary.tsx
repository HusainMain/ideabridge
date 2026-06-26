import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { ResultsData } from '../../stores/useJourneyStore';

interface ExecutiveSummaryProps {
  results: ResultsData;
}

export function ExecutiveSummary({ results }: ExecutiveSummaryProps) {
  const topStrength = results.validation[0] ?? results.summary[0] ?? 'Strong market opportunity identified.';
  const biggestRisk = results.realityCheck.biggestRisk;
  const nextAction  = results.actions[0] ?? results.nextSevenDays[0] ?? 'Begin customer discovery immediately.';

  const highlights = [
    {
      icon: TrendingUp,
      label: 'Top Strength',
      text: topStrength,
      color: '#00f0ff',
      borderColor: 'rgba(0,240,255,0.2)',
      bg: 'rgba(0,240,255,0.05)',
    },
    {
      icon: AlertTriangle,
      label: 'Biggest Risk',
      text: biggestRisk,
      color: '#f87171',
      borderColor: 'rgba(248,113,113,0.2)',
      bg: 'rgba(248,113,113,0.05)',
    },
    {
      icon: Zap,
      label: 'First Action',
      text: nextAction,
      color: '#a986ff',
      borderColor: 'rgba(169,134,255,0.2)',
      bg: 'rgba(169,134,255,0.05)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(7,13,27,0.95) 0%, rgba(10,15,30,0.9) 100%)',
        boxShadow: '0 0 60px rgba(0,240,255,0.04), 0 8px 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Gradient accent bar */}
      <div className="h-px w-full bg-gradient-to-r from-cyan-500/60 via-purple-500/40 to-transparent" />

      {/* Header row */}
      <div className="px-5 md:px-7 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[0.7rem] font-mono text-cyan-400 tracking-widest uppercase">Executive Summary</span>
        </div>
        {/* Summary bullets — compact, readable */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {results.summary.map((point, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-6 text-slate-300">
              <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0 bg-cyan-400" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Three KPI highlights — horizontal row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
        {highlights.map(({ icon: Icon, label, text, color, bg, borderColor }) => (
          <div
            key={label}
            className="flex gap-3 px-5 md:px-6 py-4 transition-colors duration-200 hover:bg-white/[0.02]"
            style={{ borderLeft: `2px solid ${borderColor}` }}
          >
            <div
              className="mt-0.5 p-1.5 rounded-md flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon size={13} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="block text-[0.62rem] font-semibold uppercase tracking-widest mb-1"
                style={{ color }}
              >
                {label}
              </span>
              <p className="text-[0.82rem] leading-snug text-slate-300 line-clamp-3">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
