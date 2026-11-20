import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sql from 'mssql';

/** Applies each migrations/NNNN_*.sql not yet applied, in name order, each in its own transaction. */
export async function migrate(pool: sql.ConnectionPool, dir: string): Promise<string[]> {
  await pool.request().batch(`IF OBJECT_ID('dbo.SchemaMigration') IS NULL
    CREATE TABLE dbo.SchemaMigration (name NVARCHAR(200) NOT NULL PRIMARY KEY,
      appliedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME())`);
  const done = new Set(
    (await pool.request().query<{ name: string }>('SELECT name FROM dbo.SchemaMigration')).recordset.map((r) => r.name),
  );
  const applied: string[] = [];
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(file)) continue;
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      await new sql.Request(tx).batch(await readFile(join(dir, file), 'utf8'));
      await new sql.Request(tx).input('name', sql.NVarChar(200), file).query('INSERT dbo.SchemaMigration (name) VALUES (@name)');
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
    applied.push(file);
  }
  return applied;
}
