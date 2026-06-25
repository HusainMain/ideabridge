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
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-6"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-5 md:p-6">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-[0.75rem] font-mono text-cyan-400 tracking-widest uppercase">
              Idea Validation Report
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
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
