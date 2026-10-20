import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type Variants } from 'framer-motion';
import {
  howItWorks,
  scanCards,
  readinessReasons,
  ecosystemNodes,
  CARD_THRESHOLDS,
  SCAN_ORB_PROGRESS,
  SCAN_ORB_TOPS,
} from './constants';
import { OrbAnchor } from './HeroPanels';
import { useSmoothProgress } from '../useSmoothProgress';

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Orb dwells at each step, then moves to next. The spring keeps the rail
  // moving between wheel notches instead of stepping 25% of the pipeline at
  // once.
  const smoothProgress = useSmoothProgress(scrollYProgress);
  const orbLeft = useTransform(
    smoothProgress,
    [0, 0.08, 0.30, 0.52, 0.74, 1],
    ['12.5%', '12.5%', '37.5%', '62.5%', '87.5%', '87.5%'],
  );

  const stepOpacity = [
    useTransform(smoothProgress, [0, 0.08], [0.4, 1]),
    useTransform(smoothProgress, [0.18, 0.30], [0.4, 1]),
    useTransform(smoothProgress, [0.40, 0.52], [0.4, 1]),
    useTransform(smoothProgress, [0.62, 0.74], [0.4, 1]),
  ];

  return (
    <div ref={sectionRef} id="section-how-it-works" className="pinned-section-container how-works-pinned">
      <div className="pinned-viewport">
        <div className="how-works-section how-works-section--pinned">
          <div className="section-shell">
            <div className="section-heading">
              <span className="act-label">How IdeaBridge Works</span>
              <h2 className="text-gradient-purple-cyan text-glow-header">
                From <span className="story-accent">Idea</span> input to startup action plan.
              </h2>
              <p>
                Enter a startup idea. IdeaBridge returns a focused results workspace:
                a top recommendation, dos and don'ts, mentor matches, funding sources,
                incubators, and an exportable report.
              </p>
            </div>
            <div className="how-pipeline">
              <div className="how-pipeline__line" />
              <motion.div
                className="orb-anchor how-pipeline__orb-anchor"
                data-stage={1}
                data-section-id="section-how-it-works"
                style={{ left: orbLeft }}
                aria-hidden="true"
              />
              {howItWorks.map(([title, body], index) => (
                <motion.div key={title} className="how-step" style={{ opacity: stepOpacity[index], willChange: 'opacity' }}>
                  <span className="how-step__num">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



export function ReadinessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activatedCards, setActivatedCards] = useState<boolean[]>(() => Array(readinessReasons.length).fill(false));
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const CARD_THRESHOLDS = [0.15, 0.35, 0.55, 0.75];

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setActivatedCards((prev) => {
      const next = [...prev];
      let changed = false;
      CARD_THRESHOLDS.forEach((t, i) => {
        const shouldBeActive = latest >= t;
        if (shouldBeActive !== next[i]) {
          next[i] = shouldBeActive;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  });

  return (
    <section ref={sectionRef} id="section-readiness" className="pinned-section-container pinned-section-container--story readiness-section">
      <div className="pinned-viewport">
        <div className="section-shell">
          <div className="readiness-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="act-label">Startup Readiness</span>
            <h2 className="text-gradient-purple-cyan text-glow-header" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', margin: 0 }}>
              A <span className="story-accent">Readiness</span> dashboard with reasons attached.
            </h2>
            <p style={{ margin: '0.5rem auto 0', maxWidth: '600px', color: 'rgba(255,255,255,0.6)' }}>
              No arbitrary stats or inflated scores. We focus purely on qualitative evidence.
            </p>
          </div>

          <div className="readiness-triple">
            {/* Left Column (Cards 1 & 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[0, 2].map((idx) => {
                const item = readinessReasons[idx];
                return (
                  <motion.div
                    key={item.heading}
                    initial={{ opacity: 0.22, x: -15 }}
                    animate={{ opacity: activatedCards[idx] ? 1 : 0.22, x: activatedCards[idx] ? 0 : -15 }}
                    transition={{ duration: 0.4 }}
                    className={`glass-panel readiness-reason-card readiness-reason-card--motion glow-card-${idx % 2 === 0 ? 'cyan' : 'purple'} ${!activatedCards[idx] ? 'readiness-reason-card--inactive' : ''}`}
                    style={{ minHeight: '150px', padding: '1.25rem', willChange: 'opacity, transform' }}
                  >
                    <span className="readiness-reason-card__icon">{item.icon}</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '1rem', marginTop: '0.5rem' }}>{item.heading}</strong>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', lineHeight: 1.5 }}>{item.body}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Center Column (Orb Container) */}
            <div
              className="readiness-orb-column"
              style={{
                position: 'relative',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Glass circular boundary for orb focus */}
              <motion.div 
                animate={{ 
                  boxShadow: ['inset 0 0 20px rgba(255,255,255,0.02)', 'inset 0 0 40px rgba(0,240,255,0.06)', 'inset 0 0 20px rgba(255,255,255,0.02)'],
                  borderColor: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'radial-gradient(circle, rgba(0, 240, 255, 0.03) 0%, transparent 70%)',
                }} 
              />
              
              <div
                className="orb-anchor"
                data-stage={3}
                data-section-id="section-readiness"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '150px',
                  height: '150px',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
                aria-hidden="true"
              />
            </div>

            {/* Right Column (Cards 2 & 4) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[1, 3].map((idx) => {
                const item = readinessReasons[idx];
                return (
                  <motion.div
                    key={item.heading}
                    initial={{ opacity: 0.22, x: 15 }}
                    animate={{ opacity: activatedCards[idx] ? 1 : 0.22, x: activatedCards[idx] ? 0 : 15 }}
                    transition={{ duration: 0.4 }}
                    className={`glass-panel readiness-reason-card readiness-reason-card--motion glow-card-${idx % 2 === 0 ? 'cyan' : 'purple'} ${!activatedCards[idx] ? 'readiness-reason-card--inactive' : ''}`}
                    style={{ minHeight: '150px', padding: '1.25rem', willChange: 'opacity, transform' }}
                  >
                    <span className="readiness-reason-card__icon">{item.icon}</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '1rem', marginTop: '0.5rem' }}>{item.heading}</strong>
                    <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', lineHeight: 1.5 }}>{item.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


export function EcosystemMap() {
  return (
    <section id="section-ecosystem" className="ecosystem-section">
      <div className="section-shell">
        <div className="section-heading">
          <span className="act-label">Startup Ecosystem</span>
          <h2 className="text-gradient-purple-cyan text-glow-header">
            A clear <span className="story-accent">Results Workspace</span>, not inflated promises.
          </h2>
          <p>
            The workspace keeps the decision canvas simple: what to do next, what to avoid,
            who can help, where funding may fit, and which incubators match the stage.
          </p>
        </div>

        <div className="ecosystem-map">
          <svg className="connector-svg" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
            <path className="connector-line" d="M500 280 C330 80 180 80 120 120 M500 280 C660 80 820 80 880 120 M500 280 C250 250 180 250 100 280 M500 280 C750 250 820 250 900 280 M500 280 C330 480 180 480 120 440 M500 280 C660 480 820 480 880 440" fill="none" stroke="rgba(0,240,255,0.22)" strokeWidth="2" />
          </svg>
          <div className="ecosystem-core">
            <OrbAnchor id="section-ecosystem" stage={5} className="ecosystem-orb-anchor" />
            <span>IdeaBridge</span>
            <strong>Results Workspace</strong>
          </div>
          {ecosystemNodes.map(([type, name, idea], index) => (
            <motion.div
              key={`${type}-${name}`}
              className={`glass-panel ecosystem-node ecosystem-node--${index + 1}`}
              initial={{ opacity: 0.45, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: '-120px' }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <span>{type}</span>
              <strong>{name}</strong>
              <small>{idea}</small>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


export function AIAnalysisSection({ scanVariants }: { scanVariants: Variants }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activatedCards, setActivatedCards] = useState<boolean[]>(
    () => Array(scanCards.length).fill(false),
  );
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSmoothProgress(scrollYProgress);
  const scanOrbTop = useTransform(smoothProgress, SCAN_ORB_PROGRESS, SCAN_ORB_TOPS);
  // Completion glow fades in after all cards activate
  const completionOpacity = useTransform(scrollYProgress, [0.76, 0.88, 0.94, 1], [0, 1, 1, 0]);
  const completionScale = useTransform(scrollYProgress, [0.76, 0.88], [0.94, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setActivatedCards((prev) => {
      const next = [...prev];
      let changed = false;
      CARD_THRESHOLDS.forEach((t, i) => {
        const shouldBeActive = latest >= t;
        if (shouldBeActive !== next[i]) { next[i] = shouldBeActive; changed = true; }
      });
      return changed ? next : prev;
    });
  });

  return (
    <section ref={sectionRef} id="section-ai" className="pinned-section-container pinned-section-container--story ai-section">
      <div className="pinned-viewport">
        <div className="section-shell split-story">
          <div>
            <span className="act-label">AI Analysis</span>
            <h2 className="text-gradient-purple-cyan text-glow-header">
              The <span className="story-accent">AI Analysis</span> scanner turns uncertainty into signals.
            </h2>
            <p>
              IdeaBridge analyzes your idea, audience, and stage, then prepares the
              recommendation, dos and don'ts, mentor matches, funding sources, and incubators.
            </p>
          </div>
          <div className="scanner-viewport glass-panel scanner-panel scanner-panel--active">
            <div className="scanner-diagnostics" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="scanner-grid" aria-hidden="true" />
            <div className="scanner-pulse scanner-pulse--one" aria-hidden="true" />
            <div className="scanner-pulse scanner-pulse--two" aria-hidden="true" />
            {/* Orb anchor moves vertically through the scanner panel */}
            <motion.div
              className="orb-anchor"
              data-stage={2}
              data-section-id="section-ai"
              style={{
                position: 'absolute',
                left: '50%',
                top: scanOrbTop,
                transform: 'translate(-50%, -50%)',
                width: '52px',
                height: '52px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
              aria-hidden="true"
            />
            <div className="scanner-beam" />
            {scanCards.map(([title, body], index) => (
              <motion.div
                key={title}
                custom={index}
                variants={scanVariants}
                initial="hidden"
                animate={activatedCards[index] ? 'visible' : 'hidden'}
                className={`glass-panel scan-card glow-card-${index % 2 === 0 ? 'cyan' : 'purple'}`}
                style={{ willChange: 'opacity, transform' }}
              >
                <strong>{title}</strong>
                <p>{body}</p>
              </motion.div>
            ))}
            {/* Soft completion state after all cards — no dead space */}
            <motion.div
              className="scanner-complete"
              style={{ opacity: completionOpacity, scale: completionScale, x: '-50%' }}
              aria-hidden="true"
            >
              <span>Analysis Complete</span>
              <strong>Workspace signals locked</strong>
              <div />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

