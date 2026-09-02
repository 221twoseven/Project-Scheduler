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
  'test66.js',
  'test67.js',
  'test68.js',
  'test69.js',
  'test70.js',
  'test71.js',
  'test72.js',
  'test74.js',
  'test80.js',
  'test81.js',
  'test82.js',
  'test83.js',
  'test84.js',
  'test85.js',
  'test86.js',
  'test87.js',
  'test88.js',
  'test89.js',
  'test90.js',
  'test91.js',
  'test92.js',
  'test-contrast.js',
  'test-e2-click.js',
  'test-e3-resize.js',
  'test-c1-color.js',
  'test-b1.js',
  'test-b3-zoom.js',
  'test-goto.js',
  'test-quiet.js',
  'test-b4.js',
  'test-b5.js',
  'test-v4-views.js',
  'test-c3-status.js',
  'test-client-filter.js',
  'test-cb.js',
  'test-v102.js',
  'test-v120.js',
  'test-v121.js',
  'test-v130.js',
  'test-v140.js',
  'test-v150.js',
  'test-v160.js',
  'test-v161.js',
  'test-v162.js',
  'test-v165.js',
  'test-v166.js',
  'test-v170.js',
  'test-v171.js',
  'test-v172.js',
  'test-v180.js',
  'test-v181.js',
  'test-v190.js',
  'test-v1100.js',
];

const repoRoot = path.resolve(__dirname, '..');
const target = process.argv[2] || 'index.html';
const targetAbs = path.resolve(repoRoot, target);

/* A suite that feature-sniffs and opts out prints "skipped —" and exits 0. Count
   those separately, so a typo'd sniff can't silently disable a suite forever
   (deferred-ledger item, closed v1.0.2). */
let failed = 0;
const skipped = [];
for (const suite of SUITES) {
  const r = spawnSync(process.execPath, [path.join(__dirname, suite), targetAbs], {
    encoding: 'utf8',
  });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  if (r.status !== 0) failed++;
  else if (/skipped —|skipped -/.test(r.stdout || '')) skipped.push(suite);
}

console.log('\n' + '='.repeat(46));
console.log(`  ${SUITES.length - failed}/${SUITES.length} suites passed   [${target}]`);
if (skipped.length) console.log(`  SKIP  ${skipped.length} suite(s) self-skipped on this build: ${skipped.join(', ')}`);
process.exit(failed ? 1 : 0);
