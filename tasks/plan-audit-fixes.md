# Implementation Plan: Fix Audit Findings (Frontend)

**Status: COMPLETE — all phases done, all checkpoints verified. Per-task evidence in `tasks/todo.md`.**

## Overview

The frontend audit (landing → results) found 1 high, ~3 medium and ~12 low issues, plus dead code and a 976-line landing monolith. This plan fixes every finding, one task at a time, ordered so cheap isolated wins land first, behavioral/a11y fixes next (with the launch scroll-lock rework as the one higher-risk item), and the LandingPage decomposition last. Each phase ends in a checkpoint (build + lint + runtime smoke via Playwright). No server-side changes are planned; verification reuses the stored journey/results in the test browser's localStorage to stay inside the Groq rate limit (15 req/hr).

Working tree currently holds the previously verified six fixes (uncommitted) — this plan builds on top without touching them.

## Architecture Decisions

- **Launch section (High) — FINAL after user review:** the fixed-screen experience is kept (snap to section + page scroll lock while the 7.5s sequence plays) because the product owner preferred it. The audit's escape hatches remain: a visible **Skip** button stops the >5s auto-motion on demand, `prefers-reduced-motion` completes instantly with no lock, and unmount always releases the lock. Rationale: preference wins over the hijack concern once a stop mechanism exists.
- **Contrast:** `text-slate-500` (#64748b, ~4.1–4.2:1 on the dark bg) → `text-slate-400` (#94a3b8, ~7:1). Disabled-control states are exempt and stay unchanged.
- **Live regions:** announce *phase text* (changes every few seconds), never the per-frame percentage. Percentage gets `role="progressbar"` + `aria-valuenow` but no live region. Share/copy confirmation via a visually hidden `role="status"`. Validation screen (`ImproveYourIdeaScreen`) gets focus moved to its `<h1>` on mount (route-change focus management).
- **Reduced motion:** `<MotionConfig reducedMotion="user">` at App root for framer-motion, plus extending the existing `prefers-reduced-motion` CSS block in `landing.css` to the scanner/radar/pulse classes. Launch fast-path from `useReducedMotion()`.
- **Wizard autosave:** debounce (500 ms) localStorage writes on every field change + flush on unmount; the existing "restored answers" banner already explains restored state, so autosave is now honest. `handleStartOver` still clears everything.
- **Example chips:** call `resetJourney()` before `setInputs({ idea })` — an example chip means "start this example fresh", not merge into a previous journey.
- **Error handling:** class `ErrorBoundary` (dark-styled fallback, reload + home actions) around `<Routes>`; `path="*"` renders a minimal `NotFoundPage`.
- **Dead code:** delete `ProjectionLayer.tsx` + `AssetLoader.ts`, remove `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` from `package.json`, run `npm install` to sync the lockfile.
- **Monolith (Phase 3):** extract verbatim (no behavior change): constants → `constants.ts`; components → `src/components/landing/*.tsx`; `LandingPage.tsx` becomes the composition root. Move-then-verify with build + landing smoke at each step; revert the step if parity fails.

## Task List

All tasks below were executed; see `tasks/todo.md` for per-task acceptance status and evidence.

### Phase 1 — Quick wins (isolated)
- [ ] Task 1: Contrast sweep `text-slate-500` → `text-slate-400` (9 results files)
- [ ] Task 2: Dot-nav `aria-current`
- [ ] Task 3: "N more characters needed" copy bug (`IdeaInputFlow.tsx`)
- [ ] Task 4: Accessible names for budget/team cards + stage cards
- [ ] Task 5: Skip-to-content link on landing
- [ ] Task 6: Visible `:focus-visible` styles (act cards, stage cards, global buttons/links)
- [ ] Task 7: Remove dead three.js code + unused deps

### Checkpoint A
- [x] `npm run build` passes (lint unavailable: eslint not installed in repo — pre-existing)
- [x] Contrast re-scan: 0 solid-text violations on results
- [x] Landing + results still render (smoke)

### Phase 2 — Behavior & accessibility
- [ ] Task 8: ErrorBoundary + `path="*"` 404
- [ ] Task 9: Live regions (loader phase/progressbar, share status) + validation-screen focus
- [ ] Task 10: Reduced motion (MotionConfig + CSS block + launch fast-path)
- [ ] Task 11: Launch rework: drop scroll-lock, add Skip, no forced jump
- [ ] Task 12: Wizard draft autosave (debounced + unmount flush)
- [ ] Task 13: Example chips reset journey first
- [ ] Task 14: Mobile results bar parity (Edit → Analyze Again)
- [ ] Task 15: Mobile orb/chips overlap fix
- [ ] Task 16: Framer-motion dev warning — locate via init-script stack capture; fix or document

### Checkpoint B
- [x] Build passes (lint N/A)
- [x] Playwright smoke: landing (skip, no lock), input (autosave survives reload), stage (validation focus), results (mobile bar, live regions), 404 route
- [x] Console: 0 errors, 0 warnings; fm warning fixed at root (static `<html>`) and documented

### Phase 3 — LandingPage decomposition (no behavior change)
- [x] Tasks 17–19 (executed as one extraction pass): `landing/constants.ts`, `landing/HeroPanels.tsx`, `landing/sections.tsx` (4 sections consolidated from 6 planned files to reduce import edges), `landing/LaunchPad.tsx`, `landing/navigation.tsx`; `LandingPage.tsx` = composition + scroll-spy (213 lines)

### Checkpoint C
- [x] Build passes (lint N/A)
- [x] Landing smoke at 1440 + 390 post-split: 10 sections, nav, dot nav (aria-current), chips, launch skip, 0 console errors
- [x] `LandingPage.tsx` = 213 lines (was 967), constants single-sourced in `landing/constants.ts`

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Launch rework regresses the landing climax | Med | Keep timeline/rAF logic intact; only remove lock + add skip; verify at both viewports |
| Phase 3 moves subtly break animated sections | Med | Verbatim moves, build+smoke after each task, revert step on parity failure |
| Groq rate limit hit while verifying | Low | Reuse stored results journey; ≥1 fresh analysis budgeted for Checkpoint B only |
| Autosave writes partial drafts users didn't intend | Low | Existing restored-answers banner + Start fresh button cover this |
| Removing `three` deps breaks hidden imports | Low | `tsc -b` + build gate; grep confirmed only ProjectionLayer/AssetLoader use them |

## Open Questions

- Commit strategy: six earlier fixes + audit fixes are uncommitted. Proposal: commit after Checkpoint B (fixes), optionally again after Checkpoint C (refactor). Awaiting user preference.
