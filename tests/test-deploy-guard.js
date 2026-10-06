/* The deploy guard, run before merge — Deploy Pages' "every local file the app references
   must be in the deploy" step, replayed on index.html's source text. That step greps every
   (src|href)="…" in the file, drops URLs, anchors and data:/mailto:/javascript:, and fails the
   deploy unless the rest is on the sparse-checkout list. It reads the SOURCE, so a link built in
   JavaScript as href="'+x+'" counts as a file called '+x+' — that killed the /preview/ deploy of
   v1.39.0 (2026-10-06) after the PR's own checks were green. This suite makes CI catch it first.
   Run: node tests/test-deploy-guard.js index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const FILE=process.argv[2]||'index.html';
/* the guard only ever runs on the app's own index.html; the frozen reference build is not deployed */
if(path.basename(FILE)!=='index.html'){console.log('test-deploy-guard: skipped — not the deployed index.html ('+FILE+')');process.exit(0);}
const src=fs.readFileSync(FILE,'utf8');
const yml=fs.readFileSync(path.join(path.dirname(FILE),'.github/workflows/deploy-pages.yml'),'utf8');

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};

/* every sparse-checkout list in the workflow; a file must be on all of them (main and development) */
const lists=[...yml.matchAll(/sparse-checkout: \|\r?\n((?:[ \t]+\S[^\n]*\n)+)/g)].map(m=>m[1].split('\n').map(s=>s.trim()).filter(Boolean)); /* \r? and trim: a CRLF checkout reads the same */
ok('the workflow has the two sparse-checkout lists (site root and /preview/)', lists.length===2, lists.length);

/* the guard's own extraction: grep -oE '(src|href)="[^"]+"', strip the attribute, skip the schemes */
const refs=[...src.matchAll(/(src|href)="[^"]+"/g)].map(m=>m[0].replace(/^(src|href)="/,'').replace(/"$/,''))
  .filter(f=>!/^(https?:|\/\/|#|data:|mailto:|javascript:)/.test(f));
const missing=[...new Set(refs)].filter(f=>!lists.every(l=>l.includes(f)));
ok('every local src/href in the source is on every deploy list (the Deploy Pages guard would pass)', !missing.length, missing.join(' | '));

console.log('\n'+'-'.repeat(46));
console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
process.exit(fail?1:0);
