import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function LaunchPad() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: '0px 0px -20% 0px', amount: 0.45, once: true });
  const prefersReducedMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const unlockRef = useRef<(() => void) | null>(null);
  const [timelineMs, setTimelineMs] = useState(0);
  const [sequenceComplete, setSequenceComplete] = useState(false);

  // Single "jump to the end" path, shared by Skip and the natural timeline end.
  // Releases any in-flight scroll lock so the page can never stay frozen.
  const finishSequence = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTimelineMs(SEQUENCE_DURATION);
    setSequenceComplete(true);
    unlockRef.current?.();
    unlockRef.current = null;
  };

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

    // Reduced motion: finished state immediately, and no scroll lock.
    if (prefersReducedMotion) {
      finishSequence();
      return;
    }

    // Fixed-screen launch: snap to the section and lock page scrolling while
    // the sequence plays, so it reads as one uninterrupted shot. The Skip
    // button and the timeline's own end both release the lock; unmounting
    // mid-sequence releases it too. (Reduced-motion users never get here.)
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

      rafRef.current = null;
      finishSequence();
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      // Never leave the page locked if this unmounts mid-sequence.
      unlockRef.current?.();
      unlockRef.current = null;
    };
  }, [isInView, prefersReducedMotion]);

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
        {isInView && !sequenceComplete && (
          <button type="button" className="launch-skip" onClick={finishSequence}>
            Skip animation
          </button>
        )}
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
