# Implementation Plan: Orb Continuous Path (Option A)

## Overview
The landing orb currently picks the nearest `.orb-anchor` on every scroll event
and lerps toward it (τ ≈ 0.27 s, layout-property writes, React re-render per
progress tick). Result: it trails every moving rail, cuts arbitrary chords
between sections, and stutters. This plan replaces the targeting model with a
single scroll-parameterized path: the orb is glued to each authored rail while
it owns that part of the page (≤ a few px), and travels between rails on a
continuous blend. Anchors stay in place as authoring handles — no section
markup changes. The three jank sources are removed at the same time.

Baseline of "how it looks right now" is captured first (Task 0) and the same
harness is rerun after the fix for a side-by-side check (Task 5).

## Architecture Decisions
- **Waypoints = existing anchors.** Registry built from `.orb-anchor` nodes in
  DOM order (= page order). Zero-size anchors (hidden at this breakpoint) are
  skipped at build time. No new markup.
- **Dwell / travel model.** Each waypoint owns a dwell window in document-scroll
  space:
  - inside a pinned/bridge ancestor → full pin range `[top, top + h − vh]`;
  - plain section → mid-crossing window around `anchorDocCenter − vh/2`.
  Inside a dwell window the orb reads the anchor's live rect — exact glue. This
  covers every moving rail (how-pipeline left, scanner top, bridge beziers,
  workspace left, roadmap top, launch anchors) with zero formula duplication.
  Between windows: travel on a smoothstep (C1) blend between the two live
  rects. Catmull-Rom tangents are a one-constant switch if round corners still
  snap after the visual check.
- **Same-frame evaluation.** Run in framer-motion's `frame.postRender`
  (v11 exports `frame`) so framer-driven anchor motion values are already
  committed when we read; ≤ 2 `getBoundingClientRect` reads per frame; registry
  cached and rebuilt on `resize` + `document.fonts.ready` + `load`; rebuild
  skipped while `data-launching="true"` (the launch scroll-lock collapses
  document scroll space).
- **Transform-only output.** Fixed 220 px base wrapper; per-frame
  `transform: translate3d(x − w/2, y − h/2, 0) scale(s)`. No left/top/width/
  height writes; skip write when < 0.1 px change. `will-change: transform`.
- **Progress leaves React.** `stage` stays a React prop (rare changes).
  `progress` becomes a mutable ref that `InteractiveOrb` consumes imperatively
  (postRender style updates of the styles derived from `progress`); removes the
  > 0.004-threshold re-render of the heavy SVG that currently fires nearly
  every frame during pinned sections.
- **Launch segment.** While `data-launching="true"`: waypoint = the active
  launch anchor (`data-orb-active`), `progress` from `data-launch-progress`;
  fuel→core switch blended over the scripted window. Stage-7 merge math inside
  `InteractiveOrb` is untouched.
- **No spring by default.** Exact glue (zero lag) is the goal; `SMOOTHING_TAU`
  constant (τ ≈ 60–80 ms) applies to the *path parameter only* if review says a
  touch of inertia feels better. Reduced motion semantics unchanged (path is
  scroll-driven, not time-driven).
- **Debug hooks for the harness** (stable, cheap): `data-orb-root`,
  `data-orb-stage`, `data-orb-waypoint` on the wrappers.

## Task List

### Phase 0 — Remember before
- [ ] **Task 0: Baseline capture (no code change).**
  Description: run the measurement harness on the current build and keep the
  artifacts so "before" is on record.
  Acceptance: `.playwright-mcp/orb/before-metrics.json` (dist-to-anchor and
  dist-to-bridge-line per segment, per-frame orb deltas, frame times) +
  `before-*.png` screenshots at 8 fixed stops + launch final state.
  Verification: files exist on disk; metrics show the known symptoms
  (large dist-to-anchor on rails, large orb step spikes).
  Dependencies: None. Scope: S. Files: `.playwright-mcp/orb/harness.js`,
  artifacts under `.playwright-mcp/orb/`.

### Checkpoint 0
- [ ] Baseline artifacts saved; numbers confirm the diagnosis before any code
      changes.

### Phase 1 — The path engine (highest risk first)
- [ ] **Task 1: `src/components/orbPath.ts` — pure path model.**
  Description: waypoint registry builder (from anchors), dwell-window
  computation (pinned/bridge vs plain), `evaluate(scrollY, rectReader)` →
  `{ x, y, size, index, blend }`. Pure functions, no DOM writes.
  Acceptance: registry skips zero-size anchors; windows ordered, clamped,
  non-inverted; evaluate is C1 across handoffs (no step in position between
  samples); frame-rate independent (no dt dependence).
  Verification: build passes; live spot-check via Task 2.
  Dependencies: None. Scope: S. Files: `src/components/orbPath.ts`.
- [ ] **Task 2: Rewire `OrbController` to the path + transform-only.**
  Description: rAF via `frame.postRender`; evaluate path; write transform on
  base wrapper; keep stage/progress/isLaunching semantics driven by the active
  waypoint; keep launch special-case; add debug attrs.
  Acceptance: on how-pipeline, bridge bezier(s), scanner and launch rails the
  orb sits on the anchor every frame (≤ 3 px); no directional reversals of orb
  motion during a monotonic scroll pass; launch sequence visuals unchanged;
  stage changes still swap orb visuals.
  Verification: build; live harness pass (dist-to-anchor mean ≈ 0 on rails);
  manual scroll recording of the three pinned rails.
  Dependencies: Task 1. Scope: M. Files: `src/components/OrbController.tsx`,
  `src/styles/landing.css`.
- [ ] **Task 3: Remove scroll-driven React re-renders.**
  Description: `InteractiveOrb` consumes `progress` via ref + imperative
  postRender style updates; controller stops calling `setOrbMeta` on progress
  (stage only).
  Acceptance: zero React renders of the orb during scroll (verified by a
  temporary render counter in dev, removed before final build); visuals at
  stage boundaries unchanged (screenshot A/B).
  Verification: build; render counter test; before/after screenshots.
  Dependencies: Task 2. Scope: M. Files: `src/components/InteractiveOrb.tsx`,
  `src/components/OrbController.tsx`.

### Checkpoint A
- [ ] Build passes; rails glued; no jump/flip-flop on full-page scroll; launch
      sequence (lock → skip → natural end) still correct; console clean.

### Phase 2 — Edge cases and tuning
- [ ] **Task 4: Handoff/launch/mobile/reduced-motion edge cases.**
  Description: tune dwell-window constants; launch fuel→core blend window;
  hidden-anchor skipping at ≤ 860 px; reduced-motion sanity (never locked,
  path still scroll-driven); launch scroll-lock interplay (registry rebuild
  guard).
  Acceptance: 390 px pass sane (no jump where an anchor is hidden);
  skip/natural-end/lock behavior unchanged; reduced-motion path fine.
  Verification: live passes at 1440 + 390; launch checks.
  Dependencies: Task 3. Scope: S. Files: `src/components/orbPath.ts`,
  `src/components/OrbController.tsx`.
- [ ] **Task 5: After-pass comparison.**
  Description: rerun the identical harness (only `before` → `after` label);
  build side-by-side screenshots; compute improvement table.
  Acceptance: all metrics improved: dist-to-anchor mean ≤ 8 px (baseline
  hundreds), bridge-line deviation ≤ 3 px, no orb step spikes, frame p95 not
  worse; screenshot pairs included.
  Verification: artifacts in `.playwright-mcp/orb/after-*`; table in
  `tasks/todo.md`.
  Dependencies: Task 4. Scope: S. Files: `.playwright-mcp/orb/*`.
- [ ] **Task 6: Docs + review pointers.**
  Description: mark todo/plan statuses, record evidence and where to look.
  Acceptance: `tasks/todo.md` has evidence per task + amendment notes.
  Verification: read-back.
  Dependencies: Task 5. Scope: XS. Files: `tasks/plan.md`, `tasks/todo.md`.

### Checkpoint C
- [ ] After-pass verdict: "much better than before" backed by the metric
      table + screenshot pairs; everything left uncommitted for review.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Anchor rects one frame stale vs framer writes | Med | Evaluate in `frame.postRender`; if still stale, measure and report; acceptable ≤ 1 frame difference. |
| `transform: scale` slightly different look than width/height resize | Low | Screenshot A/B at all size classes (52→220 px); revert to size writes for the size channel only if visible. |
| Spline overshoot on tightly spaced waypoints | Low | Clamp output to segment bounding box; smoothstep fallback constant. |
| Registry stale after layout shift (fonts/images) | Med | Rebuild on resize + fonts.ready + load; guard during launch lock. |
| InteractiveOrb ref refactor changes stage visuals | Med | Keep all stage-driven JSX in React; only progress-derived styles go imperative; A/B screenshots. |
| Dev-server metrics noisy (HMR, headless rAF) | Low | Compare relative numbers only; same environment for both passes. |

## Open Questions
- Inertia: default is exact glue (no lag). If the after-pass feels "too
  mechanical," flip `SMOOTHING_TAU` to ~70 ms — one constant, no rework.

---

## Outcome (2026-10-20)

Status: **complete and verified**, uncommitted for review. Details and the full
before/after table live in `tasks/todo.md`.

- Task 0 — baseline captured before any code change (`before-metrics.json`,
  9 screenshots). Baseline exposed an extra defect: the orb settled at a stale
  target after jump scrolls (it only re-targeted on scroll events).
- Task 1 — `src/components/orbPath.ts`: waypoint registry from the existing
  anchors, dwell windows (pin range for pinned/bridge ancestors, mid-crossing
  window otherwise), smoothstep travel between live rects, launch pseudo-waypoint.
- Task 2 — `OrbController` rewritten: `frame.postRender` same-frame evaluation,
  ≤ 2 rect reads/frame, transform-only writes on a 220 px base, stage/progress
  semantics preserved. Measured: how/scanner rails 0.00 px; bridge line 0.47 px
  mean (0.79 max); jump-settle 0.00 px.
- Task 3 — **deferred** (documented deviation): dev-build frame p95 stayed
  18–19.5 ms; trajectory, not dropped frames, was the visible defect, so the
  orb’s progress re-render was left untouched to avoid visual risk. Next lever
  only if low-end hardware stutters.
- Task 4 — edge cases verified: 390 px, reduced motion, launch lock/skip,
  clean console. Bridge metric methodology corrected (fresh polyline per frame;
  the svg moves during the pass — a cached polyline produced a false 146 px).
- Tasks 5–6 — after-pass comparison and docs done.

Verdict: the orb now travels one continuous route and is glued to every rail
(0–0.8 px) instead of trailing by 100–500 px and settling in stale positions.
One thing to eyeball: the bridge "pulse" pacing is authored and now visible
through the orb; it can be tuned in `BridgeSection` if it reads too fast.
