# 2026-08-28 — Versioning switch: REV numbers → semantic versions

**What changed.** The app's version label moved from a running build counter
(`REV 101`) to semantic versioning, starting at **v1.0.1**. The single source of
truth in `index.html` was renamed `APP_REV` → `APP_VER` and now holds a string
(`'1.0.1'`); every place the version shows (toolbar pill, sandwich-menu note,
print header, meeting sheet) now reads `v1.0.1`. `package.json` /
`package-lock.json` were aligned to `1.0.1`, and README / CONTRIBUTING /
Handoff-Notes updated.

**Why.** REV numbering carried the app through alpha (REV1–50) and beta
(REV50–100). REV101 is the first release rolled out under the v1.0.1 syntax, so
the label users see should match. From here: bump the **last** number for fixes
and small releases, the **middle** number for feature drops, the **first** for
breaking changes.

**History mapping.** REV1–50 = alpha, REV50–100 = beta, REV101 = v1.0.1.
`reference/Timeline_50.html` intentionally still says REV 50 — it's the frozen
baseline and is never edited.

**Ceiling / notes.** The DOM ids (`tb-rev`, `tb-rev-num`) and the test that
checks them were kept as-is to keep the diff small; rename only if they ever
cause confusion.
