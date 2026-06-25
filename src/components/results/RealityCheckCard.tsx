import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertOctagon, HelpCircle, XCircle, Wrench } from 'lucide-react';
import { RealityCheck } from '../../stores/useJourneyStore';

interface RealityCheckCardProps {
  realityCheck: RealityCheck;
}

const ITEMS = [
  {
    key: 'biggestAssumption' as const,
    label: 'Biggest Assumption',
    sublabel: 'The riskiest unproven belief this business depends on',
    Icon: HelpCircle,
    color: '#ffae42',
    bg: 'rgba(255,174,66,0.06)',
    border: 'rgba(255,174,66,0.18)',
    iconBg: 'rgba(255,174,66,0.12)',
  },
  {
    key: 'biggestRisk' as const,
    label: 'Biggest Risk',
    sublabel: 'The most likely reason this fails in year one',
    Icon: AlertOctagon,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.18)',
    iconBg: 'rgba(248,113,113,0.12)',
  },
  {
    key: 'whyItCouldFail' as const,
    label: 'Why It Could Fail',
    sublabel: 'The most common failure mode for this type of business',
    Icon: XCircle,
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.06)',
    border: 'rgba(251,146,60,0.18)',
    iconBg: 'rgba(251,146,60,0.12)',
  },
  {
    key: 'hardestExecutionChallenge' as const,
    label: 'Hardest Execution Challenge',
    sublabel: 'The operational or technical problem hardest to solve',
    Icon: Wrench,
    color: '#a986ff',
    bg: 'rgba(169,134,255,0.06)',
    border: 'rgba(169,134,255,0.18)',
    iconBg: 'rgba(169,134,255,0.12)',
  },
] as const;

export function RealityCheckCard({ realityCheck }: RealityCheckCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ITEMS.map(({ key, label, sublabel, Icon, color, bg, border, iconBg }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.08, duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col gap-3 rounded-xl p-5 border"
          style={{ background: bg, borderColor: border }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-lg flex-shrink-0 mt-0.5"
              style={{ background: iconBg, border: `1px solid ${border}` }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
                {label}
              </div>
              <div className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {sublabel}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
            {realityCheck[key]}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
