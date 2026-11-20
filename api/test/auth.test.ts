// Allow and deny tests for Entra token validation, run in-process with inject(): no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.ts';
import { AUDIENCE, OID, SCOPE, TENANT, logSink, noDb, token, verify } from './tokens.ts';

const OTHER_TENANT = '99999999-9999-9999-9999-999999999999';

async function get(url: string, authorization?: string) {
  const app = buildApp({ verify, db: noDb, logStream: logSink().stream });
  const res = await app.inject({ method: 'GET', url, headers: authorization ? { authorization } : {} });
  await app.close();
  return res;
}

test('allow: a valid delegated token reads /api/me', async () => {
  const res = await get('/api/me', `Bearer ${await token()}`);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { oid: OID, name: 'Test Person' });
  assert.match(String(res.headers['x-request-id']), /^[0-9a-f-]{36}$/);
});

test('allow: /health needs no token', async () => {
  assert.equal((await get('/health')).statusCode, 200);
});

const denied: [string, () => Promise<string | undefined>, number][] = [
  ['no Authorization header', async () => undefined, 401],
  ['not a Bearer token', async () => `Basic ${await token()}`, 401],
  ['garbage token', async () => 'Bearer not.a.jwt', 401],
  ['signed by a key Entra never published', async () => `Bearer ${await token({}, { key: 'stranger' })}`, 401],
  ['expired', async () => `Bearer ${await token({}, { exp: '-1m' })}`, 401],
  ['issued by another tenant', async () => `Bearer ${await token({ iss: `https://login.microsoftonline.com/${OTHER_TENANT}/v2.0`, tid: OTHER_TENANT })}`, 401],
  ['right issuer, wrong tid claim', async () => `Bearer ${await token({ tid: OTHER_TENANT })}`, 401],
  ['v1 issuer (sts.windows.net)', async () => `Bearer ${await token({ iss: `https://sts.windows.net/${TENANT}/` })}`, 401],
  ['for another audience (e.g. a Graph token)', async () => `Bearer ${await token({ aud: '00000003-0000-0000-c000-000000000000' })}`, 401],
  ['no oid', async () => `Bearer ${await token({ oid: undefined })}`, 401],
  ['valid but without the scope', async () => `Bearer ${await token({ scp: 'User.Read' })}`, 403],
  ['scope name only as a substring', async () => `Bearer ${await token({ scp: `${SCOPE}X` })}`, 403],
  ['app-only token (roles, no scp)', async () => `Bearer ${await token({ scp: undefined, roles: [SCOPE] })}`, 403],
];

for (const [why, auth, status] of denied) {
  test(`deny ${status}: ${why}`, async () => {
    const res = await get('/api/me', await auth());
    assert.equal(res.statusCode, status);
    assert.equal(res.json().requestId, res.headers['x-request-id']);
    assert.equal(res.json().oid, undefined);
  });
}

test('deny: an unknown path still needs a token (secure by default)', async () => {
  assert.equal((await get('/api/nothing-here')).statusCode, 401);
});

test('deny: an unsigned (alg none) token', async () => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'none' })}.${b64({ iss: `https://login.microsoftonline.com/${TENANT}/v2.0`, aud: AUDIENCE, tid: TENANT, oid: OID, scp: SCOPE, exp: now + 300 })}.`;
  assert.equal((await get('/api/me', `Bearer ${unsigned}`)).statusCode, 401);
});

test('log: one line per request with reqId, oid, route, status, ms and nothing sensitive', async () => {
  const sink = logSink();
  const app = buildApp({ verify, db: noDb, logStream: sink.stream });
  const jwt = await token();
  const ok = await app.inject({ method: 'GET', url: '/api/me?x=1', headers: { authorization: `Bearer ${jwt}` } });
  const no = await app.inject({ method: 'GET', url: '/api/me' });
  await app.close();

  const entries = sink.lines.map((l) => JSON.parse(l)).filter((e) => e.msg === 'request');
  assert.equal(entries.length, 2);
  const [a, b] = entries;
  assert.equal(a.reqId, ok.headers['x-request-id']);
  assert.equal(a.oid, OID);
  assert.equal(a.route, '/api/me');
  assert.equal(a.status, 200);
  assert.equal(typeof a.ms, 'number');
  assert.equal(b.reqId, no.headers['x-request-id']);
  assert.equal(b.oid, null);
  assert.equal(b.status, 401);

  const all = sink.lines.join('\n');
  for (const secret of [jwt, jwt.split('.')[2], 'Bearer', 'Test Person', 'x=1', 'authorization', '127.0.0.1']) {
    assert.ok(!all.includes(secret), `log must not contain ${secret}`);
  }
});
