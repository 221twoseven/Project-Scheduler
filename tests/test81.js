/* Phase 3.5 (REV81) — parity quick wins from the owner's audit decisions:
     I8  the draft's right-click "Add a phase" actually adds the department;
     I13 draft working state never leaks into a saved page (and same-page
         repaints keep session state);
     I14 Pin has a working control in the phase inspector, and a refused
         resize says why;
     D7  drafts announce themselves with a "Draft" footer pill;
     D8  the Status dropdown shows the stored truth, with "Automatic
         (currently: …)" carrying the derived status;
     keep-pile: the bar hover tooltip carries the crew name.
   Run: node tests/test81.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('ins-pin')<0){
  console.log('test81: skipped — no phase-panel Pin in '+FILE+' (pre-REV81 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D0=new Date();D0.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const rel=n=>{const d=new Date(D0);d.setDate(d.getDate()+n);return iso(d);};

const projects=[{appId:'p1',Title:'Anchor Job',client:'',jobCode:'ANC-1',deadline:rel(30),
  status:'auto',projectManager:'Stan',drafter:'Dana',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','fab','install']),createdAt:rel(-40)}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',
  startDate:rel(-5),endDate:rel(10),estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'install',assignee:'["Nick"]',
  startDate:rel(12),endDate:rel(16),estimatedDays:4,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const go=h=>{win.location.hash=h;};
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));

setTimeout(()=>{ /* app booted on the timeline */
  go('#/project/p1');
  setTimeout(savedPage,350);
},1300);

function savedPage(){
  sec('D8 · the Status dropdown shows the stored truth (saved page)');
  const sel=doc.getElementById('pp-status');
  ok('the dropdown exists',!!sel);
  ok('first option is Automatic with the derived status spelled out',
     !!sel&&sel.options[0].value==='auto'&&/Automatic \(currently: /.test(sel.options[0].textContent),
     sel&&sel.options[0].textContent);
  ok('a status:auto project actually selects Automatic',!!sel&&sel.value==='auto',sel&&sel.value);

  sec('keep-pile · the bar tooltip carries the crew');
  const bar=doc.querySelector('#npv-body .npv-bar');
  ok('a bar rendered',!!bar);
  ok('its hover tooltip names the crew',!!bar&&/Nick/.test(bar.getAttribute('title')||''),bar&&bar.getAttribute('title'));

  sec('D7 · the saved page footer keeps its real status pill');
  const sp=doc.querySelector('#npv-foot .sum-pill');
  ok('the footer pill is a status, not Draft',!!sp&&sp.dataset.st!=='draft',sp&&sp.dataset.st);

  sec('I14 · Pin is a real control in the phase inspector');
  const tid=E('ST.tasks[0].id');
  E('ppSelect('+JSON.stringify(tid)+')');
  const pin=doc.getElementById('ins-pin');
  ok('selecting a phase shows the Pin checkbox',!!pin);
  ok('it reflects the unpinned bar',!!pin&&!pin.checked);
  pin.checked=true;change(pin);
  ok('ticking it pins the task in state',E('ST.tasks[0].pinned')===true);

  sec('I14 · a refused resize explains itself');
  const idx=E('NPV_TASKS.findIndex(t=>t.id===ST.tasks[0].id)');
  const pbar=doc.querySelector('#npv-body .npv-bar[data-i="'+idx+'"]');
  const hdl=pbar&&pbar.querySelector('.npv-hdl');
  ok('the pinned bar and its edge handle exist',!!hdl);
  if(hdl){
    const mev=(type,tgt,x)=>tgt.dispatchEvent(new win.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:10}));
    mev('mousedown',hdl,100);
    mev('mousemove',doc,160);
    mev('mouseup',doc,160);
    ok('the snap-back names the pin as the reason',/Pinned — untick Pin/.test(doc.body.textContent));
  }
  const pin2=doc.getElementById('ins-pin');
  if(pin2){pin2.checked=false;change(pin2);}
  ok('unticking unpins',E('ST.tasks[0].pinned')===false);

  sec('I13 · a same-page data repaint keeps session state');
  /* invert the page's real row order — a repaint must keep the inversion */
  E('NPV_ORDER=["install","fab"]');
  E('saveState({projects:ST.projects,tasks:ST.tasks})');
  setTimeout(()=>{
    ok('NPV_ORDER survives the repaint',E('JSON.stringify(NPV_ORDER)')==='["install","fab"]',E('JSON.stringify(NPV_ORDER)'));
    go('#/project/new');
    setTimeout(draftPage,350);
  },250);
}

function draftPage(){
  sec('D7 · the draft announces itself in the footer');
  const dp=doc.querySelector('#npv-foot .sum-pill[data-st="draft"]');
  ok('a Draft pill renders',!!dp&&/Draft/.test(dp.textContent));
  ok('its tooltip explains the tab-local autosave',!!dp&&/kept in this tab/i.test(dp.getAttribute('title')||''));

  sec('D8 · the draft dropdown also opens on Automatic');
  const sel=doc.getElementById('pp-status');
  ok('Automatic is selected on a fresh draft',!!sel&&sel.value==='auto',sel&&sel.value);

  sec('I8 · right-click "Add a phase" adds the department on a draft');
  const before=E('(PP_FORM.activeDepartments||[]).includes("metal")');
  ok('metal is not active yet',before===false);
  E('npvCreateSubtask("metal",fmtDate(today()),true)');
  ok('the department joined the draft',E('PP_FORM.activeDepartments.includes("metal")')===true);
  const ck=doc.querySelector('#pp-depts input[data-dept="metal"]');
  ok('its checklist row ticked itself',!!ck&&ck.checked===true);
  ok('the scheduler emitted its bar',E('(NPV_ALL||[]).some(t=>t.department==="metal")')===true);

  sec('D9 · edits stash the draft without waiting for the tab to hide');
  doc.getElementById('pp-name').value='Crash Test';
  doc.getElementById('pp-name').dispatchEvent(new win.Event('input',{bubbles:true}));
  setTimeout(()=>{
    ok('the sessionStorage stash exists after the debounce',
       !!win.sessionStorage.getItem('shopTimelineDraft'));

    sec('I13 · draft state does not leak into a saved page');
    E('NPV_MANUAL["zz"]={startDate:"2026-01-01"};NPV_LINES.push({id:"zz",name:"Leak",dept:"fab",who:""})');
    go('#/project/p1'); /* harness confirm() accepts the discard */
    setTimeout(()=>{
      ok('manual placements were cleared on entry',E('Object.keys(NPV_MANUAL).length')===0,E('Object.keys(NPV_MANUAL).length'));
      ok('draft subtask lines were cleared on entry',E('NPV_LINES.length')===0,E('NPV_LINES.length'));
      /* the order re-derives from THIS project's rows — the draft's metal row must not ride along */
      ok('row order re-derived without the draft\'s department',E('NPV_ORDER.includes("metal")')===false,E('JSON.stringify(NPV_ORDER)'));
      done();
    },350);
  },2200);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
