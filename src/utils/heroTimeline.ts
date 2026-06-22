export interface HeroMoment {
  id: string;
  label: string;
  kicker: string;
  heading: string;
  subheading: string;
  frame: number;
  holdStart: number;
  holdEnd: number;
  align: 'left' | 'center' | 'right';
  accent: 'aqua' | 'violet' | 'amber';
  cta?: string;
}

export const FRAME_COUNT = 240;

export const HERO_MOMENTS: HeroMoment[] = [
  {
    id: 'landing',
    label: 'Landing page',
    kicker: 'Begin with a spark',
    heading: 'Turn the half-formed idea into a visible path.',
    subheading: 'Actualize opens with proof, context, and one focused first move.',
    frame: 0,
    holdStart: 0,
    holdEnd: 0.16,
    align: 'left',
    accent: 'aqua',
    cta: 'Start idea check',
  },
  {
    id: 'input',
    label: 'Idea input',
    kicker: 'Shape the signal',
    heading: 'A few answers become a founder-grade brief.',
    subheading: 'Guided prompts and smart follow-ups pull the useful parts forward.',
    frame: 55,
    holdStart: 0.23,
    holdEnd: 0.38,
    align: 'right',
    accent: 'violet',
  },
  {
    id: 'analysis',
    label: 'AI analysis',
    kicker: 'The engine thinks',
    heading: 'Funding, mentors, and incubators come into focus.',
    subheading: 'The model weighs readiness, fit, urgency, and next-step confidence.',
    frame: 112,
    holdStart: 0.45,
    holdEnd: 0.6,
    align: 'left',
    accent: 'aqua',
  },
  {
    id: 'workspace',
    label: 'Results workspace',
    kicker: 'Decision canvas',
    heading: 'Your next move stops feeling abstract.',
    subheading: 'Recommendations, dos and donts, mentor matches, funding, and incubators sit in one place.',
    frame: 172,
    holdStart: 0.67,
    holdEnd: 0.82,
    align: 'center',
    accent: 'violet',
  },
  {
    id: 'report',
    label: 'Export report',
    kicker: 'Leave with momentum',
    heading: 'Save the plan, share the proof, keep moving.',
    subheading: 'Export a report, send a link, or return to refine the workspace.',
    frame: 239,
    holdStart: 0.89,
    holdEnd: 1,
    align: 'right',
    accent: 'amber',
    cta: 'Preview report',
  },
];

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOut(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

export function getActiveMoment(progress: number) {
  const clamped = clamp01(progress);

  return (
    HERO_MOMENTS.find(
      (moment) => clamped >= moment.holdStart && clamped <= moment.holdEnd
    ) ?? null
  );
}

export function getMomentPresence(progress: number, moment: HeroMoment) {
  const span = Math.max(moment.holdEnd - moment.holdStart, 0.001);
  const local = clamp01((progress - moment.holdStart) / span);
  const enter = easeInOut(local / 0.28);
  const exit = easeInOut((1 - local) / 0.28);
  const presence = Math.min(enter, exit);

  return {
    local,
    opacity: presence,
    y: (1 - enter) * 58 - (1 - exit) * 46,
    blur: (1 - presence) * 18,
    scale: 0.96 + presence * 0.04,
  };
}

export function getTimelineFrame(progress: number) {
  const clamped = clamp01(progress);

  for (const moment of HERO_MOMENTS) {
    if (clamped >= moment.holdStart && clamped <= moment.holdEnd) {
      return moment.frame;
    }
  }

  const nextIndex = HERO_MOMENTS.findIndex((moment) => clamped < moment.holdStart);

  if (nextIndex <= 0) {
    return HERO_MOMENTS[0].frame;
  }

  const previous = HERO_MOMENTS[nextIndex - 1];
  const next = HERO_MOMENTS[nextIndex];
  const travel = easeInOut(
    (clamped - previous.holdEnd) / Math.max(next.holdStart - previous.holdEnd, 0.001)
  );

  return Math.round(previous.frame + (next.frame - previous.frame) * travel);
}
