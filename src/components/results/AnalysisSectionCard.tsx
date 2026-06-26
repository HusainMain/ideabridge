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
  const colorMap: Record<typeof color, { text: string; border: string; from: string; iconBg: string }> = {
    emerald: { text: 'text-emerald-400', border: 'border-emerald-500/30', from: 'from-emerald-500/20', iconBg: 'bg-emerald-500/10' },
    blue:    { text: 'text-blue-400',    border: 'border-blue-500/30',    from: 'from-blue-500/20',    iconBg: 'bg-blue-500/10'    },
    cyan:    { text: 'text-cyan-400',    border: 'border-cyan-500/30',    from: 'from-cyan-500/20',    iconBg: 'bg-cyan-500/10'    },
    purple:  { text: 'text-purple-400',  border: 'border-purple-500/30',  from: 'from-purple-500/20',  iconBg: 'bg-purple-500/10'  },
    yellow:  { text: 'text-yellow-400',  border: 'border-yellow-500/30',  from: 'from-yellow-500/20',  iconBg: 'bg-yellow-500/10'  },
    rose:    { text: 'text-rose-400',    border: 'border-rose-500/30',    from: 'from-rose-500/20',    iconBg: 'bg-rose-500/10'    },
  };

  const cfg = colorMap[color] ?? colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col overflow-hidden rounded-xl border border-white/10"
      style={{ background: 'rgba(7,13,27,0.88)' }}
    >
      {/* Top accent stripe — color-coded per section */}
      <div className={`h-px w-full bg-gradient-to-r ${cfg.from} to-transparent`} />

      {/* Card Header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-white/5`}>
        <div className={`p-1.5 rounded-md ${cfg.iconBg} border ${cfg.border}`}>
          {icon}
        </div>
        <h3 className="text-[0.95rem] font-semibold text-white">{title}</h3>
      </div>

      {/* Card Content */}
      <div className="px-5 py-4">
        {children ? (
          children
        ) : (
          <ul className="space-y-2.5">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className={`mt-0.5 w-[15px] h-[15px] flex-shrink-0 ${cfg.text}`} />
                <span className="text-[0.82rem] leading-6 text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
