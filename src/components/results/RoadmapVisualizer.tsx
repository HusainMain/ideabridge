import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { Map } from 'lucide-react';

export function RoadmapVisualizer(): React.ReactElement | null {
  const { results } = useJourneyStore();
  
  if (!results) return null;
  
  // Phases with approximate timeframes
  const phases = [
    { title: 'MVP Build', timeframe: 'Weeks 1-4', color: '#00f0ff' },
    { title: 'Validation', timeframe: 'Weeks 5-8', color: '#a986ff' },
    { title: 'Scale', timeframe: 'Months 3-6', color: '#22c55e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-4 h-4 text-cyan-400" />
        <h2 className="text-[0.7rem] font-mono text-cyan-400 tracking-widest uppercase">MVP Roadmap</h2>
      </div>

      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800" />

        <div className="space-y-2">
          {results.roadmap.map((step, idx) => {
            const phase = phases[idx % phases.length];
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
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2" style={{ borderColor: phase.color }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phase.color }} />
                </div>
                
                {/* Timeline item content */}
                <div className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[0.65rem] font-mono text-slate-500 uppercase tracking-widest">
                      {phase.title}
                    </span>
                    <span className="text-[0.65rem] font-mono text-slate-400">
                      {phase.timeframe}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{step}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
