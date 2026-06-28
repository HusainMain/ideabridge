import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { AnalysisStatus } from '../stores/useJourneyStore';

interface RobotMascotProps {
  analysisStatus: AnalysisStatus;
  stage?: number;
  isCompleted?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function RobotMascot({ stage = 0, isCompleted = false }: RobotMascotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointerMoveRef = useRef(0);
  const idleFrameRef = useRef<number>();
  const [blink, setBlink] = useState(false);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const eyeX = useSpring(targetX, { stiffness: 230, damping: 31, mass: 0.55 });
  const eyeY = useSpring(targetY, { stiffness: 230, damping: 31, mass: 0.55 });
  const headX = useMotionValue(0);
  const headY = useMotionValue(0);
  const headSpringX = useSpring(headX, { stiffness: 150, damping: 18, mass: 0.9 });
  const headSpringY = useSpring(headY, { stiffness: 150, damping: 18, mass: 0.9 });

  useEffect(() => {
    if (isCompleted) {
      targetX.set(0);
      targetY.set(0);
      return;
    }

    const moveEyes = (event: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      lastPointerMoveRef.current = Date.now();
      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.43;
      targetX.set(clamp(((event.clientX - centerX) / (rect.width / 2)) * 4, -4, 4));
      targetY.set(clamp(((event.clientY - centerY) / (rect.height / 2)) * 3, -3, 3));
      headX.set(clamp(((event.clientX - centerX) / (rect.width / 2)) * 2.5, -2.5, 2.5));
      headY.set(clamp(((event.clientY - centerY) / (rect.height / 2)) * 1.8, -1.8, 1.8));
    };

    const centerEyes = () => {
      targetX.set(0);
      targetY.set(0);
      headX.set(0);
      headY.set(0);
      lastPointerMoveRef.current = 0;
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) centerEyes();
    };

    window.addEventListener('pointermove', moveEyes, { passive: true });
    window.addEventListener('blur', centerEyes);
    document.documentElement.addEventListener('mouseleave', centerEyes);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('pointermove', moveEyes);
      window.removeEventListener('blur', centerEyes);
      document.documentElement.removeEventListener('mouseleave', centerEyes);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isCompleted, targetX, targetY]);

  useEffect(() => {
    if (isCompleted) return;
    const idle = () => {
      const idleFor = Date.now() - lastPointerMoveRef.current;
      if (lastPointerMoveRef.current === 0 || idleFor > 1400) {
        const t = Date.now() / 1000;
        targetX.set(Math.sin(t * 0.9) * 0.9);
        targetY.set(Math.cos(t * 0.72) * 0.55);
      }
      idleFrameRef.current = requestAnimationFrame(idle);
    };
    idleFrameRef.current = requestAnimationFrame(idle);
    return () => {
      if (idleFrameRef.current) cancelAnimationFrame(idleFrameRef.current);
    };
  }, [isCompleted, targetX, targetY]);

  useEffect(() => {
    if (isCompleted) return;
    let timeoutId: number;
    const loop = () => {
      timeoutId = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 105);
        loop();
      }, 3200 + Math.random() * 2600);
    };
    loop();
    return () => window.clearTimeout(timeoutId);
  }, [isCompleted]);

  const glowOpacity = isCompleted ? 0.95 : 0.5 + Math.min(stage, 6) * 0.05;

  return (
    <motion.svg
      ref={svgRef}
      className="h-[168px] w-[168px] md:h-[178px] md:w-[178px]"
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
      animate={isCompleted ? { y: [0, -8, -4], scale: [1, 1.03, 1] } : { y: [0, -5, 0] }}
      transition={isCompleted ? { duration: 0.8, ease: 'easeOut' } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id="robotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.55" />
          <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="metal" x1="68" y1="40" x2="155" y2="132" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e5edf6" />
          <stop offset="0.28" stopColor="#64748b" />
          <stop offset="0.68" stopColor="#111827" />
          <stop offset="1" stopColor="#030712" />
        </linearGradient>
        <linearGradient id="body" x1="74" y1="128" x2="146" y2="199" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="0.55" stopColor="#050914" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <filter id="cyanSoft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="110" cy="192" rx="60" ry="14" fill="#67e8f9" opacity={glowOpacity * 0.26} filter="url(#cyanSoft)" />
      <circle cx="110" cy="108" r="104" fill="url(#robotGlow)" opacity={glowOpacity * 0.45} />

      <ellipse cx="110" cy="192" rx="60" ry="14" fill="#67e8f9" opacity={glowOpacity * 0.26} filter="url(#cyanSoft)" />
      <circle cx="110" cy="108" r="104" fill="url(#robotGlow)" opacity={glowOpacity * 0.45} />

      <motion.g style={{ x: headSpringX, y: headSpringY, rotate: headSpringX, transformOrigin: '110px 108px' }}>
        <path d="M110 20V42" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="110" cy="17" r="7" fill="#020617" stroke="#cbd5e1" strokeWidth="2">
          <animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
        </circle>

        <rect x="39" y="78" width="23" height="52" rx="11.5" fill="#0f172a" stroke="#94a3b8" strokeOpacity="0.45" strokeWidth="3" />
        <rect x="158" y="78" width="23" height="52" rx="11.5" fill="#0f172a" stroke="#94a3b8" strokeOpacity="0.45" strokeWidth="3" />
        <rect x="51" y="73" width="18" height="62" rx="9" fill="#cbd5e1" opacity="0.35" />
        <rect x="151" y="73" width="18" height="62" rx="9" fill="#cbd5e1" opacity="0.35" />

        <path d="M72 138C75 120 90 111 110 111C130 111 145 120 148 138L155 174C158 190 146 203 130 203H90C74 203 62 190 65 174L72 138Z" fill="url(#body)" stroke="#67e8f9" strokeOpacity="0.45" strokeWidth="2.5" />
        <path d="M78 139C87 146 133 146 142 139" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="12" strokeLinecap="round" />

        <path d="M54 143C43 156 42 180 51 189C62 184 68 158 62 145C60 141 57 140 54 143Z" fill="#0f172a" stroke="#67e8f9" strokeOpacity="0.55" strokeWidth="2.5" />
        <path d="M166 143C177 156 178 180 169 189C158 184 152 158 158 145C160 141 163 140 166 143Z" fill="#0f172a" stroke="#67e8f9" strokeOpacity="0.55" strokeWidth="2.5" />

        <rect x="55" y="44" width="110" height="91" rx="34" fill="url(#metal)" stroke="#cbd5e1" strokeOpacity="0.7" strokeWidth="4" />
        <rect x="64" y="53" width="92" height="73" rx="27" fill="#020617" opacity="0.82" />
        <path d="M75 58C92 49 130 49 146 58" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="13" strokeLinecap="round" />
        <rect x="68" y="71" width="84" height="45" rx="20" fill="#04111f" stroke="#67e8f9" strokeOpacity="0.22" strokeWidth="2" />

        <motion.g style={{ x: eyeX, y: eyeY }} filter="url(#cyanSoft)">
          <rect x="80" y="84" width="23" height={blink ? 2 : 15} rx="7.5" fill="#67e8f9" />
          <rect x="117" y="84" width="23" height={blink ? 2 : 15} rx="7.5" fill="#67e8f9" />
          <circle cx="87" cy="88" r="3" fill="white" opacity="0.9" />
          <circle cx="124" cy="88" r="3" fill="white" opacity="0.9" />
        </motion.g>

        {isCompleted ? (
          <g filter="url(#cyanSoft)">
            <path d="M88 102 Q110 82 132 102" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <path d="M100 105 Q110 100 120 105" stroke="#67e8f9" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" fill="none" />
        )}
      </motion.g>
    </motion.svg>
  );
}
