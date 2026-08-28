# 2026-08-28 — Docs reorganization + the v2.0.0 backlog

**What changed.** Housekeeping to open the v2.0.0 phase — no app code touched.

- **Created `docs/Archive/`** and retired the completed planning docs into it:
  the v1 backlog (`TODO-v1-Archive.md`, everything closed except carried loose
  ends), the UX audit/strategy, the Phase 1/2/3 task-brief packs (Phase 3's
  moved in from the repo root), the Phase 3.5 parity audit, both toolbar design
  docs, and the hallway-test round 2 script (still the round-3 baseline if a
  round ever runs).
- **Wrote a fresh `docs/TODO.md`** — the v2.0.0 track: a condensed REV50→v1.0.1
  history, the loose ends carried from v1, the owner's 13 new objectives sorted
  by ease of implementation, a proposed version ladder (patches → minors →
  v2.0.0 reserved for the single-source-of-truth cutover), and the deferred
  ledger carried forward entry-by-entry (two entries closed in the move: the
  Settings→Density alias and the eyebrow labels, both resolved by the native
  toolbar's REV92/95).
- **Repointed every cross-reference** (CLAUDE.md, README, Design-Language,
  milestone records — including the two in space-named Phase folders) to the
  new `docs/Archive/` paths; references to the old TODO's §6/§7 now name the
  archive file explicitly.

**Why it mattered.** The v1 backlog was ~700 lines of almost entirely closed
items — history posing as a to-do list. v2 work needed a clean sheet without
losing the ledger discipline (rationale + gate, updated in place, never
deleted).

**Found in passing** (now §2 of the new TODO): `index.html` still tells users
to "add people in Settings" / "Settings → Clients" — stale since REV95 retired
the Settings menu for Resources. Copy fix rides the first quick-wins batch.

**Version:** none — docs only; `APP_VER` stays 1.0.1.

**Known ceilings / follow-ups.** Milestone records keep their original REV
numbering and in-time references; only file paths were rewritten, not history.
