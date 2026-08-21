/* REV54: standalone events (TODO §3 item 2).
   Events used to save as ticketNodes on a host phase, so deleting the phase deleted its
   events. With the (additive, app-only) ShopTimeline_Events list present they are rows of
   their own: created hostless, edited/deleted in place, rescued off a phase when the
   phase is deleted, and removed with their project. Without the list the app falls back
   to the legacy hosting untouched.
   Skips entirely on builds that predate it (the frozen REV50 reference).
   Run: node test54.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('ShopTimeline_Events')<0){
  console.log('  SKIP  build predates REV54 (no standalone events) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,notes:'',pinned:false,label:'Exterior Windows',
  ticketNodes:JSON.stringify([{id:'n1',date:'2026-08-05',target:'CNC tickets',notes:''}])},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const events=[{appId:'e1',projectId:'p1',Title:'Client visit',department:'fab',
  date:'2026-08-25',notes:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[],events},eventsList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const evCalls=m=>win.__spCalls.filter(c=>c.url.includes('ShopTimeline_Events')&&c.method===m);

setTimeout(()=>{
  sec('boot — the Events list loads and feeds the app');
  ok('EVENTS_OK is set', E('EVENTS_OK')===true);
  ok('the list row landed in ST.events', E('ST.events.length')===1&&E("ST.events[0].name")==='Client visit',
     E('JSON.stringify(ST.events)'));

  sec('main timeline — a standalone event draws on its department\'s bar');
  E('EXPANDED.add("p1");render();');   /* collapsed projects only draw summary bars */
  const fabBar=doc.querySelector('#gantt-canvas .job-bar[data-tid="f1"]');
  ok('the fab bar exists', !!fabBar);
  ok('it wears a diamond for the standalone event', !!(fabBar&&fabBar.querySelector('.tick-node')));

  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,700);
},1300);

function stage1(){
  sec('saved project — creating an event needs no host phase');
  const t0=E('JSON.stringify(ST.tasks.map(t=>(t.ticketNodes||[]).length))');
  E("liveAddEvent(ppProject(),'install','2026-08-27')");
  setTimeout(()=>{
    ok('a new row in ST.events', E('ST.events.length')===2);
    ok('no phase gained a ticketNode',
       E('JSON.stringify(ST.tasks.map(t=>(t.ticketNodes||[]).length))')===t0);
    const posts=evCalls('POST');
    ok('it POSTed to ShopTimeline_Events', posts.length===1, posts.length+' posts');
    ok('the outgoing body carries project and date',
       posts.length&&posts[0].body.fields.projectId==='p1'&&posts[0].body.fields.date==='2026-08-27',
       posts.length?JSON.stringify(posts[0].body.fields):'');
    ok('liveEvents merges both stores (legacy node + 2 rows)',
       E("liveEvents(ppProject()).length")===3, E("liveEvents(ppProject()).length"));

    sec('renaming edits the row in place');
    const id=E('ST.events.slice(-1)[0].id');
    E("liveCommitEvent('"+id+"','name','Crate pickup')");
    setTimeout(()=>{
      ok('the name landed on the row', E('ST.events.slice(-1)[0].name')==='Crate pickup');
      ok('a PATCH went to the Events list', evCalls('PATCH').length>=1);
      ok('still no ticketNode anywhere new',
         E('JSON.stringify(ST.tasks.map(t=>(t.ticketNodes||[]).length))')===t0);
      stage2();
    },350);
  },350);
}

function stage2(){
  sec('deleting a phase rescues its hosted events instead of killing them');
  const tdId=E("ST.tasks.find(t=>t.department==='td').id");
  E("ppDeletePhase('"+tdId+"')");
  setTimeout(()=>{
    ok('the phase is gone', E("ST.tasks.some(t=>t.department==='td')")===false);
    ok('its event moved to ST.events', E("ST.events.some(e=>e.name==='CNC tickets')"),
       E('JSON.stringify(ST.events)'));
    ok('the rescued event kept its date', E("(ST.events.find(e=>e.name==='CNC tickets')||{}).date")==='2026-08-05');
    ok('the rescue POSTed the row', evCalls('POST').some.call(evCalls('POST'),
       c=>c.body&&c.body.fields&&c.body.fields.Title==='CNC tickets'));
    ok('liveEvents still lists all three', E("liveEvents(ppProject()).length")===3,
       E("liveEvents(ppProject()).length"));
    stage3();
  },400);
}

function stage3(){
  sec('the draft page files its events as rows too');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;
      e.dispatchEvent(new win.Event('input',{bubbles:true}));
      e.dispatchEvent(new win.Event('change',{bubbles:true}));};
    set('pp-name','Cartier Vitrine'); set('pp-deadline','2026-10-14');
    E("NPV_EVENTS.push({id:genId(),name:'Kickoff',date:'2026-09-21',dept:'fab',notes:''})");
    const nEv=E('ST.events.length');
    click(doc.getElementById('pp-save'));
    setTimeout(()=>{
      const pid=E("(ST.projects.find(p=>p.name==='Cartier Vitrine')||{}).id");
      ok('the project saved', !!pid);
      ok('the draft event is a row on the new project',
         E("ST.events.length")===nEv+1&&E("ST.events.slice(-1)[0].name")==='Kickoff'
         &&E("ST.events.slice(-1)[0].projectId")===pid, E('JSON.stringify(ST.events.slice(-1)[0])'));
      ok('no ticketNode carries it',
         E("ST.tasks.every(t=>!(t.ticketNodes||[]).some(n=>n.target==='Kickoff'))"));
      stage4();
    },600);
  },800);
}

function stage4(){
  sec('deleting a project takes its events with it');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const before=E('ST.events.length');
    click(doc.getElementById('pp-del'));   /* confirm() is stubbed true */
    setTimeout(()=>{
      ok('p1 is gone', E("ST.projects.some(p=>p.id==='p1')")===false);
      ok('its events left with it, the draft\'s survived',
         E("ST.events.length")===1&&E("ST.events[0].name")==='Kickoff',
         before+' -> '+E('ST.events.length'));
      ok('DELETEs went to the Events list', evCalls('DELETE').length>=1, evCalls('DELETE').length+'');
      stageFallback();
    },500);
  },700);
}

/* Without the list, everything behaves exactly as before REV54. */
function stageFallback(){
  sec('fallback — no Events list, events still host on phases');
  const dom2=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
  const win2=dom2.window;
  const E2=s=>win2.eval(s);
  setTimeout(()=>{
    ok('EVENTS_OK stays false', E2('EVENTS_OK')===false);
    win2.location.hash='#/project/p1';
    win2.dispatchEvent(new win2.Event('hashchange'));
    setTimeout(()=>{
      const n0=E2("ST.tasks.reduce((a,t)=>a+(t.ticketNodes||[]).length,0)");
      E2("liveAddEvent(ppProject(),'fab','2026-08-27')");
      setTimeout(()=>{
        ok('the event saved onto a phase (legacy)',
           E2("ST.tasks.reduce((a,t)=>a+(t.ticketNodes||[]).length,0)")===n0+1);
        ok('ST.events stayed empty', E2('(ST.events||[]).length')===0);
        ok('no call ever went to ShopTimeline_Events with a write',
           !win2.__spCalls.some(c=>c.url.includes('ShopTimeline_Events')&&c.method!=='GET'));
        done();
      },400);
    },700);
  },1300);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
