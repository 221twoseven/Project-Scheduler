/* REV71: calendar drag-to-move + "Add a phase" wording.
   Phase bands on the calendar drag to a new day like Gantt bars: the drag reads dates
   from the day cells under the pointer (target-based, no coordinate math — so it runs
   here in jsdom). Merged N16 roster twins move as one, a nested subtask clamps to its
   parent's window, and a plain click still only selects (N11). The create menu's
   "Add a department" is now "Add a phase" — same action, honest name.
   Skips entirely on builds that predate it (the frozen REV50 reference).
   Run: node test71.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cal-dragging')<0){
  console.log('  SKIP  build predates REV71 (no calendar drag) — nothing to assert');
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
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
 {appId:'td2',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-04',
  endDate:'2026-08-05',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:'Trim'},
 /* Two fab bars with the same label and window — the N16 merged "+1" band. */
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f2',projectId:'p1',department:'fab',assignee:'Kate',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const menu=()=>doc.getElementById('npv-menu');
const cell=iso=>doc.querySelector('#npv-body .cal-col[data-d="'+iso+'"]');
const bands=()=>[...doc.querySelectorAll('#npv-body .cal-band.ph[data-i]')];
const bandByText=t=>bands().find(b=>b.textContent.indexOf(t)===0);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const clickOn=el=>{
  el.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0}));
  el.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,button:0}));
  el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
};
const rclick=el=>{
  const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2});
  el.dispatchEvent(ev);return ev;
};
/* A drag is: press on the band, then mousemoves that land on day cells (the app turns
   band pointer-events off after 3px of travel, so real mousemoves target the cells),
   then release. Exactly the event stream a browser delivers. */
const drag=(band,cells)=>{
  band.dispatchEvent(new win.MouseEvent('mousedown',
    {bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
  cells.forEach((c,n)=>c.dispatchEvent(new win.MouseEvent('mousemove',
    {bubbles:true,cancelable:true,clientX:120+n*10,clientY:100})));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,button:0}));
};
const dates=appId=>JSON.parse(E(
  "JSON.stringify((ST.tasks.find(t=>t.id==='"+appId+"')||{}),null,0)"));

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=false;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{E("NPV_MODE='calendar';npvRender();");setTimeout(stage1,300);},700);
},1300);

function stage1(){
  sec('saved project — a phase band drags to a new day');
  const b=bandByText('Exterior Windows');
  ok('the band is drawn', !!b);
  ok('the merged fab band carries a +1 chip', bands().some(x=>/\+1/.test(x.textContent)),
     bands().map(x=>x.textContent).join(' | '));
  drag(b,[cell('2026-08-03'),cell('2026-08-05')]);
  setTimeout(()=>{
    const t=dates('td1');
    ok('the phase moved 2 days later', t.startDate==='2026-08-05'&&t.endDate==='2026-08-09',
       t.startDate+'..'+t.endDate);
    ok('the drag selected the moved phase (like the Gantt)', E('PP_SEL')==='td1', String(E('PP_SEL')));
    ok('the nested subtask did not move (Link off)', dates('td2').startDate==='2026-08-04');
    /* REV84: the move put td1's start past Trim's, flipping the positional parent —
       the collapsed calendar would hide 'Exterior Windows' once deselected. Put the
       kid back inside the moved window (stage3 needs it there anyway) first. */
    E("commitPhaseDates('td2','2026-08-06','2026-08-07');npvRebuild();");
    setTimeout(()=>{E('ppSelect(null,true);');stage2();},250);
  },350);
}

function stage2(){
  sec('a drag that goes nowhere is a no-op; a plain click still selects (N11)');
  const b=bandByText('Exterior Windows');
  drag(b,[cell('2026-08-05')]);           /* anchor only — zero days */
  setTimeout(()=>{
    ok('same-day release changes nothing', dates('td1').startDate==='2026-08-05');
    const b2=bandByText('Exterior Windows');
    clickOn(b2);
    setTimeout(()=>{
      ok('a plain click on a band still selects its phase', E('PP_SEL')==='td1', String(E('PP_SEL')));
      E('ppSelect(null,true);');
      stage3();
    },300);
  },350);
}

function stage3(){
  sec('a nested subtask clamps to its parent\'s window');
  /* Parent td1 is now 08-05..08-09; kid td2 (08-04..08-05) sits outside it after the
     stage1 move — put the kid back inside first so the clamp is in play. */
  E("commitPhaseDates('td2','2026-08-06','2026-08-07');npvRebuild();");
  /* REV84: kid bands only paint while their phase is selected. */
  E("ppSelect('td1',true);");
  setTimeout(()=>{
    const b=bandByText('Trim');
    ok('the kid band is drawn', !!b);
    drag(b,[cell('2026-08-06'),cell('2026-08-20')]);   /* asks for +14 days */
    setTimeout(()=>{
      const t=dates('td2');
      ok('the kid stopped at the parent\'s end', t.endDate==='2026-08-09',
         t.startDate+'..'+t.endDate);
      E('ppSelect(null,true);');
      stage4();
    },350);
  },350);
}

function stage4(){
  sec('a merged +N band moves all its roster twins together');
  const b=bands().find(x=>/\+1/.test(x.textContent));
  ok('the merged band exists', !!b);
  drag(b,[cell('2026-08-20'),cell('2026-08-22')]);
  setTimeout(()=>{
    const f1=dates('f1'),f2=dates('f2');
    ok('the first twin moved', f1.startDate==='2026-08-22'&&f1.endDate==='2026-09-06',
       f1.startDate+'..'+f1.endDate);
    ok('the second twin moved with it', f2.startDate==='2026-08-22'&&f2.endDate==='2026-09-06',
       f2.startDate+'..'+f2.endDate);
    E('ppSelect(null,true);');
    stage5();
  },350);
}

function stage5(){
  /* v1.2.1 (08-31 obj 12): "Add a phase" left the right-click menu entirely — new
     builds assert its absence (the department picker's surviving door, the calendar
     double-click, is asserted in test-v121.js). Older builds keep the REV71 checks. */
  if(src.indexOf('data-act="depts"')<0){
    sec('the right-click menu no longer offers "Add a phase" (v1.2.1 obj 12)');
    rclick(cell('2026-08-26'));
    setTimeout(()=>{
      ok('a menu opened', !!menu());
      ok('"Add a phase" is gone', menu()&&menu().textContent.indexOf('Add a phase')<0,
         menu()&&menu().textContent.slice(0,80));
      ok('the two add actions (ev/tk) remain',
         menu()&&!!menu().querySelector('button[data-act="ev"]')&&!!menu().querySelector('button[data-act="tk"]'));
      E('npvCloseMenu();');
      stage6();
    },250);
    return;
  }
  sec('the create menu says "Add a phase", not "Add a department"');
  rclick(cell('2026-08-26'));
  setTimeout(()=>{
    ok('a menu opened', !!menu());
    const btn=menu()&&menu().querySelector('button[data-act="depts"]');
    ok('the item reads "Add a phase"', !!btn&&/Add a phase/.test(btn.textContent), btn&&btn.textContent);
    ok('"department" is gone from the menu', menu().textContent.indexOf('department')<0,
       menu().textContent.slice(0,80));
    click(btn);
    setTimeout(()=>{
      const mh=menu()&&menu().querySelector('.mh');
      ok('the submenu header reads "Add a phase" too', !!mh&&/Add a phase/.test(mh.textContent),
         mh&&mh.textContent);
      ok('it still lists departments to pick from', !!menu().querySelector('button[data-act="dept"]'));
      E('npvCloseMenu();');
      stage6();
    },250);
  },250);
}

function stage6(){
  sec('the draft page drags too — placements, not ST');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    E("NPV_MODE='calendar';npvRender();");
    setTimeout(()=>{
      const b=doc.querySelector('#npv-body .cal-band.ph[data-i]');
      ok('the draft calendar draws phase bands', !!b);
      if(!b)return done();
      const t0=JSON.parse(E('JSON.stringify(NPV_TASKS['+b.dataset.i+'])'));
      const c1=cell(t0.startDate);
      const target=E("fmtDate(addDays(parseDate('"+t0.startDate+"'),2))");
      const c2=cell(target);
      ok('the band\'s start cell and target cell exist', !!c1&&!!c2, t0.startDate+' → '+target);
      const manual0=E('Object.keys(NPV_MANUAL).length');
      drag(b,[c1,c2]);
      setTimeout(()=>{
        ok('the drag filed a manual placement, not an ST write',
           E('Object.keys(NPV_MANUAL).length')>manual0);
        const t1=JSON.parse(E("JSON.stringify(NPV_TASKS.find(z=>z.department==='"
          +t0.department+"'&&(z.label||'')==='"+(t0.label||'')+"')||{})"));
        ok('the draft bar moved 2 days', t1.startDate===target, t1.startDate+' vs '+target);
        done();
      },400);
    },300);
  },800);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
