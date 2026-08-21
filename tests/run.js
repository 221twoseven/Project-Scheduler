#!/usr/bin/env node
/* Run every Timeline regression suite against one HTML build and aggregate the result.
 *
 *   node tests/run.js                # runs against ../index.html (the company app)
 *   node tests/run.js reference/Timeline_50.html   # or any other build, path relative to repo root
 *
 * Each suite is its own process that exits non-zero on failure (see the individual
 * testNN.js files). This wrapper forwards the chosen target to all of them and exits
 * non-zero if any suite fails, so `npm test` and CI get a single pass/fail signal.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const SUITES = [
  'test46.js',
  'test47.js',
  'test-label.js',
  'test48.js',
  'test49.js',
  'test50.js',
  'test53.js',
  'test54.js',
  'test55.js',
  'test56.js',
  'test57.js',
  'test58.js',
  'test61.js',
  'test62.js',
  'test63.js',
  'test65.js',
  'test-contrast.js',
  'test-e2-click.js',
  'test-e3-resize.js',
  'test-c1-color.js',
  'test-b1.js',
  'test-quiet.js',
  'test-b4.js',
  'test-c3-status.js',
  'test-cb.js',
];

const repoRoot = path.resolve(__dirname, '..');
const target = process.argv[2] || 'index.html';
const targetAbs = path.resolve(repoRoot, target);

let failed = 0;
for (const suite of SUITES) {
  const r = spawnSync(process.execPath, [path.join(__dirname, suite), targetAbs], {
    stdio: 'inherit',
  });
  if (r.status !== 0) failed++;
}

console.log('\n' + '='.repeat(46));
console.log(`  ${SUITES.length - failed}/${SUITES.length} suites passed   [${target}]`);
process.exit(failed ? 1 : 0);
