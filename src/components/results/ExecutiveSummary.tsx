import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { ResultsData } from '../../stores/useJourneyStore';

interface ExecutiveSummaryProps {
  results: ResultsData;
}

export function ExecutiveSummary({ results }: ExecutiveSummaryProps) {
  // Pull from AI-generated realityCheck instead of guessing from arbitrary bullet indices.
  const topStrength = results.validation[0] ?? results.summary[0] ?? 'Strong market opportunity identified.';
  const biggestRisk = results.realityCheck.biggestRisk;
  const nextAction  = results.actions[0] ?? results.nextSevenDays[0] ?? 'Begin customer discovery immediately.';

  const highlights = [
    {
      icon: TrendingUp,
      label: 'Top Strength',
      text: topStrength,
      color: '#00f0ff',
      bg: 'rgba(0,240,255,0.08)',
    },
    {
      icon: AlertTriangle,
      label: 'Biggest Risk',
      text: biggestRisk,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
    },
    {
      icon: Zap,
      label: 'First Action',
      text: nextAction,
      color: '#a986ff',
      bg: 'rgba(169,134,255,0.08)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
      className="rounded-xl border border-white/10 bg-slate-900/80 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-5 md:px-6 py-4 border-b border-white/5">
        <span className="text-[0.75rem] font-mono text-cyan-400 tracking-widest uppercase">Executive Summary</span>
        <h2 className="text-white font-semibold text-lg mt-1.5 leading-snug">At a Glance</h2>
      </div>

      {/* Summary bullets */}
      <div className="px-5 md:px-6 py-4 border-b border-white/5">
        <ul className="space-y-2.5">
          {results.summary.map((point, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-7 text-slate-300">
              <span
                className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-cyan-400"
              />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Three AI-sourced highlights */}
      <div className="px-5 md:px-6 py-4 space-y-3">
        {highlights.map(({ icon: Icon, label, text, color, bg }) => (
          <div
            key={label}
            className="flex gap-3 p-3 rounded-lg transition-colors duration-200"
            style={{ background: bg }}
          >
            <div
              className="mt-0.5 p-2 rounded-md"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <Icon size={14} style={{ color }} />
            </div>
            <div className="flex-1">
              <span
                className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-500"
              >
                {label}
              </span>
              <p className="text-sm leading-relaxed text-slate-300 mt-1">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
