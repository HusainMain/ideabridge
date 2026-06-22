import React, { useEffect, useRef, useCallback } from 'react';
import { InteractiveOrb, OrbStage } from './InteractiveOrb';

interface OrbState {
  left: number;
  top: number;
  width: number;
  height: number;
  stage: OrbStage;
  progress: number;
  isLaunching: boolean;
}

// Lerp utility – moves 'current' toward 'target' by 'factor' per frame
function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export const OrbController: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Live render state tracked in refs to avoid React re-render overhead
  const current = useRef<OrbState>({
    left: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    top: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    width: 150,
    height: 150,
    stage: 1,
    progress: 0,
    isLaunching: false,
  });

  const target = useRef<OrbState>({ ...current.current });
  const rafRef = useRef<number | null>(null);
  const stageRef = useRef<OrbStage>(1);
  const progressRef = useRef(0);
  const isLaunchingRef = useRef(false);

  // ─── Anchor selection ───────────────────────────────────────────────
  const computeTarget = useCallback((): OrbState | null => {
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>('.orb-anchor'),
    );
    if (anchors.length === 0) return null;

    const vMid = window.innerHeight / 2;
    let best: HTMLElement | null = null;
    let bestScore = Infinity;

    for (const anchor of anchors) {
      if (anchor.dataset.orbActive === 'false') continue;

      const rect = anchor.getBoundingClientRect();
      // Skip anchors that are hidden (display: none) or far outside viewport
      if ((rect.width === 0 && rect.height === 0) || rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

      const sectionId = anchor.getAttribute('data-section-id');
      const section = sectionId ? document.getElementById(sectionId) : null;
      const secRect = section?.getBoundingClientRect();

      // Heavily prefer the anchor whose section straddles the viewport midpoint
      const inSection =
        secRect && secRect.top <= vMid && secRect.bottom >= vMid ? 0 : 400;

      const anchorMidY = rect.top + rect.height / 2;
      const score = Math.abs(anchorMidY - vMid) + inSection;

      if (score < bestScore) {
        bestScore = score;
        best = anchor;
      }
    }

    if (!best) {
      // Absolute fallback: closest by raw distance
      best = anchors.reduce<HTMLElement | null>((closest, a) => {
        const d = Math.abs(a.getBoundingClientRect().top + a.getBoundingClientRect().height / 2 - vMid);
        const cd = closest
          ? Math.abs(closest.getBoundingClientRect().top + closest.getBoundingClientRect().height / 2 - vMid)
          : Infinity;
        return d < cd ? a : closest;
      }, null);
    }

    if (!best) return null;

    const rect = best.getBoundingClientRect();
    const stageAttr = best.getAttribute('data-stage');
    const sectionId = best.getAttribute('data-section-id');
    const stage = (stageAttr ? parseInt(stageAttr, 10) : 1) as OrbStage;

    let progress = 0;
    let isLaunching = false;

    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        const secRect = section.getBoundingClientRect();
        const isPinned = section.classList.contains('pinned-section-container');

        if (isPinned) {
          const launchProgressAttr = sectionId === 'section-launch' ? section.getAttribute('data-launch-progress') : null;
          if (launchProgressAttr) {
            progress = Math.max(0, Math.min(1, parseFloat(launchProgressAttr)));
          } else {
            const scrollRange = secRect.height - window.innerHeight;
            if (scrollRange > 0) {
              progress = Math.max(0, Math.min(1, -secRect.top / scrollRange));
            }
          }
        } else {
          const enterPoint = window.innerHeight;
          const exitPoint = -secRect.height;
          const travel = enterPoint - exitPoint;
          progress = Math.max(0, Math.min(1, (enterPoint - secRect.top) / travel));
        }

        if (sectionId === 'section-launch') {
          isLaunching = section.getAttribute('data-launching') === 'true' || progress > 0.4;
        }
      }
    }

    return {
      left: rect.left + rect.width / 2,
      top: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
      stage,
      progress,
      isLaunching,
    };
  }, []);

  // ─── rAF animation loop ─────────────────────────────────────────────
  const animate = useCallback(() => {
    rafRef.current = requestAnimationFrame(animate);

    const t = target.current;
    const c = current.current;

    // Position lerp — 0.06 gives the orb inertia and weight, not cursor-chasing
    const POS_LERP  = 0.06;
    const SIZE_LERP = 0.18;
    c.left   = lerp(c.left,   t.left,   POS_LERP);
    c.top    = lerp(c.top,    t.top,    POS_LERP);
    c.width  = lerp(c.width,  t.width,  SIZE_LERP);
    c.height = lerp(c.height, t.height, SIZE_LERP);

    const div = innerRef.current;
    if (div) {
      div.style.left   = `${c.left}px`;
      div.style.top    = `${c.top}px`;
      div.style.width  = `${c.width}px`;
      div.style.height = `${c.height}px`;
    }
  }, []);

  // ─── Scroll + resize handler ────────────────────────────────────────
  const onScrollOrResize = useCallback(() => {
    const next = computeTarget();
    if (!next) return;

    target.current.left   = next.left;
    target.current.top    = next.top;
    target.current.width  = next.width;
    target.current.height = next.height;

    // Stage and progress changes are discrete — apply immediately
    if (next.stage !== stageRef.current) {
      stageRef.current = next.stage;
      // Force a React re-render only on stage change
      forceStageUpdate(next.stage, next.progress, next.isLaunching);
    } else if (Math.abs(next.progress - progressRef.current) > 0.004) {
      progressRef.current = next.progress;
      forceStageUpdate(next.stage, next.progress, next.isLaunching);
    }

    if (next.isLaunching !== isLaunchingRef.current) {
      isLaunchingRef.current = next.isLaunching;
      forceStageUpdate(next.stage, next.progress, next.isLaunching);
    }
  }, [computeTarget]);

  // Minimal React state update — only fires on stage/progress/launching change
  const [orbMeta, setOrbMeta] = React.useState<{
    stage: OrbStage;
    progress: number;
    isLaunching: boolean;
  }>({ stage: 1, progress: 0, isLaunching: false });

  const forceStageUpdate = useCallback(
    (stage: OrbStage, progress: number, isLaunching: boolean) => {
      setOrbMeta({ stage, progress, isLaunching });
    },
    [],
  );

  useEffect(() => {
    // Seed initial position before first scroll event
    const seed = computeTarget();
    if (seed) {
      target.current = { ...seed };
      current.current = { ...seed };
      const div = innerRef.current;
      if (div) {
        div.style.left   = `${seed.left}px`;
        div.style.top    = `${seed.top}px`;
        div.style.width  = `${seed.width}px`;
        div.style.height = `${seed.height}px`;
      }
      stageRef.current = seed.stage;
      setOrbMeta({ stage: seed.stage, progress: seed.progress, isLaunching: seed.isLaunching });
    }

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('launch-timeline-update', onScrollOrResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('launch-timeline-update', onScrollOrResize);
    };
  }, [animate, computeTarget, onScrollOrResize]);

  return (
    <div
      ref={divRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top, width, height',
        }}
      >
        <InteractiveOrb
          stage={orbMeta.stage}
          progress={orbMeta.progress}
          isLaunching={orbMeta.isLaunching}
        />
      </div>
    </div>
  );
};
