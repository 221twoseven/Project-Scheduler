# api/ — the Systems API

A small TypeScript web server (Fastify) that will sit between the Systems pages and the
Azure SQL database. Today it is the read-only proof of concept from item 51
(`docs/Architecture-Review-Backend.md` §E16). Nothing here runs in the browser, and
Timeline does not call it yet.

## Run the tests

```bash
cd api
npm ci
npm test
```

`npm test` type-checks the code and runs every `test/*.test.ts` in-process: no network, no
Azure, no Entra. Tokens are signed with keys made up for the run.

The SQL tests (`test/projects.sql.test.ts`) need a SQL Server and are skipped without one.
CI starts a throwaway SQL Server container with a password made up for that run. To run
them on your machine, start a container the same way (`.github/workflows/ci.yml`, job
`api`) and set `SQL_TEST_PASSWORD` to that container's password. Never commit it.

## Endpoints

| Route | Answer |
|---|---|
| `GET /health` | `{ ok: true }`, no token needed (App Service's health check) |
| `GET /api/me` | The caller's Entra object ID and display name |
| `GET /api/projects` | Every project, in the shape Timeline's `fieldsToProj` gives |
| `GET /api/projects/{id}` | One project by its UUID; `404 PROJECT_NOT_FOUND` if none, `400` if the ID isn't a UUID |

The response schemas in `src/projects.ts` decide what leaves the server: a column not listed
there is never sent.

## The database

- `migrations/` — numbered SQL files, applied in order by `src/migrate.ts`, each in its own
  transaction and recorded in `dbo.SchemaMigration`. Never edit one that has been applied;
  add the next number.
- `seed/synthetic-projects.sql` — invented rows for staging and the tests. Not a migration,
  so production never gets them.
- The API signs in to Azure SQL with no password (`azure-active-directory-default`): its
  managed identity in Azure, your `az login` on a laptop. It only reads (`db_datareader`,
  `infra/grant-app-read.sql`).

## How a request is checked

Every route needs a Microsoft (Entra) access token unless it is marked public (only
`/health` is). The API checks the token itself (`src/auth.ts`):

- signed by one of Entra's published keys (RS256 only);
- issued by the TwoSeven tenant (v2.0 issuer, and the `tid` claim);
- meant for this API (`aud` = the API registration's client ID);
- a person's delegated token holding the scope (`Systems.Access` by default); app-only
  tokens are refused.

No token or a bad one → `401`. A good token without the scope → `403`. Each answer carries
an `x-request-id` header, and the error body repeats it.

## Logs

One JSON line per request: request ID (`reqId`), the caller's Entra object ID (`oid`), the
route, status and duration in ms. Never the token, names, emails, request bodies or
query strings (a test checks this).

## Settings (set by `infra/main.bicep` in Azure)

| Setting | Meaning |
|---|---|
| `ENTRA_TENANT_ID` | The tenant tokens must come from |
| `API_AUDIENCE` | The API registration's Application (client) ID |
| `API_SCOPE` | The scope every token must hold |
| `SQL_SERVER`, `SQL_DATABASE` | The Azure SQL server and database |
| `PORT` | Set by App Service |
