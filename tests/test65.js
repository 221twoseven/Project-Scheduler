/* REV65: the person filter — limits both lenses to one person's work.
   - Toolbar Person menu lists Everyone + the People & Availability roster.
   - Project lens: only projects the person is on (explicit crew, or implicit via the
     project team on an unowned umbrella); expanded subtask rows filter the same way.
   - Departments lens: only the person's lanes survive; empty sections drop.
   - Reset (toolbar Clear filters AND the in-canvas Reset the view) clears the person —
     except on My Dashboard (dept lens + person), where the person is the view, not a
     filter, and resets keep it (v1.2.2).
   - The pick persists in the UI prefs and restores on load.
   - A person with nothing scheduled gets an explanatory empty-state card.
   Skips on builds that predate the person filter.
   Run: node test65.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/btn-filters/.test(src)){
  console.log('  SKIP  build predates the consolidated Filters menu (no btn-filters) — nothing to assert');
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
 /* p1: explicit crew — Peter and Chris */
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter, Chris',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Armature'},
 /* p2: unowned umbrella — implicitly Peter's via the project team */
 {appId:'t2',projectId:'p2',department:'td',assignee:'',startDate:'2026-08-05',
  endDate:'2026-08-12',estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''},
 /* p1: Nick alone in fab */
 {appId:'t3',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  E("PEOPLE=[{name:'Stan',depts:['pm']},{name:'Caroline',depts:['pm']},{name:'Peter',depts:['td']},{name:'Chris',depts:['td']},{name:'Nick',depts:['fab']},{name:'Kate',depts:['fab']}];rebuildStaff();render();");

  sec('Toolbar: the Person section of Filters ▾');
  ok('Filters button exists',E("!!document.getElementById('btn-filters')"));
  E('buildFiltersMenu()');
  ok('the Person section lists Everyone + the six people',
     E("document.querySelectorAll('#person-menu .sm-item').length")===7,
     E("document.querySelectorAll('#person-menu .sm-item').length"));
  E("PERSON='Peter';updateFilterBadges();");
  ok('a Person chip appears and Filters lights up',
     E("document.getElementById('filter-chips').textContent.includes('Person: Peter')&&document.getElementById('btn-filters').classList.contains('active')"));

  sec('Project lens: only the person’s projects and bars');
  E("PERSON='Peter';render();");
  ok('Peter is on both projects (explicit crew + implicit umbrella)',
     E("ROWS.filter(r=>r.kind==='projHead').length")===2,
     E("ROWS.filter(r=>r.kind==='projHead').length"));
  E("PERSON='Nick';render();");
  ok('Nick is only on Hermes',
     E("ROWS.filter(r=>r.kind==='projHead').length")===1&&E("projById(ROWS.find(r=>r.kind==='projHead').projectId).name")==='Hermes Windows');
  E("EXPANDED.add('p1');PERSON='Nick';render();");
  ok('expanded subtask rows only show Nick’s bars',
     E("ROWS.filter(r=>r.kind==='projTask').every(r=>barCrew(taskById(r.taskId)).includes('Nick'))")&&
     E("ROWS.filter(r=>r.kind==='projTask').length")===1,
     E("JSON.stringify(ROWS.filter(r=>r.kind==='projTask').map(r=>r.taskId))"));

  sec('Departments lens: only the person’s lanes, empty sections drop');
  E("LENS='dept';PERSON='Nick';render();");
  ok('lanes exist and every lane is Nick’s (or a non-person lane holding his bars)',
     E("ROWS.some(r=>r.kind==='deptLane')")&&
     E("ROWS.filter(r=>r.kind==='deptLane').every(r=>r.assignee==='Nick'||!personByName(r.assignee))"));
  ok('every visible bar has Nick on the crew',
     E("ROWS.filter(r=>r.kind==='deptLane').every(r=>r.tasks.every(t=>barCrew(t).includes('Nick')))"));
  ok('sections without Nick drop entirely',
     E("ROWS.filter(r=>r.kind==='deptHead').every(r=>r.count>0)"));

  sec('Reset paths clear the person');
  /* v1.2.2: dept lens + person IS My Dashboard — there the person isn't a filter,
     so Clear filters keeps it; on the Projects lens it clears as always. */
  E("document.getElementById('btn-reset').click();");
  ok('on the dashboard, Clear filters keeps the person',E("PERSON==='Nick'"));
  E("LENS='project';render();document.getElementById('btn-reset').click();");
  ok('toolbar Clear filters clears the pick on the Projects lens',E('PERSON===null'));
  ok('all projects come back',E("ROWS.filter(r=>r.kind==='projHead').length")===2);

  sec('Persistence');
  E("PERSON='Peter';saveUI();");
  ok('the pick is saved in UI prefs',E("JSON.parse(localStorage.getItem(UI_KEY)).person")==='Peter');
  E("PERSON=null;loadLocalPrefs();");
  ok('and restores on load',E("PERSON")==='Peter');

  sec('Empty state: a person with nothing scheduled');
  E("ACCOUNT=ACCOUNT||{username:'t@example.com'};PERSON='Stan';render();");
  /* Stan is a PM — pm bars exist per project? The seeded data has no pm bars, so Stan has nothing. */
  ok('the card names the person',
     E("(document.getElementById('empty-state')||{textContent:''}).textContent.includes('Stan')"),
     E("(document.getElementById('empty-state')||{textContent:'(no card)'}).textContent.slice(0,80)"));

  sec('Empty state: search/spotlight that matches nothing (T7)');
  E("PERSON=null;FILTER='zzz-no-such-thing';applyFilter();");
  ok('a zero-match search shows the card',
     E("(document.getElementById('empty-state')||{textContent:''}).textContent.includes('search')"),
     E("(document.getElementById('empty-state')||{textContent:'(no card)'}).textContent.slice(0,80)"));
  E("FILTER='hermes';applyFilter();");
  ok('a matching search clears it',E("!document.getElementById('empty-state')"));
  E("FILTER='';SPOT.add('p2');applyFilter();");
  ok('spotlight alone (its project exists) shows no card',E("!document.getElementById('empty-state')"));
  E("FILTER='hermes';applyFilter();"); /* search hits p1 only, spotlight holds p2 — empty intersection */
  ok('search ∩ spotlight = nothing shows the card',E("!!document.getElementById('empty-state')"));
  E("SPOT.clear();FILTER='';applyFilter();");

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
