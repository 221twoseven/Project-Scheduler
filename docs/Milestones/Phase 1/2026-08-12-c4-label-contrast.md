# Bar and pill label contrast (C4) — 2026-08-12

**What changed.** Text that sits on a colored bar or pill now always meets the WCAG
4.5:1 contrast minimum. A new `labelColor(bg)` function in `index.html` picks dark ink
or white — whichever reads better against the fill — and is applied to timeline bar
labels, project-page bar labels (including department summary bars), and the
project-page calendar bands. The old hard-coded white/slate text colors on those
surfaces were removed.

**Palette touch-ups.** Four colors had no passing text color and were nudged, keeping
their hue: department colors `pm` (`#5B7C99` → `#567693`) and `install` on the project
page (`#6366F1` → `#5A5DEC`), plus the "complete" and "forecast" status-pill text
(both → `#475569`). Everything else is unchanged.

**Regression guard.** `tests/test-contrast.js` (now part of `npm test`) checks every
project color, department color, the install red, and every status-pill pair — 58
assertions. Any future palette edit that drops below 4.5:1 fails CI. The suite skips
itself on the frozen REV50 reference build, which predates `labelColor`.

**Docs.** `docs/Design-Language.md` §2.5 had a fixed `L > 0.44` threshold that
contradicted its own 4.5:1 rule; it now documents the shipped compare-both-candidates
rule, and §2.3 records the two department-color nudges.

**Rev/refs.** UX audit finding C4, task brief T1. All 7 suites pass on `index.html`
and on the reference build.
