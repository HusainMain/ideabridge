import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingDown, Swords } from 'lucide-react';
import { CompetitorCard } from '../../stores/useJourneyStore';

interface CompetitorCardsProps {
  competitors: CompetitorCard[];
}

const PALETTE = [
  { accent: '#00f0ff', bg: 'rgba(0,240,255,0.04)',   border: 'rgba(0,240,255,0.12)'   },
  { accent: '#a986ff', bg: 'rgba(169,134,255,0.04)', border: 'rgba(169,134,255,0.12)' },
  { accent: '#ffae42', bg: 'rgba(255,174,66,0.04)',  border: 'rgba(255,174,66,0.12)'  },
  { accent: '#f472b6', bg: 'rgba(244,114,182,0.04)', border: 'rgba(244,114,182,0.12)' },
  { accent: '#4ade80', bg: 'rgba(74,222,128,0.04)',  border: 'rgba(74,222,128,0.12)'  },
];

/** Returns initials from a competitor name for the avatar. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function CompetitorCards({ competitors }: CompetitorCardsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {competitors.map((c, i) => {
        const p = PALETTE[i % PALETTE.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.45, ease: 'easeOut' }}
            className="flex items-start gap-4 p-4 md:p-5 rounded-xl border"
            style={{ background: p.bg, borderColor: p.border }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
              style={{
                background: `${p.accent}15`,
                border: `1px solid ${p.accent}30`,
                color: p.accent,
                fontFamily: 'var(--act-serif)',
              }}
            >
              {initials(c.name)}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {/* Name */}
              <div className="font-semibold text-sm text-white leading-tight">{c.name}</div>

              {/* Two columns: weakness | your edge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Weakness */}
                <div
                  className="flex flex-col gap-1.5 p-3 rounded-lg"
                  style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.12)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={11} style={{ color: '#f87171' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#f87171' }}>
                      Their Weakness
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {c.weakness}
                  </p>
                </div>

                {/* Your edge */}
                <div
                  className="flex flex-col gap-1.5 p-3 rounded-lg"
                  style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.12)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Swords size={11} style={{ color: '#00f0ff' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#00f0ff' }}>
                      Your Edge
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {c.yourEdge}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
