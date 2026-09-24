# 2026-08-20 — Project-page title row uncovered (REV59)

**What happened:** Robert asked where the N1 breadcrumb was — nowhere to be found, and
the only visible way back to the timeline was the Done button at the bottom.

**Why:** the project page's title row (the ← Timeline button, the project color dot,
the editable name, and the REV57 breadcrumb tail) was rendering the whole time —
*underneath* the main timeline's toolbar row. The toolbar is pinned to the top of the
window at a higher layer; the project page starts 50px down, leaving room for the
header row only. REV57's N15 hid five individual toolbar controls on the project page
but left the row itself, and that row sat exactly on top of the title bar. Every
element in it was painted and never visible.

**The fix (REV59):** N15 now hides the entire timeline toolbar row on the project
page, not just five of its controls — which is the honest reading of the affordance
rule anyway, since the survivors (Today, Vivid months, Protect dates) also act only on
the main chart. With the row gone, the title bar lands where the layout always
expected it: ← Timeline, the project name, and the breadcrumb tail
(`‹ Phase name`, appears when a bar is selected, click to unwind one layer).

- Evidence: `screenshots/rev59-title-row-before.png` / `rev59-title-row-after.png`.
- `tests/test57.js` N15 assertion updated to accept the row-level rule (still accepts
  the REV57–58 per-control form so it can gate older builds).
- PR: rides the open promotion PR
  ([#15](https://github.com/221twoseven/Project-Scheduler/pull/15)).

**Follow-up worth knowing:** this also explains why the breadcrumb never showed in
anyone's hands-on use of `/preview/` despite test57 passing — the suite asserts DOM
and CSS text in jsdom, which has no layout engine, so "covered by a fixed bar" is
invisible to it. Screenshot evidence against a real browser (the `make-preview.js`
stub) is the check that catches this class of bug.
