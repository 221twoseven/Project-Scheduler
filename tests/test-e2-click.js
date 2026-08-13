/* E2 — click hierarchy on the timeline (Design-Language §6).
   Main timeline: a plain click (<3px travel) opens the task modal; any drag — engaged,
   attempted, or a resize — suppresses it. Pinned bars behave identically.
   Project page: a plain click selects (drives the inspector); a drag never selects.
   Run: node tests/test-e2-click.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* The frozen REV50 reference predates E2 — same convention as test-e3-resize.js. */
if(src.indexOf('click hierarchy')<0){
  console.log('test-e2-click: skipped — no §6 click-hierarchy code in '+FILE+' (pre-E2 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'approved',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'t0',projectId:'p1',department:'pm',assignee:'Stan',startDate:'2026-08-03',
  endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-14',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-17',
  endDate:'2026-08-28',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:true,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const tlBar=dept=>q('.job-bar[data-tid="'+E("ST.tasks.find(t=>t.department==='"+dept+"').id")+'"]');
const modalOpen=()=>!doc.getElementById('task-overlay').classList.contains('hidden');
const stOf=dept=>JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='"+dept+"'))"));

setTimeout(main1,1300);

function main1(){
  sec('main timeline — a plain click opens the task modal');
  E("EXPANDED.add('p1');render();");
  const bar=tlBar('td');
  ok('the td bar is drawn', !!bar);
  mouse(bar,'mousedown',100,20); mouse(bar,'mouseup',100,20); click(bar);
  ok('the task modal opened', modalOpen());
  ok('it opened on the clicked task', E('EDIT_TASK_ID')===E("ST.tasks.find(t=>t.department==='td').id"));
  E('closeTaskModal();');
  setTimeout(main2,50); /* let the rAF that clears SUPPRESS_CLICK run */
}

function main2(){
  sec('main timeline — a 10px flick (under the 200ms hold) is not a click');
  const bar=tlBar('td'), b4=stOf('td');
  mouse(bar,'mousedown',100,20); dmouse('mousemove',110,20); dmouse('mouseup',110,20); click(bar);
  ok('no modal after a 10px drag', !modalOpen());
  ok('dates untouched', stOf('td').startDate===b4.startDate&&stOf('td').endDate===b4.endDate);
  setTimeout(main3,50);
}

function main3(){
  sec('main timeline — an engaged drag (held 200ms) never fires the modal');
  const bar=tlBar('td');
  mouse(bar,'mousedown',100,20);
  setTimeout(()=>{
    dmouse('mousemove',110,20); dmouse('mouseup',110,20); click(bar);
    ok('no modal after an engaged drag', !modalOpen());
    setTimeout(main4,50);
  },250);
}

function main4(){
  sec('main timeline — a resize drag on a handle never fires the modal');
  const bar=tlBar('td'), hdl=bar.querySelector('.bar-handle.bh-r');
  ok('the bar carries a right handle', !!hdl);
  mouse(hdl,'mousedown',100,20);
  setTimeout(()=>{
    dmouse('mousemove',110,20); dmouse('mouseup',110,20); click(hdl);
    ok('no modal after a resize drag', !modalOpen());
    setTimeout(main5,50);
  },250);
}

function main5(){
  sec('main timeline — a clean click on a handle still opens the modal');
  const bar=tlBar('td'), hdl=bar.querySelector('.bar-handle.bh-r');
  mouse(hdl,'mousedown',100,20); mouse(hdl,'mouseup',100,20); click(hdl);
  ok('a handle click bubbles to the bar and opens the modal', modalOpen());
  E('closeTaskModal();');
  setTimeout(main6,50);
}

function main6(){
  sec('main timeline — pinned bars: click works, drag does not');
  const bar=tlBar('fab');
  ok('fab is seeded pinned', stOf('fab').pinned===true);
  mouse(bar,'mousedown',100,20); mouse(bar,'mouseup',100,20); click(bar);
  ok('a plain click on a pinned bar opens the modal', modalOpen());
  E('closeTaskModal();');
  setTimeout(()=>{
    const b4=stOf('fab'), bar2=tlBar('fab');
    mouse(bar2,'mousedown',100,20);
    setTimeout(()=>{
      dmouse('mousemove',112,20); dmouse('mouseup',112,20); click(bar2);
      ok('no modal after dragging a pinned bar', !modalOpen());
      ok('pinned dates untouched', stOf('fab').startDate===b4.startDate&&stOf('fab').endDate===b4.endDate);
      win.location.hash='#/project/p1';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(page1,800);
    },250);
  },50);
}

/* --- project page: selection is the edit-details surface --- */
const npvBar=dept=>q('#npv-body .npv-bar[data-i="'+E("NPV_TASKS.findIndex(t=>t.department==='"+dept+"')")+'"]');

function page1(){
  sec('project page — a plain click selects (drives the inspector)');
  ok('NPV_LIVE on a saved project', E('NPV_LIVE')===true);
  const bar=npvBar('td');
  mouse(bar,'mousedown',200,20); dmouse('mouseup',200,20);
  setTimeout(()=>{
    ok('the click selected the td phase', E('PP_SEL')===E("ST.tasks.find(t=>t.department==='td').id"), String(E('PP_SEL')));
    ok('the selected bar is ringed', !!q('#npv-body .npv-bar.pick'));
    E('ppSelect(null,true);');
    setTimeout(page2,100);
  },100);
}

function page2(){
  sec('project page — a small drag (≥3px, <half a day) selects nothing');
  const bar=npvBar('td');
  /* travel must clear the 3px click threshold but round to zero days */
  const dx=Math.max(3,Math.floor(E('NPV_GEO.dw')/2)-1);
  mouse(bar,'mousedown',200,20); dmouse('mousemove',200+dx,20); dmouse('mouseup',200+dx,20);
  setTimeout(()=>{
    ok('a '+dx+'px drag did not select', E('PP_SEL')===null, String(E('PP_SEL')));
    setTimeout(page3,100);
  },100);
}

function page3(){
  sec('project page — pinned bar: click selects, locked edge drag does not');
  const bar=npvBar('fab');
  mouse(bar,'mousedown',200,20); dmouse('mouseup',200,20);
  setTimeout(()=>{
    ok('a plain click on a pinned bar selects it', E('PP_SEL')===E("ST.tasks.find(t=>t.department==='fab').id"), String(E('PP_SEL')));
    E('ppSelect(null,true);');
    setTimeout(()=>{
      const b4=stOf('fab');
      const hdl=npvBar('fab').querySelector('.npv-hdl.r');
      const dw=E('NPV_GEO.dw');
      mouse(hdl,'mousedown',200,20); dmouse('mousemove',200+dw*3,20); dmouse('mouseup',200+dw*3,20);
      setTimeout(()=>{
        ok('the locked edge drag did not select', E('PP_SEL')===null, String(E('PP_SEL')));
        ok('the locked edge drag changed nothing', stOf('fab').endDate===b4.endDate);
        done();
      },150);
    },100);
  },100);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
