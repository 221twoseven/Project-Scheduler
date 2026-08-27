# Toolbar grouping — design pass (Phase 3.5)

*2026-08-27 · for the owner's pick before any code (TODO §6 "Toolbar clarity").
The complaint: two toolbars with competing/mixed categories — view styles, data
filters, and actions interleaved.*

**DECIDED 2026-08-27: the owner picked Option A** — shipped the same day as
REV88 (`docs/Milestones/2026-08-27-toolbar-regroup.md`); the grouping rule is
now codified in Design-Language §2.6.

## What's there today

**Row 1 (dark, global):** brand · **+ New Project** · My Dashboard · Print ▾ ·
Settings ▾ (People, Clients, **Density**) · Help · — · REV · sync pill

**Row 2 (timeline):** Today (+ go-to-date) · [Day 2-Day Week Month] ·
"Color" [Project Team] · search · Status ▾ · Person ▾ · Views ▾ ·
Clear filters · — · Vivid months · Protect dates · ?

The mixing the owner sensed, named:

- **Density** is a view style but hides inside Settings, two clicks from its
  siblings (scale, color).
- **Today** is navigation but sits flush against the view styles.
- **Views** *captures* the whole row (filters + zoom + density + lens) but sits
  in the middle of the filter cluster, reading like another filter.
- **Vivid months** (view style) and **Protect dates** (an editing safety, not a
  view at all) float together at the right with the ? legend.

## The organizing rule (any option below follows it)

Each control answers one of four questions, and controls that answer the same
question sit together, in reading order:

1. **Do something** — New Project, Dashboard, Print, Settings, Help → row 1
   (already true today; row 1 needs no change).
2. **Where am I looking** — Today / go to date.
3. **How is it drawn** — scale, color lens, density, vivid.
4. **What is shown** — search, status, person, clear.

**Views** is the named bundle of 2–4, so it belongs at the row's edge — the
summary of the row, not a member of one cluster. **Protect dates** answers none
of them (it guards editing); it moves out of the way, not into a cluster.

## Option A — recluster row 2, keep everything visible *(recommended)*

```
Today·goto │ D 2D W M · Project/Team · Comfortable▾ · Vivid │ search · Status · Person · Clear │ ——— │ Views ▾ · 🔒 · ?
  WHERE            HOW IT'S DRAWN                                WHAT'S SHOWN                        the row, named
```

- Micro-eyebrow labels over the three clusters (WHERE / STYLE / FILTER — the
  existing `t-mini` "Color" treatment, Design-Language §3 micro), separators
  between clusters only.
- **Density surfaces out of Settings** into the style cluster as a small cycle
  button (the Settings menu item stays as an alias for a release, then retires).
- **Views moves to the right edge**, next to Protect dates and ?.
- Nothing gains or loses a click except Density (loses one). Muscle memory for
  scale buttons, search and filters is preserved in place.
- Effort: markup reorder + a few CSS rules. No behavior changes.

## Option B — one "View" menu, single visible cluster

Collapse scale/color/density/vivid into one **View ▾** dropdown (like Print ▾),
leaving row 2 as: Today · View ▾ · search · Status · Person · Clear · — ·
Views ▾ · 🔒 · ?.

- Cleanest-looking row; but the scale steps (the most-touched controls, with
  D/W/+/− keys) go behind a menu — a click tax on the most frequent action.
  The B3 zoom brief deliberately made them one-click. Not recommended alone;
  could pair with A later if the row still feels busy on small screens.

## Option C — merge to one toolbar row

Fold row 2 into row 1 (brand · New Project · Dashboard │ Today · styles ·
filters │ Print · Settings · Help · sync). Saves ~36px of vertical space, but
overloads one row past ~1400px-wide comfort and mixes the global actions back
into view controls — the opposite of the complaint. Listed for completeness;
not recommended.

## Recommendation

**Option A.** It fixes exactly what was named (mixed categories) without moving
any frequent control behind a menu, and it's a markup-reorder, not a rebuild.
If the owner picks A, the implementation is one REV: reorder row 2, add the two
eyebrow labels, surface Density, move Views right; suites `test-b3-zoom`,
`test-b5`, `test-v4-views` guard the controls' behavior and don't care about
position.
