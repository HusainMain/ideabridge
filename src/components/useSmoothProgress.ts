import { useReducedMotion, useSpring, type MotionValue } from 'framer-motion';

// Overdamped spring so a scroll-linked anchor keeps moving for a beat after a
// coarse wheel notch instead of teleporting. The orb is glued to these anchors,
// so smoothing the anchor is what makes the orb read as continuous.
const SPRING = {
  stiffness: 220,
  damping: 30,
  mass: 0.5,
  restDelta: 0.0001,
  restSpeed: 0.0001,
};

export function useSmoothProgress(progress: MotionValue<number>): MotionValue<number> {
  const reduceMotion = useReducedMotion();
  const smooth = useSpring(progress, SPRING);
  // Keep the original 1:1 scroll mapping for reduced-motion users.
  return reduceMotion ? progress : smooth;
}
