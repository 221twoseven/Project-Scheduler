/* The deploy guard, run before merge — Deploy Pages' "every local file a page references
   must be in the deploy" step, replayed on each published page's source text. That step greps
   every (src|href)="…" in the file, drops URLs, anchors and data:/mailto:/javascript:, and fails
   the deploy unless the rest is on the sparse-checkout list. It reads the SOURCE, so a link built
   in JavaScript as href="'+x+'" counts as a file called '+x+' — that killed the /preview/ deploy
   of v1.39.0 (2026-10-06) after the PR's own checks were green. This suite makes CI catch it first.
   v1.56.0 (item 49): two pages — the Systems page at the root and Timeline in timeline/ (the
   build under test stands for it). Each page's links resolve from its own folder; a link's #…
   or ?… part is dropped, and a link to a folder (timeline/) needs that folder's index.html.
   Run: node tests/test-deploy-guard.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {suite}=require('./harness');
const {FILE,raw,ok,done}=suite(); /* raw: the page as served, with its common/ tags (item 85) */
const ROOT=path.join(__dirname,'..');
const yml=fs.readFileSync(path.join(ROOT,'.github/workflows/deploy-pages.yml'),'utf8');

/* every sparse-checkout list in the workflow; a file must be on all of them (main and development) */
const lists=[...yml.matchAll(/sparse-checkout: \|\r?\n((?:[ \t]+\S[^\n]*\n)+)/g)].map(m=>m[1].split('\n').map(s=>s.trim()).filter(Boolean)); /* \r? and trim: a CRLF checkout reads the same */
ok('the workflow has the two sparse-checkout lists (site root and /preview/)', lists.length===2, lists.length);
/* each published branch triggers the deploy, or a push to it would never reach its subpath */
ok('a push to main or development deploys', /branches: \[main, development\]/.test(yml));
ok('the guard checks every published page, each from its own folder',
  /for page in \$\(find site -name index\.html\)/.test(yml)&&/d=\$\(dirname "\$page"\)/.test(yml));
ok('the guard drops a link\'s #… and ?… part and reads a folder link as its index.html',
  yml.includes('f=${f%%#*}; f=${f%%\\?*}')&&yml.includes('*/) t="$d/${f}index.html"'));

const pages=[['index.html',fs.readFileSync(path.join(ROOT,'index.html'),'utf8')],['timeline/index.html',raw]];
for(const [p] of pages)ok(p+' is on every deploy list', lists.every(l=>l.includes(p)));

/* the guard's own extraction: grep -oE '(src|href)="[^"]+"', strip the attribute, skip the schemes */
const missing=[],absent=[];
for(const [p,text] of pages){
  const refs=[...text.matchAll(/(src|href)="[^"]+"/g)].map(m=>m[0].replace(/^(src|href)="/,'').replace(/"$/,''))
    .filter(f=>!/^(https?:|\/\/|#|data:|mailto:|javascript:)/.test(f));
  for(let f of new Set(refs)){
    f=f.replace(/#.*$/,'').replace(/\?.*$/,'');if(!f)continue;
    if(f.endsWith('/'))f+='index.html';
    const rel=path.posix.normalize(path.posix.join(path.posix.dirname(p),f));
    if(!lists.every(l=>l.includes(rel)))missing.push(p+' → '+rel);
    else if(!fs.existsSync(path.join(ROOT,rel)))absent.push(p+' → '+rel);
  }
}
ok('every local src/href on each page is on every deploy list (the Deploy Pages guard would pass)', !missing.length, missing.join(' | '));
ok('…and each of those files is in the repository', !absent.length, absent.join(' | '));

done();
