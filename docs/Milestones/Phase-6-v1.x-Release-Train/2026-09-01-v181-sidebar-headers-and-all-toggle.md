# 2026-09-01 — v1.8.1: ⇕ All walks expansion levels + header parity + resizable dashboard dock

**Version:** v1.8.1 (patch) · **Branch:** `development` · **Suite:** `tests/test-v181.js`
· **Source:** owner feedback with sidebar screenshots, 2026-09-01 evening (three items)

## 1 · ⇕ All steps through the view's levels

The button used to be a blunt all-or-none on ONE state set — and in the Projects
lens it only touched project expansion, never the sort-group headers. With groups
collapsed (the owner's screenshot), pressing it did nothing visible: "does not work
consistently."

Now it walks the levels the view actually has, in series (owner spec):

- **Projects lens + sort grouping (three levels):** all collapsed → groups open /
  projects closed → everything open → back to all collapsed.
- **Projects lens ungrouped and Departments lens (two levels):** a plain toggle.
- **Mixed states resolve forward, not backward:** "expanded" is judged against the
  whole board, so one hand-opened project no longer flips the button into
  collapse-everything — it finishes opening the rest first. A hand-collapsed group
  sends the walk to "groups open" first, same idea.

This also fires the Phase-3 ledger gate "Sidebar ⇕ All doesn't fold sort-group
headers — gate: PMs ask (REV77)."

## 2 · Header bars: one look in both lenses

The Projects-lens sort-group headers (REV44) had drifted from the Departments-lens
section headers: lighter bar (`#EDF2F7` vs `#D6DFEB`), different border/hover/ink,
and a paler count chip. They now wear exactly the department-header treatment —
same bar color, hover, uppercase label ink, and the standard count chip. The status
sort keeps its colored status pill (identity information, not decoration).

## 3 · The My Dashboard dock resizes by drag

The dashboard/summary dock had the fixed height the REV67 comment promised to
revisit "if asked" — asked. It now carries the same drag grip as the project edit
dock (the E1 pattern: document-level listeners keyed off the handle id, since the
dock repaints often). One CSS variable (`--medock-h`) drives the dock height and
`#main`'s bottom together, the height persists per browser
(`shopTimelineMeDockH`, 140px floor), and the existing collapse chevron still wins
while collapsed. Also fixed in passing: `test-v171`'s self-skip gate was tied to
the `APP_VER='1.7` prefix, so v1.8.0 silently dropped its ten checks from the
aggregate — it now gates on the feature marker.

## Known ceilings / follow-ups

- The cycle's "levels" are structural (groups → projects → phases). If a future
  view gains a fourth level, the walk needs that level added by hand.
- Two visually identical group headers can appear when the underlying values
  differ (e.g. two client spellings — visible as the double DIOR in the owner's
  screenshot). That's a data condition, not a rendering bug: the client strings
  differ on the projects. The Clients page / a future scrub pass is the fix; noted
  for the staffing-style reconciliation.
