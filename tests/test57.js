/* REV57: the project-page refinement batch (recovered field notes N1–N16).
   N4  — the status pill anchors in the schedule footer, not the title row.
   N1  — breadcrumb tail (Timeline ‹ name ‹ phase); clicking it unwinds one layer.
   N2  — a dirty unsaved draft asks before it is discarded.
   N13 — department Start/End date fields, bidirectional and workday-snapped.
   N11 — left-click edits, right-click adds; menus carry an inline name field.
   N15 — the main-timeline toolbar controls hide on the project page.
   N16 — calendar collapses roster fan-out; "Selected only" filters the bands.
   Skips entirely on builds that predate REV57 (the frozen REV50 reference).
   Run: node test57.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/\.npv-menu \.mn/.test(src)){
  console.log('  SKIP  build predates REV57 (no add-menu name field) — nothing to assert');
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
/* Two fab bars with the same label and window but different assignees — the roster
   fan-out N16 collapses on the calendar. */
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f2',projectId:'p1',department:'fab',assignee:'Kate',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const menu=()=>doc.getElementById('npv-menu');
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const keyOn=(el,k,o)=>el.dispatchEvent(new win.KeyboardEvent('keydown',
  Object.assign({key:k,bubbles:true,cancelable:true},o||{})));
const rclick=el=>{
  const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2});
  el.dispatchEvent(ev);return ev;
};

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,800);
},1300);

function stage1(){
  sec('N5/N8 — copy: labels lose the "In", the orphan row is "Events"');
  ok('STATUS_LBL reads Design / Fabrication',
     E("STATUS_LBL['in-design']")==='Design'&&E("STATUS_LBL['in-fabrication']")==='Fabrication');
  ok('stored keys are untouched', /'in-design'/.test(src)&&/'in-fabrication'/.test(src));
  ok('the orphan agenda row is titled Events', />Events<\/div>/.test(src));

  sec('N15 — the main-timeline toolbar mutes on the project page');
  ok('the page stamps body.pp-route', doc.body.classList.contains('pp-route'));
  ok('the mute rule hides scale, color, search, status and clear',
     /body\.pp-route #tg-scale,body\.pp-route #tg-color,body\.pp-route #t-search/.test(src));

  sec('N4 — the status pill anchors in the schedule footer');
  ok('the footer carries the pill', !!q('#npv-foot .sum-pill'),
     (q('#npv-foot')||{innerHTML:''}).innerHTML.slice(0,80));
  ok('it reads the project status', /Fabrication/.test(q('#npv-foot .sum-pill').textContent));
  ok('the title row no longer floats one', !!q('.dash-top')&&!q('.dash-top .sum-pill'));

  sec('N1 — breadcrumb tail follows the selection');
  ok('the tail is hidden with nothing selected', q('#pp-bc').classList.contains('hidden'));
  E('ppSelect(NPV_TASKS[0].id);');
  setTimeout(()=>{
    ok('selecting a phase shows the tail', !q('#pp-bc').classList.contains('hidden'));
    ok('it names the phase', /Exterior Windows/.test(q('#pp-bc').textContent),
       q('#pp-bc').textContent);
    click(q('#pp-bc'));
    setTimeout(()=>{
      ok('clicking it unwinds one layer (deselects)', E('PP_SEL')===null);
      ok('the tail hid again', q('#pp-bc').classList.contains('hidden'));
      stage2();
    },250);
  },250);
}

function stage2(){
  sec('N13 — department date fields, bidirectional and workday-snapped');
  const ds=q('#pp-depts .dstart[data-dept="td"]'), de=q('#pp-depts .dend[data-dept="td"]');
  ok('the td row carries start and end date fields', !!ds&&!!de);
  ok('they read the bar\'s dates', ds.value==='2026-08-03'&&de.value==='2026-08-07',
     ds.value+' -> '+de.value);
  ok('the pm row has none (spans job)', !q('#pp-depts .dstart[data-dept="pm"]'));
  ds.value='2026-08-04';change(ds);
  setTimeout(()=>{
    ok('a start edit moves the phase', E("ST.tasks.find(t=>t.appId==='td1'||t.label==='Exterior Windows').startDate")==='2026-08-04');
    ok('the day count followed', q('#pp-depts input[data-dept="td"]').closest('.idr').querySelector('.ddays').value==='4');
    const de2=q('#pp-depts .dend[data-dept="td"]');
    de2.value='2026-08-09';change(de2);   /* a Sunday — must snap to Monday */
    setTimeout(()=>{
      ok('an end edit snaps to the next workday',
         E("ST.tasks.find(t=>t.label==='Exterior Windows').endDate")==='2026-08-10',
         E("ST.tasks.find(t=>t.label==='Exterior Windows').endDate"));
      stage3();
    },300);
  },300);
}

function stage3(){
  sec('N11 — right-click adds, with an inline name; Enter creates');
  E('ppSelect(null,true);');
  const bar=q('#npv-body .npv-bar');
  rclick(bar);
  setTimeout(()=>{
    ok('the bar menu opened', !!menu());
    ok('it is add-only', !menu().querySelector('[data-act="ren"]')
       &&!menu().querySelector('[data-act="del"]')&&!!menu().querySelector('[data-act="sub"]'));
    ok('right-click did not select', E('PP_SEL')===null);
    const mn=menu().querySelector('.mn');
    ok('it carries the name field', !!mn);
    const n0=E('ST.tasks.length');
    mn.value='Glass order';
    keyOn(mn,'Enter');
    setTimeout(()=>{
      ok('Enter created under the first action', E('ST.tasks.length')===n0+1);
      ok('the new bar carries the typed name',
         E("ST.tasks.slice(-1)[0].label")==='Glass order', E("ST.tasks.slice(-1)[0].label"));
      ok('the menu closed', !menu());
      stage4();
    },350);
  },300);
}

function stage4(){
  sec('N16 — the calendar collapses roster fan-out');
  E("NPV_MODE='calendar';npvRender();");
  setTimeout(()=>{
    const fab=qa('#npv-body .cal-band.ph').filter(b=>/Main Shop Fab/.test(b.textContent));
    ok('fan-out bands merged (+1 chip)', fab.length>0&&fab.every(b=>/\+1/.test(b.textContent)),
       fab.map(b=>b.textContent).join(' | '));
    ok('the focus toggle is visible in calendar mode',
       !q('#npv-focus').classList.contains('hidden'));

    sec('N16 — "Selected only" filters the bands');
    E('ppSelect(NPV_TASKS.find(t=>t.label==="Exterior Windows").id,true);');
    click(q('#npv-focus'));
    setTimeout(()=>{
      const vis=qa('#npv-body .cal-band.ph');
      ok('only the selected phase\'s bands remain',
         vis.length>0&&vis.every(b=>/Exterior Windows/.test(b.textContent)),
         vis.map(b=>b.textContent).join(' | '));
      click(q('#npv-focus'));
      setTimeout(()=>{
        ok('toggling off restores the rest', qa('#npv-body .cal-band.ph').length>vis.length);
        E("NPV_MODE='gantt';npvRender();ppSelect(null,true);");
        stage5();
      },250);
    },250);
  },300);
}

function stage5(){
  sec('N2 — a dirty unsaved draft asks before it is discarded');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    ok('the draft page is up', E('ROUTE.creating')===true);
    const nm=doc.getElementById('pp-name');
    nm.value='Half-typed job';
    ok('the draft reads dirty', E('ppDraftDirty()')===true);
    E('window.confirm=()=>false;');
    win.location.hash='#/';
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      ok('declining keeps the draft open', E('ROUTE.creating')===true, E('ROUTE.view'));
      ok('the typed name survived', doc.getElementById('pp-name')
         &&doc.getElementById('pp-name').value==='Half-typed job');
      E('window.confirm=()=>true;');
      win.location.hash='#/';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(()=>{
        ok('accepting leaves for the timeline', E('ROUTE.view')==='timeline');
        done();
      },300);
    },300);
  },800);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
