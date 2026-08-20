/* REV55: draft vs saved phase-splitting converged (TODO §3 item 3).
   On a saved project a subtask is a real row, so its dates persist. On a draft, a
   subtask was an NPV_LINES name-split applied BEFORE the manual-placement overlay, so
   its NPV_MANUAL key (dept::label::who) could never match — a dragged draft subtask
   snapped back to the department window on the very next rebuild, and line lookups
   guessed by name. REV55 applies the overlay again after the split, resolves lines by
   the id a split bar already carries (baseId::lineId), and moves a bar's manual
   placement with it when it's renamed.
   Skips on builds that predate the convergence (the frozen REV50 reference).
   Run: node test55.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('applyPhaseLines(tasks).map(overlay)')<0){
  console.log('  SKIP  build predates REV55 (draft subtasks not yet independent) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
/* The split bars of a department, as [{id,label,startDate,endDate}] */
const split=d=>JSON.parse(E("JSON.stringify(NPV_TASKS.filter(t=>t.department==='"+d+"')"+
  ".map(t=>({id:t.id,label:t.label,startDate:t.startDate,endDate:t.endDate})))"));

let DEPT='';

setTimeout(()=>{
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,800);
},1300);

function stage1(){
  const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;
    e.dispatchEvent(new win.Event('input',{bubbles:true}));
    e.dispatchEvent(new win.Event('change',{bubbles:true}));};
  set('pp-name','Cartier Vitrine'); set('pp-deadline','2026-10-14');
  setTimeout(()=>{
    E('npvRebuild();');
    DEPT=E("NPV_TASKS[0].department");
    ok('the preview drew bars', !!DEPT, DEPT);

    sec('splitting a draft department makes bars with line identity');
    E("npvCreateSubtask('"+DEPT+"')");
    const bars=split(DEPT);
    ok('the department split into two bars', bars.length===2, bars.length+' bars');
    ok('each split bar carries its line id (baseId::lineId)',
       bars.every(b=>String(b.id).includes('::')), JSON.stringify(bars.map(b=>b.id)));
    ok('both bars share the department window (nothing dragged yet)',
       bars[0].startDate===bars[1].startDate&&bars[0].endDate===bars[1].endDate);
    stage2();
  },400);
}

function stage2(){
  sec('a draft subtask\'s manual placement survives rebuilds (the REV55 point)');
  const before=split(DEPT);
  const target=before[1];
  const s=target.startDate;             /* 1-day bar at the window's start: clearly its own */
  E("NPV_MANUAL[npvKey(NPV_TASKS.find(t=>t.id==='"+target.id+"'))]="+
    "{startDate:'"+s+"',endDate:'"+s+"',estimatedDays:1};npvRebuild();");
  let now=split(DEPT);
  const lid=String(target.id).split('::')[1];
  const mine=now.find(b=>String(b.id).endsWith('::'+lid));
  const sib=now.find(b=>!String(b.id).endsWith('::'+lid));
  ok('the dragged subtask kept its own dates', mine&&mine.startDate===s&&mine.endDate===s,
     JSON.stringify(mine));
  ok('its sibling kept the scheduler dates', sib&&sib.endDate!==s, JSON.stringify(sib));
  E('npvRebuild();npvRebuild();');
  now=split(DEPT);
  ok('still true after more rebuilds',
     (now.find(b=>String(b.id).endsWith('::'+lid))||{}).startDate===s);

  sec('renaming a subtask moves its placement with it');
  E("ppPopName(NPV_TASKS.find(t=>String(t.id).endsWith('::"+lid+"')),'Cutting')");
  now=split(DEPT);
  const ren=now.find(b=>String(b.id).endsWith('::'+lid));
  ok('the bar wears the new name', ren&&ren.label==='Cutting', JSON.stringify(ren));
  ok('and kept its manual dates through the rename', ren&&ren.startDate===s&&ren.endDate===s);
  ok('exactly one line was renamed',
     E("NPV_LINES.filter(l=>l.name==='Cutting').length")===1);

  sec('same-named lines stay distinct (id beats name-guessing)');
  const otherLid=String((split(DEPT).find(b=>!String(b.id).endsWith('::'+lid))||{}).id).split('::')[1];
  E("ppPopName(NPV_TASKS.find(t=>String(t.id).endsWith('::"+otherLid+"')),'Cutting')");
  ok('two lines now share the name', E("NPV_LINES.filter(l=>l.name==='Cutting').length")===2);
  ok('each bar still resolves to its OWN line',
     E("ppDraftLineFor(NPV_TASKS.find(t=>String(t.id).endsWith('::"+lid+"'))).id")===lid);
  stage3(lid);
}

function stage3(lid){
  sec('what you see is what saves — the split files as real rows');
  const shown=split(DEPT);
  click(doc.getElementById('pp-save'));
  setTimeout(()=>{
    const pid=E("(ST.projects.find(p=>p.name==='Cartier Vitrine')||{}).id");
    ok('the project saved', !!pid);
    const saved=JSON.parse(E("JSON.stringify(ST.tasks.filter(t=>t.projectId==='"+pid+
      "'&&t.department==='"+DEPT+"').map(t=>({label:t.label,startDate:t.startDate,endDate:t.endDate})))"));
    ok('both subtasks landed as rows', saved.length===2, JSON.stringify(saved));
    ok('with exactly the previewed dates',
       shown.every(b=>saved.some(r=>r.label===b.label&&r.startDate===b.startDate&&r.endDate===b.endDate)),
       JSON.stringify({shown,saved}));

    sec('saved-path parity guard — a subtask there is a real row, as before');
    win.location.hash='#/project/p1';
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      const n0=E("ST.tasks.filter(t=>t.department==='fab').length");
      E("npvCreateSubtask('fab','2026-08-24')");
      setTimeout(()=>{
        ok('the saved project gained a row', E("ST.tasks.filter(t=>t.department==='fab').length")===n0+1);
        ok('drafts left no lines behind on the saved page', E('NPV_LINES.length')===0||E('NPV_LIVE')===true);
        done();
      },350);
    },700);
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
