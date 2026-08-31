/* v1.4.0 — Milestones & Notes (08-31 brief objs 3, 6, 4).
   1) (obj 3) Checkpoint → Milestone: date + plain-text name + phase. The type
      dropdown/datalist and the notes field are gone from every milestone editor
      (agenda row, popover, phase-modal list). Stored fields unchanged.
   2) (obj 6) Task → Note: date + single-line text only. Phase and who inputs gone
      from the note editors.
   3) (obj 4) Project-Gantt marker labels retired — the name lives in the hover
      title; click still opens the edit popover.
   Run: node tests/test-v140.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('Milestones & Notes')<0){
  console.log('test-v140: skipped — pre-v1.4.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D=n=>{const d=new Date();d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:D(30),status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:D(-5),endDate:D(5),
  estimatedDays:8,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(6),endDate:D(20),
  estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]},todosList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));

sec('source-level checks');
ok('the milestone type datalist is gone', src.indexOf('list="ag-dl"')<0&&src.indexOf('TN_TARGETS=[')<0);
ok('menus say New milestone / New note',
   src.indexOf('New milestone<span class="k">E</span>')>=0&&src.indexOf('New note<span class="k">T</span>')>=0);
ok('no marker label chip is rendered', src.indexOf('class="npv-evlbl"')<0);

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(main,800);
},1300);

function main(){
  sec('obj 3/6 — agenda rows carry only the new fields');
  click(q('#pp-insp [data-ag="ev"]'));
  click(q('#pp-insp [data-ag="tk"]'));
  setTimeout(()=>{
    const rows=qa('#pp-insp .ag-i');
    const evRow=rows.find(r=>r.dataset.agK==='ev'),tkRow=rows.find(r=>r.dataset.agK==='tk');
    ok('one milestone and one note row exist', !!evRow&&!!tkRow, rows.length+' rows');
    ok('milestone row: date + name + phase, no notes input',
       evRow&&!!evRow.querySelector('input[type=date]')&&!!evRow.querySelector('.nm')
       &&!!evRow.querySelector('select[data-f="dept"]')&&!evRow.querySelector('.x3'));
    ok('note row: date + name only',
       tkRow&&!!tkRow.querySelector('input[type=date]')&&!!tkRow.querySelector('.nm')
       &&!tkRow.querySelector('select')&&!tkRow.querySelector('.x3'));

    sec('obj 3/6 — the edit popover matches');
    const evId=E('liveEvents(ppProject())[0].id');
    E("npvEditPop('ev','"+evId+"',60,60)");
    let pop=q('#npv-pop');
    ok('milestone popover: date + name + phase, no notes',
       pop&&!!pop.querySelector('[data-f="date"]')&&!!pop.querySelector('[data-f="name"]')
       &&!!pop.querySelector('select[data-f="dept"]')&&!pop.querySelector('[data-f="notes"]'));
    E('npvPopClose()');
    const tkId=E('liveTodos(ppProject())[0].id');
    E("npvEditPop('tk','"+tkId+"',60,60)");
    pop=q('#npv-pop');
    ok('note popover: date + name only — no phase, no who',
       pop&&!!pop.querySelector('[data-f="due"]')&&!!pop.querySelector('[data-f="title"]')
       &&!pop.querySelector('select')&&!pop.querySelector('[data-f="who"]'));
    E('npvPopClose()');

    sec('obj 4 — the Gantt marker has no label chip; the title carries the name');
    const evRow2=qa('#pp-insp .ag-i').find(r=>r.dataset.agK==='ev');
    const nmInp=evRow2&&evRow2.querySelector('.nm');
    nmInp.value='Client sign-off';
    nmInp.dispatchEvent(new win.Event('change',{bubbles:true}));
    setTimeout(()=>{
      ok('no .npv-evlbl in the chart', !q('#npv-body .npv-evlbl'));
      const mk=q('#npv-body .npv-ev');
      ok('the marker title names the milestone', mk&&/Client sign-off/.test(mk.title), mk&&mk.title);

      sec('obj 3 — the phase modal milestone list is date + plain text');
      win.location.hash='#/';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(()=>{
        E("openTaskModal('t1')");
        click(q('#tm-tnadd'));
        const row=q('#tm-tnlist .tn-row');
        ok('a milestone row renders', !!row);
        ok('its name is a plain text input, no dropdown',
           row&&!!row.querySelector('input[type=text]')&&!row.querySelector('select'));
        ok('no notes input remains', row&&row.querySelectorAll('input').length===2,
           row&&row.querySelectorAll('input').length+' inputs');
        console.log('\ntest-v140: '+pass+' passed, '+fail+' failed');
        process.exit(fail?1:0);
      },800);
    },350);
  },400);
}
