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
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ITEMS.map(({ key, label, sublabel, Icon, color }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.06, duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col gap-3 rounded-xl p-5 border border-white/10 bg-slate-900/80"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-md flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-widest" style={{ color }}>
                {label}
              </div>
              <div className="text-[0.7rem] mt-0.5 leading-snug text-slate-500">
                {sublabel}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm leading-7 text-slate-300">
            {realityCheck[key]}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
