import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useTransform, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BridgeSection } from '../components/BridgeSection';
import { OrbController } from '../components/OrbController';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { StartupStats } from '../components/StartupStats';

const startupExamples = [
  'AI Farming Assistant',
  'Solar-Powered Coffee Roaster',
  'Smart Waste Management Platform',
];

const chatLines = startupExamples.map((idea) => `Analyze this idea: ${idea}`);

const howItWorks = [
  ['Enter Your Idea', 'Describe the startup you want to build in plain language.'],
  ['Get AI Analysis', 'IdeaBridge analyzes the idea, funding fit, mentor fit, and incubator fit.'],
  ['Review Results Workspace', 'See a top recommendation, dos and don’ts, mentors, funding, and incubators.'],
  ['Save Or Export', 'Edit inputs, save or share the workspace, and export the report.'],
];

const scanCards = [
  ['Idea Fit', 'Parses the idea, audience, and current stage from the guided input flow.'],
  ['Funding Fit', 'Checks which funding sources are most relevant and why they match.'],
  ['Mentor Fit', 'Finds mentor matches and explains the reason for each match.'],
  ['Incubator Fit', 'Identifies incubators by stage, location, and benefits.'],
  ['Workspace Ready', 'Prepares the top recommendation, actions, dos and don’ts, and report output.'],
];

const readinessReasons = [
  { icon: '01', heading: 'Idea is clearly defined', body: 'Your concept describes a specific audience and a concrete problem, which gives the analysis a useful starting point.' },
  { icon: '02', heading: 'Stage fits the platform', body: 'IdeaBridge is calibrated for early-stage founders. Results are matched to where you actually are, not where a pitch deck says you should be.' },
  { icon: '03', heading: 'Mentor matches are grounded', body: 'Matches are based on sector overlap and founder background. Each match shows the exact reason it was made.' },
  { icon: '04', heading: 'Funding sources are realistic', body: 'Funding and incubator suggestions are framed with eligibility, stage, location, and deadline context.' },
];

const mentors = [
  ['SJ', 'Sarah Jenkins', 'Product Manager at TechFlow', 'Matched for industry sector experience.'],
  ['DC', 'David Chen', '2x Exit Founder', 'Matched for building and selling a similar marketplace.'],
  ['AR', 'Aisha Rahman', 'Climate Tech VC Partner', 'Matched for deep domain fit in sustainability and hardware.'],
  ['MK', 'Mike Kim', 'B2B SaaS Founder', 'Matched for GTM expertise in selling to enterprise buyers.'],
];

const ecosystemNodes = [
  ['Top Recommendation', 'Best next step', 'Reasoning + 3 actions'],
  ['Dos & Don’ts', 'Personalized analysis', 'What to focus on and avoid'],
  ['Mentor Matches', 'Why matched', 'Reach-out context'],
  ['Funding Sources', 'Eligibility + fit', 'Deadlines and match score'],
  ['Incubators', 'Stage + location', 'Benefits and fit'],
  ['Save / Share', 'Export report', 'PDF and shareable workspace'],
];

const fundingCards = [
  ['Micro-Grant Initiative', '92% fit', 'Pre-seed grant match with eligibility and deadline context.'],
  ['Seed Angel Syndicate', '75% fit', 'Equity funding source shown with stage fit and rolling deadline.'],
  ['LaunchPad Tech', 'Idea stage', 'Incubator match with stipend, credits, and weekly mentorship benefits.'],
];

function ChatPreview() {
  const [lineIndex, setLineIndex] = useState(0);
  const charSpanRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef('');
  const tickRef = useRef<number | null>(null);
  const pauseRef = useRef<number | null>(null);

  useEffect(() => {
    const line = chatLines[lineIndex];
    typedRef.current = '';
    if (charSpanRef.current) charSpanRef.current.textContent = '';

    const type = () => {
      if (typedRef.current.length < line.length) {
        typedRef.current = line.slice(0, typedRef.current.length + 1);
        if (charSpanRef.current) charSpanRef.current.textContent = typedRef.current;
        tickRef.current = window.setTimeout(type, 24);
      } else {
        pauseRef.current = window.setTimeout(() => {
          setLineIndex((i) => (i + 1) % chatLines.length);
        }, 1300);
      }
    };

    tickRef.current = window.setTimeout(type, 80);
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      if (pauseRef.current) window.clearTimeout(pauseRef.current);
    };
  }, [lineIndex]);

  return (
    <div className="glass-panel--elevated chat-preview-container" style={{ padding: '1rem' }}>
      <div className="chat-message-user">{startupExamples[lineIndex]}</div>
      <div className="chat-message-ai">
        <span ref={charSpanRef} />
        <span className="chat-cursor" />
      </div>
    </div>
  );
}

function OrbAnchor({ id, stage, className = '' }: { id: string; stage: number; className?: string }) {
  return (
    <div
      className={`orb-anchor ${className}`}
      data-stage={stage}
      data-section-id={id}
      aria-hidden="true"
    />
  );
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Orb dwells at each step, then moves to next
  const orbLeft = useTransform(
    scrollYProgress,
    [0, 0.08, 0.30, 0.52, 0.74, 1],
    ['12.5%', '12.5%', '37.5%', '62.5%', '87.5%', '87.5%'],
  );

  const stepOpacity = [
    useTransform(scrollYProgress, [0, 0.08], [0.4, 1]),
    useTransform(scrollYProgress, [0.18, 0.30], [0.4, 1]),
    useTransform(scrollYProgress, [0.40, 0.52], [0.4, 1]),
    useTransform(scrollYProgress, [0.62, 0.74], [0.4, 1]),
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


function ReadinessSection() {
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px 1fr',
            gap: '2rem',
            alignItems: 'center',
            minHeight: '440px',
            position: 'relative',
          }}>
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
                    className={`glass-panel readiness-reason-card glow-card-${idx % 2 === 0 ? 'cyan' : 'purple'} ${!activatedCards[idx] ? 'readiness-reason-card--inactive' : ''}`}
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
            <div style={{
              position: 'relative',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
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
                    className={`glass-panel readiness-reason-card glow-card-${idx % 2 === 0 ? 'cyan' : 'purple'} ${!activatedCards[idx] ? 'readiness-reason-card--inactive' : ''}`}
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

function EcosystemMap() {
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

const CARD_THRESHOLDS = [0.08, 0.24, 0.40, 0.56, 0.72];
const CARD_TOP_POS = ['8%', '26%', '44%', '62%', '80%'];
// Orb dwells at 80% after last card then exits — avoids dead space
const SCAN_ORB_PROGRESS = [0, 0.06, ...CARD_THRESHOLDS, 0.88, 1];
const SCAN_ORB_TOPS     = ['0%', '8%', ...CARD_TOP_POS, '85%', '95%'];

function AIAnalysisSection({ scanVariants }: { scanVariants: Variants }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activatedCards, setActivatedCards] = useState<boolean[]>(
    () => Array(scanCards.length).fill(false),
  );
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const scanOrbTop = useTransform(scrollYProgress, SCAN_ORB_PROGRESS, SCAN_ORB_TOPS);
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


function LaunchPad() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: '0px 0px -20% 0px', amount: 0.45, once: true });
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const unlockRef = useRef<(() => void) | null>(null);
  const [timelineMs, setTimelineMs] = useState(0);
  const [sequenceComplete, setSequenceComplete] = useState(false);

  const SEQUENCE_DURATION = 7500;
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const easeInOutCubic = (value: number) =>
    value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const ramp = (timeMs: number, startMs: number, endMs: number) => {
    if (endMs <= startMs) return timeMs >= endMs ? 1 : 0;
    return clamp((timeMs - startMs) / (endMs - startMs), 0, 1);
  };

  const timelineProgress = timelineMs / SEQUENCE_DURATION;
  const arrivalEase = easeInOutCubic(ramp(timelineMs, 0, 500));
  const beamEase = easeInOutCubic(ramp(timelineMs, 500, 1000));
  const transferEase = easeInOutCubic(ramp(timelineMs, 1000, 3000));
  const postTransferEase = easeInOutCubic(ramp(timelineMs, 3500, 4200));
  const warmupEase = easeInOutCubic(ramp(timelineMs, 4200, 5300));
  const exhaustEase = easeInOutCubic(ramp(timelineMs, 5300, 6000));
  const launchEase = easeInOutCubic(ramp(timelineMs, 6000, 6800));
  const revealEase = easeInOutCubic(ramp(timelineMs, 6200, 7000));
  const ctaEase = easeInOutCubic(ramp(timelineMs, 6800, 7350));

  const ambientGlowOpacity = 0.16 + arrivalEase * 0.2 + postTransferEase * 0.16 + warmupEase * 0.1 - launchEase * 0.18;
  const fuelOpacity = 0.1 + transferEase * 0.72 - warmupEase * 0.2;
  const transferOpacity = beamEase * (1 - ramp(timelineMs, 2850, 3300));
  const particleOpacity = transferEase * (1 - ramp(timelineMs, 2850, 3200));
  const coreGlowOpacity = transferEase * 0.55 + postTransferEase * 0.24 + warmupEase * 0.34;
  const engineWarmthOpacity = postTransferEase * 0.24 + warmupEase * 0.5 + exhaustEase * 0.16;
  const fuelAnchorTop = `${68 - transferEase * 14}%`;
  const readyOpacity = Math.sin(ramp(timelineMs, 4200, 6000) * Math.PI) * 0.82;
  const readyTop = `${60 - easeInOutCubic(ramp(timelineMs, 4200, 6000)) * 24}%`;
  const crossedOpacity = revealEase;
  const brandOpacity = easeInOutCubic(ramp(timelineMs, 6400, 7150));
  const taglineOpacity = easeInOutCubic(ramp(timelineMs, 6600, 7300));
  const ctaOpacity = ctaEase;
  const rocketY = -920 * launchEase;
  const rocketScale = 1 - launchEase * 0.72;
  const rocketOpacity = 1 - easeInOutCubic(ramp(timelineMs, 6500, 6950));
  const count = timelineMs < 4200 ? '' : timelineMs < 4800 ? 3 : timelineMs < 5300 ? 2 : timelineMs < 6000 ? 1 : '';
  const isIgnited = timelineMs >= 4200;
  const isVibrating = timelineMs >= 4800 && timelineMs < 6000;
  const isFuelAnchorActive = timelineMs < 3000;
  const isCoreAnchorActive = timelineMs >= 3000;

  useEffect(() => {
    if (!isInView || startedRef.current) return;

    startedRef.current = true;

    const sectionEl = sectionRef.current;
    const targetY = sectionEl ? sectionEl.offsetTop : window.scrollY;
    window.scrollTo({ top: targetY, behavior: 'auto' });

    const body = document.body;
    const docEl = document.documentElement;
    const snapshot = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      htmlOverflow: docEl.style.overflow,
      scrollY: targetY,
    };

    body.style.overflow = 'hidden';
    docEl.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${targetY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    unlockRef.current = () => {
      body.style.overflow = snapshot.bodyOverflow;
      docEl.style.overflow = snapshot.htmlOverflow;
      body.style.position = snapshot.bodyPosition;
      body.style.top = snapshot.bodyTop;
      body.style.left = snapshot.bodyLeft;
      body.style.right = snapshot.bodyRight;
      body.style.width = snapshot.bodyWidth;
      window.scrollTo({ top: snapshot.scrollY, behavior: 'auto' });
    };

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - startTime, SEQUENCE_DURATION);
      setTimelineMs(elapsed);
      if (elapsed < SEQUENCE_DURATION) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      completedRef.current = true;
      setSequenceComplete(true);
      unlockRef.current?.();
      unlockRef.current = null;
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (!completedRef.current) {
        unlockRef.current?.();
        unlockRef.current = null;
      }
    };
  }, [isInView]);

  useEffect(() => {
    window.dispatchEvent(new Event('launch-timeline-update'));
  }, [timelineMs]);

  // Generate star particles once
  const stars = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 2 + 1}px`,
    delay: `${Math.random() * 6}s`,
    duration: `${Math.random() * 4 + 5}s`,
  })), []);

  const fuelParticles = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    id: i,
    left: `${44 + (i % 3) * 6}%`,
    delay: `${i * 0.12}s`,
    size: `${2 + (i % 2)}px`,
  })), []);

  return (
    <section
      ref={sectionRef}
      id="section-launch"
      className="pinned-section-container pinned-section-container--launch launchpad-container"
      data-launch-progress={timelineProgress.toFixed(4)}
      data-launching={isIgnited ? 'true' : 'false'}
      data-launch-complete={sequenceComplete ? 'true' : 'false'}
    >
      <motion.div className="launch-ambient-glow" style={{ opacity: ambientGlowOpacity }} aria-hidden="true" />
      <div className="pinned-viewport launch-viewport">
        <div className="launch-grid">
          <div>
            <span className="act-label">Launch</span>
            <h2 className="text-gradient-amber text-glow-header">
              <span className="story-accent">Launch</span> becomes the brand moment.
            </h2>
            <p>
              The recommendation, dos and don'ts, mentor matches, funding sources,
              incubators, and export report converge into one clear Results Workspace.
            </p>
          </div>

          <div className="glass-panel launch-stage">
            <div className="launch-stars" aria-hidden="true">
              {stars.map(({ id, left, width, delay, duration }) => (
                <span
                  key={id}
                  className="launch-stars__star"
                  style={{ left, width, height: width, bottom: '-5%', animationDelay: delay, animationDuration: duration }}
                />
              ))}
            </div>
            <div className="launch-stage__content">
              {/* Dual Anchors for LaunchPad:
                  Anchor 1 (Fuel entry): static, positions orb at rocket thruster initially.
                  Anchor 2 (Fusion core): child of the moving rocket container, moves up into space. */}
              
              {/* Anchor 1: Fuel Intake */}
              <motion.div
                className="orb-anchor"
                data-stage={7}
                data-section-id="section-launch"
                data-orb-active={isFuelAnchorActive ? 'true' : 'false'}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: fuelAnchorTop,
                  transform: 'translate(-50%, -50%)',
                  width: '52px',
                  height: '52px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
                aria-hidden="true"
              />

              <motion.div
                className="launch-rocket-sequence"
                style={{
                  x: '-50%',
                  y: rocketY,
                  scale: rocketScale,
                  opacity: rocketOpacity,
                  willChange: 'transform, opacity',
                }}
              >
                <motion.div className="launch-fuel-focus" style={{ opacity: fuelOpacity }} aria-hidden="true" />
                <motion.div className="launch-energy-transfer" style={{ opacity: transferOpacity }} aria-hidden="true" />
                <div className="launch-fuel-particles" style={{ opacity: particleOpacity }} aria-hidden="true">
                  {fuelParticles.map(({ id, left, delay, size }) => (
                    <span key={id} style={{ left, width: size, height: size, animationDelay: delay }} />
                  ))}
                </div>
                <motion.div className="launch-core-glow" style={{ opacity: coreGlowOpacity }} aria-hidden="true" />
                <motion.div className="launch-engine-warmth" style={{ opacity: engineWarmthOpacity }} aria-hidden="true" />
                <div className="launch-count">{count}</div>
                <div className={`rocket-vehicle${isVibrating ? ' shaking' : ''}`} style={{ position: 'relative' }}>
                  {/* Anchor 2: Core Fusion (placed inside window area) */}
                  <div
                    className="orb-anchor"
                    data-stage={7}
                    data-section-id="section-launch"
                    data-orb-active={isCoreAnchorActive ? 'true' : 'false'}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '37%',
                      transform: 'translate(-50%, -50%)',
                      width: '64px',
                      height: '64px',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                    aria-hidden="true"
                  />

                  <svg viewBox="0 0 100 150" width="110" height="165" aria-hidden="true">
                    <path d="M50 5 C70 25 78 58 70 105 L58 105 L50 132 L42 105 L30 105 C22 58 30 25 50 5Z" fill="#f8fbff" stroke="rgba(0,240,255,0.65)" strokeWidth="2" />
                    <circle cx="50" cy="55" r="15" fill="#061426" stroke="#00f0ff" strokeWidth="3" />
                    <path d="M30 95 L12 126 L34 116Z" fill="#a986ff" />
                    <path d="M70 95 L88 126 L66 116Z" fill="#3b82f6" />
                  </svg>
                  <div className="rocket-thrust-flame" style={{ opacity: exhaustEase }} />
                </div>
              </motion.div>
              
              <motion.div className="launch-ready" style={{ opacity: readyOpacity, top: readyTop }}>
                Startup Ready
              </motion.div>
              <div className="launch-brand-reveal">
                <motion.span style={{ opacity: crossedOpacity }}>Your Idea Has Crossed The Bridge</motion.span>
                <motion.strong style={{ opacity: brandOpacity }}>IdeaBridge</motion.strong>
                <motion.em style={{ opacity: taglineOpacity }}>Bridging Ideas to Successful Startups</motion.em>
                <motion.button
                  className="act-cta-btn launch-final-cta"
                  style={{ opacity: ctaOpacity, pointerEvents: ctaOpacity > 0.98 ? 'auto' : 'none' }}
                  disabled={ctaOpacity <= 0.98}
                  onClick={() => navigate('/input')}
                >
                  Analyze My Idea <ArrowRight size={18} strokeWidth={1.6} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const NAV_SECTIONS = [
  { id: 'section-hero', label: 'Home' },
  { id: 'section-how-it-works', label: 'How It Works' },
  { id: 'section-ai', label: 'AI Analysis' },
  { id: 'section-readiness', label: 'Readiness' },
  { id: 'section-mentorship', label: 'Mentorship' },
  { id: 'section-ecosystem', label: 'Ecosystem' },
  { id: 'section-funding', label: 'Funding' },
  { id: 'section-stats', label: 'Stats' },
  { id: 'section-roadmap', label: 'Roadmap' },
  { id: 'section-launch', label: 'Launch' },
];

function StickyNav({ navigate }: { navigate: (path: string) => void }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`landing-nav${hidden ? ' landing-nav--hidden' : ''}`} aria-label="Site navigation">
      <a href="#section-hero" className="landing-nav__logo">
        Idea<span>Bridge</span>
      </a>
      <button className="landing-nav__cta" onClick={() => navigate('/input')}>
        Analyze My Idea
      </button>
    </nav>
  );
}

function DotNav({ activeId }: { activeId: string }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dot-nav" role="navigation" aria-label="Page sections">
      {NAV_SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          className={`dot-nav__item${activeId === id ? ' dot-nav__item--active' : ''}`}
          onClick={() => scrollTo(id)}
          aria-label={label}
        >
          <span className="dot-nav__tooltip">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('section-hero');
  const scanVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 28 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55 } }),
  }), []);

  useEffect(() => {
    // Scroll-midpoint strategy: whichever section's visible area is closest
    // to the viewport centre wins — works correctly for pinned sections too.
    const update = () => {
      const mid = window.innerHeight / 2;
      let bestId = NAV_SECTIONS[0].id;
      let bestDist = Infinity;
      for (const { id } of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        // For elements taller than viewport (pinned containers) clamp to visible slice
        const visTop = Math.max(r.top, 0);
        const visBot = Math.min(r.bottom, window.innerHeight);
        if (visBot < visTop) continue;
        const visMid = (visTop + visBot) / 2;
        const dist = Math.abs(visMid - mid);
        if (dist < bestDist) { bestDist = dist; bestId = id; }
      }
      setActiveSection(bestId);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <>
      <StickyNav navigate={navigate} />
      <DotNav activeId={activeSection} />
      <main className="actualize-landing">
      <OrbController />

      <section id="section-hero" className="landing-hero">
        <div className="landing-grid-bg" />
        <div className="ambient-particles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <motion.div
          className="landing-hero__inner"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <div>
            <motion.span
              className="act-label"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              IdeaBridge
            </motion.span>
            <h1 className="text-gradient-purple-cyan text-glow-header">
              Bridge your <span className="story-accent">Idea</span> into a startup plan.
            </h1>
            <p>
              Enter a startup idea. IdeaBridge analyzes it, finds mentors and funding
              sources, recommends incubators, and gives you a report you can edit,
              save, share, or export.
            </p>
            <motion.button
              onClick={() => navigate('/input')}
              className="act-cta-btn"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.4 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Start analysis <ArrowRight size={18} strokeWidth={1.6} />
            </motion.button>
          </div>

          <motion.div
            className="hero-orb-panel"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <OrbAnchor id="section-hero" stage={1} className="hero-orb-anchor" />
            <ChatPreview />
          </motion.div>
        </motion.div>
      </section>

      <HowItWorksSection />

      <BridgeSection id="bridge-idea-ai" label="Idea to AI Analysis" stage={2} accent="cyan" rhythm="smooth" />

      <AIAnalysisSection scanVariants={scanVariants} />

      <ReadinessSection />

      <section id="section-mentorship" className="mentorship-section">
        <div className="section-shell mentorship-shell">
          <svg className="connector-svg" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
            <path className="connector-line" d="M500 260 C260 120 190 90 90 90 M500 260 C740 120 810 90 910 90 M500 260 C260 400 190 430 90 430 M500 260 C740 400 810 430 910 430" fill="none" stroke="rgba(168,134,255,0.28)" strokeWidth="2" />
          </svg>
          <div className="section-heading">
            <span className="act-label">Mentorship</span>
            <h2 className="text-gradient-blue-purple text-glow-header">
              <span className="story-accent">Mentorship</span> that fits the problem.
            </h2>
            <p>IdeaBridge shows mentor matches and why each one fits your idea.</p>
          </div>
          <OrbAnchor id="section-mentorship" stage={4} className="mentor-orb-anchor" />
          <div className="mentor-grid">
            {mentors.map(([initials, name, role, reason]) => (
              <div key={name} className="glass-panel mentor-card mentor-card--hover">
                <div className="mentor-card__avatar">{initials}</div>
                <h3>{name}</h3>
                <span>{role}</span>
                <div className="mentor-card__reason">
                  <p>{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BridgeSection id="bridge-mentorship-ecosystem" label="Mentors to Results Workspace" stage={5} accent="purple" rhythm="pulse" />

      <EcosystemMap />

      <section id="section-funding" className="funding-section">
        <div className="section-shell">
          <div className="section-heading">
            <span className="act-label">Funding Hub</span>
            <h2 className="text-gradient-cyan-blue text-glow-header">
              <span className="story-accent">Funding</span> and incubators shown with fit.
            </h2>
            <p>Funding sources and incubators appear with eligibility, fit score, deadlines, stage, location, and benefits.</p>
          </div>
          <OrbAnchor id="section-funding" stage={6} className="funding-orb-anchor" />
          <div className="funding-grid">
            {fundingCards.map(([title, metric, body], i) => (
              <motion.div
                key={title}
                className="glass-panel funding-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span>{metric}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BridgeSection id="bridge-funding-roadmap" label="Workspace to Export Report" stage={6} accent="blue" rhythm="calm" />

      <StartupStats />
      <RoadmapTimeline />
      <LaunchPad />

      <footer className="act-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>Idea<span style={{ color: 'var(--neon-cyan)' }}>Bridge</span></span>
          <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Bridging Ideas to Successful Startups</small>
        </div>
        <div className="act-footer__links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#section-hero">Back to Top ↑</a>
        </div>
      </footer>
    </main>
    </>
  );
}
