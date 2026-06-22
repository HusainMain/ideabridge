import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const workspaceModules = [
  {
    label: 'Guided Inputs',
    title: 'Idea, audience, stage',
    body: 'The workspace starts with the founder context needed to make the analysis specific.',
  },
  {
    label: 'Recommendation',
    title: 'Best next step',
    body: 'The top action is paired with clear reasoning and a short list of practical follow-ups.',
  },
  {
    label: 'Do / Avoid',
    title: 'Personalized guidance',
    body: 'Founders see what to focus on now and what would waste time at the current stage.',
  },
  {
    label: 'Matches',
    title: 'Mentors, funding, incubators',
    body: 'Each match includes why it fits, eligibility context, and stage-relevant details.',
  },
  {
    label: 'Export',
    title: 'PDF-ready report',
    body: 'The result can be saved, shared, and exported without turning into a bloated dashboard.',
  },
];

export const StartupStats: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbLeft = useTransform(scrollYProgress, [0.12, 0.88], ['8%', '92%']);

  return (
    <section ref={sectionRef} id="section-stats" className="workspace-section">
      <div className="section-shell workspace-shell">
        <div className="section-heading workspace-heading">
          <span className="act-label">Focused Workspace</span>
          <h2 className="text-glow-header text-gradient-purple-cyan">
            One workspace that explains what to do next.
          </h2>
          <p>
            No vanity counters or inflated feature claims. The output is organized around
            the decisions an early founder actually needs to make.
          </p>
        </div>

        <div className="workspace-map" aria-label="IdeaBridge workspace modules">
          <motion.div
            className="orb-anchor workspace-orb-anchor"
            data-stage={6}
            data-section-id="section-stats"
            aria-hidden="true"
            style={{ left: orbLeft }}
          />
          <div className="workspace-map__rail" aria-hidden="true" />
          {workspaceModules.map((item, index) => (
            <motion.div
              key={item.label}
              className="glass-panel workspace-module"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
