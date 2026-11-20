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
| `PORT` | Set by App Service |
