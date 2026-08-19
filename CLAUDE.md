# CLAUDE.md

Project rules and context for working in this repository. Read this before making any change.

> **Note on who edits this app:** contributors are not all programmers — systems
> designers, managers, and shop staff work on it too. Many changes are made through
> GitHub in a web browser, with no local setup (see `CONTRIBUTING.md`). Keep that in mind:
> the rules below still apply to everyone, but the docs should stay approachable and the
> browser workflow is the default path for non-developers.

## Core files

- **`reference/Timeline_50.html` — immutable reference. NEVER modify it.** The untouched
  copy of the colleague's working REV50 app, kept in `reference/` as the frozen baseline
  to diff against and as the control build for `npm run test:ref`. Do not edit its
  contents. (It lives in `reference/`, not the repo root, to keep it clearly separate
  from the live app.)
- **`index.html` — the company-developed application. This is the primary
  implementation file.** All company feature work happens here. It began as a
  byte-for-byte copy of the REV50 reference; divergence is expected over time.
+- **`docs/Design-Language.md` — the design system. Read it before any change that
+  touches appearance or interaction.** If a change contradicts it, either follow the
+  doc or update the doc in the same PR — never silently diverge.
+- **`docs/UX-Audit-and-Strategy.md` — the current UX plan.** Findings, phases, and
+  the finding→fix index. Task briefs reference its IDs (C1, B2, E3, …).

## Branches

- **`main` is the production / GitHub Pages branch.** It is what users run. Treat it as
  protected — do not develop directly on it.
- **Development work happens on the `development` branch** unless explicitly instructed
  otherwise. Open changes there and promote to `main` deliberately.
- **Pushes auto-deploy to GitHub Pages** via `.github/workflows/deploy-pages.yml`:
  `main` → `/`, `development` → `/preview/`, `sandbox` → `/sandbox/` (a collaborator's
  copy). The workflow rebuilds the whole site from all three branches each run, so it must
  stay identical on all three. See `docs/Onboarding-Fork.md`.

## Shared infrastructure — SharePoint & Entra

The SharePoint site and Lists are **shared infrastructure**. They are used by BOTH this
company app (`index.html`) AND a separately maintained colleague app. Changes here can
break the other application.

- **Do not rename, delete, change column types, or otherwise alter the existing
  SharePoint List schema without explicit approval.** The other app reads and writes the
  same Lists; a schema change is a cross-application breaking change.
- **Do not change Entra client IDs, tenant IDs, Graph permissions/scopes, redirect URIs,
  or the authentication architecture without explicit instruction.** These are tied to an
  external Entra app registration and shared expectations.

The current infrastructure values (for reference — do not change without instruction):

- SharePoint site: `twosevennet.sharepoint.com/sites/TWOSEVENINC`
- Lists: `ShopTimeline_Projects`, `ShopTimeline_Tasks`, `ShopTimeline_Staff`,
  `ShopTimeline_Tasks2`, `ShopTimeline_Events` (Events is app-only — the colleague app
  never reads it)
- Entra (public SPA / PKCE, single-tenant): Client ID `5ba3aabe-81f7-41c9-92a4-83a45d5407ab`,
  Tenant ID `70aa5330-416f-48cb-a64f-1a89f0196577`
- Graph scopes: `User.Read`, `Sites.ReadWrite.All`

## Security

- **Never commit secrets, access tokens, passwords, client secrets, or credentials.**
  This repo is public (GitHub Pages). Access tokens are acquired at runtime and held only
  in `sessionStorage` — keep it that way. Client ID and Tenant ID are public SPA
  identifiers by design and are not secrets, but no client secret must ever exist in a
  browser SPA.

## Testing

- **Preserve the existing test harness.** `harness.js` boots a Timeline HTML file in
  jsdom with MSAL and `fetch` stubbed, recording every Graph request so persistence is
  asserted on the actual outgoing request bodies.
- **Run the tests after implementation changes.** `tests/run.js` aggregates all 17 suites
  (behaviour suites `test46`–`test54`, `test-label`, plus the Phase 1–2 UX/design suites);
  see `tests/README.md`. Validate company changes against `index.html`, and the frozen
  baseline with `test:ref`:

  ```bash
  npm install && npm test && npm run test:ref
  ```

  Every feature should be asserted on BOTH the new-project draft page and the saved
  project page (see the "REV49 lesson" in `README.md`).

## Change discipline

- **Prefer small, reviewable changes.** Do not refactor unrelated working code unless
  explicitly requested.
+- **UI changes ship with evidence:** before/after screenshots from `/preview/` in the
+  PR description, and the accessibility checklist from `docs/Design-Language.md` §9
+  confirmed for any surface you touched.
- **Before any substantial architectural change, first explain:** the proposed change,
  the files it affects, the risks (especially to shared SharePoint/Entra infrastructure
  and the colleague app), and the rollback path. Wait for approval before proceeding.

## Milestones

**Every development milestone gets a short record in `docs/Milestones/`.** This covers
anything worth remembering later: bandwidth/performance passes, UX/design changes, a Teams
integration, schema or auth changes, a notable refactor. Skip it only for trivial fixes.

- One Markdown file per milestone, named `YYYY-MM-DD-short-slug.md`.
- Keep it plain-language and skimmable: what changed, why it mattered, the app REV(s), a
  pointer to the PR, and any known ceiling or follow-up. A non-developer should understand it.
- Link any shareable artifact (explainer page, diagram) from the record.

## Architecture summary

A **single-file, client-only SPA**. `index.html` (~5,900 lines) contains all HTML, CSS,
and vanilla JavaScript — no framework and no build step. It is a shop-timeline / Gantt
dashboard for projects, tasks, staff, and to-dos.

- **Frontend:** hand-rolled vanilla JS in one HTML file, plus a locally vendored
  `msal-browser.min.js` (not loaded from a CDN).
- **Auth:** MSAL.js browser library, delegated PKCE flow against a single-tenant Entra
  app registration. Sign-in via `loginPopup`, tokens via `acquireTokenSilent`
  (fallback `acquireTokenPopup`), cached in `sessionStorage`.
- **Backend is SharePoint — there is no server of our own.** Microsoft Graph v1.0 is the
  API. The five SharePoint Lists on the `TWOSEVENINC` site are the database. The site ID
  is resolved at runtime; Lists are addressed by name.
- **Data flow:** load reads all Lists on startup, then a 45-second background poll picks
  up other users' edits (paused during drag/edit/open overlays). Writes are optimistic
  and state-diffed into per-record Graph `POST`/`PATCH`/`DELETE` calls, with a sync-status
  pill, one automatic retry, and undo toasts. Missing optional Lists (`ShopTimeline_Staff`,
  `ShopTimeline_Tasks2`) degrade gracefully to browser-local storage; a missing
  `ShopTimeline_Events` falls back to saving events on host phases (the pre-REV54 way).
- **Hosting:** GitHub Pages serving the static `index.html`; `no-cache` meta tags force
  fresh loads.
- **Testing:** a jsdom harness that stubs MSAL and `fetch` and records every Graph call,
  so persistence is verified against the real outgoing request bodies.

There is no Teams-specific code or configuration; this is a standalone web app backed by
SharePoint.
