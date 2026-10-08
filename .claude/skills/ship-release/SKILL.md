---
name: ship-release
description: The release checklist for any change that ships to users in Shop Timeline (index.html). Covers branching from development, APP_VER + package.json, CHANGELOG + npm run notes, per-release tests, preview screenshots, /code-review, the full suite run and its traps, the PR, and the milestone record. Use whenever a change bumps APP_VER, when triage-issues step 2a builds a fix, or when the owner says "ship it", "release", "cut a version" or "/ship-release".
---

# Ship a release

The owner doesn't review code. This checklist, CI, and `/code-review` stand in for that
review, so **don't skip steps**. For docs-only and dev-tooling changes, use only steps 1,
8 and 9: no version bump and no changelog line.

`gh` path and auth: see the `gh-cli-access` memory. Repo: `221twoseven/Project-Scheduler`.

## 1. Branch

```bash
git fetch -q origin
git log --oneline origin/development..origin/main   # must print nothing
git switch -c fix/<slug> origin/development          # or feat/ style/ docs/
```

- If `origin/main` has commits that `development` lacks, open a `main → development` PR
  first and wait for it to merge. Otherwise the version and changelog collide.
- One change per branch. Never commit on `main` or `development` directly.

## 2. Build it, with tests per requirement

- Put the new assertions in **`tests/test-v<MAJOR><MINOR><PATCH>.js`** (v1.26.0 →
  `test-v1260.js`). Copy the header of the latest `test-v*.js` and **add the file to the
  list in `tests/run.js`**.
- Name each assertion after what it proves. When the work comes from `triage-issues`,
  that's the R it covers.
- **Assert on both the draft page (`#/project/new`) and a saved project** whenever the
  feature lives on the project page (`CLAUDE.md`, the REV49 lesson).
- **CI also runs every suite against `reference/Timeline_50.html`.** A check for a new
  feature must skip itself when the feature is missing:
  `if(!/<marker in new code>/.test(src)){console.log('  SKIP  … pre-v<ver> build');}`.
- Changing a behaviour on purpose? Update the old assertion to the new behaviour; don't
  delete it.
- Source edits containing backslashes, `#` or regexes go through Edit/Write, never a Bash
  heredoc (see the `bash-heredoc-backslash-trap` memory). Confirm with `grep -F`.
- Quick checks while you work run one suite at a time (about 30 seconds):
  `node tests/test-vNNNN.js index.html` and
  `node tests/test-vNNNN.js reference/Timeline_50.html`.

## 3. Version and release notes

1. Bump `const APP_VER='x.y.z'` in `index.html`.
   - Patch number: fixes and small changes.
   - Middle number: features.
   - First number: breaking changes.
2. **Set `package.json` `"version"` to the same value.**
3. In `CHANGELOG.md`, add the entry above the previous version:
   ```
   ## vX.Y.Z — Mon D, YYYY
   - <one concrete, shop-facing sentence per change>
   ```
   - Write for the team: what changed *for them*.
   - No "bug fixes" filler, and no line for developer-only tooling.
   - A version with nothing team-facing folds into the next entry's range (`v1.14–1.15`).
   - Collect lines under `## Unreleased` while working; rename the heading at ship.
4. Run `npm run notes`. It regenerates the in-app list; never edit `RELEASE_NOTES` by hand.
   `test-v160` fails CI if this drifts.
5. **`docs/TODO.md`, in the same commit:**
   - tick the item, `[x]`, with `Shipped vX.Y.Z (PR #N, <date>)`, or note what's left if
     it's only part-done;
   - set §0 to the new version on the branch it lands on;
   - add any follow-up the work turned up as a new item, or a §7 ledger line.

   Work with no item gets one first (`CLAUDE.md`). `test-todo` fails CI when §0 doesn't
   name `APP_VER`, when item numbers collide, or when a `Shipped vX` isn't a release.

## 4. Evidence in a real browser (any visible change)

1. Build the stubbed preview and screenshot **before** and **after** with headless Chrome,
   per the `visual-preview-stub` memory. Get the "before" build from
   `git show origin/development:index.html`, using the same seed data.
2. Save the PNGs to `docs/Milestones/Phase-7-Pilot-Readiness/screenshots/` as
   `before-<slug>.png` / `after-<slug>.png`. Use the folder of the phase that's running.
3. If you touched a screen, check the accessibility checklist in
   `design/Design-Language.md` §9.

## 5. Milestone record (skip only for trivial fixes)

Write `docs/Milestones/<running phase>/YYYY-MM-DD-<slug>.md`. Keep it in plain language:

- what changed and why;
- the version;
- the PR;
- the screenshots;
- any known limit or follow-up.

Skip it for a one-line wording fix.

## 6. `/code-review`

Run the `code-review` skill on the branch diff at `high`. Fix what's real; note what you
dismissed and why. Re-run single suites after fixes.

## 7. Full suite: the **last** step before committing

The traps are in the `slow-test-runs` and `git-checkout-crlf-trap` memories.

1. **Freeze the tree.** Finish every edit (code, docs, screenshots) first. Editing any
   tracked file while the run is going invalidates it: kill it and start again.
2. **Line endings.** The Write tool and git checkouts on this machine produce CRLF, which
   breaks suites that read the raw source. For every touched file:
   ```bash
   grep -c $'\r$' <file>      # run as a plain statement, not inside $( )
   sed -i 's/\r$//' <file>    # for any file that reported > 0
   ```
3. **Run it bare in the background**, with no pipe, so the log keeps every suite:
   `node tests/run.js index.html` with `run_in_background: true`. It takes 10–15 minutes.
4. **The exit code is always 0, even when tests fail.** When the run finishes, check the
   log:
   ```bash
   grep -n "  FAIL  " <log>     # must print nothing
   tail -4 <log>               # must read N/N suites passed
   ```
5. Also run `npm run test:ref` in the same way, or at least run the new suite against
   `reference/Timeline_50.html`.
6. Report failures with their output. Never call a red run green.

## 8. Commit and PR

```bash
git add <the files you changed>      # never `git add -A`: .claude/worktrees and settings.local.json live here
git commit -m "fix(<area>): <what> (vX.Y.Z)

Fixes 221twoseven/Project-Scheduler-issues#N

Co-Authored-By: <attribution from the system reminder>"
git push -u origin <branch>
gh pr create --base development --title "<plain title> (vX.Y.Z)" --body-file <file>
```

The PR body (written with Write) holds:

- **What changed for users:** the CHANGELOG line.
- **Requirements → tests:** a table of R / assertion / suite, when it comes from a spec.
- **Evidence:** before/after screenshots.
- **Checks:** the full suite result (`N/N suites, 0 FAIL`), the reference run, and the
  code-review outcome.
- `Fixes 221twoseven/Project-Scheduler-issues#N` for each tracker issue. They close when
  the PR merges.
- The PR attribution line from the system reminder.

Then call `mcp__ccd_pr__get_status` (bind the PR if it isn't bound) and offer Auto-fix.
Don't poll CI yourself.

## 9. After it merges

- The `development` merge deploys to `/preview/`. Users get it only when a
  `development → main` PR merges. The owner merges every PR by hand.
- Check that the change really reached `origin/main` before calling it shipped
  (`git log origin/main`). A commit pushed to a branch after its PR merged is stranded and
  needs a new PR.
- When the work came from the tracker, post the `**Fix shipped**` comment on the issue
  (the `triage-issues` skill, step 2a).
- The TODO tick went in with the release (step 3.5). A `development → main` promotion PR
  also updates §0's production version and runs the TODO audit in `CLAUDE.md`
  ("Keeping `docs/TODO.md` true").

## Never without explicit approval

- SharePoint list or column changes: deliver a column spec for the owner to apply.
- Entra/auth changes: client IDs, scopes, redirect URIs.
- Edits to `reference/Timeline_50.html` or `msal-browser.min.js`.
- Changes to `.github/workflows/deploy-pages.yml`: it must stay identical on `main` and
  `development`.
- `--no-verify`, force-push, or anything that bypasses the `main` ruleset.
