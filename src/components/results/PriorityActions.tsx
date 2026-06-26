import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Flame, Zap, Lightbulb } from 'lucide-react';

interface PriorityActionsProps {
  actions: string[];
}

type Priority = 'high' | 'medium' | 'future';

interface ActionItem {
  text: string;
  priority: Priority;
}

const PRIORITY_CONFIG = {
  high: {
    label: 'High Priority',
    Icon: Flame,
    color: '#ff6b6b',
    order: 0,
  },
  medium: {
    label: 'Medium Priority',
    Icon: Zap,
    color: '#ffae42',
    order: 1,
  },
  future: {
    label: 'Future Opportunity',
    Icon: Lightbulb,
    color: '#a986ff',
    order: 2,
  },
} as const;

/** Deterministically assign priority based on bullet index + content length */
function assignPriority(text: string, index: number): Priority {
  if (index === 0) return 'high';
  if (index === 1) return 'high';
  if (index === 2 || (text.length > 80 && index === 3)) return 'medium';
  if (index === 3) return 'medium';
  return 'future';
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold flex-shrink-0"
      style={{ background: 'rgba(0,0,0,0.2)', color: cfg.color }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export function PriorityActions({ actions }: PriorityActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-40px' });

  const items: ActionItem[] = actions.map((text, i) => ({
    text,
    priority: assignPriority(text, i),
  }));

  const groups: Record<Priority, ActionItem[]> = { high: [], medium: [], future: [] };
  items.forEach(item => groups[item.priority].push(item));

  return (
    <div ref={containerRef} className="flex flex-col gap-5">
      {(['high', 'medium', 'future'] as Priority[]).map(priority => {
        const group = groups[priority];
        if (group.length === 0) return null;
        const cfg = PRIORITY_CONFIG[priority];
        const Icon = cfg.Icon;

        return (
          <div key={priority}>
            {/* Group header with pill background */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5"
              style={{ background: `${cfg.color}14`, border: `1px solid ${cfg.color}30` }}
            >
              <Icon size={11} style={{ color: cfg.color }} />
              <span
                className="text-[0.62rem] font-bold uppercase tracking-widest"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {group.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.05 + (PRIORITY_CONFIG[priority].order * 0.08), duration: 0.35 }}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* Colored dot indicator instead of icon + circle */}
                  <div
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[0.4rem]"
                    style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}88` }}
                  />
                  <p className="text-[0.82rem] leading-6 flex-1 text-slate-300">
                    {item.text}
                  </p>
                  <PriorityBadge priority={priority} />
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
