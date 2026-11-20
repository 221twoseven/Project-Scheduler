// Staging values for infra/main.bicep. Production gets its own file, prod.bicepparam,
// when production is approved; nothing else changes between the two.
using './main.bicep'

param env = 'staging'

// The SQL server's Entra admin. Set these two in your terminal before deploying
// (infra/README.md, step 2). They are identifiers, not passwords.
param sqlAdminName = readEnvironmentVariable('SQL_ADMIN_NAME')
param sqlAdminObjectId = readEnvironmentVariable('SQL_ADMIN_OBJECT_ID')

// The staging API registration's Application (client) ID. All zeros until the owner applies
// the registration (item 51, step 4): until then the API accepts no token at all.
param apiAudience = '00000000-0000-0000-0000-000000000000'
