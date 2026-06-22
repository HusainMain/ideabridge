import { create } from 'zustand';

export interface ScrollStore {
  scrollProgress: number;
  targetScrollProgress: number;
  setScrollProgress: (progress: number) => void;
  getScrollProgress: () => number;
}

export const useScrollStore = create<ScrollStore>((set, get) => ({
  scrollProgress: 0,
  targetScrollProgress: 0,
  setScrollProgress: (progress: number) => {
    set({ targetScrollProgress: Math.max(0, Math.min(1, progress)) });
  },
  getScrollProgress: () => get().scrollProgress,
}));

type Point = { x: number; v: number };

const springStiffness = 0.08;
const springDamping = 0.82;

let current = { x: 0, v: 0 } as Point;
let rafId: number | null = null;
let lastTime = performance.now();

function tick(now: number) {
  const dt = Math.min((now - lastTime) / 16.667, 3);
  lastTime = now;

  const { targetScrollProgress } = useScrollStore.getState();
  const displacement = current.x - targetScrollProgress;
  const springForce = -springStiffness * displacement;
  const dampingForce = -springDamping * current.v;
  const newVelocity = current.v + (springForce + dampingForce) * dt;
  const newPosition = current.x + newVelocity * dt;

  current = { x: newPosition, v: newVelocity };

  useScrollStore.setState({
    scrollProgress: Math.max(0, Math.min(1, newPosition)),
  });

  const isSettled =
    Math.abs(newPosition - targetScrollProgress) < 0.0005 &&
    Math.abs(newVelocity) < 0.0005;

  if (isSettled) {
    current = { x: targetScrollProgress, v: 0 };
    useScrollStore.setState({ scrollProgress: targetScrollProgress });
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  if (rafId === null) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }
}

function getHeroProgress() {
  const hero = document.getElementById('hero-scroll');

  if (hero) {
    const travelDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const scrolledInsideHero = -hero.getBoundingClientRect().top;
    return scrolledInsideHero / travelDistance;
  }

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  return docHeight > 0 ? window.scrollY / docHeight : 0;
}

function updateScrollProgress() {
  useScrollStore.getState().setScrollProgress(getHeroProgress());
  startLoop();
}

function attachScrollListener() {
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  requestAnimationFrame(updateScrollProgress);

  return () => {
    window.removeEventListener('scroll', updateScrollProgress);
    window.removeEventListener('resize', updateScrollProgress);
  };
}

const cleanup = attachScrollListener();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, () => void>).__unsubscribeScroll = cleanup;
}

export function resetScrollSpringForDebug() {
  const target = useScrollStore.getState().targetScrollProgress;
  current = { x: target, v: 0 };
  useScrollStore.setState({ scrollProgress: target });

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
