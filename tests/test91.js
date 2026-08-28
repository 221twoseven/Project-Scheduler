/* Edit-in-place popover — left-click any item to edit it, right-click → New X to create
   then edit, double-click a title to rename it in place. Parity with the bottom inspector
   is asserted both directions. Covers the Gantt and the calendar.
   Skips on builds that predate the popover (the frozen REV50 reference).
   Run: node test91.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/npvEditPop/.test(src)){
  console.log('  SKIP  build predates the edit popover — nothing to assert');
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
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:'Weld-up'},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const menu=()=>doc.getElementById('npv-menu');
const pop=()=>doc.getElementById('npv-pop');
const byAct=a=>menu()&&menu().querySelector('button[data-act="'+a+'"]');
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const change=el=>el&&el.dispatchEvent(new win.Event('change',{bubbles:true}));
const rclick=el=>{const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2});
  el.dispatchEvent(ev);return ev;};
/* A bar click: mousedown on the bar, mouseup on the document — no travel, so it reads as
   a click (the §6 disambiguator). The same path a real pointer takes. */
function clickBar(bar){
  bar.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:0}));
}

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,800);
},1300);

function stage1(){
  sec('Gantt — left-click a phase bar opens the edit popover');
  clickBar(q('#npv-body .npv-bar'));
  setTimeout(()=>{
    ok('a popover opened over the chart', !!pop());
    ok('it is the phase editor (has a Name field)', !!(pop()&&pop().querySelector('[data-f="label"]')));
    ok('the bottom inspector is still populated too', !!doc.getElementById('ins-name'));
    const lbl=E('(ppSelected()||{}).label')||'';
    ok('the popover Name shows the bar\'s label',
       pop().querySelector('[data-f="label"]').value===lbl,
       pop().querySelector('[data-f="label"]').value+' vs '+lbl);

    sec('editing the popover writes through, and the dock reflects it (parity)');
    const pn=pop().querySelector('[data-f="label"]');
    pn.value='Skylight Run';change(pn);
    setTimeout(()=>{
      ok('the popover Name edit persists to ST', E("ST.tasks.some(t=>t.label==='Skylight Run')"));
      ok('the bottom inspector shows the same edit',
         doc.getElementById('ins-name').value==='Skylight Run',
         doc.getElementById('ins-name').value);
      const pd=pop().querySelector('[data-f="estimatedDays"]');
      pd.value='9';change(pd);
      setTimeout(()=>{
        ok('a days edit in the popover persists too',
           E("ST.tasks.find(t=>t.label==='Skylight Run').estimatedDays")===9,
           String(E("ST.tasks.find(t=>t.label==='Skylight Run').estimatedDays")));
        stage2();
      },300);
    },300);
  },300);
}

function stage2(){
  sec('parity — an edit in the bottom inspector reflects in the popover');
  ok('the popover is still open', !!pop());
  const nm=doc.getElementById('ins-name');
  nm.value='Ridge Beam';change(nm);
  setTimeout(()=>{
    ok('the dock edit wrote through', E("ST.tasks.some(t=>t.label==='Ridge Beam')"));
    ok('the popover Name now shows it too',
       pop()&&pop().querySelector('[data-f="label"]').value==='Ridge Beam',
       pop()&&pop().querySelector('[data-f="label"]').value);
    E('npvPopClose();ppSelect(null,true);');
    stage3();
  },300);
}

function stage3(){
  sec('right-click → New checkpoint is a plain add (no editor thrown open); a click edits it');
  const ev=rclick(q('#npv-body .npv-bar'));
  ok('the browser menu is suppressed', ev.defaultPrevented);
  setTimeout(()=>{
    ok('the add-only menu opened', !!menu()&&!!byAct('ev')&&!byAct('ren'));
    ok('the menu no longer carries an inline name field', !menu().querySelector('.mn'));
    const before=E('liveEvents(ppProject()).length');
    click(byAct('ev'));
    setTimeout(()=>{
      ok('a checkpoint was created', E('liveEvents(ppProject()).length')===before+1);
      ok('the menu just adds — no editor popped open', !pop());
      /* the checkpoint popover is reached by CLICKING the marker, like any item */
      const mk=q('#npv-body .npv-ev');
      ok('the checkpoint diamond is drawn on the chart', !!mk);
      mk.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:0}));
      doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:0}));
      setTimeout(()=>{
        ok('clicking the marker opens the checkpoint popover', !!pop());
        const nf=pop()&&pop().querySelector('[data-f="name"]');
        ok('it has a Name and a Date field', !!nf&&!!(pop().querySelector('[data-f="date"]')));
        nf.value='Client Approval';change(nf);
        setTimeout(()=>{
          ok('naming the checkpoint writes through',
             E("liveEvents(ppProject()).some(e=>e.name==='Client Approval')"));
          E('npvPopClose();');
          stage4();
        },300);
      },250);
    },300);
  },250);
}

function stage4(){
  sec('double-click a gutter title renames it in place (Explorer-style)');
  E('ppSelect(null,true);');
  const gut=q('#npv-body .npv-row .npv-gut');
  gut.dispatchEvent(new win.MouseEvent('dblclick',{bubbles:true,cancelable:true}));
  setTimeout(()=>{
    const inp=q('#npv-body .npv-rename');
    ok('an inline rename box appeared', !!inp);
    inp.value='Renamed Phase';
    inp.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    setTimeout(()=>{
      ok('Enter commits the new name to ST', E("ST.tasks.some(t=>t.label==='Renamed Phase')"),
         E("JSON.stringify(ST.tasks.map(t=>t.label))"));
      stage5();
    },300);
  },250);
}

function stage5(){
  sec('Calendar — left-click a phase band opens the popover');
  E("ppSelect(null,true);NPV_MODE='calendar';npvRender();");
  setTimeout(()=>{
    const band=q('#npv-body .cal-band.ph');
    ok('there is a phase band to click', !!band);
    band.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0}));
    band.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
    setTimeout(()=>{
      ok('the popover opened from the calendar', !!pop());
      ok('it is the phase editor', !!(pop()&&pop().querySelector('[data-f="label"]')));
      stage6();
    },250);
  },300);
}

function stage6(){
  sec('Escape and outside-click dismiss the popover');
  ok('a popover is open', !!pop());
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  setTimeout(()=>{
    ok('Escape closed the popover', !pop());
    ok('Escape did not also leave the project page', E('ROUTE.view')==='project');
    E("NPV_MODE='gantt';npvRender();");
    setTimeout(()=>{
      clickBar(q('#npv-body .npv-bar'));
      setTimeout(()=>{
        ok('reopened via a bar click', !!pop());
        doc.body.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0}));
        setTimeout(()=>{
          ok('a press outside the popover closes it', !pop());
          done();
        },150);
      },250);
    },250);
  },200);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
