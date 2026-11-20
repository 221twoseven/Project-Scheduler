# infra/ — the Systems API's Azure resources

This folder describes, in code, everything the Systems API needs in Azure. Running it
creates those resources; deleting their resource group removes every one of them. Nothing
here has been deployed yet (item 51 in `docs/TODO.md`; the plan is
`docs/Architecture-Review-Backend.md` §E16).

| File | What it is |
|---|---|
| `main.bicep` | The resources. Bicep is Microsoft's language for describing Azure resources. |
| `staging.bicepparam` | The values for staging. Production will get its own file; the resources stay the same. |
| `grant-app-read.sql` | One SQL statement pair, run once after the first deploy, that lets the API read the database. |

## What gets created (all in one resource group)

| Resource | What it does | Rough cost |
|---|---|---|
| App Service plan (`asp-systems-staging`) | The small Linux server the API runs on (B1 size). | about $13/month |
| Web app (`app-systems-staging-…`) | The API itself, on Node.js 22 (long-term support). HTTPS only. | included in the plan |
| Managed identity (on the web app) | The API's own Microsoft identity. It signs in to the database with no password. | free |
| SQL server (`sql-systems-staging-…`) | Holds the database. **Microsoft (Entra) sign-in only:** SQL user names and passwords are switched off, so no database password exists. | free |
| SQL database (`sqldb-systems-staging`) | The data (Basic size). | about $5/month |
| Log Analytics workspace + Application Insights | Where the API's request logs and errors go (kept 30 days). | a few dollars at most at this size |

Costs are estimates to check against the first bill (item 51, step 6).

## Before you start

- The Azure CLI (`az`), signed in with `az login`, on the account that owns the subscription.
- The subscription chosen: `az account set --subscription "<subscription name>"`.
- An Entra group to be the database's admin (for example "Systems SQL Admins", with you in
  it). You need its **display name** and **object ID** (Entra admin center → Groups → the
  group → Overview).

## 1. Create the resource group (once)

The region defaults to East US 2. Any region works; pick one and keep it.

```bash
az group create --name rg-systems-staging --location eastus2
```

## 2. Preview the change ("what-if") — changes nothing

PowerShell (set the admin group's name and ID for this terminal first):

```powershell
$env:SQL_ADMIN_NAME = "Systems SQL Admins"
$env:SQL_ADMIN_OBJECT_ID = "<the group's object ID>"
az deployment group what-if --resource-group rg-systems-staging --template-file infra/main.bicep --parameters infra/staging.bicepparam
```

Read the list: everything should be **Create** (green) the first time. Later runs should
show only the change you meant.

## 3. Create or update the resources

Same terminal, same two settings:

```bash
az deployment group create --resource-group rg-systems-staging --template-file infra/main.bicep --parameters infra/staging.bicepparam
```

It prints `appName`, `appUrl`, `sqlServer` and `sqlDatabase` at the end. Running it again is
safe: it only changes what differs from the file.

## 4. Let the API read the database (once)

In the Azure portal: the SQL database → **Query editor** → sign in with Microsoft (as a
member of the admin group). Paste `grant-app-read.sql`, replace `app-systems-staging-XXXX`
with the `appName` from step 3, and run it. The database's tables come from the API's
migrations (`api/migrations/`), applied the same way until the deploy pipeline does it
(item 51, step 4).

## Rollback: delete everything

```bash
az group delete --name rg-systems-staging
```

This removes every resource above, and their data, for good. Nothing in production or
SharePoint depends on them, so nothing else needs restoring.

## Rules

- Change resources here, in a pull request, never by clicking in the portal. Anything
  clicked in an emergency is written back into `main.bicep` the same day.
- No passwords, keys or connection secrets in these files, ever (`CLAUDE.md`, "Backend").
- Production resources wait for the owner's explicit go.
