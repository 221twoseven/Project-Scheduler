/* V4/B6: named saved views.
   - viewState()/applyViewState() round-trip is the single source of truth: the session
     boots to the same defaults as before the refactor, and UI_KEY still restores.
   - Acceptance: save "Install crunch" (status=In Fabrication+Design, group=PM, Month,
     Compact), switch away, reapply through the menu â€” identical render.
   - First menu open seeds "Everything" + "My work" (REV66 identity chain).
   - Deleting a view never touches live state.
   - The launch-flagged view is honored on reload; a #view= link applies read-on-load.
   Run: node tests/test-v4-views.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';

/* The frozen REV50 reference predates V4 â€” same convention as test-b5.js. */
if(fs.readFileSync(FILE,'utf8').indexOf('applyViewState')<0){
  console.log('test-v4-views: skipped â€” no applyViewState in '+FILE+' (pre-V4 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* 30 projects across two PMs and three statuses so the crunch filter actually filters. */
const STATUSES=['in-fabrication','in-design','forecast'];
const projects=[],tasks=[];
for(let i=0;i<30;i++){
  const id='p'+i;
  projects.push({appId:id,Title:'Job '+i,client:'Client '+(i%5),jobCode:'J'+i,
    deadline:'2026-10-'+String((i%28)+1).padStart(2,'0'),status:STATUSES[i%3],
    projectManager:i<8?'Caroline':'Stan',drafter:'Peter',leadFab:'Nick',
    activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01',sortIndex:i});
  tasks.push({appId:'t'+i,projectId:id,department:'fab',assignee:'Nick',
    startDate:'2026-08-24',endDate:'2026-09-04',estimatedDays:10,
    ticketNodes:'[]',notes:'',pinned:false,label:''});
}
const data={projects,tasks,staff:[],todos:[]};

/* The crunch snapshot, as a literal, reused by the reload and link boots below. */
const CRUNCH={lens:'project',group:'pm',status:['in-fabrication','in-design'],person:'',
  search:'',color:'project',view:'week',density:'compact',tint:false,
  collapsedGroups:{},collapsedDepts:[]};

const dom=boot(FILE,{data});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const menuNames=()=>[...doc.querySelectorAll('#views-menu .vw-name')].map(n=>n.textContent);
const rowOf=nm=>[...doc.querySelectorAll('#views-menu .vw-row')].find(r=>r.querySelector('.vw-name').textContent===nm);

setTimeout(()=>{
  sec('refactor is behavior-neutral â€” boot lands on the pre-V4 defaults');
  ok('lens project / view month / density comfortable',
     E("LENS")==='project'&&E('VIEW')==='month'&&E('DENSITY')==='comfortable'); /* v1.5.0: month is the boot step (same 40px/day feel the old Day had) */
  ok('no grouping, no person, no tint',E('GROUP_BY')===null&&E('PERSON')===null&&E('TINT')===false);
  ok('all statuses shown',E('SHOW_STATUS.size')===E('ALL_STATUSES.length'));
  ok('viewState()â†’applyViewState() round-trips',
     (()=>{const a=E('JSON.stringify(viewState())');E('applyViewState(JSON.parse('+JSON.stringify(a)+'))');
       return E('JSON.stringify(viewState())')===a;})());

  sec('acceptance â€” save "Install crunch", switch away, reapply â†’ identical render');
  E("SHOW_STATUS=new Set(['in-fabrication','in-design']);GROUP_BY='pm';setView('week');zoomSettle();applyDensity('compact');saveUI();render();"); /* v1.6.1: setView animates — settle before snapshotting */
  const rowsBefore=E('ROWS.length');
  const sideBefore=doc.getElementById('side-rows').innerHTML;
  const barsBefore=doc.querySelectorAll('#gantt-canvas .job-bar').length;
  E("saveViews([{name:'Install crunch',state:viewState()}]);");
  E("applyViewState(defaultViewState());saveUI();render();");
  ok('switched away (defaults again)',E('VIEW')==='month'&&E('DENSITY')==='comfortable'&&E('GROUP_BY')===null
     &&E('SHOW_STATUS.size')===E('ALL_STATUSES.length'));
  click(doc.getElementById('btn-views'));
  ok('the saved view is listed',menuNames().indexOf('Install crunch')>=0,menuNames().join(','));
  click(rowOf('Install crunch').querySelector('.vw-name'));
  ok('menu closed on apply',doc.getElementById('views-menu').classList.contains('hidden'));
  ok('state restored: Week + Compact + group PM + 2 statuses',
     E('VIEW')==='week'&&E('DENSITY')==='compact'&&E("GROUP_BY")==='pm'&&E('SHOW_STATUS.size')===2);
  ok('toolbar follows: Week active, body.compact',
     doc.getElementById('btn-week').classList.contains('active')&&doc.body.classList.contains('compact'));
  ok('identical render: same rows',E('ROWS.length')===rowsBefore,rowsBefore+' -> '+E('ROWS.length'));
  ok('identical render: sidebar markup byte-equal',doc.getElementById('side-rows').innerHTML===sideBefore);
  ok('identical render: same bar count',doc.querySelectorAll('#gantt-canvas .job-bar').length===barsBefore);

  sec('first menu open seeds Everything + My work (REV66 identity)');
  E("localStorage.removeItem('shopTimelineViews_v1');PEOPLE=[{name:'Sam',email:'user@example.com'}];");
  click(doc.getElementById('btn-views')); /* close */
  click(doc.getElementById('btn-views')); /* reopen â€” rebuilds and seeds */
  ok('Everything + My work seeded',menuNames()[0]==='Everything'&&menuNames()[1]==='My work',menuNames().join(','));
  ok('My work carries me',JSON.parse(win.localStorage.getItem('shopTimelineViews_v1'))[1].state.person==='Sam');

  sec('deleting a view never touches live state');
  const liveBefore=E('JSON.stringify(viewState())');
  const rowsLive=E('ROWS.length');
  click(rowOf('My work').querySelector('.vw-act[title^="Delete"]')); /* confirm() stubbed true */
  ok('the view is gone from the store',
     JSON.parse(win.localStorage.getItem('shopTimelineViews_v1')).every(v=>v.name!=='My work'));
  ok('live state untouched',E('JSON.stringify(viewState())')===liveBefore&&E('ROWS.length')===rowsLive);

  sec('launch flag â€” exactly one, toggles off');
  click(rowOf('Everything').querySelector('.vw-act[title^="Open"]'));
  ok('Everything marked for launch',JSON.parse(win.localStorage.getItem('shopTimelineViews_v1'))[0].launch===true);
  click(rowOf('Everything').querySelector('.vw-act[title^="Open"]'));
  ok('clicking again unmarks it',!JSON.parse(win.localStorage.getItem('shopTimelineViews_v1'))[0].launch);

  sec('rename keeps the snapshot');
  win.prompt=()=>'All jobs';
  click(rowOf('Everything').querySelector('.vw-act[title^="Rename"]'));
  ok('renamed in place',JSON.parse(win.localStorage.getItem('shopTimelineViews_v1'))[0].name==='All jobs');

  bootLaunch();
},1300);

/* Second boot: the launch-flagged view must be honored on a cold reload. */
function bootLaunch(){
  const dom2=boot(FILE,{data,localStorage:{
    shopTimelineViews_v1:JSON.stringify([{name:'Install crunch',state:CRUNCH,launch:true}])}});
  const w=dom2.window,E2=s=>w.eval(s);
  setTimeout(()=>{
    sec('launch view honored on reload');
    ok('boot lands on the crunch state',
       E2('VIEW')==='week'&&E2('DENSITY')==='compact'&&E2("GROUP_BY")==='pm'&&E2('SHOW_STATUS.size')===2);
    ok('toolbar reflects it',w.document.getElementById('btn-week').classList.contains('active'));
    bootLink();
  },1300);
}

/* Third boot: a shared #view= link applies read-on-load and is never auto-saved. */
function bootLink(){
  const dom3=boot(FILE,{data,url:'https://example.github.io/shop-timeline/#view='
    +encodeURIComponent(JSON.stringify(CRUNCH))});
  const w=dom3.window,E3=s=>w.eval(s);
  setTimeout(()=>{
    sec('#view= link â€” read on load, never auto-saved');
    ok('link state applied',E3('VIEW')==='week'&&E3('DENSITY')==='compact'&&E3("GROUP_BY")==='pm');
    ok('hash cleaned from the address bar',w.location.hash==='');
    ok('nothing auto-saved as a view',w.localStorage.getItem('shopTimelineViews_v1')===null);
    done();
  },1300);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);

