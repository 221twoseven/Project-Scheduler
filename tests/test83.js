/* Phase 3.5 (REV83) — calendar drag-resize live feedback. While an edge handle
   drags, the day columns the band will span after the workday snap tint live
   (.cal-col.rz), so the resize visibly follows the mouse; the tint clears on
   release. The full-day snap itself is unchanged (test72 owns those rules).
   Asserted on BOTH the saved page and the New Project draft (the REV49 lesson).
   Run: node tests/test83.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cal-col.rz')<0){
  console.log('test83: skipped — no live resize tint in '+FILE+' (pre-REV83 build)');
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
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const cell=iso=>doc.querySelector('#npv-body .cal-col[data-d="'+iso+'"]');
const rz=iso=>{const c=cell(iso);return !!c&&c.classList.contains('rz');};
const phBand=t=>[...doc.querySelectorAll('#npv-body .cal-band.ph')]
  .filter(b=>b.textContent.indexOf(t)===0)[0];
const press=el=>el.dispatchEvent(new win.MouseEvent('mousedown',
  {bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
const move=(c,n)=>c.dispatchEvent(new win.MouseEvent('mousemove',
  {bubbles:true,cancelable:true,clientX:120+n*10,clientY:100}));
const release=()=>doc.dispatchEvent(new win.MouseEvent('mouseup',
  {bubbles:true,cancelable:true,button:0}));

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=false;DATE_LOCK=false;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{E("NPV_MODE='calendar';npvRender();");setTimeout(savedPage,300);},700);
},1300);

function savedPage(){
  sec('saved page · the snapped span tints live under an edge drag');
  const hdl=phBand('Exterior Windows').querySelector('.cal-hdl.r');
  ok('the band has a right handle', !!hdl);
  press(hdl);
  move(cell('2026-08-10'),0);
  move(cell('2026-08-12'),1);
  ok('the span start..target is tinted mid-drag',
     rz('2026-08-03')&&rz('2026-08-07')&&rz('2026-08-12'));
  ok('cells outside the span are not', !rz('2026-08-02')&&!rz('2026-08-13'));

  move(cell('2026-08-15'),2);   /* a Saturday — the end snaps back to Friday */
  ok('the tint shows the SNAPPED span (ends Friday, not the Saturday under the mouse)',
     rz('2026-08-14')&&!rz('2026-08-15'));

  release();
  setTimeout(()=>{
    ok('the tint clears on release', !doc.querySelector('#npv-body .cal-col.rz'));
    ok('the resize itself still filed (snap rules untouched)',
       E("ST.tasks.find(t=>t.id==='td1').endDate")==='2026-08-14',
       E("ST.tasks.find(t=>t.id==='td1').endDate"));
    setTimeout(draftPage,300);
  },350);
}

function draftPage(){
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const nm=doc.getElementById('pp-name');
    nm.value='Draft Job';nm.dispatchEvent(new win.Event('input',{bubbles:true}));
    E("ppFormSync();npvRebuild();NPV_MODE='calendar';npvRender();");
    setTimeout(()=>{
      sec('draft page · same live tint, same clear');
      const hdl=[...doc.querySelectorAll('#npv-body .cal-band.ph')]
        .map(b=>b.querySelector('.cal-hdl.r')).find(Boolean);
      ok('a draft band has a right handle', !!hdl);
      const i=+hdl.closest('.cal-band').dataset.i;
      const t=JSON.parse(E('JSON.stringify(NPV_TASKS['+i+'])'));
      press(hdl);
      move(cell(t.endDate),0);
      move(cell(t.startDate),1);   /* shrink to minimum — the edge clamps at the start */
      ok('the clamped single-day span is tinted mid-drag', rz(t.startDate),
         t.startDate+'..'+t.endDate);
      if(t.endDate!==t.startDate)
        ok('the old end is no longer tinted', !rz(t.endDate));
      release();
      setTimeout(()=>{
        ok('the tint clears on release', !doc.querySelector('#npv-body .cal-col.rz'));
        done();
      },350);
    },300);
  },350);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
