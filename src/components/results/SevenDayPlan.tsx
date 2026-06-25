import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SevenDayPlanProps {
  days: string[];
}

/** Parse "Day 1: text" or "Days 1-2: text" into label + body */
function parseEntry(raw: string): { label: string; body: string } {
  const match = raw.match(/^(Days?\s[\d\-–]+)\s*[:—]\s*/i);
  if (match) {
    return { label: match[1].trim(), body: raw.slice(match[0].length).trim() };
  }
  return { label: `Day ${1}`, body: raw };
}

const DOT_COLORS = [
  '#00f0ff', '#a986ff', '#ffae42', '#4ade80',
  '#f472b6', '#00f0ff', '#a986ff',
];

export function SevenDayPlan({ days }: SevenDayPlanProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="relative">
      {/* Vertical connector line */}
      <div
        className="absolute left-5 top-5 bottom-5 w-px"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div
          className="w-full origin-top"
          style={{ background: 'linear-gradient(to bottom, #00f0ff88, #a986ff88, transparent)' }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
        />
      </div>

      <div className="flex flex-col">
        {days.map((raw, i) => {
          const { label, body } = parseEntry(raw);
          const color = DOT_COLORS[i % DOT_COLORS.length];
          const isLast = i === days.length - 1;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
              className={`relative flex items-start gap-4 pl-12 ${isLast ? '' : 'pb-5'}`}
            >
              {/* Dot */}
              <div
                className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${color}10`,
                  border: `1.5px solid ${color}40`,
                  boxShadow: `0 0 10px ${color}20`,
                }}
              >
                <CheckCircle2 size={16} style={{ color }} />
              </div>

              {/* Content */}
              <div
                className="flex-1 rounded-xl p-4 border"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color }}
                >
                  {label}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {body}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
