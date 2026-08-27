# The project pages get the coach-mark tour (REV86) — 2026-08-27

The last implementation item from the Phase 3.5 punch list that had its decision
(`docs/TODO.md` §6; owner ruling 2026-08-27: **one shared tour**, not two). PR:
[#28](https://github.com/221twoseven/Project-Scheduler/pull/28) (rides the
REV84/85 branch).

**What shipped.** The Help button now teaches the page you're on: on the main
timeline it runs the REV74 tour as before, and on Project Edit / New Project it
starts a project-page tour **in place** (it used to bounce you back to the
timeline first). One step list serves both pages — breadcrumb trail, the
glance-numbers strip, the schedule (including the REV84 calendar collapse),
the Gantt/Calendar switch, and the bottom editor. The one-step branch the
owner asked about costs nothing: the tour machinery already drops steps whose
target isn't on screen, so the draft sees a "Nothing is real yet" step on the
Create button and the saved page sees an "Everything saves itself" step on the
autosave note.

![Step 3 of 6 — the schedule, spotlit on the saved page](Phase%203.5/screenshots/after-3-5-pp-tour.png)

**Deliberately NOT included:** a first-visit auto-run. The REV74 tour auto-runs
once on a fresh browser; the project tour is Help-only for now — auto-running
it would surprise every existing user on their next project open. Ledgered in
TODO §7 for the owner to upgrade if onboarding data asks for it.

**Tests.** New suite `tests/test86.js` (11 assertions): the tour opens in place
on the saved page with the autosave step and no Create step, the branch flips
on the draft, and the timeline tour is untouched (still starts at the sidebar).
`test74` (the REV74 tour) still green. Full `npm test` green.
