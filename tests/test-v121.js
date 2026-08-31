/* v1.2.1 quick-wins batch — four 08-31 objectives + the tour step.
   1) (08-31 obj 12) "Add a phase" left the project-page right-click menu; the
      calendar double-click's department picker still works.
   2) (08-31 obj 2)  The sidebar LATE chip stays quiet on past projects (all work
      wrapped, install behind us) and still shows on late-but-current jobs.
   3) (08-31 obj 10) The conflict tooltip counts jobs: "… is on 2 other jobs …".
   4) (08-31 obj 11) Forecast projects render uncolored (FORECAST_GREY) everywhere.
   5) (08-31 obj 1)  The main tour teaches the date-bar drag (#gantt-hdr step).
   Run: node tests/test-v121.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* Pre-v1.2.1 builds (and the frozen reference) lack the forecast-grey rule. */
if(src.indexOf('FORECAST_GREY')<0){
  console.log('test-v121: skipped — pre-v1.2.1 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Dates relative to the real clock, like the app's own sample data. */
const D=n=>{const d=new Date();d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const P=(id,name,extra)=>({appId:id,Title:name,client:'C',jobCode:id.toUpperCase(),
  deadline:D(20),status:'auto',projectManager:'Stan',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-60),sortIndex:0,...extra});
const T=(id,pid,who,s,e,extra)=>({appId:id,projectId:pid,department:'fab',assignee:who,
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'',...extra});

const projects=[
  P('p1','Alpha Active'),
  P('p2','Beta Overlap',{deadline:D(30)}),
  P('p3','Gamma Overlap',{deadline:D(30)}),
  P('p4','Delta Past',{deadline:D(-30)}),               /* work wrapped, install behind us */
  P('p5','Echo LateLive',{deadline:D(-3)}),             /* late but still running */
  P('p6','Foxtrot Forecast',{deadline:D(40),status:'forecast'})];
const tasks=[
  T('t1','p1','Nick',D(-2),D(5)),
  T('x1','p2','Nick',D(-1),D(3)),                       /* conflict job #1 for t1 */
  T('x2','p3','Nick',D(0),D(2)),                        /* conflict job #2 for t1 */
  T('t4','p4','Peter',D(-40),D(-25)),
  T('t5','p5','Kate',D(-10),D(4)),
  T('k1','p2','Kate',D(0),D(2)),                        /* Kate's ONLY other job — the singular case */
  T('t6','p6','Peter',D(10),D(15))];
const staff=[
  {appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s2',Title:'Peter',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s3',Title:'Kate',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];

sec('source-level checks');
ok('right-click menu builder no longer offers "Add a phase"',
   !/data-act="depts"[^>]*>[^<]*<\/span>Add a phase/.test(src));
ok('legend hint names the forecast exception', src.indexOf('except Forecast')>=0);

setTimeout(main,1300);

function main(){
  sec('obj 1 — the tour teaches the date-bar drag');
  ok('a #gantt-hdr step is in COACH_STEPS', E("COACH_STEPS.some(s=>s.sel==='#gantt-hdr')"));
  ok('its target exists on the main view', !!q('#gantt-hdr'));

  sec('obj 2 — LATE chip only while the job is current');
  const rowOf=nm=>qa('.sb-row').find(r=>{const n=r.querySelector('.sb-name');return n&&n.textContent===nm;});
  const chip=nm=>{const r=rowOf(nm);return r?r.querySelector('.sb-chip.late'):null;};
  ok('past project (work wrapped) shows no LATE chip', rowOf('Delta Past')&&!chip('Delta Past'));
  ok('late-but-current project keeps its LATE chip', !!chip('Echo LateLive'));

  sec('obj 10 — the warning counts jobs');
  ok('t1 overlaps 2 other jobs', E("conflictCount(taskById('t1'))")===2,
     'got '+E("conflictCount(taskById('t1'))"));
  ok('t1 is flagged as a conflict at all', E("CONFLICTS.has('t1')"));
  E("showTooltipTask(taskById('t1'),{clientX:40,clientY:40})");
  const tt=q('#tooltip').innerHTML;
  ok('tooltip says "on 2 other jobs"', tt.indexOf('is on 2 other jobs during this window')>=0, tt.slice(0,300));
  E("showTooltipTask(taskById('t5'),{clientX:40,clientY:40})");
  ok('single overlap reads singular ("1 other job")',
     q('#tooltip').innerHTML.indexOf('is on 1 other job during this window')>=0);

  sec('obj 11 — forecast renders uncolored');
  ok('projColor is FORECAST_GREY for the forecast project', E("projColor('p6')===FORECAST_GREY"));
  ok('barColor follows for its bars', E("barColor(taskById('t6'))===FORECAST_GREY"));
  ok('a normal project keeps its palette color', E("projColor('p1')!==FORECAST_GREY"));
  const sum=q('.job-bar.summary[data-pid="p6"]');
  ok('forecast summary bar painted grey', !!sum&&sum.style.backgroundColor==='rgb(107, 116, 132)',
     sum&&sum.style.backgroundColor);

  /* obj 12 — right-click menu, saved page then draft page (the REV49 lesson) */
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(savedMenu,800);
}

function menuChecks(page){
  E("npvOpenMenu(60,60,{row:null,date:'"+D(1)+"'})");
  let m=q('#npv-menu');
  ok(page+': blank right-click has no "Add a phase"', !!m&&!m.querySelector('[data-act="depts"]')&&m.textContent.indexOf('Add a phase')<0);
  ok(page+': New checkpoint + New task remain', !!m&&!!m.querySelector('[data-act="ev"]')&&!!m.querySelector('[data-act="tk"]'));
  E('npvCloseMenu()');
  E("npvOpenMenu(60,60,{row:null,date:'"+D(1)+"'},'depts')");
  m=q('#npv-menu');
  ok(page+': the department picker (double-click path) still builds', !!m&&!!m.querySelector('[data-act="dept"]'));
  E('npvCloseMenu()');
}

function savedMenu(){
  sec('obj 12 — saved project page');
  menuChecks('saved');
  win.location.hash='#/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(draftMenu,800);
}

function draftMenu(){
  sec('obj 12 — new-project draft page');
  menuChecks('draft');
  done();
}

function done(){
  console.log('\ntest-v121: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
