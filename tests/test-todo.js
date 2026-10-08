/* docs/TODO.md stays accurate — the mechanical half of the CLAUDE.md "keeping TODO.md true"
   rule (owner, 2026-10-08: "We can't afford for this document to go stale"). It checks what a
   machine can: §0 names the build that is running, §3's item numbers are unique (a second "42"
   was filed on 2026-10-05 and lived three days), every "item N" points at a real item, and
   every ticked item's "Shipped vX" is a real release. Whether an item's *words* are still
   true is the human half: the ship-release and triage-issues skills.
   Run: node tests/test-todo.js index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const FILE=process.argv[2]||'index.html';
/* the frozen reference build has no TODO of its own */
if(path.basename(FILE)!=='index.html'){console.log('test-todo: skipped — not the company index.html ('+FILE+')');process.exit(0);}
const root=path.dirname(path.resolve(FILE));
const src=fs.readFileSync(FILE,'utf8');
const todo=fs.readFileSync(path.join(root,'docs','TODO.md'),'utf8').replace(/\r\n/g,'\n');
const log=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8');

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const section=(a,b)=>{const i=todo.indexOf('\n## '+a),j=todo.indexOf('\n## '+b,i+1);return i<0?'':todo.slice(i,j<0?undefined:j);};

const ver=(src.match(/const APP_VER='([0-9.]+)'/)||[])[1];
ok('APP_VER is readable from '+path.basename(FILE), !!ver);
ok('§0 "Where we stand" names this build, v'+ver+' (update §0 with every release)',
   section('0.','1.').indexOf('v'+ver)>=0);

const s3=section('3.','4.');
const nums=[...s3.matchAll(/^- \[[ x]\] \*\*(\d+)\./gm)].map(m=>+m[1]);
const dup=[...new Set(nums.filter((n,i)=>nums.indexOf(n)!==i))];
ok('§3 has numbered items', nums.length>20, nums.length);
ok('no two §3 items share a number (numbers are labels; take the next free one)', !dup.length, dup.join(', '));

/* "item 14", "items 42, 43", "items 32–40", "items 13 and 14", "item 9a". "v1.x item N" is the
   retired backlog's numbering and is skipped; §8's log is history and may name what was. */
const live=todo.slice(0,todo.indexOf('\n## 8.')>0?todo.indexOf('\n## 8.'):undefined);
const have=new Set(nums);
const bad=new Set();
for(const m of live.matchAll(/(v1\.x |v1 )?\bitems? ((?:\d+[a-z]?(?:[–-]\d+)?(?:,? and |, | or |\/)?)+)/g)){
  if(m[1])continue;
  for(const n of m[2].match(/\d+/g)||[])if(!have.has(+n))bad.add(n);
}
ok('every "item N" outside the §8 log names a §3 item', !bad.size, [...bad].join(', '));

const rel=new Set([...log.matchAll(/^## v([0-9.]+)/gm)].map(m=>m[1]));
const ticked=[...s3.matchAll(/^- \[x\] \*\*[^\n]*\n(?:(?!^- \[)[^\n]*\n)*/gm)].map(b=>b[0]);
const wrong=[];
for(const b of ticked)for(const m of b.matchAll(/Shipped (?:in )?v([0-9]+\.[0-9]+\.[0-9]+)/g))if(!rel.has(m[1]))wrong.push(m[1]);
ok('every ticked item\'s "Shipped vX" is a CHANGELOG.md release', !wrong.length, wrong.join(', '));

console.log('\n'+'-'.repeat(46));
console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
process.exit(fail?1:0);
