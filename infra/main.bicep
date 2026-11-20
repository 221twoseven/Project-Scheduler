// The Systems API's Azure resources, for ONE environment (item 51, step 1).
// Deployed into a resource group that already exists (see infra/README.md).
// Staging and production differ only in their parameter files (review §E11).

@description('Environment name; part of every resource name.')
@allowed(['staging', 'prod'])
param env string

@description('Azure region. Defaults to the resource group\'s region.')
param location string = resourceGroup().location

@description('Entra tenant (public identifier, not a secret).')
param tenantId string = '70aa5330-416f-48cb-a64f-1a89f0196577'

@description('The SQL server\'s Entra admin: an Entra group (recommended) or a person. Its display name.')
param sqlAdminName string

@description('Object ID of that Entra group or person.')
param sqlAdminObjectId string

@allowed(['Group', 'User'])
param sqlAdminPrincipalType string = 'Group'

@description('Token audience the API accepts: the API registration\'s Application (client) ID, which Entra v2 access tokens carry as aud.')
param apiAudience string

@description('Delegated scope the API requires in every token.')
param apiScope string = 'Systems.Access'

@description('App Service plan size. B1 is the smallest tier with Always On.')
param planSku string = 'B1'

@description('Database size. Basic is about $5 a month (verify on the bill).')
param sqlSku string = 'Basic'

var suffix = uniqueString(resourceGroup().id) // keeps globally unique names stable per group
var name = 'systems-${env}'
var tags = { product: 'Systems', environment: env, item: '51' }

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-${name}'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${name}'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logs.id
  }
}

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: 'sql-${name}-${suffix}'
  location: location
  tags: tags
  properties: {
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    // Entra-only: SQL logins (user name + password) are off, so no database password exists anywhere.
    administrators: {
      administratorType: 'ActiveDirectory'
      azureADOnlyAuthentication: true
      login: sqlAdminName
      sid: sqlAdminObjectId
      principalType: sqlAdminPrincipalType
      tenantId: tenantId
    }
  }
}

// ponytail: "allow Azure services" (0.0.0.0) lets any Azure-hosted caller reach the server's
// front door; Entra-only auth still decides who gets in. A private endpoint + VNet is the
// upgrade when production data arrives (it adds cost and a VNet to the plan).
resource sqlAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource db 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: 'sqldb-${name}'
  location: location
  tags: tags
  sku: { name: sqlSku }
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'asp-${name}'
  location: location
  tags: tags
  kind: 'linux'
  sku: { name: planSku }
  properties: { reserved: true } // reserved = Linux
}

resource app 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-${name}-${suffix}'
  location: location
  tags: tags
  identity: { type: 'SystemAssigned' } // the API's own identity; it signs in to SQL with no password
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node dist/server.js'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      healthCheckPath: '/health'
      appSettings: [
        { name: 'ENTRA_TENANT_ID', value: tenantId }
        { name: 'API_AUDIENCE', value: apiAudience }
        { name: 'API_SCOPE', value: apiScope }
        { name: 'SQL_SERVER', value: sqlServer.properties.fullyQualifiedDomainName }
        { name: 'SQL_DATABASE', value: db.name }
        // Application Insights' codeless Node agent: request, dependency and console telemetry.
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: insights.properties.ConnectionString }
        { name: 'ApplicationInsightsAgent_EXTENSION_VERSION', value: '~3' }
      ]
    }
  }
}

// No password or key is set anywhere, and the template returns none.
output appName string = app.name
output appUrl string = 'https://${app.properties.defaultHostName}'
output appPrincipalId string = app.identity.principalId
output sqlServer string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabase string = db.name
