import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { Sparkles, MapPin, Building2, Calendar } from 'lucide-react';

export function ReportHeader(): React.ReactElement {
  const { inputs } = useJourneyStore();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper component for metadata items
  const Meta = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-cyan-400" />
      <div className="flex flex-col">
        <span className="text-[0.7rem] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-slate-200">{value}</span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-4"
    >
      <div
        className="relative overflow-hidden rounded-xl border border-white/10 p-5 md:p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(7,13,27,0.98) 0%, rgba(5,10,22,0.95) 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.5), 0 0 60px rgba(0,240,255,0.03)',
        }}
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        <div className="relative flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[0.7rem] font-mono text-cyan-400 tracking-widest uppercase">
              Idea Validation Report
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-semibold text-white tracking-tight leading-tight">
            {inputs.idea}
          </h1>

          {/* Compact metadata row */}
          <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-white/5">
            <Meta icon={Building2} label="Industry" value={inputs.industry} />
            <Meta icon={MapPin} label="Market" value={inputs.country} />
            <Meta icon={Calendar} label="Generated" value={currentDate} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
