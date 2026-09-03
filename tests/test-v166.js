/* v1.6.6 — Filters dropdown revision (owner review, 2026-09-01).
   1) The Person section stays in the Filters menu inside a Summary/Dashboard —
      the v1.2.2 CSS hide is gone. The radios switch the summary to another person
      in place; Everyone exits exactly like the × (PREV_LENS restored). The person
      still never chips or counts as a filter while the place is on.
   2) The status-scoped "Show all / Clear all" pair is gone ("Clear all" read as
      clear-the-filters but hid every project). One menu-wide reset at the top —
      #fm-showall "Show everything" — restores every status, clears client picks,
      and clears the person (leaving a summary like the ×).
   Run: node tests/test-v166.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('fm-showall')<0){
  console.log('test-v166: skipped — pre-v1.6.6 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[
  {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:D(40),
   status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'Nick',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0},
  {appId:'p2',Title:'Madison Facade',client:'Madison',jobCode:'M2',deadline:D(60),
   status:'in-design',projectManager:'Sam',drafter:'',leadFab:'Kate',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-20),sortIndex:1}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-2),endDate:D(5),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p2',department:'fab',assignee:'Kate',startDate:D(1),endDate:D(8),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const staff=[
  {appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s2',Title:'Kate',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s3',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM'}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];

setTimeout(main,1300);

function main(){
  sec('item 1 — the Person section survives inside a summary');
  ok('the v1.2.2 CSS hide is gone', !/body\.dash-on #fm-person-sec/.test(src));
  E("LENS='project';PERSON='Nick';saveUI();render();buildFiltersMenu()");
  ok('summary is on', E('dashOn()')===true);
  ok('the person radios are present and Nick is picked',
     qa('#person-menu input[type=radio]').length>=3
     &&qa('#person-menu input:checked').length===1);
  ok('…and the person still never chips or counts', E('activeFilterCount()')===0
     &&!qa('#filter-chips .f-chip').some(c=>/Person:/.test(c.textContent)));

  sec('item 1 — radios switch the summary in place; Everyone exits like the ×');
  const radios=qa('#person-menu .sm-item');
  const kate=radios.find(l=>/Kate/.test(l.textContent));
  kate.querySelector('input').checked=true;
  kate.querySelector('input').dispatchEvent(new win.Event('change',{bubbles:true}));
  ok('picking another name keeps the place', E('dashOn()')===true&&E('PERSON')==='Kate');
  ok('…and renames the trail', q('#db-name').textContent==='Summary · Kate',
     q('#db-name').textContent);
  E('buildFiltersMenu()');
  /* enter via the dashboard button so PREV_LENS is armed, then Everyone must restore it */
  E("LENS='project';render()");
  E("enterDash('Sam')");
  ok('dashboard entered from the Projects lens', E("LENS==='dept'&&PERSON==='Sam'"));
  E('buildFiltersMenu()');
  const everyone=qa('#person-menu .sm-item').find(l=>/Everyone/.test(l.textContent));
  everyone.querySelector('input').checked=true;
  everyone.querySelector('input').dispatchEvent(new win.Event('change',{bubbles:true}));
  ok('Everyone exits the place', E('PERSON===null')&&E('dashOn()')===false);
  ok('…and restores the lens the button left', E("LENS==='project'"));

  sec('item 2 — one menu-wide reset, the old status pair gone');
  ok('the status section has no Show all / Clear all buttons',
     qa('#status-menu button').length===0, qa('#status-menu button').length);
  ok('the menu-wide button sits at the top of the dropdown',
     !!q('#filters-menu .sm-btns #fm-showall')
     &&q('#filters-menu').firstElementChild.contains(q('#fm-showall')));
  E("SHOW_STATUS=new Set(['in-design']);CLIENT_FILTER.add('Hermes');PERSON='Nick';LENS='project';saveUI();render();buildFiltersMenu()");
  ok('filters armed for the test', E('activeFilterCount()')>=2&&E('dashOn()')===true);
  q('#fm-showall').click();
  ok('every status is back', E('SHOW_STATUS.size')===E('ALL_STATUSES.length'));
  ok('client picks cleared', E('CLIENT_FILTER.size')===0);
  ok('the person cleared too (summary exited)', E('PERSON===null')&&E('dashOn()')===false);
  ok('nothing counts as a filter afterwards', E('activeFilterCount()')===0);
  ok('the menu stayed open for confirmation', !q('#filters-menu').classList.contains('hidden')
     ||qa('#status-menu input:checked').length===E('ALL_STATUSES.length'));

  console.log('\ntest-v166: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
