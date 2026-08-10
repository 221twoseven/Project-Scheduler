# Setup — Hosting & Authentication

The working configuration for the deployed app. If sign-in ever breaks after a move,
rename, or domain change, this is the first place to check. **All of these values are
shared with a separately maintained colleague app** — do not change the app registration,
client ID, or tenant ID; only add/adjust redirect URIs with care (see `CLAUDE.md`).

> Values here are public identifiers (client ID, tenant ID, list names). They are **not**
> secrets — a browser SPA exposes them by design. Real access is gated by Entra sign-in
> and each user's SharePoint permissions. Never add a client secret; there is none.

## Live app

- **URL:** https://221twoseven.github.io/Project-Scheduler/
- **Hosting:** GitHub Pages, served from the `main` branch, repo root.
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
```

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

| Scope | Admin consent required? |
|---|---|
| `User.Read` | No |
| `Sites.ReadWrite.All` | **Yes** |

- Grant tenant-wide admin consent (**API permissions → "Grant admin consent for
  <tenant>"**) so ordinary users aren't blocked by a consent screen they can't approve.
- Because auth is **delegated**, the app acts as the signed-in user. Each user also needs
  edit/contribute rights on the SharePoint site and lists below, or reads work but saves
  fail.

## SharePoint (the backend — no server of our own)

- **Site:** `https://twosevennet.sharepoint.com/sites/TWOSEVENINC`
- **Lists** (addressed by name; the site ID is resolved at runtime):
  `ShopTimeline_Projects`, `ShopTimeline_Tasks`, `ShopTimeline_Staff`,
  `ShopTimeline_Tasks2`.

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
