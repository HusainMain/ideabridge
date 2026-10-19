import React, { useCallback, useEffect, useRef } from 'react';
import { frame } from 'framer-motion';
import { InteractiveOrb, OrbStage } from './InteractiveOrb';
import { buildPath, evaluatePath, type OrbPath, type WaypointRect } from './orbPath';

// The orb renders inside a fixed 220px box (the largest authored anchor — the
// hero) and is placed every frame with a single transform: translate3d to the
// path position + uniform scale to the waypoint size. No layout properties are
// written after mount.
const BASE_SIZE = 220;

interface OrbMeta {
  stage: OrbStage;
  progress: number;
  isLaunching: boolean;
}

export const OrbController: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<OrbPath | null>(null);
  const writtenRef = useRef({ x: -9999, y: -9999, s: -1 });
  const metaRef = useRef<OrbMeta>({ stage: 1, progress: 0, isLaunching: false });
  const [orbMeta, setOrbMeta] = React.useState<OrbMeta>(metaRef.current);

  // ─── Waypoint registry (rebuilds when layout can have changed) ──────
  const rebuild = useCallback(() => {
    const launching =
      document.getElementById('section-launch')?.getAttribute('data-launching') === 'true';
    if (launching) return; // scroll space is collapsed by the launch lock
    pathRef.current = buildPath(window.innerHeight);
  }, []);

  useEffect(() => {
    rebuild();
    const settleTimer = window.setTimeout(rebuild, 400); // late font/image shifts
    const onResize = () => rebuild();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('load', rebuild);
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => rebuild()).catch(() => undefined);
    }

    // Live rect of the launch anchor that is active right now (fuel 0-3s,
    // core 3s+ of the sequence). During the launch lock both are static.
    const launchRect = (): WaypointRect | null => {
      const section = document.getElementById('section-launch');
      if (!section) return null;
      const anchor =
        section.querySelector<HTMLElement>('.orb-anchor[data-orb-active="true"]') ??
        section.querySelector<HTMLElement>('.orb-anchor');
      if (!anchor) return null;
      const r = anchor.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        size: (r.width + r.height) / 2,
      };
    };

    const update = () => {
      const wrap = wrapRef.current;
      const path = pathRef.current;
      if (!wrap || !path) return;

      const sample = evaluatePath(path, window.scrollY, { launchRect });

      // Position + size, transform-only.
      const s = sample.size > 0 ? sample.size / BASE_SIZE : writtenRef.current.s;
      const nx = sample.x - BASE_SIZE / 2;
      const ny = sample.y - BASE_SIZE / 2;
      const w = writtenRef.current;
      if (Math.abs(nx - w.x) > 0.1 || Math.abs(ny - w.y) > 0.1 || Math.abs(s - w.s) > 0.0005) {
        wrap.style.transform = `translate3d(${nx.toFixed(2)}px, ${ny.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
        wrap.style.visibility = 'visible';
        w.x = nx;
        w.y = ny;
        w.s = s;
      }

      // Stage / progress / launching — same semantics as the previous
      // controller, now driven by the path's dominant waypoint.
      let progress = 0;
      let isLaunching = false;
      if (sample.sectionId) {
        const section = document.getElementById(sample.sectionId);
        if (section) {
          const secRect = section.getBoundingClientRect();
          if (section.classList.contains('pinned-section-container')) {
            if (sample.sectionId === 'section-launch') {
              const attr = section.getAttribute('data-launch-progress');
              progress = attr ? Math.max(0, Math.min(1, parseFloat(attr))) : 0;
            } else {
              const scrollRange = secRect.height - window.innerHeight;
              if (scrollRange > 0) progress = Math.max(0, Math.min(1, -secRect.top / scrollRange));
            }
          } else {
            const enterPoint = window.innerHeight;
            const exitPoint = -secRect.height;
            const travel = enterPoint - exitPoint;
            progress = Math.max(0, Math.min(1, (enterPoint - secRect.top) / travel));
          }
          if (sample.sectionId === 'section-launch') {
            isLaunching = section.getAttribute('data-launching') === 'true' || progress > 0.4;
          }
        }
      }

      const meta = metaRef.current;
      const nextStage = sample.stage as OrbStage;
      if (
        nextStage !== meta.stage ||
        Math.abs(progress - meta.progress) > 0.004 ||
        isLaunching !== meta.isLaunching
      ) {
        const next: OrbMeta = { stage: nextStage, progress, isLaunching };
        metaRef.current = next;
        setOrbMeta(next);
      }
    };

    // Run inside framer's postRender so anchor rects (driven by motion
    // values on the same frame) are already committed when we read them.
    // Fallback: plain rAF (may read one frame stale on moving rails).
    let stopped = false;
    let raf = 0;
    let usingFrameApi = typeof frame?.postRender === 'function';
    const schedule = () => {
      frame.postRender(() => {
        if (stopped) return;
        update();
        schedule();
      });
    };
    if (usingFrameApi) {
      try {
        schedule();
      } catch {
        usingFrameApi = false;
      }
    }
    if (!usingFrameApi) {
      const loop = () => {
        if (stopped) return;
        raf = requestAnimationFrame(loop);
        update();
      };
      loop();
    }

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', rebuild);
    };
  }, [rebuild]);

  return (
    <div
      ref={wrapRef}
      data-orb-root=""
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: BASE_SIZE,
        height: BASE_SIZE,
        transform: `translate3d(-${BASE_SIZE * 2}px, -${BASE_SIZE * 2}px, 0)`,
        visibility: 'hidden',
        pointerEvents: 'none',
        zIndex: 40,
        willChange: 'transform',
      }}
    >
      <InteractiveOrb
        stage={orbMeta.stage}
        progress={orbMeta.progress}
        isLaunching={orbMeta.isLaunching}
      />
    </div>
  );
};
