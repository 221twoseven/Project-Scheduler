# Hallway Test — Round 2

Ready-to-run script for the round-2 usability test (TODO §4). Everything a
facilitator needs: setup, the tasks word-for-word, a scoring sheet, and which
open decisions each observation feeds. Budget: half a day total, ~20–25 minutes
per tester.

## Who and where

- **Three testers, same roles as the plan in `UX-Audit-and-Strategy.md` §6:**
  one PM, one fabricator, one manager. Same people as round 1 if possible —
  comparison is the point. If round 1's assist counts were never written down,
  record this round carefully anyway: **it becomes the baseline** for round 3.
- **URL:** https://221twoseven.github.io/Project-Scheduler/preview/ — the
  development build (REV73). Testers sign in with their own work account.
- **⚠ The preview writes to the REAL shared SharePoint lists.** Before the
  sessions, create one sacrificial project named **`TEST — Hallway (delete
  me)`** with 3–4 departments and a deadline a few weeks out. Every task that
  *changes* anything (reschedule, subtask, checkpoint) happens on that project
  only. Delete it when the last session ends (project delete cleans up its
  events and tasks).

## Facilitator rules

- Read each task aloud exactly as written, then **stay silent**. Re-reading
  the task on request is free; anything more is an assist.
- **An assist = any hint** — pointing, naming a button, "try right-clicking,"
  even a leading "what do you think that icon does?" Count every one.
- Ask testers to think aloud. Write down verbatim confusion ("I thought that
  was a filter") — quotes decide roadmap items better than counts do.
- If a tester is stuck 2+ minutes with no progress, give the assist, count it,
  and move on. Nobody suffers for science.

## The tasks

**Block A — the round-1 five** (identical wording, for comparison):

| # | Say this | Success looks like | Watch for |
|---|----------|--------------------|-----------|
| A1 | "Find the project *[pick a real one]* and open it." | Lands on its project page | Search vs scrolling; sidebar two-line rows doing their job |
| A2 | "Tell me its status and when it installs." | Reads status pill + install/deadline | Status legend use; meta strip vs modal |
| A3 | "Fabrication on **TEST — Hallway** slipped — move it 3 days later." | Fab bar moved (drag or date fields), undo toast noticed or not | Grab vs resize confusion (REV73 widened narrow-bar handles — did it help?) |
| A4 | "Who's out of the shop next week?" | Finds time off (People & Availability, or a person panel) | Path taken — nobody has been told where this lives |
| A5 | "Print the meeting sheet for this week." | Reaches Print → meeting sheet preview | Print menu discoverability |

**Block B — the features built since round 1** (this is why the test waited):

| # | Say this | Success looks like | Watch for |
|---|----------|--------------------|-----------|
| B1 | "Show me just *your* work." | My Dashboard button, or person filter set to self | Identity chain resolving them; the breadcrumb back out |
| B2 | "On TEST — Hallway, switch to the calendar and make design start this coming Monday." | Calendar mode, band dragged/resized to Monday | REV71/72 parity: do they try to drag at all? Edge handles found? |
| B3 | "Design will do this job in two chunks — set that up." | Splits design into subtasks (right-click → add subtask), places them | N11 right-click-creates discovery; parallel-subtask sculpting (the overlap decision assumes PMs can do this) |
| B4 | "Add a checkpoint called 'Client approval' next Friday." | Checkpoint created (agenda panel or chart right-click), lands on the right date | **Feeds N9:** do they reach for 'checkpoint' vs 'task' correctly, or not care? |
| B5 | "Start a new project for *[a real client]* — just name it and set the install date, don't save." | Draft page, client type-ahead used (or free-typed), deadline set | N3 client list: does the suggest list read as optional or as a gate? Then Escape — does the unsaved-changes warning make sense to them? |

## Scoring sheet

One row per task per tester. Copy this into notes or print it.

| Task | Tester/role | Done? (Y / assisted / N) | Assists | Time (rough) | Verbatim confusion |
|------|-------------|--------------------------|---------|--------------|--------------------|
| A1 | | | | | |
| …one row each, A1–A5, B1–B5 | | | | | |

Total the assist column per tester and per task. Round 1 comparison, if
counts exist, is per-task on Block A only.

## What the results decide (don't skip this part)

- **Phase 3 scope:** if testers still fight navigation (lost scrolling in A1,
  zoom complaints anywhere) → build B3 zoom + B5 compact density. If they
  don't → build B6 saved views instead. (Phase 2 brief's standing rule.)
- **N14 coach marks (Phase 4 pull-forward):** only if testers sit stuck with
  no idea right-click exists (watch B3/B4). Otherwise it stays Phase 4.
- **N9 checkpoints vs tasks:** B4's watch-for. If testers treat them as one
  thing, that's the vote to merge the stores; if the distinction is natural,
  keep two. Last open decision in the backlog — this is its data.
- **Promotion:** if Block A assist counts drop vs round 1 (or Block B mostly
  self-serves), merge PR #15. The ruleset and CI gate it regardless.

## After the sessions

1. Delete `TEST — Hallway (delete me)`.
2. Write the results into a short milestone record
   (`docs/Milestones/YYYY-MM-DD-hallway-round-2.md`): the scoring table,
   the quotes, and which of the decisions above each result triggered.
3. Tick the TODO §4 item and make the merge call on PR #15.
