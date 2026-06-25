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
      bg: 'rgba(0,240,255,0.05)',
      border: 'rgba(0,240,255,0.12)',
      dividerColor: 'rgba(255,255,255,0.04)',
    },
    {
      icon: AlertTriangle,
      label: 'Biggest Risk',
      text: biggestRisk,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.05)',
      border: 'rgba(248,113,113,0.12)',
      dividerColor: 'rgba(255,255,255,0.04)',
    },
    {
      icon: Zap,
      label: 'First Action',
      text: nextAction,
      color: '#a986ff',
      bg: 'rgba(169,134,255,0.05)',
      border: 'rgba(169,134,255,0.12)',
      dividerColor: 'rgba(255,255,255,0.04)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d0d0d 0%, #0a0f1a 100%)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div className="px-6 md:px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="act-label" style={{ margin: 0, display: 'inline-block' }}>Executive Summary</span>
        <h2 className="text-white font-semibold text-lg mt-1 leading-snug">At a Glance</h2>
      </div>

      {/* Summary bullets */}
      <div className="px-6 md:px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <ul className="space-y-3">
          {results.summary.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--act-cyan)' }}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Three AI-sourced highlights */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {highlights.map(({ icon: Icon, label, text, color, bg, border }, idx) => (
          <div
            key={label}
            className="px-6 py-5 flex flex-col gap-3 transition-colors duration-200"
            style={{
              borderRight: idx < highlights.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              borderBottom: '0',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = bg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon size={13} style={{ color }} />
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--act-muted)' }}
              >
                {label}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
