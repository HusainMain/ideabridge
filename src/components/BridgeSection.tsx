import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface BridgeSectionProps {
  id: string;
  label: string;
  stage: number;
  accent: 'cyan' | 'purple' | 'blue';
  rhythm?: 'smooth' | 'pulse' | 'calm';
}

// Pre-computed bezier sample points for the S-curve drawn in the SVG
// Path: M80 116 C240 28 360 28 500 116 C640 204 760 204 920 116
// ViewBox: 0 0 1000 220
// 21 points at p = 0.00 to 1.00 (step 0.05)
// leftPct = x / 1000 * 100, topPct = y / 220 * 100
const BEZIER_LEFT_PCT = [
  8.00, 12.69, 17.17, 21.48, 25.66, 29.75,
  33.78, 37.78, 41.79, 45.85, 50.00,
  54.15, 58.21, 62.22, 66.22, 70.25,
  74.34, 78.52, 82.83, 87.35, 92.00,
];
const BEZIER_TOP_PCT = [
  52.73, 41.93, 33.53, 27.53, 23.93, 22.73,
  23.93, 27.53, 33.53, 41.93, 52.73,
  63.53, 71.93, 77.93, 81.53, 82.73,
  81.53, 77.93, 71.93, 63.53, 52.73,
];

// Scroll progress range: dwell 0→0.12, travel 0.12→0.88, dwell 0.88→1
const TRAVEL_START = 0.12;
const TRAVEL_END   = 0.88;
const TRAVEL_RANGE = TRAVEL_END - TRAVEL_START; // 0.76

const N = BEZIER_LEFT_PCT.length; // 21

// Build input/output arrays for useTransform
const LEFT_OUTPUT: string[] = [
  `${BEZIER_LEFT_PCT[0]}%`,
  ...BEZIER_LEFT_PCT.map((v) => `${v.toFixed(2)}%`),
  `${BEZIER_LEFT_PCT[N - 1]}%`,
];
const TOP_OUTPUT: string[] = [
  `${BEZIER_TOP_PCT[0]}%`,
  ...BEZIER_TOP_PCT.map((v) => `${v.toFixed(2)}%`),
  `${BEZIER_TOP_PCT[N - 1]}%`,
];

export const BridgeSection: React.FC<BridgeSectionProps> = ({ id, label, stage, accent, rhythm = 'smooth' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scrollInput = React.useMemo(() => {
    if (rhythm === 'pulse') {
      return [
        0,
        ...BEZIER_LEFT_PCT.map((_, i) => {
          const t = i / (N - 1);
          const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          return TRAVEL_START + easedT * TRAVEL_RANGE;
        }),
        1,
      ];
    }
    return [
      0,
      ...BEZIER_LEFT_PCT.map((_, i) => TRAVEL_START + (i / (N - 1)) * TRAVEL_RANGE),
      1,
    ];
  }, [rhythm]);

  // Orb follows the actual drawn S-curve bezier
  const leftPos = useTransform(scrollYProgress, scrollInput, LEFT_OUTPUT);
  const topPos  = useTransform(scrollYProgress, scrollInput, TOP_OUTPUT);

  const glowRange = rhythm === 'pulse' ? [0.2, 0.45, 1, 0.7, 0.3] : [0.25, 0.55, 1, 0.85, 0.45];
  const bridgeGlow = useTransform(scrollYProgress, [0, 0.12, 0.58, 0.92, 1], glowRange);
  const opacity    = useTransform(scrollYProgress, rhythm === 'calm' ? [0, 0.2, 0.8, 1] : [0, 0.08, 0.92, 1], [0, 1, 1, 0]);

  const colorVar = accent === 'purple' ? 'var(--neon-purple)' : accent === 'blue' ? 'var(--neon-blue)' : 'var(--neon-cyan)';
  const glowVar  = accent === 'purple' ? 'var(--neon-purple-glow)' : accent === 'blue' ? 'var(--neon-blue-glow)' : 'var(--neon-cyan-glow)';

  return (
    <section ref={containerRef} id={id} className="bridge-container abstract-bridge">
      <div className="bridge-inner">
        <motion.div className="abstract-bridge__stage" style={{ opacity }}>
          <span className="abstract-bridge__label" style={{ color: colorVar, textShadow: `0 0 12px ${glowVar}` }}>
            {label}
          </span>

          <div className="abstract-bridge__field">
            <div className="ambient-particles ambient-particles--bridge" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg className="abstract-bridge__svg" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
              <motion.path
                d="M80 116 C240 28 360 28 500 116 C640 204 760 204 920 116"
                fill="none"
                stroke={colorVar}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="12 16"
                style={{ opacity: bridgeGlow }}
              />
              <path d="M86 132 L914 132" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <path d="M100 150 L900 150" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              {[160, 280, 400, 520, 640, 760, 880].map((x) => (
                <g key={x}>
                  <line x1={x} y1="94" x2={x - 28} y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <line x1={x} y1="94" x2={x + 28} y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <circle cx={x} cy="132" r="4" fill={colorVar} opacity="0.65" />
                </g>
              ))}
            </svg>

            {/* Pulse glow follows the same bezier path */}
            <motion.div
              className="abstract-bridge__pulse"
              style={{ left: leftPos, top: topPos, background: `radial-gradient(circle, ${colorVar}, transparent 68%)` }}
            />

            {/* Orb anchor follows the actual drawn bezier — orb stays on the line */}
            <motion.div
              className="orb-anchor"
              data-stage={stage}
              data-section-id={id}
              style={{
                position: 'absolute',
                top: topPos,
                left: leftPos,
                transform: 'translate(-50%, -50%)',
                width: '86px',
                height: '86px',
                pointerEvents: 'none',
              }}
            />
          </div>

          <span className="abstract-bridge__caption">THE IDEA CROSSES INTO THE NEXT SYSTEM</span>
        </motion.div>
      </div>
    </section>
  );
};
