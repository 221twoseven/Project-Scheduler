# Calendar live resize + Phase 3.5 small closeouts (REV83) — 2026-08-26

Three Phase 3.5 punch-list items in one small pass (`docs/Archive/TODO-v1-Archive.md` §6). PR:
[#27](https://github.com/221twoseven/Project-Scheduler/pull/27).

**Calendar drag-resize live feedback.** Resizing a phase band from its edge handle
used to give no visual response until the mouse was released — the full-day snap
made it feel like nothing was happening. Now the day columns the band will span
*after* the snap tint live under the drag (both directions, saved and draft pages)
and the tint clears on release. The snap rules themselves are untouched — the tint
deliberately shows the **snapped** result (drag onto a Saturday and the tint ends
on Friday), so what you see mid-drag is exactly what release files. Implementation
is one CSS rule plus a class toggle on the existing `[data-d]` day cells; a
`::after` overlay carries the tint because the cells' inline background shorthand
and blend mode swallow class-level backgrounds and shadows.

![Mid-drag: the snapped span tints live, the chip names the snapped edge](Phase%203.5/screenshots/after-3-5-cal-resize-tint.png)

**Coach-mark copy.** The tour's timeline step claimed "Red bars are installs —
nothing else is ever red," but other red elements (the late chip, warnings) exist
across the site, so the claim invited confusion (owner review note). The tour now
stops at "Red bars are installs."; the legend screen's matching line was scoped
honestly to bars ("no other bar is ever red").

**Parity audit §4 verified closed.** The audit's deferred click-behavior rows
(`docs/Archive/Phase-3.5-Parity-Audit.md` §4) were re-checked against the REV82 build:
every row was already converged by REV81/82 — they were symptoms of the same roots
(draft selection, the I8 bug, the I5 Link gate) the earlier fixes hit. The one
survivor is **double-click**, unbound on both pages: an open owner decision
(candidate verb: "open editor"), not drift. The audit is now fully dispositioned.

**Tests.** New suite `tests/test83.js` (10 assertions, both pages): mid-drag tint
spans start→target, excludes cells outside the span, shows the snapped edge on a
weekend target, clears on release, and the resize still files; skips on builds
without the tint. Full `npm test` green.

**Known ceilings / follow-ups** (ledgered in TODO §7): the live tint covers
edge-resize only — drag-to-move keeps its tooltip-only feedback, per the brief.
