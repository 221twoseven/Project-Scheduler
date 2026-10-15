#!/usr/bin/env node
/* Run every Timeline regression suite against one HTML build and aggregate the result.
 *
 *   node tests/run.js                # runs against ../index.html (the company app)
 *   node tests/run.js <other build>.html           # path relative to repo root
 *
 * Every tests/test*.js file is a suite (item 60: found here, not kept in a hand list — the
 * old list lost test-v1210 for months). Each runs as its own process and exits non-zero on
 * a failure; this wrapper exits non-zero if any suite did, so `npm test` and CI get a single
 * pass/fail signal. No suite skips itself any more (item 60), so there is nothing to count.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUITES = fs.readdirSync(__dirname).filter(f => /^test.*\.js$/.test(f)).sort();

const repoRoot = path.resolve(__dirname, '..');
const target = process.argv[2] || 'index.html';
const targetAbs = path.resolve(repoRoot, target);

let failed = 0;
for (const suite of SUITES) {
  const r = spawnSync(process.execPath, [path.join(__dirname, suite), targetAbs], {
    encoding: 'utf8',
  });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  if (r.status !== 0) failed++;
}

console.log('\n' + '='.repeat(46));
console.log(`  ${SUITES.length - failed}/${SUITES.length} suites passed   [${target}]`);
process.exit(failed ? 1 : 0);
