import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AnalysisSectionCardProps {
  title: string;
  icon: React.ElementType;
  description: string;
  bullets: string[];
  accentColor?: string;
  delay?: number;
  /** Optionally render a custom child instead of the default bullet list */
  children?: React.ReactNode;
}

export function AnalysisSectionCard({
  title,
  icon: Icon,
  description,
  bullets,
  accentColor = 'var(--act-cyan)',
  delay = 0,
  children,
}: AnalysisSectionCardProps) {
  const [expanded, setExpanded] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="rounded-xl border overflow-hidden group"
      style={{
        background: '#0d0d0d',
        borderColor: 'rgba(255,255,255,0.07)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ boxShadow: `0 0 0 1px ${accentColor}22, 0 8px 32px rgba(0,0,0,0.4)` }}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-4 p-5 md:p-6 text-left focus:outline-none"
        aria-expanded={expanded}
      >
        {/* Icon */}
        <div
          className="p-2 rounded-lg flex-shrink-0 mt-0.5 transition-colors duration-200"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}28`,
          }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base text-white">{title}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
            >
              {bullets.length} points
            </span>
          </div>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--act-muted)' }}>
            {description}
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 mt-1"
          style={{ color: 'var(--act-muted)' }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
              <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />
              {children ?? (
                <ul className="space-y-3">
                  {bullets.map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 text-sm leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.72)' }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: accentColor }}
                      />
                      {point}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
