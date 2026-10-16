# Setup — Hosting & Authentication

The working configuration for the deployed app. If sign-in ever breaks after a move,
rename, or domain change, this is the first place to check. **All of these values are
tied to the company's Entra app registration** — do not change the app registration,
client ID, or tenant ID; only add/adjust redirect URIs with care (see `CLAUDE.md`).

> Values here are public identifiers (client ID, tenant ID, list names). They are **not**
> secrets — a browser SPA exposes them by design. Real access is gated by Entra sign-in
> and each user's SharePoint permissions. Never add a client secret; there is none.

## Live app

- **URL:** https://221twoseven.github.io/Project-Scheduler/
- **Hosting:** GitHub Pages, published by `.github/workflows/deploy-pages.yml`: `main`
  at the root, `development` at `/preview/`, and `test` at `/test/` for one feature on
  trial (same sign-in, same lists). Each subpath is its own Entra SPA redirect URI.
- The path is **case-sensitive** (`Project-Scheduler`, capital P and S) and resolves with
  a **trailing slash**. The lowercase form (`/project-scheduler`) is a 404.

## Microsoft Entra (app registration)

- **Application (client) ID:** `5ba3aabe-81f7-41c9-92a4-83a45d5407ab`
- **Directory (tenant) ID:** `70aa5330-416f-48cb-a64f-1a89f0196577`
- **Supported account types:** single tenant (this organization only).
- **Authentication library:** MSAL browser (`msal-browser.min.js`), auth-code flow with
  PKCE. No client secret.

### Redirect URI — the part that breaks most often

The app sends Entra, as its redirect URI, **the exact URL of the page it loaded from**
(minus any `#`/`?`). See `spInit()` in `index.html`:
`redirectUri: window.location.href.split('#')[0].split('?')[0]`.

So Entra must hold that exact string, registered under the **Single-page application
(SPA)** platform:

```
https://221twoseven.github.io/Project-Scheduler/
https://221twoseven.github.io/Project-Scheduler/preview/
https://221twoseven.github.io/Project-Scheduler/test/
```

One line per subpath: production, `/preview/`, and `/test/` (item 72, 2026-10-16).

Rules:

- **Platform must be "Single-page application (SPA)", not "Web".** Under "Web" you get
  `AADSTS9002326` (cross-origin token redemption is only allowed for SPA) even if the
  string matches.
- **Exact match, case-sensitive, trailing slash included.**
- Optionally also register `https://221twoseven.github.io/Project-Scheduler/index.html`
  to cover anyone who lands on the explicit file.
- Implicit grant (access/ID token checkboxes) is **not** needed — MSAL uses the code flow.

> **If the repo is renamed, moved to another org, or given a custom domain, the Pages URL
> changes and this redirect URI must be re-registered to match** — otherwise every
> sign-in fails with `AADSTS50011` (redirect URI mismatch). The error page prints the
> exact `redirect_uri` the app sent; register that verbatim under SPA.

### API permissions (Microsoft Graph, delegated)

| Scope | Admin consent required? | Used for |
|---|---|---|
| `User.Read` | No | Sign-in |
| `Sites.ReadWrite.All` | **Yes** | Every SharePoint list |
| `TeamMember.Read.All` | **Yes** (granted 2026-08-25) | Staff picker's name suggestions from the company Team |
| `Mail.Send` | No (admin-consented 2026-09-01) | The feedback form's email to the recipients (v1.8.0) |

- The last two ride their own silent token request: without consent, that one feature
  degrades (free-text names; report filed, mail skipped) and sign-in is unaffected.

- Grant tenant-wide admin consent (**API permissions → "Grant admin consent for
  <tenant>"**) so ordinary users aren't blocked by a consent screen they can't approve.
- Because auth is **delegated**, the app acts as the signed-in user. Each user also needs
  edit/contribute rights on the SharePoint site and lists below, or reads work but saves
  fail.

## SharePoint (the backend — no server of our own)

- **Site:** `https://twosevennet.sharepoint.com/sites/TWOSEVENINC`
- **Lists** (addressed by name; the site ID is resolved at runtime):
  `ShopTimeline_Projects`, `ShopTimeline_Tasks`, `ShopTimeline_Staff`,
  `ShopTimeline_Tasks2`, `ShopTimeline_Events`, `ShopTimeline_Clients`,
  `ShopTimeline_Config`, `ShopTimeline_Changelog`, `ShopTimeline_Feedback`. HR's
  `Employee Contacts` is read for the People-page import and never written.
  Column specs: `docs/TODO.md` §6.
- **Creating `ShopTimeline_Events`** (standalone events, REV54 — the app runs fine
  without it, falling back to saving events on phases): a plain list with these columns,
  all single-line text unless noted — `appId`, `projectId`, `department`,
  `date` (Date only), `notes` (multi-line text). `Title` (built-in) carries the event
  name. Only this app uses the list; the colleague app never reads it.

## Feedback Bot (the tracker poller's registration)

A second, separate Entra registration — **"ShopTimeline Feedback Bot"** — lets the
private tracker repository `221twoseven/Project-Scheduler-issues` read
`ShopTimeline_Feedback` and file each report as a GitHub issue (`docs/Automations.md`).

- **Permission:** Microsoft Graph application `Sites.Selected`, admin-consented
  2026-09-25, with `write` granted on the TWOSEVENINC site only.
- **Client ID:** not in this repository. It lives only in the tracker's Actions secret
  `GRAPH_CLIENT_ID`; read it from Entra (App registrations ▸ ShopTimeline Feedback Bot).
- **Client secret:** "GitHub Actions Poller", in the tracker's Actions secrets.
  **It expires on 2028-09-23.** From that day every poll run fails with `token: 401`.
  Before then: create a new secret on the registration, paste its **Value** (not its
  Secret ID) into the tracker's secret, and run the poll workflow once to confirm.

## How to confirm it all works

1. Open https://221twoseven.github.io/Project-Scheduler/ in a normal browser.
2. Sign in with a Twoseven account. The Microsoft popup should complete without an error.
3. The timeline populates and the **sync pill turns green ("synced …")**.
4. **Test as a non-admin user too** — admins can pass consent individually even when
   tenant-wide admin consent hasn't been granted, which hides the "needs admin approval"
   failure ordinary users would hit.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| `AADSTS50011` redirect URI mismatch | Registered URI doesn't match the live URL exactly (case / trailing slash / wrong path) | Register the exact string above under SPA |
| `AADSTS9002326` cross-origin redemption | Redirect URI registered under "Web", not "SPA" | Move it to the SPA platform |
| Works for admins, "needs admin approval" for users | Tenant-wide admin consent not granted for `Sites.ReadWrite.All` | Grant admin consent for the tenant |
| Reads work, saves fail | User lacks SharePoint edit rights | Grant contribute/edit on the site & lists |
| App loads but sign-in never appears / 404 | Wrong URL case, or Pages not serving | Use the exact case-sensitive URL; check Pages is on for `main` |

## Repository settings (governance)

### Branch protection on `main`

So nothing reaches the live site without passing CI (this is what would have stopped a
"merged before the check went green" push):

GitHub → repo **Settings → Branches → Add branch ruleset** (or classic **Add rule**):

- **Target:** `main`.
- **Require a pull request before merging.** Set **Required approvals: 0** for a small
  team, so a solo contributor can still merge their own PR.
- **Require status checks to pass before merging** → select **CI**. (The check only
  appears in the list after it has run at least once — it has.)
- Optional: **Require branches to be up to date before merging.**
- **Do not allow bypassing the above settings** (classic: "Include administrators") →
  turn **ON** to truly prevent merging a red build. It applies to everyone, including
  admins; toggle off only for a genuine emergency.

> Branch protection / rulesets are free on **public** repos. If this repo is later made
> **private** under a free org plan, enforcing protection may require a paid plan.

### Tenant-wide admin consent

Verify in **Entra admin center → App registrations →** the app (client ID
`5ba3aabe-…`) **→ API permissions**: `Sites.ReadWrite.All` should show **"Granted for
<tenant>"** with a green check. If not, click **"Grant admin consent for <tenant>"**.
Then do one **non-admin** sign-in test — admins can self-consent and mask the
"needs admin approval" wall that ordinary users would hit.
