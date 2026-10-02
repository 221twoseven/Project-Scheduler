/* v1.31.1 — tracker #17 (Drafter → Technical Designer) and #22 (Team → Project Team,
   Departments → Project Schedule on the project page).
   #17 R1 every on-screen "Drafter" label reads Technical Designer; the stored column and
   values stay · #22 R1/R2 the two section headings · #22 Q1 default: the dashboard's
   Departments lens keeps its name · #22 plan: Help and tour text follow; the hint under the
   renamed heading names the two doors that exist (tick a department, double-click the
   calendar). Both pages: a saved project and the New Project draft.
   Run: node tests/test-v1311.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("ppSec('team','Project Team'")<0){
  console.log('  SKIP  test-v1311: pre-v1.31.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

/* No "Drafter" anywhere in the data, so a whole-page sweep is meaningful. */
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''},
  {appId:'s2',Title:'Peter',email:'',depts:JSON.stringify(['td']),ooo:'[]',role:''},
  {appId:'s3',Title:'Nick',email:'',depts:JSON.stringify(['fab']),ooo:'[]',role:''}];
const projects=[{appId:'p1',Title:'Artport 2026',jobCode:'WMU004',client:'Whitney Museum',deadline:D(40),status:'in-fabrication',
  projectManager:'Sam',drafter:'Peter',leadFab:'Nick',fabricators:'',activeDepartments:JSON.stringify(['pm','td','fab','install']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
/* What a user can see: body text without the inline script (which carries the generated
   release notes and so the CHANGELOG line that names the old word). */
const vis=()=>{const c=doc.body.cloneNode(true);c.querySelectorAll('script,style,template').forEach(n=>n.remove());return c.textContent;};
const HINT='Tick a department to add it to the schedule, or double-click the calendar to add a phase where you want it.';
const h4=id=>{const e=q('#pp-insp .ins-sec[data-sec="'+id+'"]>h4');return e?e.textContent:'(none)';};
const rl=()=>qa('#pp-insp .pg-roles .rl').map(e=>e.textContent).join(' · ');
const hint=()=>{const e=q('#pp-insp .ins-sec[data-sec="depts"]>.in>.ins-note');return e?e.textContent.slice(0,HINT.length):'(none)';}; /* a later build may append a sentence (v1.32.0 adds the + hint) */

setTimeout(stage1,1500);

function stage1(){
  sec('Dashboard — #17 R1 in the legend; #22 Q1 the lens keeps its name');
  const legend=doc.getElementById('legend-menu');
  ok('#17 R1: the legend names the Technical Designer', !!legend&&legend.textContent.indexOf('Technical Designer')>=0&&!/Drafter/.test(legend.textContent), legend&&legend.textContent.slice(0,80));
  ok('#17 default: the chips stay PM · D · L', !!legend&&[...legend.querySelectorAll('.role-tag')].map(c=>c.textContent).join()==='PM,D,L', legend&&[...legend.querySelectorAll('.role-tag')].map(c=>c.textContent).join());
  ok('#17 R1: no visible "Drafter" on the dashboard', !/Drafter/.test(vis()));
  ok('#22 Q1 default: the dashboard lens still says Departments', doc.getElementById('btn-lens-dept').textContent==='Departments');
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(stage2,600);
}

function stage2(){
  sec('Saved project — #22 R1/R2 headings, #17 R1 label, stored names untouched');
  ok('#22 R1: the Team section reads Project Team', h4('team')==='Project Team', h4('team'));
  ok('#22 R2: the Departments section reads Project Schedule', h4('depts')==='Project Schedule', h4('depts'));
  ok('#17 R1: the Team labels read Project manager · Technical Designer · Project lead · Fabricators', rl()==='Project manager · Technical Designer · Project lead · Fabricators', rl());
  ok('#17 default: the existing assignment still shows (Peter checked)', !!qa('#pp-r-dr input').find(i=>i.value==='Peter'&&i.checked));
  ok('#17 default: the stored key is still drafter', E("Object.keys(projToFields(projById('p1'))).includes('drafter')&&projById('p1').drafter==='Peter'"));
  ok('#17 R1: no visible "Drafter" on the project page', !/Drafter/.test(vis()));
  ok('#22 plan: the hint under Project Schedule names the two doors that exist', hint()===HINT, hint());
  try{E("coachStart(COACH_PP_STEPS);COACH.i=COACH.steps.findIndex(s=>s.sel==='#pp-insp');coachShow()");}catch(e){}
  const body=(q('#coach-body')||{textContent:''}).textContent;
  ok('#22 plan: the tour names Setup, Project Team, Project Schedule, Milestones and Notes', body.indexOf('Setup, Project Team, Project Schedule, Milestones and Notes')>=0&&!/Team, Departments/.test(body), body.slice(0,120));
  try{E('coachEnd()');}catch(e){}
  const app=src.slice(0,src.indexOf('/* RELEASE_NOTES:BEGIN'))+src.slice(src.indexOf('/* RELEASE_NOTES:END */'));
  ok('source: no "Drafter" label left outside the generated release notes', !/Drafter/.test(app));
  ok('source: no stale "Setup, Team, Departments" or "add one where you want it"', !/Setup, Team, Departments/.test(app)&&!/add one where you want it/.test(app));
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(stage3,600);
}

function stage3(){
  sec('New Project draft — the same headings, label and hint');
  ok('#22 R1 draft: Project Team', h4('team')==='Project Team', h4('team'));
  ok('#22 R2 draft: Project Schedule', h4('depts')==='Project Schedule', h4('depts'));
  ok('#17 R1 draft: Technical Designer label', rl()==='Project manager · Technical Designer · Project lead · Fabricators', rl());
  ok('#22 plan draft: the hint', hint()===HINT, hint());
  ok('#17 R1 draft: no visible "Drafter"', !/Drafter/.test(vis()));
  done();
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
