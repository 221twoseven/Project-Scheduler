/* Phase 3 (native direction): the Client filter — narrow the board to selected clients.
   - buildFiltersMenu builds a Client section with a checkbox per client that has a
     project on the board (not the whole Clients master).
   - Selecting clients removes non-matching projects' rows (like status/person).
   - A removable "Client: X" chip shows, Filters counts it, Clear wipes it.
   - The pick persists in UI prefs and restores on load.
   Run: node tests/test-client-filter.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/CLIENT_FILTER/.test(src)){
  console.log('  SKIP  build predates the client filter (no CLIENT_FILTER) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Three projects, two clients — Acme (p1,p2) and Beta (p3); each with one fab bar. */
const projects=[
 {appId:'p1',Title:'Acme Lobby',client:'Acme',jobCode:'A1',deadline:'2026-09-15',
  status:'in-fabrication',projectManager:'Stan',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01',sortIndex:0},
 {appId:'p2',Title:'Acme Annex',client:'Acme',jobCode:'A2',deadline:'2026-09-20',
  status:'in-design',projectManager:'Stan',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-02',sortIndex:1},
 {appId:'p3',Title:'Beta Tower',client:'Beta',jobCode:'B1',deadline:'2026-10-01',
  status:'in-fabrication',projectManager:'Caroline',drafter:'Peter',leadFab:'Kate',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-03',sortIndex:2}];
const tasks=projects.map((p,i)=>({appId:'t'+i,projectId:p.appId,department:'fab',assignee:'Nick',
  startDate:'2026-08-24',endDate:'2026-09-04',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}));

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('the picker lists only clients that have a project on the board');
  ok('boardClients() = Acme, Beta (sorted, no empties)',E("boardClients().join(',')")==='Acme,Beta',E("boardClients().join(',')"));
  E('buildFiltersMenu()');
  ok('the Client section has one checkbox per board client',
     E("document.querySelectorAll('#client-menu input[type=checkbox]').length")===2,
     E("document.querySelectorAll('#client-menu input[type=checkbox]').length"));

  sec('selecting a client narrows the board to its projects');
  ok('all three projects show with no filter',E("ROWS.filter(r=>r.kind==='projHead').length")===3,E("ROWS.filter(r=>r.kind==='projHead').length"));
  E("CLIENT_FILTER=new Set(['Acme']);render();");
  ok('only Acme’s two projects remain',E("ROWS.filter(r=>r.kind==='projHead').length")===2,E("ROWS.filter(r=>r.kind==='projHead').length"));
  ok('every visible project head is Acme',
     E("ROWS.filter(r=>r.kind==='projHead').every(r=>projById(r.projectId).client==='Acme')"));
  ok('clientHit keeps Acme, drops Beta',E("clientHit(projById('p1'))&&!clientHit(projById('p3'))"));

  sec('chip, count and Clear');
  E('updateFilterBadges();');
  ok('a "Client: Acme" chip shows',E("document.getElementById('filter-chips').textContent.includes('Client: Acme')"));
  ok('the Filters button counts it',E("document.getElementById('btn-filters').textContent.includes('Filters (1)')"),E("document.getElementById('btn-filters').textContent.trim()"));
  ok('Clear filters is now visible',!E("document.getElementById('btn-reset').classList.contains('hidden')"));
  E("document.getElementById('btn-reset').click();");
  ok('Clear wipes the client filter',E('CLIENT_FILTER.size')===0);
  ok('all three projects return',E("ROWS.filter(r=>r.kind==='projHead').length")===3);

  sec('the pick persists in UI prefs and restores on load');
  E("CLIENT_FILTER=new Set(['Beta']);saveUI();");
  ok('saved in UI_KEY',E("(JSON.parse(localStorage.getItem(UI_KEY)).clients||[]).join(',')")==='Beta',E("JSON.stringify(JSON.parse(localStorage.getItem(UI_KEY)).clients)"));
  E("CLIENT_FILTER=new Set();loadLocalPrefs();");
  ok('restored on load',E("[...CLIENT_FILTER].join(',')")==='Beta',E("[...CLIENT_FILTER].join(',')"));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
