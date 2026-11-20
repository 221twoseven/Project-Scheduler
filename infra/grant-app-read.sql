-- Run ONCE after the first deploy, signed in as the SQL server's Entra admin
-- (infra/README.md, step 4). It lets the API's managed identity read the database,
-- and nothing more: the Azure test is read-only (item 51).
-- Replace app-systems-staging-XXXX with the appName the deploy printed.
CREATE USER [app-systems-staging-XXXX] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [app-systems-staging-XXXX];
