import sql from 'mssql';
import { buildApp } from './app.ts';
import { makeVerifier } from './auth.ts';

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing setting ${name} (set by infra/main.bicep in Azure)`);
  return v;
}

const verify = makeVerifier({
  tenantId: need('ENTRA_TENANT_ID'),
  audience: need('API_AUDIENCE'),
  scope: need('API_SCOPE'),
});

// No password: in Azure this resolves to the app's managed identity, on a laptop to `az login`.
const db = new sql.ConnectionPool({
  server: need('SQL_SERVER'),
  database: need('SQL_DATABASE'),
  options: { encrypt: true },
  authentication: { type: 'azure-active-directory-default', options: {} },
});
await db.connect();

const app = buildApp({ verify, db });
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 8080) });
