/* The deploy guard, run before merge — Deploy Pages' "every local file the app references
   must be in the deploy" step, replayed on index.html's source text. That step greps every
   (src|href)="…" in the file, drops URLs, anchors and data:/mailto:/javascript:, and fails the
   deploy unless the rest is on the sparse-checkout list. It reads the SOURCE, so a link built in
   JavaScript as href="'+x+'" counts as a file called '+x+' — that killed the /preview/ deploy of
   v1.39.0 (2026-10-06) after the PR's own checks were green. This suite makes CI catch it first.
   Run: node tests/test-deploy-guard.js index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {suite}=require('./harness');
const {FILE,src,ok,done}=suite();
const yml=fs.readFileSync(path.join(path.dirname(FILE),'.github/workflows/deploy-pages.yml'),'utf8');


/* every sparse-checkout list in the workflow; a file must be on all of them (main, development, test) */
const lists=[...yml.matchAll(/sparse-checkout: \|\r?\n((?:[ \t]+\S[^\n]*\n)+)/g)].map(m=>m[1].split('\n').map(s=>s.trim()).filter(Boolean)); /* \r? and trim: a CRLF checkout reads the same */
ok('the workflow has the three sparse-checkout lists (site root, /preview/, /test/)', lists.length===3, lists.length);
/* item 72: each published branch triggers the deploy, or a push to it would never reach its subpath */
ok('a push to main, development or test deploys', /branches: \[main, development, test\]/.test(yml));

/* the guard's own extraction: grep -oE '(src|href)="[^"]+"', strip the attribute, skip the schemes */
const refs=[...src.matchAll(/(src|href)="[^"]+"/g)].map(m=>m[0].replace(/^(src|href)="/,'').replace(/"$/,''))
  .filter(f=>!/^(https?:|\/\/|#|data:|mailto:|javascript:)/.test(f));
const missing=[...new Set(refs)].filter(f=>!lists.every(l=>l.includes(f)));
ok('every local src/href in the source is on every deploy list (the Deploy Pages guard would pass)', !missing.length, missing.join(' | '));

done();
