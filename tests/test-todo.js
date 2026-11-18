/* docs/TODO.md stays accurate — the mechanical half of the CLAUDE.md "keeping TODO.md true"
   rule (owner, 2026-10-08: "We can't afford for this document to go stale"). Since item 89
   (2026-11-18) the work is split over three files: docs/TODO.md (the summary and the open
   items), docs/TODO-Done.md (finished items and the audit log) and docs/Decisions.md (the plan,
   the decisions and the schema). It checks what a machine can: "Where we stand" names the build
   that is running, item numbers are unique across TODO.md and TODO-Done.md, finished items live
   in TODO-Done.md and open ones in TODO.md, every "item N" points at a real item, every
   finished item's "Shipped vX" is a real release, and TODO.md uses plain names, not the old
   decision codes (owner, 2026-11-18). Whether an item's *words* are still true is the human
   half: the ship-release and triage-issues skills.
   Run: node tests/test-todo.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {suite}=require('./harness');
const {FILE,src,ok,done}=suite();
const root=path.join(__dirname,'..'); /* the repo, not the app's folder: Timeline lives in timeline/ since v1.56.0 */
const rd=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
const todo=rd('docs/TODO.md'),doneAll=rd('docs/TODO-Done.md'),dec=rd('docs/Decisions.md'),log=rd('CHANGELOG.md');
/* the audit log is history and may name what was */
const doneMd=doneAll.slice(0,doneAll.indexOf('\n## Promotion audit log')>0?doneAll.indexOf('\n## Promotion audit log'):undefined);

const section=(t,h)=>{const i=t.indexOf('\n## '+h);if(i<0)return '';const j=t.indexOf('\n## ',i+1);return t.slice(i,j<0?undefined:j);};
const ver=(src.match(/const APP_VER='([0-9.]+)'/)||[])[1];
ok('APP_VER is readable from '+path.basename(FILE), !!ver);
ok('TODO.md "Where we stand" names this build, v'+ver+' (update it with every release)',
   section(todo,'Where we stand').indexOf('v'+ver)>=0);

const items=(t,mark)=>[...t.matchAll(new RegExp('^- \\['+mark+'\\] \\*\\*(\\d+)\\.','gm'))].map(m=>+m[1]);
const nums=[...items(todo,'[ x]'),...items(doneMd,'[ x]')];
const dup=[...new Set(nums.filter((n,i)=>nums.indexOf(n)!==i))];
ok('there are numbered items', nums.length>20, nums.length);
ok('no two items share a number across TODO.md and TODO-Done.md (take the next free one)', !dup.length, dup.join(', '));
const tickedHere=items(todo,'x'), openThere=items(doneMd,' ');
ok('finished items move to TODO-Done.md', !tickedHere.length, tickedHere.join(', '));
ok('TODO-Done.md holds no open item', !openThere.length, openThere.join(', '));

/* "item 14", "items 42, 43", "items 32–40", "items 13 and 14", "item 9a". "v1.x item N" is the
   retired backlog's numbering and is skipped. */
const have=new Set(nums);
const bad=new Set();
for(const t of [todo,doneMd,dec])for(const m of t.matchAll(/(v1\.x |v1 )?\bitems? ((?:\d+[a-z]?(?:[–-]\d+)?(?:,? and |, | or |\/)?)+)/g)){
  if(m[1])continue;
  for(const n of m[2].match(/\d+/g)||[])if(!have.has(+n))bad.add(n);
}
ok('every "item N" in TODO.md, TODO-Done.md and Decisions.md names a real item', !bad.size, [...bad].join(', '));

/* a folded entry ("## v1.51.1–v1.51.2") names both ends as releases */
const rel=new Set([...log.matchAll(/^## v([0-9.]+)(?:\s*[–-]\s*v?([0-9.]+))?/gm)].flatMap(m=>m[2]?[m[1],m[2]]:[m[1]]));
const ticked=[...doneMd.matchAll(/^- \[x\] \*\*[^\n]*\n(?:(?!^- \[)[^\n]*\n)*/gm)].map(b=>b[0]);
const wrong=[];
for(const b of ticked)for(const m of b.matchAll(/Shipped (?:in )?v([0-9]+\.[0-9]+\.[0-9]+)/g))if(!rel.has(m[1]))wrong.push(m[1]);
ok('every finished item\'s "Shipped vX" is a CHANGELOG.md release', !wrong.length, wrong.join(', '));

const codes=[...new Set(todo.match(/\bD\d{1,2}\b/g)||[])];
ok('TODO.md names decisions in words, not codes like D5 (Decisions.md has the names)', !codes.length, codes.join(', '));

done();
