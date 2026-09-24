# 2026-09-24 — v1.x backlog retired; Phase 7 (pilot readiness) opened

**What changed.** Docs only — no app code touched; `APP_VER` stays 1.23.0. Nothing in
the new plan is built or started; this record opens the planning phase.

- **Retired the v1.x backlog** (`docs/TODO.md`, the v1.0.2 → v1.23.0 run, 2026-08-28 →
  2026-09-24) to `docs/Archive/TODO-v1.x-Archive.md`, frozen as-is with a retirement banner.
- **Audited every unfinished entry before carrying it.** A 43-agent sweep read all
  1,353 lines of the old file in eight sections, extracted 149 candidate entries that
  were not marked done, and checked each against `index.html`, `CHANGELOG.md` and
  `tests/` for evidence it had quietly shipped. Twelve had (or were stale placeholders)
  and are closed in the new file's §7.0 rather than carried; ten ledger entries described
  their ceiling wrongly and were corrected in the carry (e.g. the changelog fetch already
  pages — the real ceiling is an unbounded full-list read; Vivid hides weekends only,
  holidays got name pills in v1.20.0). The other ~130 carried with their gates.
- **Fact-checked the Project Director's September 2026 brief** (Robert's condensed
  version with its "Response" annotations): 125 claims about what the app does today,
  93 confirmed, 28 partly right, 1 refuted, 3 unverifiable from the repo. The corrections
  are folded into the new backlog where they change the plan (see "Found in passing").
- **Wrote a fresh `docs/TODO.md`** — Phase 7: the restated north star (shared registries
  are the source of truth; Timeline is one view of them), a three-phase roadmap toward
  v2.0.0 and the portal suite, the Phase 7 build list drawn from the brief's P0/P1 rows
  and corrected by the audit, the open design decisions the suite forces, the reference
  material still to gather (with owners), the schema candidates, and the ledger.
- **Milestones:** Phase 6 (the v1.x release train) closes at v1.23.0. New folder
  `Phase-7-Pilot-Readiness/`; row added to `docs/Milestones/README.md`. Records for
  Phase 7 releases go here, not in Phase 6.

**Why it mattered.** The goalposts moved twice in September: the Project Director's
brief asks for a limited pilot and a shared project registry, not an app that replaces
everything; the owner's vision puts Timeline inside a portal of sibling apps (Client
Manager, Personnel Manager, Design Resources Manager) sharing the same lists. Both
conflict with the retired backlog's north star — "the app becomes the company's singular
source of truth" with v2.0.0 as the cutover. Carrying 90 unchecked boxes into that frame
would have kept planning against a goal nobody holds any more. Development also stops
being solitary: milestones and the strategy will be presented to Hubert and the key
users as the phase runs, so the backlog now separates *decisions to take together* (§4)
from *work to do* (§3).

**Found in passing** (from the brief fact-check; each is now a line in the new TODO):

- The Employee Contacts import fetches every column into the browser (no `$select`) —
  Pay Type and PersonalEmail cross the wire even though they are never stored or shown.
- A blank Primary Phone silently imports the Mobile Phone column (the fallback chain).
- The People page shows employment Status and admin/dev badges to every signed-in user.
- New Project pre-fills the install date at today + 42 days, so the "required" install
  date never actually has to be chosen — any Tentative/TBD design starts there.
- Lock dates means two things: on the timeline it blocks moves; on the project page it
  blocks resizes only.
- Saved views live in the browser (`localStorage`), so they cannot serve as role-based
  audience views without new storage.
- Undo covers project/phase/milestone/note edits only; People, Clients and Settings have
  none in-app.
- Clients already carry a stable key (`spId`) — the name-keyed selection ceiling needs
  no new column.
- `docs/ARCHITECTURE.md` and `SETUP.md` lag the code (5 lists documented vs 9 in use;
  2 Graph scopes vs 4); the repo lives under a GitHub *user* account, not an organization;
  there are no release tags and no written rollback procedure.

**Version:** none — docs only.

**Known ceilings / follow-ups.** The Phase 7 build list is a proposal until the owner,
Hubert and the Project Director agree the scope; the fourteen design decisions in the new
TODO §4 are open. The condensed brief itself is not in the repository (the repo is public;
adding it is the owner's call).
