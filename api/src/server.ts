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

const app = buildApp({ verify });
await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 8080) });
