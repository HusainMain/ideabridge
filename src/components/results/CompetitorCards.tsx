import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { Sword, Shield, Zap } from 'lucide-react';

export function CompetitorCards(): React.ReactElement | null {
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
        <Sword className="w-5 h-5 text-purple-400" />
        <h2 className="text-[0.75rem] font-mono text-purple-400 tracking-widest uppercase">Competitive Landscape</h2>
      </div>

      <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.competitors.map((comp, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-5 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {comp.name.charAt(0)}
              </div>
              <h3 className="text-base font-semibold text-white">{comp.name}</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-[0.7rem] text-slate-500 uppercase tracking-widest mb-1.5">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>Weakness</span>
                </div>
                <p className="text-sm text-slate-300 leading-7">{comp.weakness}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 text-[0.7rem] text-slate-500 uppercase tracking-widest mb-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Your Advantage</span>
                </div>
                <p className="text-sm text-slate-300 leading-7">{comp.yourEdge}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
