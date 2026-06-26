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
  },
  {
    key: 'biggestRisk' as const,
    label: 'Biggest Risk',
    sublabel: 'The most likely reason this fails in year one',
    Icon: AlertOctagon,
    color: '#f87171',
  },
  {
    key: 'whyItCouldFail' as const,
    label: 'Why It Could Fail',
    sublabel: 'The most common failure mode for this type of business',
    Icon: XCircle,
    color: '#fb923c',
  },
  {
    key: 'hardestExecutionChallenge' as const,
    label: 'Hardest Execution Challenge',
    sublabel: 'The operational or technical problem hardest to solve',
    Icon: Wrench,
    color: '#a986ff',
  },
] as const;

export function RealityCheckCard({ realityCheck }: RealityCheckCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ITEMS.map(({ key, label, sublabel, Icon, color }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-3 rounded-xl p-4 border border-white/8"
          style={{
            background: 'rgba(7,13,27,0.88)',
            borderLeft: `3px solid ${color}55`,
            boxShadow: `inset 0 0 20px ${color}06`,
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="p-1.5 rounded-md flex-shrink-0 mt-0.5"
              style={{ background: `${color}15` }}
            >
              <Icon size={14} style={{ color }} />
            </div>
            <div>
              <div
                className="text-[0.68rem] font-semibold uppercase tracking-widest font-mono"
                style={{ color }}
              >
                {label}
              </div>
              <div className="text-[0.68rem] mt-0.5 leading-snug text-slate-500">
                {sublabel}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-[0.82rem] leading-6 text-slate-300">
            {realityCheck[key]}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
