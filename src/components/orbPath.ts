// Waypoint path model for the landing orb.
//
// The orb travels one continuous route made of the authored `.orb-anchor`
// spots, in DOM order. Each waypoint owns a "dwell" window of scroll: while
// the window is active the orb sits exactly on that anchor's live rect — this
// is what glues it to every moving rail (pipeline, scanner, bridge beziers,
// workspace, roadmap) with zero formula duplication. Between windows the orb
// travels on a smoothstep (C1) blend between the two live rects.
//
// The evaluation is deliberately cheap: 1-2 getBoundingClientRect reads per
// frame, no allocations per frame beyond the sample object.

export interface WaypointRect {
  x: number;
  y: number;
  size: number;
}

export interface Waypoint {
  el: HTMLElement | null; // null = launch pseudo-waypoint (resolved live, see OrbEvalOptions)
  stage: number;
  sectionId: string | null;
  dwellStart: number; // scrollY where this waypoint takes over
  dwellEnd: number; // scrollY where this waypoint releases
}

export interface PathStop {
  t: number; // scrollY where this stop begins
  travel: boolean; // false = dwell on waypoint `i`; true = travelling i -> i+1
  i: number;
}

export interface OrbPath {
  waypoints: Waypoint[];
  stops: PathStop[];
  vh: number;
}

export interface OrbSample {
  x: number;
  y: number;
  size: number;
  index: number; // dominant waypoint index
  stage: number;
  sectionId: string | null;
  isLaunch: boolean;
  blend: number; // 0 = fully on waypoint `index`, 1 = fully on the next one
}

export interface OrbEvalOptions {
  /** Live rect of the currently active launch anchor (fuel/core). */
  launchRect?: () => WaypointRect | null;
}

// Plain sections: the orb is glued while the anchor's centre is within this
// half-window of the viewport centre.
const DWELL_HALF_WINDOW_VH = 0.35;
// Fallback pin length when a container is shorter than the viewport.
const MIN_DWELL_VH = 0.2;
// When two dwell windows would touch/overlap, open a travel slot this wide.
const MIN_TRAVEL_VH = 0.25;

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smooth = (t: number) => t * t * (3 - 2 * t);

function readRect(el: HTMLElement): WaypointRect {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: (r.width + r.height) / 2 };
}

export function buildPath(vh: number): OrbPath | null {
  const anchors = Array.from(document.querySelectorAll<HTMLElement>('.orb-anchor'));
  const waypoints: Waypoint[] = [];

  for (const el of anchors) {
    // The two launch anchors are handled by the launch pseudo-waypoint below
    // (which one is live changes during the sequence).
    if (el.closest('#section-launch')) continue;
    if (el.dataset.orbActive === 'false') continue;

    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue; // hidden at this breakpoint

    const docMid = r.top + window.scrollY + r.height / 2;
    const pin = el.closest<HTMLElement>('.pinned-section-container, .bridge-container');

    let dwellStart: number;
    let dwellEnd: number;
    if (pin) {
      // Pinned / bridge sections: the anchor itself railed through the sticky
      // viewport for the whole pin, so the dwell window is the pin range.
      const pinTop = pin.getBoundingClientRect().top + window.scrollY;
      dwellStart = pinTop;
      dwellEnd = pinTop + Math.max(pin.offsetHeight - vh, vh * MIN_DWELL_VH);
    } else {
      const claim = docMid - vh / 2; // scrollY where the anchor crosses the viewport centre
      dwellStart = claim - vh * DWELL_HALF_WINDOW_VH;
      dwellEnd = claim + vh * DWELL_HALF_WINDOW_VH;
    }

    waypoints.push({
      el,
      stage: parseInt(el.dataset.stage ?? '1', 10),
      sectionId: el.dataset.sectionId ?? null,
      dwellStart,
      dwellEnd,
    });
  }

  // Launch pseudo-waypoint: resolves to whichever launch anchor is active.
  const launch = document.getElementById('section-launch');
  if (launch) {
    const launchTop = launch.getBoundingClientRect().top + window.scrollY;
    waypoints.push({
      el: null,
      stage: 7,
      sectionId: 'section-launch',
      dwellStart: launchTop,
      dwellEnd: launchTop + Math.max(launch.offsetHeight - vh, vh * 0.15),
    });
  }

  if (waypoints.length === 0) return null;

  waypoints.sort((a, b) => a.dwellStart - b.dwellStart);

  // The page top always belongs to the first waypoint.
  if (waypoints[0].dwellStart > 0) waypoints[0].dwellStart = 0;

  // Normalise touching/overlapping windows so there is always a travel slot.
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (b.dwellStart < a.dwellEnd + vh * MIN_TRAVEL_VH) {
      const mid = (a.dwellEnd + b.dwellStart) / 2;
      a.dwellEnd = Math.max(mid - (vh * MIN_TRAVEL_VH) / 2, a.dwellStart);
      b.dwellStart = Math.min(mid + (vh * MIN_TRAVEL_VH) / 2, b.dwellEnd);
    }
  }

  // Flatten to an ordered stop list: dwell 0, travel 0-1, dwell 1, ...
  const stops: PathStop[] = [{ t: -Infinity, travel: false, i: 0 }];
  for (let i = 0; i < waypoints.length - 1; i++) {
    stops.push({ t: waypoints[i].dwellEnd, travel: true, i });
    stops.push({ t: waypoints[i + 1].dwellStart, travel: false, i: i + 1 });
  }

  return { waypoints, stops, vh };
}

export function evaluatePath(
  path: OrbPath,
  scrollY: number,
  options: OrbEvalOptions = {},
): OrbSample {
  const { waypoints, stops } = path;

  // Last stop that begins at or above the current scroll position.
  let stop = stops[0];
  for (let k = 1; k < stops.length; k++) {
    if (scrollY >= stops[k].t) stop = stops[k];
    else break;
  }

  const rectOf = (wp: Waypoint, fallback: WaypointRect): WaypointRect => {
    if (wp.el) return readRect(wp.el);
    return options.launchRect?.() ?? fallback;
  };

  if (!stop.travel) {
    const wp = waypoints[stop.i];
    const rect = rectOf(wp, { x: 0, y: 0, size: 0 });
    return {
      x: rect.x,
      y: rect.y,
      size: rect.size,
      index: stop.i,
      stage: wp.stage,
      sectionId: wp.sectionId,
      isLaunch: wp.el === null,
      blend: 0,
    };
  }

  const a = waypoints[stop.i];
  const b = waypoints[stop.i + 1];
  const span = b.dwellStart - a.dwellEnd;
  const t = span > 1 ? clamp01((scrollY - a.dwellEnd) / span) : 0.5;
  const s = smooth(t);

  const ar = rectOf(a, { x: 0, y: 0, size: 0 });
  const br = rectOf(b, ar);
  const dominant = s < 0.5 ? a : b;

  return {
    x: ar.x + (br.x - ar.x) * s,
    y: ar.y + (br.y - ar.y) * s,
    size: ar.size + (br.size - ar.size) * s,
    index: s < 0.5 ? stop.i : stop.i + 1,
    stage: dominant.stage,
    sectionId: dominant.sectionId,
    isLaunch: dominant.el === null,
    blend: s,
  };
}
