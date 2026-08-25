/* REV72: full calendar parity — markers drag/click/delete, phase bands edge-resize.
   Checkpoint/task bands get the Gantt diamonds' verbs (drag moves, click opens the
   agenda editor, right-click deletes); phase bands grow resize handles on the band
   segment holding the phase's true start/end (a week-clipped edge is not grabbable),
   with the Gantt's rules: workday snap, Protect-dates/pin lock, nesting clamp, roster
   twins resize together. Skips on builds that predate it.
   Run: node test72.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cal-hdl')<0){
  console.log('  SKIP  build predates REV72 (no calendar resize/markers) — nothing to assert');
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
  ticketNodes:JSON.stringify([{id:'ev1',date:'2026-08-11',target:'Client review',notes:''}])},
 {appId:'td2',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-04',
  endDate:'2026-08-05',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:'Trim'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f2',projectId:'p1',department:'fab',assignee:'Kate',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const todos=[{appId:'tk1',Title:'Order steel',projectId:'p1',department:'fab',
  assignees:'[]',dueDate:'2026-08-13',startDate:null,progress:'notstarted',
  priority:'medium',notes:'',createdBy:'',completedOn:null,completedBy:'',sortIndex:0}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos},todosList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const cell=iso=>doc.querySelector('#npv-body .cal-col[data-d="'+iso+'"]');
const phBands=t=>[...doc.querySelectorAll('#npv-body .cal-band.ph')]
  .filter(b=>b.textContent.indexOf(t)===0);
const mkBand=id=>doc.querySelector('#npv-body .cal-band[data-mk-id="'+id+'"]');
/* Press on `el`, move across day cells (the app releases band pointer-events after
   3px of travel so real mousemoves land on cells), release. */
const drag=(el,cells)=>{
  el.dispatchEvent(new win.MouseEvent('mousedown',
    {bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
  cells.forEach((c,n)=>c.dispatchEvent(new win.MouseEvent('mousemove',
    {bubbles:true,cancelable:true,clientX:120+n*10,clientY:100})));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,button:0}));
};
const clickOn=el=>{
  el.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,button:0}));
  el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
};
const rclick=el=>{
  const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2});
  el.dispatchEvent(ev);return ev;
};
const task=id=>JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.id==='"+id+"')||{})"));

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=false;DATE_LOCK=false;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{E("NPV_MODE='calendar';npvRender();");setTimeout(stage1,300);},700);
},1300);

function stage1(){
  sec('markers carry identity; a checkpoint band drags to a new day');
  ok('the checkpoint band is drawn with its id', !!mkBand('ev1'));
  ok('the task band too', !!mkBand('tk1'));
  drag(mkBand('ev1'),[cell('2026-08-11'),cell('2026-08-13')]);
  setTimeout(()=>{
    ok('the checkpoint moved 2 days', task('td1').ticketNodes[0].date==='2026-08-13',
       task('td1').ticketNodes[0].date);
    stage2();
  },350);
}

function stage2(){
  sec('a plain click on a marker opens its agenda editor (like the Gantt)');
  clickOn(mkBand('tk1'));
  setTimeout(()=>{
    const a=doc.activeElement;
    const row=a&&a.closest?a.closest('.ag-i'):null;
    ok('focus landed in the task\'s agenda row', !!row&&row.dataset.agId==='tk1',
       row?row.dataset.agId:String(a&&a.className));
    stage3();
  },300);
}

function stage3(){
  sec('right-click deletes a marker');
  const ev=rclick(mkBand('tk1'));
  setTimeout(()=>{
    ok('the browser menu is suppressed', ev.defaultPrevented);
    ok('the task is gone', E("(ST.todos||[]).every(t=>t.id!=='tk1')"));
    ok('its band is gone', !mkBand('tk1'));
    stage4();
  },350);
}

function stage4(){
  sec('a nested subtask\'s resize clamps to the parent window');
  const b=phBands('Trim')[0];
  ok('the kid band is drawn', !!b);
  const hr=b.querySelector('.cal-hdl.r');
  ok('it carries a right handle', !!hr);
  drag(hr,[cell('2026-08-06'),cell('2026-08-20')]);   /* asks for far past the parent */
  setTimeout(()=>{
    const t=task('td2');
    ok('the end stopped at the parent\'s end', t.endDate==='2026-08-07',
       t.startDate+'..'+t.endDate);
    ok('the day count followed', t.estimatedDays===4, String(t.estimatedDays));
    E('ppSelect(null,true);');
    stage5();
  },350);
}

function stage5(){
  sec('edge handles resize; edges snap to workdays');
  const b=phBands('Exterior Windows')[0];
  drag(b.querySelector('.cal-hdl.r'),[cell('2026-08-10'),cell('2026-08-12')]);
  setTimeout(()=>{
    let t=task('td1');
    ok('the right handle moved the end date', t.endDate==='2026-08-12',
       t.startDate+'..'+t.endDate);
    ok('the day count recomputed', t.estimatedDays===8, String(t.estimatedDays));
    const b2=phBands('Exterior Windows')[0];
    drag(b2.querySelector('.cal-hdl.l'),[cell('2026-08-04'),cell('2026-08-08')]);  /* a Saturday */
    setTimeout(()=>{
      t=task('td1');
      ok('the start snapped forward to Monday', t.startDate==='2026-08-10',
         t.startDate);
      E('ppSelect(null,true);');
      stage6();
    },350);
  },350);
}

function stage6(){
  sec('Protect dates swallows a resize, like the Gantt');
  E('DATE_LOCK=true;');
  const before=task('td1');
  const b=phBands('Exterior Windows')[0];
  drag(b.querySelector('.cal-hdl.r'),[cell('2026-08-12'),cell('2026-08-14')]);
  setTimeout(()=>{
    const t=task('td1');
    ok('the dates did not change', t.startDate===before.startDate&&t.endDate===before.endDate,
       t.startDate+'..'+t.endDate);
    E('DATE_LOCK=false;ppSelect(null,true);');
    stage7();
  },350);
}

function stage7(){
  sec('handles only exist on a phase\'s true edges; twins resize together');
  const segs=phBands('Main Shop Fab');
  ok('the fab phase spans multiple week rows', segs.length>1, segs.length+' segments');
  ok('the first segment has a left handle, no right',
     !!segs[0].querySelector('.cal-hdl.l')&&!segs[0].querySelector('.cal-hdl.r'));
  const last=segs[segs.length-1];
  ok('the last segment has a right handle, no left',
     !!last.querySelector('.cal-hdl.r')&&!last.querySelector('.cal-hdl.l'));
  drag(last.querySelector('.cal-hdl.r'),[cell('2026-09-03'),cell('2026-09-02')]);
  setTimeout(()=>{
    const f1=task('f1'),f2=task('f2');
    ok('the first twin resized', f1.endDate==='2026-09-02', f1.endDate);
    ok('the second twin resized with it', f2.endDate==='2026-09-02', f2.endDate);
    stage8();
  },350);
}

function stage8(){
  sec('the draft page: resize files a manual placement; a draft marker drags');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    E("NPV_MODE='calendar';npvRender();");
    setTimeout(()=>{
      /* Pick a segment holding its phase's true end — a week-clipped segment
         rightly has no right handle. */
      const b=[...doc.querySelectorAll('#npv-body .cal-band.ph[data-i]')]
        .find(x=>x.querySelector('.cal-hdl.r'));
      ok('the draft calendar draws phase bands', !!b);
      if(!b)return done();
      const t0=JSON.parse(E('JSON.stringify(NPV_TASKS['+b.dataset.i+'])'));
      const endTgt=E("fmtDate(addDays(parseDate('"+t0.endDate+"'),-1))");
      const hr=b.querySelector('.cal-hdl.r');
      ok('draft bands carry handles too', !!hr);
      const manual0=E('Object.keys(NPV_MANUAL).length');
      drag(hr,[cell(t0.endDate),cell(endTgt)]);
      setTimeout(()=>{
        ok('the resize filed a manual placement', E('Object.keys(NPV_MANUAL).length')>manual0);
        ok('the placement carries a day count',
           E("Object.values(NPV_MANUAL).some(m=>m.estimatedDays>0)"));
        const iso=E('fmtDate(addDays(parseDate(NPV_TASKS[0].startDate),1))');
        E("NPV_EVENTS.push({id:'de1',name:'Site visit',date:'"+iso+"',dept:'',notes:''});npvRebuild();");
        setTimeout(()=>{
          const mb=mkBand('de1');
          ok('the draft checkpoint band is drawn', !!mb);
          if(!mb)return done();
          const tgt=E("fmtDate(addDays(parseDate('"+iso+"'),2))");
          drag(mb,[cell(iso),cell(tgt)]);
          setTimeout(()=>{
            ok('the draft checkpoint moved, in NPV_EVENTS not ST',
               E("NPV_EVENTS.find(e=>e.id==='de1').date")===tgt,
               E("NPV_EVENTS.find(e=>e.id==='de1').date")+' vs '+tgt);
            done();
          },400);
        },400);
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
