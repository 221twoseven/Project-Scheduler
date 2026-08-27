/* Phase 3.5 (REV84) — the calendar collapses phases by default. Subtask bands
   (kids whose label/window differ from the parent's — not N16 roster twins) stay
   hidden until their phase is selected; a left-click on a phase band selects it,
   which opens the bottom phase editor AND repaints with the subtasks in view.
   Deselecting collapses again. Asserted on BOTH the saved page and the New
   Project draft (the REV49 lesson).
   Run: node tests/test84.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('phases collapse by default')<0){
  console.log('test84: skipped — no calendar collapse in '+FILE+' (pre-REV84 build)');
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
  endDate:'2026-08-05',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:'Door Frames'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-10',
  endDate:'2026-08-12',estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:'Metal'},
 {appId:'f2',projectId:'p1',department:'fab',assignee:'Bob',startDate:'2026-08-10',
  endDate:'2026-08-12',estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:'Metal'},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const bands=()=>[...doc.querySelectorAll('#npv-body .cal-band.ph')];
const band=t=>bands().filter(b=>b.textContent.indexOf(t)===0)[0];
/* Calendar hits resolve from the event's target, not coordinates (test53's rule). */
const clickOn=el=>{
  el.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0}));
  el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
};

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=false;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{E("ppSelect(null);NPV_MODE='calendar';npvRender();");setTimeout(savedPage,300);},700);
},1300);

function savedPage(){
  sec('saved page · phases collapse by default');
  ok('the phase band paints', !!band('Exterior Windows'));
  ok('its subtask band does not', !band('Door Frames'),
     bands().map(b=>b.textContent).join(' | '));
  ok('roster twins still merge into one +N band (not eaten by the collapse)',
     bands().filter(b=>/^Metal/.test(b.textContent)).length===1
     &&!!band('Metal +1'), bands().map(b=>b.textContent).join(' | '));

  sec('saved page · left-click opens the phase editor and expands the subtasks');
  clickOn(band('Exterior Windows'));
  setTimeout(()=>{
    ok('the phase is selected', E('PP_SEL')==='td1', String(E('PP_SEL')));
    ok('the bottom editor shows the phase', E('PP_INSP')==='phase');
    ok('the phase edit form is on screen', !!doc.getElementById('ins-name'));
    ok('the subtask band came into view', !!band('Door Frames'),
       bands().map(b=>b.textContent).join(' | '));
    ok('the selected phase wears the ring', !!doc.querySelector('#npv-body .cal-band.pick'));

    E('ppSelect(null);');
    setTimeout(()=>{
      ok('deselecting collapses the phase again', !band('Door Frames'),
         bands().map(b=>b.textContent).join(' | '));
      setTimeout(draftPage,300);
    },250);
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
      sec('draft page · same collapse, same click-to-expand');
      const pd=E("NPV_TASKS.findIndex(t=>t.department==='td')");
      ok('the draft has a td phase band', pd>=0&&!!doc.querySelector('#npv-body .cal-band.ph[data-i="'+pd+'"]'));
      E("npvCreateSubtask('td',NPV_TASKS["+pd+"].startDate,false,'Chunk A')");
      setTimeout(()=>{
        ok('the fresh subtask is selected, so its band shows', !!band('Chunk A'),
           bands().map(b=>b.textContent).join(' | '));
        E('ppSelect(null);');
        setTimeout(()=>{
          ok('deselected, the draft subtask collapses away', !band('Chunk A'),
             bands().map(b=>b.textContent).join(' | '));
          const pb=doc.querySelector('#npv-body .cal-band.ph[data-i="'+
            E("NPV_TASKS.findIndex(t=>t.department==='td')")+'"]');
          clickOn(pb);
          setTimeout(()=>{
            ok('clicking the draft phase opens its editor', E('PP_INSP')==='phase');
            ok('and brings the subtask into view', !!band('Chunk A'),
               bands().map(b=>b.textContent).join(' | '));
            done();
          },350);
        },250);
      },350);
    },300);
  },350);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
