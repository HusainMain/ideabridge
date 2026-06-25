import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface RoadmapVisualizerProps {
  steps: string[];
}

const MONTH_LABELS = [
  'Month 1', 'Month 2', 'Month 3', 'Month 4',
  'Month 5', 'Month 6', 'Month 7', 'Month 8',
];

const STEP_COLORS = [
  { dot: '#00f0ff', glow: 'rgba(0,240,255,0.3)',   bg: 'rgba(0,240,255,0.05)',   border: 'rgba(0,240,255,0.15)'  },
  { dot: '#a986ff', glow: 'rgba(169,134,255,0.3)', bg: 'rgba(169,134,255,0.05)', border: 'rgba(169,134,255,0.15)'},
  { dot: '#ffae42', glow: 'rgba(255,174,66,0.3)',  bg: 'rgba(255,174,66,0.05)',  border: 'rgba(255,174,66,0.15)' },
  { dot: '#4ade80', glow: 'rgba(74,222,128,0.3)',  bg: 'rgba(74,222,128,0.05)',  border: 'rgba(74,222,128,0.15)' },
  { dot: '#00f0ff', glow: 'rgba(0,240,255,0.3)',   bg: 'rgba(0,240,255,0.05)',   border: 'rgba(0,240,255,0.15)'  },
];

export function RoadmapVisualizer({ steps }: RoadmapVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-80px' });

  return (
    <div ref={containerRef} className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute left-4 top-2 bottom-2 w-px md:left-6"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          className="w-full origin-top"
          style={{ background: 'linear-gradient(to bottom, #00f0ff, #a986ff, #ffae42)' }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const palette = STEP_COLORS[i % STEP_COLORS.length];
          const monthLabel = MONTH_LABELS[i] ?? `Phase ${i + 1}`;
          const isLast = i === steps.length - 1;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
              className={`relative flex items-start gap-4 md:gap-6 pl-10 md:pl-14 ${isLast ? 'pb-0' : 'pb-6'}`}
            >
              {/* Dot */}
              <div
                className="absolute left-0 top-1 md:left-2 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: palette.bg,
                  border: `2px solid ${palette.dot}`,
                  boxShadow: `0 0 12px ${palette.glow}`,
                }}
              >
                <span className="text-xs font-bold tabular-nums" style={{ color: palette.dot }}>
                  {i + 1}
                </span>
              </div>

              {/* Content card */}
              <div
                className="flex-1 rounded-xl p-4 border"
                style={{ background: palette.bg, borderColor: palette.border }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: palette.dot }}
                  >
                    {monthLabel}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {step}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
