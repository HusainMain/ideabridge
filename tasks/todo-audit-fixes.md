# Task List: Audit Fixes — COMPLETE

All tasks and checkpoints below are verified unless a note says otherwise.
Evidence: live Playwright runs against Vite :5173 + Express :5000 (real Groq for
the two analysis runs), screenshots in `.playwright-mcp/audit/`.

---

## Phase 1 — Quick wins — DONE

## Task 1: Contrast sweep (slate-500 → slate-400) — [x]
14 replacements across ResultsWorkspace + 7 results components. Playwright scan:
0 slate-500 text elements, 47 slate-400. Screenshot: `fix-results-contrast-desktop.png`.

## Task 2: Dot-nav aria-current — [x]
Active dot exposes `aria-current="true"`; verified moving with scroll ("How It Works").

## Task 3: "more characters needed" copy — [x]
Now "3 / 500 characters — 7 more needed" / "— 6 more needed"; ≥10 shows none.

## Task 4: Accessible names for choice cards — [x]
Budget/team/stage cards expose clean `aria-label`s ("Bootstrap / Low. Budget is under $5k", …).

## Task 5: Skip-to-content link — [x]
Tab from top focuses "Skip to content"; Enter moves focus to `#main-content`.

## Task 6: Visible focus styles — [x]
Global `button:focus-visible, a:focus-visible` + `.act-stage-card:focus-visible` cyan outline in index.css.

## Task 7: Dead three.js code + deps — [x]
Deleted `ProjectionLayer.tsx` + `AssetLoader.ts` (71 packages removed via npm install);
README tree updated. JS bundle unchanged — R3F was already tree-shaken; the win is
node_modules/lockfile hygiene.

---

## Checkpoint A — [x]
- [x] Build passes (lint unavailable: eslint not installed in repo — pre-existing)
- [x] 0 contrast violations on results
- [x] Landing + results smoke clean

---

## Phase 2 — Behavior & accessibility — DONE

## Task 8: ErrorBoundary + 404 route — [x]
`src/components/ErrorBoundary.tsx` wraps Routes; `src/pages/NotFoundPage.tsx` on `path="*"`.
404 verified live at `/definitely-not-a-page` (heading + home link). Boundary is
class-standard; not trip-tested (would require an artificial crash).

## Task 9: Live regions + validation focus — [x]
Verified during a real analysis: `role="progressbar"` with `aria-valuenow` (25 at sample),
`role="status"` phase text ("Understanding your market..."), share announced
("Report summary copied to clipboard"). Validation screen: live test with a nonsense
submission — focus lands on the H1 (`tabindex="-1"`). Mobile "Copy failed" parity added.

## Task 10: Reduced motion — [x]
`<MotionConfig reducedMotion="user">` in App; landing.css reduce block now covers
all 17 animated classes (+skip-link). Under emulated reduce: pulses compute `none`.

## Task 11: Launch rework — [x]
Scroll-lock/forced `scrollTo`/body-fixed removed entirely. Live test: body stays
`static`, scrollY stable through the sequence, Skip appears → click completes
(progress 1.0, CTA enabled). Reduced-motion path completes instantly.

## Task 12: Wizard autosave — [x]
500 ms debounce + unmount flush. Live: typed probe persisted within 900 ms and
survived a reload; banner reappears on later visits (one-shot chip flag cleared
from history after first mount).

## Task 13: Example chips reset journey — [x]
Live with a completed journey: chip click → `ideabridge-journey` shows only the
example idea (industry/budget cleared), no stale results, no "restored" banner.

## Task 14: Mobile bar parity — [x]
Mobile bar now "Redo / Share / Print / Export" wired to `onAnalyzeAgain`.
390 + 320: no overflow, no wrapped labels (43 px buttons).

## Task 15: Mobile orb overlap — [x]
`@media (max-width: 860px)`: hero panel min-height 460, orb 180 px at top 12%.
Measured overlap 0 px at 320/390/768; desktop unchanged (18 px kiss, chips clear).
Screenshot: `fix-hero-mobile-orb.png`.

## Task 16: Framer-motion dev warning — [x]
Root cause found via stack capture: framer-motion v11's dev guard warns when its
default scroll container `<html>` computes `position: static`. Fixed with
`html { position: relative; }` (visually inert). 0 warnings on landing + results.

---

## Checkpoint B — [x]
- [x] Build passes (lint N/A)
- [x] Launch, input reload, chip reset, mobile bar, 404 — all verified live
- [x] 0 console errors AND 0 warnings across all flows
- [x] 6-fix regression re-run: Back → home, browser-back → report intact;
      Analyze Again → fresh analysis (live Groq) → results

---

## Phase 3 — LandingPage decomposition — DONE
Executed with one structural change vs plan: the six section files were
consolidated into `sections.tsx` (four cohesive sections in one module) plus
`HeroPanels.tsx`; this keeps import edges lower while still decomposing the
monolith. All moves verbatim via script extraction; build verified after.

## Task 17+18+19: Extract → `src/components/landing/` — [x]
- `constants.ts` — all data constants + scan/section constants (12 exports)
- `HeroPanels.tsx` — ChatPreview + OrbAnchor
- `sections.tsx` — HowItWorksSection, ReadinessSection, EcosystemMap, AIAnalysisSection
- `LaunchPad.tsx` — the launch sequence
- `navigation.tsx` — StickyNav + DotNav
- `LandingPage.tsx` — 213 lines (was 967): imports + scroll-spy + composition only

Backup of the pre-split file: `.playwright-mcp/LandingPage.pre-split.tsx` (untracked).

## Checkpoint C — [x]
- [x] Build passes (tsc clean; one unused import fixed)
- [x] Landing parity live: 10 dot items (1 active), 3 chips, 3 mentor cards,
      10 sections, 5 pinned containers, footer, skip link, launch skip works
- [x] 0 console errors/warnings post-split
- [x] `LandingPage.tsx` = 213 lines < 250

---

## Post-completion amendments (after user review)

1. **Launch fixed-screen restored (user preference).** The scroll lock + snap is
   back: the sequence plays as one uninterrupted fixed screen. Kept from the
   audit fixes:
   - the **Skip animation** button (stop mechanism for the >5s auto-motion)
   - reduced-motion users get the finished state instantly and are never locked
   - unmounting mid-sequence always releases the lock (effect cleanup)
   Verified live (1440 and 390): lock engages (body `fixed`, scroll frozen), Skip
   unlocks + completes + restores scroll to the section, the natural 7.5s end
   unlocks, reduced motion never locks. Console clean in all paths (one
   informational framer-motion notice only under emulated reduced motion).
2. **Encoding repair.** The Phase-3 extraction script read UTF-8 as ANSI on
   Windows PowerShell, mojibake-ing em-dashes/quotes in comments of the five
   `landing/` files. Re-extracted from `.playwright-mcp/LandingPage.pre-split.tsx`
   with explicit UTF-8 read/write; verified non-ASCII now only the intended
   `—` and `'` characters.
