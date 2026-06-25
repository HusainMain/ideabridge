import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface AnalysisSectionCardProps {
  title: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'cyan' | 'purple' | 'yellow' | 'rose';
  points: string[];
  children?: React.ReactNode;
}

export default function AnalysisSectionCard({
  title,
  icon,
  color,
  points,
  children
}: AnalysisSectionCardProps): React.ReactElement {
  
  // Color mapping for consistency
  const colorMap = {
    emerald: 'text-emerald-400 border-emerald-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    cyan: 'text-cyan-400 border-cyan-500/30',
    purple: 'text-purple-400 border-purple-500/30',
    yellow: 'text-yellow-400 border-yellow-500/30',
    rose: 'text-rose-400 border-rose-500/30',
  };

  const colorClass = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/80"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className={`p-1.5 rounded-md bg-white/5 border ${colorClass.split(' ')[1]}`}>
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {children ? (
          children
        ) : (
          <ul className="space-y-2">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className={`mt-0.5 w-3.5 h-3.5 flex-shrink-0 ${colorClass.split(' ')[0]}`} />
                <span className="text-xs leading-relaxed text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
