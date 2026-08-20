/* REV63 (saved side): the work-priority core on real ST data.
   - generateSchedule makes ONE bar per roster department, unowned.
   - barCrew resolves an unowned umbrella to the project team (implicit ownership),
     and an explicit crew wins over the team.
   - Overbooking is per person across crews: the same name on two overlapping bars from
     different projects flags both — whether the name is explicit or implicit.
   Skips on builds that predate the work-priority change.
   Run: node test63.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/barCrew/.test(src)){
  console.log('  SKIP  build predates work-priority crews (no barCrew) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[
 {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:'2026-09-15',
  status:'in-fabrication',projectManager:'Stan',drafter:'Peter, Chris',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:'2026-07-01',sortIndex:0},
 {appId:'p2',Title:'Madison Façade',client:'Madison',jobCode:'M2',deadline:'2026-09-30',
  status:'in-design',projectManager:'Caroline',drafter:'Peter',leadFab:'Kate',
  activeDepartments:JSON.stringify(['pm','td']),createdAt:'2026-07-02',sortIndex:1}];
const tasks=[
 /* p1: explicit crew on a subtask */
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter, Chris',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Armature'},
 /* p2: unowned umbrella — implicitly Peter's via the team */
 {appId:'t2',projectId:'p2',department:'td',assignee:'',startDate:'2026-08-05',
  endDate:'2026-08-12',estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''},
 /* control: Nick alone, no overlap with anyone */
 {appId:'t3',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  E("PEOPLE=[{name:'Stan',depts:['pm']},{name:'Caroline',depts:['pm']},{name:'Peter',depts:['td']},{name:'Chris',depts:['td']},{name:'Nick',depts:['fab']},{name:'Kate',depts:['fab']}];rebuildStaff();");

  sec('generateSchedule: one unowned bar per roster department');
  const gen=E("JSON.stringify(generateSchedule({id:'x',deadline:'2026-09-15',activeDepartments:['pm','td','fab'],projectManager:'Stan',drafter:'Peter, Chris',leadFab:'Nick'},{td:5,fab:10},{}).map(t=>({d:t.department,who:t.assignee})))");
  const g=JSON.parse(gen);
  ok('exactly one bar per department',['pm','td','fab'].every(d=>g.filter(t=>t.d===d).length===1),gen);
  ok('every roster bar is unowned',g.every(t=>t.who===''),gen);

  sec('barCrew: explicit crew wins, umbrella falls back to the project team');
  ok('explicit crew',E("JSON.stringify(barCrew(ST.tasks.find(t=>t.id==='t1')))")==='["Peter","Chris"]',
     E("JSON.stringify(barCrew(ST.tasks.find(t=>t.id==='t1')))"));
  ok('implicit team on the umbrella',E("JSON.stringify(barCrew(ST.tasks.find(t=>t.id==='t2')))")==='["Peter"]',
     E("JSON.stringify(barCrew(ST.tasks.find(t=>t.id==='t2')))"));

  sec('Overbooking: the same person on overlapping bars flags both');
  E('computeConflicts()');
  ok('the explicit-crew bar is flagged',E("CONFLICTS.has('t1')"));
  ok('the implicit umbrella is flagged too',E("CONFLICTS.has('t2')"));
  ok('the lone fab bar is not',!E("CONFLICTS.has('t3')"));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
