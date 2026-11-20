// SQL integration tests against a real SQL Server: the CI container (ci.yml, job "api"),
// whose sa password is generated per run. Skipped when SQL_TEST_PASSWORD isn't set.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sql from 'mssql';
import { buildApp } from '../src/app.ts';
import { migrate } from '../src/migrate.ts';
import { logSink, token, verify } from './tokens.ts';

const password = process.env.SQL_TEST_PASSWORD;
const skip = password ? false : 'SQL_TEST_PASSWORD not set (no SQL Server container)';
const here = import.meta.dirname;
const DB = 'systems_api_test';
const ID1 = '3f2a8c1e-0000-4000-8000-000000000001';

const conn = (database: string): sql.config => ({
  server: process.env.SQL_TEST_SERVER ?? 'localhost',
  user: 'sa',
  password,
  database,
  options: { trustServerCertificate: true }, // the container's self-signed certificate
});

let db: sql.ConnectionPool;

before(async () => {
  if (skip) return;
  const master = await new sql.ConnectionPool(conn('master')).connect();
  await master.request().batch(`IF DB_ID('${DB}') IS NOT NULL DROP DATABASE ${DB}; CREATE DATABASE ${DB};`);
  await master.close();
  db = await new sql.ConnectionPool(conn(DB)).connect();
  assert.deepEqual(await migrate(db, join(here, '../migrations')), ['0001_project.sql']);
  await db.request().batch(await readFile(join(here, '../seed/synthetic-projects.sql'), 'utf8'));
});

after(async () => {
  await db?.close();
});

async function get(url: string, auth = true) {
  const app = buildApp({ verify, db, logStream: logSink().stream });
  const res = await app.inject({ method: 'GET', url, headers: auth ? { authorization: `Bearer ${await token()}` } : {} });
  await app.close();
  return res;
}

test('migrations run once: a second run applies nothing', { skip }, async () => {
  assert.deepEqual(await migrate(db, join(here, '../migrations')), []);
});

test('a failing migration rolls back whole and is not recorded', { skip }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'mig-'));
  await writeFile(join(dir, '9999_bad.sql'), 'CREATE TABLE dbo.Half (x INT); SELECT * FROM dbo.NoSuchTable;');
  await assert.rejects(migrate(db, dir));
  const r = await db.request().query(`SELECT OBJECT_ID('dbo.Half') AS t, (SELECT COUNT(*) FROM dbo.SchemaMigration WHERE name = '9999_bad.sql') AS n`);
  assert.deepEqual(r.recordset[0], { t: null, n: 0 });
});

test('allow: GET /api/projects lists the synthetic rows in the fieldsToProj shape', { skip }, async () => {
  const res = await get('/api/projects');
  assert.equal(res.statusCode, 200);
  const list = res.json();
  assert.equal(list.length, 3);
  const p = list.find((x: { id: string }) => x.id === ID1);
  assert.deepEqual(p, {
    id: ID1,
    legacyAppId: 'synthetic0001aaaaaa',
    name: 'Sample Window Display',
    client: 'Example Retail Co.',
    jobCode: 'EX-0001',
    deadline: '2027-03-15',
    status: 'in-fabrication',
    projectManager: 'Sample PM A',
    drafter: 'Sample Drafter A',
    leadFab: 'Sample Lead A',
    fabricators: 'Sample Fabricator A, Sample Fabricator B',
    activeDepartments: ['pm', 'td', 'cnc', 'fab', 'finish', 'install'],
    sortIndex: 1,
    createdAt: '2026-11-01',
    confirmedAt: '2026-11-18T14:30:00.000Z',
    confirmedBy: 'Sample PM A',
  });
  const bare = list.find((x: { name: string }) => x.name === 'Sample Lobby Sign');
  assert.equal(bare.deadline, '');
  assert.equal(bare.sortIndex, null);
  assert.equal('confirmedAt' in bare, false); // absent when unset, as in fieldsToProj
  assert.equal('rowVersion' in bare || 'refs' in bare, false); // never leave the server
});

test('allow: GET /api/projects/{id} returns one project', { skip }, async () => {
  const res = await get(`/api/projects/${ID1.toUpperCase()}`);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().id, ID1);
});

test('deny: projects need a token', { skip }, async () => {
  assert.equal((await get('/api/projects', false)).statusCode, 401);
  assert.equal((await get(`/api/projects/${ID1}`, false)).statusCode, 401);
});

test('404 for an unknown id; 400 for one that is not a UUID (never reaches SQL)', { skip }, async () => {
  const missing = await get('/api/projects/00000000-0000-4000-8000-000000000000');
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.json().error, 'PROJECT_NOT_FOUND');
  assert.equal((await get(`/api/projects/${encodeURIComponent("1' OR '1'='1")}`)).statusCode, 400);
});

test('the table refuses bad JSON and a reused appId', { skip }, async () => {
  await assert.rejects(db.request().query(`INSERT dbo.Project (name, activeDepartments) VALUES (N'x', N'not json')`), /CK_Project_activeDepartments/);
  await assert.rejects(db.request().query(`INSERT dbo.Project (name, legacyAppId) VALUES (N'x', 'synthetic0001aaaaaa')`), /UX_Project_legacyAppId/);
});
