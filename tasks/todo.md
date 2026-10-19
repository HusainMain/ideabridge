# Task List: Orb Continuous Path (Option A) — COMPLETE (uncommitted for review)

Baseline-first rework of the landing orb: one scroll-parameterized path, exact
glue on every authored rail, transform-only rendering, same-frame evaluation.
Old audit plan archived as `tasks/plan-audit-fixes.md` / `tasks/todo-audit-fixes.md`.

---

## Task 0: Baseline capture (“how it looked before”) — [x]
- [x] Harness saved: `.playwright-mcp/orb/harness.js`
- [x] `.playwright-mcp/orb/before-metrics.json`
- [x] `before-*.png` — 9 shots (8 stops + launch final)

### Baseline numbers (1440×900, 8 px/frame scroll)
- how rail: dist-to-anchor mean **141.46** / p95 178.84 / max 179.22 px
- bridge bezier: dist-to-anchor mean **216.65** / max 361.24 px
- scan rail: dist-to-anchor mean **100.54** / p95 368.69 / max **498.54** px
- orb step per frame max: 10.75 / 17.70 / 29.91 px
- frame p95: 18.0 / 18.1 / 18.4 ms
- **Extra baseline defect found:** after any jump scroll the orb settles at a
  stale target — the controller only re-targeted on scroll *events*, so the
  last event’s anchor rect became the final destination. Visual proof:
  `before-bridge2-mid.png` (pulse at the right end of the curve, orb parked at
  the left start), `before-scan-mid.png` (cards at mid-state, orb stuck at the
  bottom of the rail), `before-how-mid.png` (orb at step 01 while the section
  is at ~40 %).

## Checkpoint 0 — [x]
- [x] Artifacts saved; numbers confirm the diagnosis before code changes

---

## Task 1: `src/components/orbPath.ts` pure model — [x]
- [x] Registry from `.orb-anchor` DOM order; zero-size (hidden) anchors skipped
- [x] Dwell windows: pinned/bridge ancestor = pin range; plain section = mid-crossing ±0.35 vh
- [x] `evaluatePath()` → `{x, y, size, index, stage, sectionId, isLaunch, blend}`;
      smoothstep (C1) travel between live rects; launch pseudo-waypoint resolved live
- [x] Normalised windows guarantee a travel slot between neighbours

## Task 2: `OrbController` rewrite — path + transform-only — [x]
- [x] Evaluated every frame inside framer’s `frame.postRender` (anchor rects
      already committed for the frame); plain-rAF fallback kept
- [x] ≤ 2 `getBoundingClientRect` reads/frame (only the two live rects needed)
- [x] Transform-only writes on a fixed 220 px base (`translate3d` + `scale`);
      no left/top/width/height after mount; writes skipped below 0.1 px
- [x] stage / progress / isLaunching semantics preserved, driven by the dominant
      waypoint; launch follows the active `data-orb-active` anchor
- [x] Debug hook `data-orb-root`; production build passes
      (`477.82 kB` JS / `147.68 kB` gzip, `90.97 kB` CSS / `18.60 kB` gzip)
- [x] Load: hero orb 0.09 px from its anchor
- [x] Jump-to-section: orb on the anchor after ~7 frames — stale-target bug gone

## Task 3: Remove scroll-driven React re-renders — [~] DEFERRED (documented deviation)
- Evidence: dev-build frame p95 stayed 18–19.5 ms before/after and max 23.9 ms;
  the visible defect was trajectory, not dropped frames. Keeping the existing
  progress-state re-render (same 0.004 threshold as before) meant zero visual
  risk to the orb’s stage internals. If stutter ever shows on low-end hardware,
  this is the next lever (progress via ref + imperative styles).

## Task 4: Handoffs / launch / mobile / reduced motion — [x]
- [x] Bridge measurement corrected: the bridge svg moves during the pass, so the
      polyline must be sampled per frame (a cached polyline reported a false
      “146 px off the line”; corrected harness committed)
- [x] 390×844 pass: orb present, visible, in view, no console errors
- [x] Reduced motion: orb present, visible; no lock, no errors
- [x] Launch sequence: body lock active → Skip → unlock restored; no errors
- [x] Console clean (desktop + mobile + reduced motion)

## Checkpoint A — [x]
- [x] Rails glued; no reversals on monotonic passes; launch intact; console clean

---

## Task 5: After-pass comparison — [x]
- [x] Identical harness rerun (label `after`): `after-*.png`, metrics below
- [x] Corrected bridge run (fresh polyline per frame) for the line metric

### After numbers (same viewport, same speed)
| Metric | Before | After |
|---|---|---|
| how dist-to-anchor mean | 141.46 px | **0.00 px** |
| bridge dist-to-anchor mean | 216.65 px | **0.00 px** (max 0.01) |
| bridge dist-to-line mean | anywhere on screen → line (trailing) | **0.47 px** (max 0.79) |
| scan dist-to-anchor mean | 100.54 px (max 498.54) | **0.00 px** |
| jump-settle to target | stale spot, hundreds px off | **0.00 px** |
| orb step per frame (max) | 10.75 / 17.70 / 29.91 | 10.84 / 88.43* / 5.63 |
| frame p95 | 18.0 / 18.1 / 18.4 ms | 19.5 / 18.5 / 18.4 ms |

\* The bridge per-frame step now mirrors the **authored** “pulse” pacing: the
orb follows the same eased curve mapping as the pulse, so near the dwell edges
the curve is traversed quickly. It is continuous (no jump), but it is the one
motion to eyeball — pacing can be tuned in `BridgeSection` if it reads too fast.

### Visual pairs (`.playwright-mcp/orb/`)
- `before-how-mid.png` → `after-how-mid.png`: orb stranded at step 01 → orb on
  the rail at the true progress, midway between steps 02/03
- `before-bridge2-mid.png` → `after-bridge2-mid.png`: orb at the left start
  while the pulse is at the right end → orb exactly on the curve’s end
- `before-scan-mid.png` → `after-scan-mid.png`: orb stuck at the rail bottom →
  orb at the rail position matching the active cards

## Task 6: Docs — [x]
- [x] Statuses, evidence and review pointers recorded (this file + `tasks/plan.md`)

## Checkpoint C — [x]
- [x] Verdict backed by the table + screenshot pairs; everything uncommitted
      for review

---

## Review pointers
- `git diff -- src/components/OrbController.tsx` — rewrite (146+, 220−)
- `src/components/orbPath.ts` — new path model
- `.playwright-mcp/orb/` — harness + before/after screenshots + metrics JSON
- Nothing committed; dev server serves the new build via Vite HMR.
