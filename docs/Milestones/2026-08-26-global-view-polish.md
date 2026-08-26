# Global-view polish — Phase 3.5 opener (REV80) — 2026-08-26

**What this is.** The first slice of **Phase 3.5** — the owner's review adjustments
(`docs/TODO.md` §6) that gate the Phase 3 promotion
([PR #23](https://github.com/221twoseven/Project-Scheduler/pull/23)). Four
main-timeline items, plus the New Project ↔ Project Edit **parity audit** the same
review asked for (`docs/Phase-3.5-Parity-Audit.md` — diff list delivered, fixes
await the owner's picks). PR: pending.

**What changed (REV80):**

1. **Bar text is always white.** Black (ink) labels were hard to read on the colored
   bars — and rather than re-arguing per color, the palettes were darkened so white
   wins everywhere: 8 of 12 identity slots and the light department colors dropped in
   lightness (same hues — "Hermès is still the blue one"), every fill now passing
   white at ≥4.5:1. No logic changed: `labelColor()` still adjudicates, the palette
   just sits below its flip point on every slot. `beamsaw` and `electrical` stay a
   distinct gold pair. Design-Language §2.2/§2.3/§2.5 updated in step.
2. **The scroll wheel works over the project sidebar** — it used to only scroll with
   the mouse over the chart; the sidebar now forwards the wheel to the same scroller.
3. **The date bar drags to pan.** Click-and-drag anywhere on the timeline header
   moves the timeline left/right; a 4px threshold keeps month-name clicks (the
   go-to-date popover) working exactly as before.
4. **The Today button no longer touches the screen edge** — the timeline toolbar row
   gained its missing left padding.

**Why it mattered.** All four were friction a PM hits in the first minute of a
session: labels you squint at, a wheel that ignores half the window, no direct way
to grab the timeline, and a button pressed into the bezel.

**Evidence** (stubbed-data captures, headless Chrome):

| What | Screenshot |
|---|---|
| Before — ink labels on light bars, Today at the edge (REV79) | [before-3-5-white-text.png](Phase%203.5/screenshots/before-3-5-white-text.png) |
| After — white labels on the darkened palette, Today padded (REV80) | [after-3-5-white-text.png](Phase%203.5/screenshots/after-3-5-white-text.png) |

**Tests.** New suite `tests/test80.js` (13 assertions: every identity/department/
fallback fill labels white at ≥4.5:1 — independently recomputed; rendered bars carry
the white label; wheel-over-sidebar scrolls both axes; header drag pans and follows
the pointer; a post-drag click is swallowed while a plain month-name click still
opens the goto popover; the toolbar padding rule exists). `tests/test-contrast.js`
keeps guarding the 4.5:1 floor and its fallback-grey list was updated; the
deuteranopia suite (`test-cb.js`) passes on the darker palette unchanged.

**Known ceilings / follow-ups** (ledgered in `docs/TODO.md` §7):

- The white-text rule covers the **bar palettes** (identity, department, install,
  fallback grey). The project page's light **subtask shades** (`kidShade()`) still
  use the computed label and can legitimately pick ink — extending the rule there
  would mean darkening the child shades and losing the light-tint hierarchy; owner's
  call if wanted.
- Drag-to-pan lives on the **date header only** — canvas drag still belongs to the
  bars (move/resize). If PMs want canvas panning, it needs a modifier-key design.
- The month-header **strip colors** (vivid mode) are untouched — they're background,
  not bars, and keep their own contrast function.
