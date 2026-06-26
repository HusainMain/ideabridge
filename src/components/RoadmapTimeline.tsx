import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Milestone {
  title: string;
  desc: string;
  details: string[];
  align: 'left' | 'right';
}

const milestones: Milestone[] = [
  {
    title: '1. Guided Inputs',
    desc: 'Three focused fields shape everything that follows.',
    details: ['Your startup idea in plain language', 'Your target audience', 'Your current stage'],
    align: 'left',
  },
  {
    title: '2. AI Analysis',
    desc: 'IdeaBridge reads your inputs and generates a structured workspace.',
    details: ['Idea fit — clarity and audience match', 'Funding fit — which sources apply and why', 'Mentor and incubator fit by stage'],
    align: 'right',
  },
  {
    title: '3. Results Workspace',
    desc: 'A single page with everything relevant, nothing that is not.',
    details: ['Top recommendation with 3 actions', 'Personalized dos and don\'ts', 'AI reasoning — not just a score'],
    align: 'left',
  },
  {
    title: '4. Connections',
    desc: 'Matches shown with context, not just names.',
    details: ['Mentor matches with reason for match', 'Funding sources with eligibility context', 'Incubators by stage, location, and benefits'],
    align: 'right',
  },
  {
    title: '5. Save & Export',
    desc: 'The workspace is yours to keep, edit, and share.',
    details: ['Edit inputs and regenerate anytime', 'Save or share the workspace link', 'Export a PDF-ready report'],
    align: 'left',
  },
];

// Pre-computed ranges for each of the 5 milestones — no hooks inside loops
// Cards 1-4 fade in and gently fade out as user scrolls past.
// Card 5 (index 4) fades in and HOLDS at full opacity until section ends.
const SCALE_RANGES = milestones.map((_, i) => {
  const s = i * 0.2;
  const e = (i + 1) * 0.2;
  const mid = (s + e) / 2;
  // Card 5: hold scale at peak until the end
  if (i === 4) return { input: [Math.max(0, s - 0.1), mid, 1], output: [0.9, 1.05, 1.0] };
  return { input: [Math.max(0, s - 0.1), mid, Math.min(1, e + 0.1)], output: [0.9, 1.05, 0.9] };
});

const OPACITY_RANGES = milestones.map((_, i) => {
  const s = i * 0.2;
  const e = (i + 1) * 0.2;
  const mid = (s + e) / 2;
  // Card 5: fade in then HOLD at 1 — do not fade out before section exits
  if (i === 4) return { input: [Math.max(0, s - 0.1), mid, 1], output: [0.05, 1, 1] };
  return { input: [Math.max(0, s - 0.1), mid, Math.min(1, e + 0.1)], output: [0.05, 1, 0.05] };
});

// Spread cards more evenly to match the larger container height
const VERTICAL_POSITIONS = milestones.map((_, i) => 12 + i * 18);

function MilestoneCard({
  milestone,
  index,
  scrollYProgress,
}: {
  milestone: Milestone;
  index: number;
  scrollYProgress: import('framer-motion').MotionValue<number>;
}) {
  const cardScale = useTransform(scrollYProgress, SCALE_RANGES[index].input, SCALE_RANGES[index].output);
  const cardOpacity = useTransform(scrollYProgress, OPACITY_RANGES[index].input, OPACITY_RANGES[index].output);
  const verticalPos = VERTICAL_POSITIONS[index];
  const m = milestone;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: `${verticalPos}%`,
        transform: 'translateY(-50%)',
        left: m.align === 'left' ? '5%' : 'auto',
        right: m.align === 'right' ? '5%' : 'auto',
        width: '42%',
        scale: cardScale,
        opacity: cardOpacity,
        zIndex: 5,
      }}
    >
      <div
        className={`glass-panel glow-card-${index % 2 === 0 ? 'cyan' : 'purple'}`}
        style={{ padding: '1.25rem 1.5rem', position: 'relative', borderRadius: '12px' }}
      >
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
          {m.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
          {m.desc}
        </p>
        <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
          {m.details.map((detail) => (
            <li key={detail} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.58)', marginBottom: '0.3rem', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--neon-cyan)', flexShrink: 0, marginTop: '0.05em' }}>·</span>
              {detail}
            </li>
          ))}
        </ul>
        {/* Connector pointer to centerline */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: m.align === 'left' ? '-10px' : 'auto',
            left: m.align === 'right' ? '-10px' : 'auto',
            transform: 'translateY(-50%) rotate(45deg)',
            width: '12px',
            height: '12px',
            background: 'inherit',
            borderRight: m.align === 'left' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            borderTop: m.align === 'left' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            borderLeft: m.align === 'right' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            borderBottom: m.align === 'right' ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}
        />
      </div>
    </motion.div>
  );
}

export const RoadmapTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const orbTop = useTransform(scrollYProgress, [0, 1], ['15%', '85%']);
  const lineFillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div
      ref={containerRef}
      id="section-roadmap"
      className="pinned-section-container"
      // Increased height gives card 5 enough dwell time before the section exits
      style={{ height: '420vh', background: '#020711', position: 'relative' }} 
    >
      <div className="pinned-viewport">
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60vw', height: '60vh',
            background: 'radial-gradient(circle, rgba(169,134,255,0.03) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }}
        />

        <div
          style={{
            maxWidth: '1200px', width: '100%', height: '100%',
            position: 'relative', padding: '2rem',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem', height: '10%' }}>
            <span
              style={{
                color: 'var(--neon-purple)', fontSize: '0.75rem',
                fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
              }}
            >
              Execution Path
            </span>
            <h2
              className="text-gradient-purple-cyan text-glow-header"
              style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '-0.02em' }}
            >
              Growth Roadmap
            </h2>
          </div>

          {/* Timeline Wrapper */}
          <div style={{ position: 'relative', width: '100%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Center Line Track */}
            <div className="timeline-centerline">
              <motion.div className="timeline-progress-fill" style={{ height: lineFillHeight }} />
            </div>

            {/* Floating Orb Anchor */}
            <motion.div
              className="orb-anchor"
              data-stage={6}
              data-section-id="section-roadmap"
              style={{
                position: 'absolute',
                left: '50%',
                top: orbTop,
                transform: 'translate(-50%, -50%)',
                width: '60px', height: '60px',
                pointerEvents: 'none', zIndex: 10,
              }}
            />

            {/* Milestones — rendered as proper components, no hooks in loops */}
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {milestones.map((m, i) => (
                <MilestoneCard
                  key={m.title}
                  milestone={m}
                  index={i}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
