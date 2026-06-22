import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type OrbStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface InteractiveOrbProps {
  stage: OrbStage;
  progress: number; // local progress (0 to 1) for the current stage/section
  isLaunching?: boolean; // trigger launch countdown/take-off style
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const launchParticles = [
  { x: -18, y: 14, delay: 0 },
  { x: 12, y: 18, delay: 0.06 },
  { x: -8, y: 24, delay: 0.12 },
  { x: 20, y: 30, delay: 0.18 },
  { x: -22, y: 36, delay: 0.24 },
  { x: 8, y: 42, delay: 0.3 },
];

export const InteractiveOrb: React.FC<InteractiveOrbProps> = ({
  stage,
  progress,
  isLaunching = false,
}) => {
  const getStageTheme = () => {
    switch (stage) {
      case 1: return { primary: '#00f0ff', secondary: '#3b82f6', glow: 'rgba(0, 240, 255, 0.4)' };
      case 2: return { primary: '#00f0ff', secondary: '#a986ff', glow: 'rgba(0, 240, 255, 0.4)' };
      case 3: return { primary: '#3b82f6', secondary: '#00f0ff', glow: 'rgba(59, 130, 246, 0.4)' };
      case 4: return { primary: '#00f0ff', secondary: '#00f0ff', glow: 'rgba(0, 240, 255, 0.3)' };
      case 5: return { primary: '#a986ff', secondary: '#3b82f6', glow: 'rgba(169, 134, 255, 0.4)' };
      case 6: return { primary: '#00f0ff', secondary: '#a986ff', glow: 'rgba(0, 240, 255, 0.5)' };
      case 7: return { primary: '#ff8a1f', secondary: '#ff3b30', glow: 'rgba(255, 138, 31, 0.35)' }; // Reduced glow opacity
      default: return { primary: '#00f0ff', secondary: '#3b82f6', glow: 'rgba(0, 240, 255, 0.4)' };
    }
  };

  const theme = getStageTheme();
  const glowOpacity = stage === 7 ? 0.35 + progress * 0.1 : 0.5 + progress * 0.15; // Reduced glow

  // Launch handoff window: the orb eases into the fuel chamber before disappearing.
  let opacity = 1;
  let scaleX = 1;
  let scaleY = 1;
  let trailOpacity = 0;
  let trailScaleY = 0.4;
  let trailTranslateY = 0;
  let shellTranslateY = 0;
  let shellBlur = 0;
  let postMergeEnergy = 0;
  let particleOpacity = 0;
  let particleTravel = 0;

  if (stage === 7) {
    const mergeStart = 1000 / 7500;
    const mergeEnd = 3000 / 7500;
    const ignitionDelay = 500 / 7500;
    const mergeT = clamp((progress - mergeStart) / (mergeEnd - mergeStart), 0, 1);
    const mergeEase = easeInOutCubic(mergeT);
    const ignitionT = clamp((progress - (mergeEnd + ignitionDelay)) / (900 / 7500), 0, 1);
    const stretch = Math.sin(mergeT * Math.PI);

    scaleX = Math.max(0.08, 1 - mergeEase * 0.88);
    scaleY = Math.max(0.1, 1 + stretch * 0.72 - mergeEase * 0.92);
    opacity = Math.max(0, 1 - mergeEase);
    shellTranslateY = mergeEase * 26;
    shellBlur = mergeEase * 1.1;

    // Stretch the trail during the travel, then let it collapse as the core ignites.
    trailOpacity = mergeT < 1 ? stretch * 0.7 : Math.max(0, 0.18 - ignitionT * 0.18);
    trailScaleY = 0.45 + mergeEase * 2.8;
    trailTranslateY = 12 + mergeEase * 56;
    particleOpacity = mergeT < 1 ? stretch * 0.82 : 0;
    particleTravel = mergeEase * 58;
    postMergeEnergy = easeInOutCubic(ignitionT);
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${shellTranslateY}px) scale(${scaleX}, ${scaleY})`,
        filter: shellBlur > 0 ? `blur(${shellBlur}px)` : 'none',
        pointerEvents: 'none',
      }}
    >
      {stage === 7 && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '34%',
            height: '92%',
            borderRadius: '999px',
            background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.04), ${theme.primary}, ${theme.secondary}, rgba(255, 59, 48, 0.06))`,
            transform: `translate(-50%, calc(-50% + ${trailTranslateY}px)) scaleY(${trailScaleY})`,
            transformOrigin: 'center top',
            opacity: trailOpacity,
            filter: 'blur(16px)',
            zIndex: 0,
          }}
        />
      )}

      {stage === 7 && launchParticles.map(({ x, y, delay }, index) => (
        <motion.span
          key={`fuel-particle-${index}`}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y + particleTravel - delay * 120}px)`,
            width: index % 2 === 0 ? 3 : 2,
            height: index % 2 === 0 ? 3 : 2,
            borderRadius: 999,
            background: index % 2 === 0 ? '#ffffff' : theme.primary,
            boxShadow: `0 0 10px ${theme.glow}`,
            opacity: particleOpacity,
            zIndex: 2,
          }}
        />
      ))}

      {/* Glow Backdrop */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '90%',
          height: '90%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          opacity: glowOpacity,
          zIndex: 0,
        }}
      />

      {/* Main Container */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">

          {/* ── STAGE 1: IDEA ORB (JARVIS-subtle inner activity) ── */}
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '80%',
                height: '80%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Core sphere */}
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${theme.primary} 30%, ${theme.secondary} 70%, #020711 100%)`,
                boxShadow: `0 0 40px ${theme.glow}, inset 0 -10px 20px rgba(0,0,0,0.6)`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Slow scanline sweep — barely visible, signals latent intelligence */}
                <motion.div
                  animate={{ y: ['-110%', '110%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '3px',
                    background: `linear-gradient(to bottom, transparent, ${theme.primary}, transparent)`,
                    opacity: 0.18,
                  }}
                />
              </div>

              {/* Ghost dashed ring — slow rotation, very faint */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: '118%',
                  height: '118%',
                  borderRadius: '50%',
                  border: '1px dashed rgba(0, 240, 255, 0.18)',
                  pointerEvents: 'none',
                }}
              />

              {/* Counter-rotating inner ghost ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: '105%',
                  height: '105%',
                  borderRadius: '50%',
                  border: '1px solid rgba(169, 134, 255, 0.1)',
                  pointerEvents: 'none',
                }}
              />

              {/* 3 electrical pulse nodes orbiting at different speeds */}
              {([0, 120, 240] as number[]).map((startDeg, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: [startDeg, startDeg + 360] }}
                  transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '118%',
                    height: '118%',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '0%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: theme.primary,
                    boxShadow: `0 0 8px ${theme.glow}`,
                    opacity: 0.5,
                  }} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── STAGE 2: AI CORE ── */}
          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, ${theme.primary} 30%, ${theme.secondary} 100%)`, boxShadow: `0 0 25px ${theme.glow}` }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', width: '90%', height: '90%', borderRadius: '50%', border: '2px dashed rgba(0, 240, 255, 0.4)' }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', width: '75%', height: '75%', borderRadius: '50%', border: '1px solid rgba(169, 134, 255, 0.2)' }}
              />
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50%', pointerEvents: 'none' }}>
                <motion.div
                  animate={{ y: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '100%', height: '4px', background: 'linear-gradient(to bottom, transparent, #00f0ff, transparent)', boxShadow: '0 0 10px #00f0ff', opacity: 0.7 }}
                />
              </div>
            </motion.div>
          )}

          {/* ── STAGE 3: REASONING DASHBOARD ── */}
          {stage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.03, 1], // Gentle breathing pulse
              }}
              transition={{
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.5 }
              }}
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="45" fill="none" stroke={theme.primary} strokeWidth="8"
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 70 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 5px ${theme.glow})` }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '0.04em' }}
                >
                  WHY
                </motion.span>
                <span style={{ fontSize: '0.62rem', color: theme.secondary, fontWeight: 600, letterSpacing: '0.05em', marginTop: '2px' }}>REASON</span>
              </div>
            </motion.div>
          )}

          {/* ── STAGE 4: NETWORK NODE ── */}
          {stage === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '35%', height: '35%', borderRadius: '50%', background: theme.primary, boxShadow: `0 0 20px ${theme.glow}`, zIndex: 2 }}
              />
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', zIndex: 1 }}>
                <line x1="50" y1="50" x2="15" y2="25" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
                <line x1="50" y1="50" x2="85" y2="25" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
                <line x1="50" y1="50" x2="80" y2="75" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
                <line x1="50" y1="50" x2="20" y2="75" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
                <line x1="50" y1="50" x2="50" y2="90" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
                <circle cx="15" cy="25" r="4" fill="#00f0ff" />
                <circle cx="85" cy="25" r="4" fill="#00f0ff" />
                <circle cx="80" cy="75" r="4" fill="#00f0ff" />
                <circle cx="20" cy="75" r="4" fill="#00f0ff" />
                <circle cx="50" cy="90" r="4" fill="#00f0ff" />
              </svg>
            </motion.div>
          )}

          {/* ── STAGE 5: OPPORTUNITY EXPLORER (RADAR) ── */}
          {stage === 5 && (
            <motion.div
              key="stage5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ width: '40%', height: '40%', borderRadius: '50%', background: `radial-gradient(circle, ${theme.primary} 40%, ${theme.secondary} 100%)`, boxShadow: `0 0 25px ${theme.glow}` }} />
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                style={{ position: 'absolute', width: '40%', height: '40%', borderRadius: '50%', border: `1.5px solid ${theme.primary}` }}
              />
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 1.25 }}
                style={{ position: 'absolute', width: '40%', height: '40%', borderRadius: '50%', border: `1.5px solid ${theme.secondary}` }}
              />
            </motion.div>
          )}

          {/* ── STAGE 6: FIT-SCORE RING (Funding / Readiness) ── */}
          {stage === 6 && (
            <motion.div
              key="stage6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Radar polygon background rings */}
              <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ position: 'absolute' }}>
                {/* Background concentric hexagons approximated as circles */}
                {[44, 34, 24, 14].map((r) => (
                  <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                ))}
                {/* Axes */}
                {[0, 60, 120, 180, 240, 300].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  return (
                    <line
                      key={deg}
                      x1="60" y1="60"
                      x2={60 + Math.cos(rad) * 44}
                      y2={60 + Math.sin(rad) * 44}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  );
                })}
                {/* Animated fit polygon */}
                <motion.polygon
                  points="60,18 96,40 96,80 60,100 24,80 24,40"
                  fill={`rgba(0,240,255,0.08)`}
                  stroke={theme.primary}
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ transformOrigin: '60px 60px', filter: `drop-shadow(0 0 4px ${theme.glow})` }}
                />
              </svg>

              {/* Central pulsing orb */}
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '30%',
                  height: '30%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, #ffffff 10%, ${theme.primary} 60%, ${theme.secondary} 100%)`,
                  boxShadow: `0 0 20px ${theme.glow}, 0 0 50px rgba(0, 240, 255, 0.2)`,
                  zIndex: 2,
                }}
              />

              {/* Slow rotating outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', width: '90%', height: '90%', borderRadius: '50%', border: '1px dashed rgba(0, 240, 255, 0.18)', pointerEvents: 'none' }}
              />
            </motion.div>
          )}

          {/* ── STAGE 7: RADIANT ENERGY CORE (Fuel/Core fusion stage) ── */}
          {stage === 7 && (
            <motion.div
              key="stage7"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4 }}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Outer solar flares / expanding energy ring */}
              <motion.div
                animate={{ rotate: 360, scale: [0.98, 1.05, 0.98] }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{
                  position: 'absolute',
                  width: '120%',
                  height: '120%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 138, 31, 0.1) 0%, transparent 65%)', // Lower opacity
                  border: '1px dashed rgba(255, 138, 31, 0.25)', // Softer edge
                  opacity: stage === 7 ? 0.35 + postMergeEnergy * 0.45 : 1,
                }}
              />

              {/* Fast rotating electrical ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} // Slower rotation
                style={{
                  position: 'absolute',
                  width: '90%',
                  height: '90%',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 59, 48, 0.15)', // Softer edge
                  opacity: stage === 7 ? 0.4 + postMergeEnergy * 0.5 : 1,
                }}
              />

              {/* High intensity fusing core */}
              <motion.div
                animate={{
                  scale: isLaunching
                    ? [0.92 + postMergeEnergy * 0.13, 1.02 + postMergeEnergy * 0.22, 0.92 + postMergeEnergy * 0.13]
                    : [0.9 + postMergeEnergy * 0.1, 1 + postMergeEnergy * 0.15, 0.9 + postMergeEnergy * 0.1],
                  opacity: [
                    0.55 + postMergeEnergy * 0.3,
                    0.68 + postMergeEnergy * 0.27,
                    0.55 + postMergeEnergy * 0.3,
                  ]
                }}
                transition={{
                  duration: isLaunching ? 0.7 : 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  width: '60%',
                  height: '60%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #ff8a1f 45%, #ff3b30 80%, #020711 100%)',
                  boxShadow: '0 0 25px rgba(255, 138, 31, 0.5), 0 0 45px rgba(255, 59, 48, 0.35), inset 0 -4px 10px rgba(0,0,0,0.5)', // Reduced spread
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
};
