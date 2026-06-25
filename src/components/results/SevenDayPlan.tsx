import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { Calendar, CheckCircle2 } from 'lucide-react';

export function SevenDayPlan(): React.ReactElement | null {
  const { results } = useJourneyStore();
  
  if (!results) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-yellow-400" />
        <h2 className="text-[0.7rem] font-mono text-yellow-400 tracking-widest uppercase">Next 7 Days</h2>
      </div>

      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
        {results.nextSevenDays.map((task, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-4 flex items-start gap-2.5"
          >
            <div className="mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-[0.65rem] font-mono text-yellow-400 uppercase tracking-widest mb-1">
              Day {idx + 1}
            </div>
              <p className="text-xs leading-relaxed text-slate-300">{task}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
