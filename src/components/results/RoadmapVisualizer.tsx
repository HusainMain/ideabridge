import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { Map } from 'lucide-react';

// Accent colors cycle for each phase
const PHASE_COLORS = [
  '#00f0ff', // cyan
  '#a986ff', // purple
  '#22c55e', // emerald
  '#ffae42', // amber
  '#3b82f6', // blue
  '#f87171', // rose
];

export function RoadmapVisualizer(): React.ReactElement | null {
  const { results } = useJourneyStore();
  
  if (!results) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-cyan-400" />
        <h2 className="text-[0.75rem] font-mono text-cyan-400 tracking-widest uppercase">MVP Roadmap</h2>
      </div>

      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="space-y-3">
          {results.roadmap.map((step, idx) => {
            const color = PHASE_COLORS[idx % PHASE_COLORS.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="relative flex items-start gap-3"
              >
                {/* Timeline dot */}
                <div
                  className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                  style={{
                    background: 'rgba(7,13,27,0.9)',
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 8px ${color}44`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                
                {/* Timeline item content */}
                <div
                  className="flex-1 rounded-lg border border-white/8 px-4 py-3"
                  style={{ background: 'rgba(7,13,27,0.88)' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="text-[0.62rem] font-mono uppercase tracking-widest"
                      style={{ color }}
                    >
                      Phase {idx + 1}
                    </span>
                    <span className="text-[0.62rem] font-mono text-slate-500">
                      Step {idx + 1} of {results.roadmap.length}
                    </span>
                  </div>
                  <p className="text-[0.82rem] leading-6 text-slate-300">{step}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
