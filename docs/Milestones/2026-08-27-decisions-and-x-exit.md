# Four Phase 3.5 decisions land + the × exit ships (REV85) — 2026-08-27

The four decision-gated Phase 3.5 punch-list items got their rulings today
(recorded in `docs/Archive/TODO-v1-Archive.md` §6 and the docs each one touches). PR:
[#28](https://github.com/221twoseven/Project-Scheduler/pull/28) (rides the
REV84 branch).

**The rulings:**

1. **Coach marks on Project Edit / New Project: ONE shared tour.** The REV82
   convergence made the pages near-identical; a one-step branch covers the
   draft's Create button. (Implementation is the next work item.)
2. **Fourth exit: yes — add the ×.** Shipped below as REV85.
3. **Double-click on a phase: stays unbound.** Single-click already opens the
   editor (REV82/84); the verb stays reserved per Design-Language §6. This
   fully dispositions the parity audit — nothing in it is open anymore.
4. **Completion flow: green-lit, build both** — the manual Complete button and
   the PM late-project prompt. (The storage-shape check passed earlier today:
   `complete` is an existing shared status value; no schema change.)

**The × exit (REV85).** An × now sits at the right edge of the project pages'
breadcrumb bar (both pages), the fourth exit alongside Esc, Done, and the
breadcrumb — same action as Done: back to all projects, and on a draft it
leaves without creating (the autosaved stash still protects typed work against
an accidental close). Same hover treatment as the app's other close buttons.

![The × on the breadcrumb bar](Phase%203.5/screenshots/after-3-5-x-exit.png)

**Tests.** New suite `tests/test85.js` (5 assertions, both pages): the × sits
on the breadcrumb bar, exits the saved page, exits the draft without creating
a project. Skips on pre-REV85 builds. Full `npm test` green.

**Known ceilings / follow-ups:** none — the × is a third binding of the
existing `goTimeline` exit, no new semantics.
