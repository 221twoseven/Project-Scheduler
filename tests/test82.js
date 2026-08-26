/* Phase 3.5 (REV82) — the inspector convergence (audit D1–D4, L1/L3/L4, I1–I7,
   I9–I12): draft selection is real, the floating popover is retired, and the
   bottom "This phase" inspector serves BOTH pages. Draft selection keys on what
   survives the per-keystroke rebuild (department / line id); draft edits commit
   to the durable stores (lines + manual placements); ⌘Z walks a draft undo
   stack; Link carries subtasks on drafts; saved-page row reorder persists.
   Also guards the notes fix (commitPhase used to drop the field silently).
   Run: node tests/test82.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('ppDraftResolve')<0){
  console.log('test82: skipped — no draft selection layer in '+FILE+' (pre-REV82 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D0=new Date();D0.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const rel=n=>{const d=new Date(D0);d.setDate(d.getDate()+n);return iso(d);};

/* activeDepartments deliberately ordered install-before-fab: the I12 read side must
   seed the row order from it. */
const projects=[{appId:'p1',Title:'Anchor Job',client:'',jobCode:'ANC-1',deadline:rel(30),
  status:'auto',projectManager:'Stan',drafter:'Dana',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','install','fab']),createdAt:rel(-40)}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',
  startDate:rel(-5),endDate:rel(10),estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'install',assignee:'["Nick"]',
  startDate:rel(12),endDate:rel(16),estimatedDays:4,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const go=h=>{win.location.hash=h;};
const fire=(el,type)=>el.dispatchEvent(new win.Event(type,{bubbles:true}));
const mev=(type,tgt,x,y)=>tgt.dispatchEvent(new win.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x||0,clientY:y||10}));

setTimeout(()=>{go('#/project/p1');setTimeout(savedPage,350);},1300);

function savedPage(){
  sec('saved page sanity + the notes fix');
  E('ppSelect(ST.tasks[0].id)');
  ok('the phase inspector opens',!!doc.getElementById('ins-name'));
  const notes=doc.querySelector('#pp-insp [data-f="notes"]');
  ok('it has a Notes field',!!notes);
  notes.value='measure twice';fire(notes,'change');
  ok('notes actually persist now (commitPhase used to drop them)',
     E('ST.tasks[0].notes')==='measure twice',E('ST.tasks[0].notes'));

  sec('I12 · the row order reads from activeDepartments');
  ok('install-before-fab seeded from the project',
     E('JSON.stringify(NPV_ORDER)')==='["install","fab"]',E('JSON.stringify(NPV_ORDER)'));

  go('#/project/new');
  setTimeout(draftPage,350);
}

function draftPage(){
  /* give the draft a name + install date so the scheduler emits bars */
  const nm=doc.getElementById('pp-name');nm.value='Draft Job';fire(nm,'input');
  E('ppFormSync();npvRebuild()');

  sec('I1 · clicking a draft bar selects into the inspector (popover retired)');
  const bar=doc.querySelector('#npv-body .npv-bar');
  ok('a draft bar rendered',!!bar);
  mev('mousedown',bar,100);mev('mouseup',doc,100);
  ok('the This-phase inspector opened',!!doc.getElementById('ins-name'));
  ok('no floating popover appeared',!doc.getElementById('bar-pop'));
  ok('the selection ring painted',!!doc.querySelector('#npv-body .npv-bar.pick'));

  sec('D3 · the breadcrumb shows the draft selection');
  ok('the phase crumb is visible',!doc.getElementById('pp-bc').classList.contains('hidden'));

  sec('I1 · selection survives the per-keystroke rebuild');
  const selDept=E('ppSelected().department');
  nm.value='Draft Job Two';fire(nm,'input');
  E('npvRebuild()');
  ok('still selected after a rebuild',E('ppSelected()&&ppSelected().department')===selDept);

  sec('inspector commits on the draft: dates → placement, rename moves it');
  const sd=doc.querySelector('#pp-insp [data-f="startDate"]');
  const before=E('Object.keys(NPV_MANUAL).length');
  sd.value=rel(2);fire(sd,'change');
  ok('a date edit files a manual placement',E('Object.keys(NPV_MANUAL).length')>before);
  const nameF=doc.querySelector('#pp-insp [data-f="label"]');
  nameF.value='Facade Chunk';fire(nameF,'change');
  ok('the rename kept the placement (key moved with it)',
     E('Object.keys(NPV_MANUAL).some(k=>k.includes("Facade Chunk"))'));
  ok('…and the bar is still selected',!!E('ppSelected()'));
  ok('…renamed',E('ppSelected().label')==='Facade Chunk');

  sec('I9 · duplicate works on the draft');
  const nBars=E('NPV_TASKS.length');
  doc.getElementById('ins-dup').click();
  ok('a new bar exists',E('NPV_TASKS.length')===nBars+1,E('NPV_TASKS.length'));
  ok('the copy is selected',/ copy$/.test(E('ppSelected()?ppSelected().label:""')),E('ppSelected()&&ppSelected().label'));
  ok('the copy kept the source dates',E('ppSelected().startDate')===rel(2));

  sec('I10 · ⌘Z walks the draft undo stack');
  const afterDup=E('NPV_TASKS.length');
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true}));
  ok('undo removed the duplicate',E('NPV_TASKS.length')===afterDup-1,E('NPV_TASKS.length'));

  sec('I2 · Del deletes the selected draft bar');
  E('ppSelect(NPV_TASKS.find(t=>String(t.id).includes("::")).id)');
  const beforeDel=E('NPV_TASKS.length');
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Delete',bubbles:true}));
  ok('the bar is gone',E('NPV_TASKS.length')<beforeDel,E('NPV_TASKS.length'));

  sec('I4 · Shift+arrow nudges a draft bar');
  const t0=E('NPV_TASKS[0]');
  E('ppSelect(NPV_TASKS[0].id)');
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true}));
  const expect=E('fmtDate(addDays(parseDate('+JSON.stringify(t0.startDate)+'),1))');
  ok('the bar moved a day',E('ppSelected().startDate')===expect,
     t0.startDate+' -> '+E('ppSelected().startDate')+' (want '+expect+')');

  sec('I5 · Link carries subtasks on a draft drag');
  E('LINK_SUBS=true');
  E('npvCreateSubtask(NPV_TASKS[0].department,NPV_TASKS[0].startDate,false,"Chunk B")');
  const dept=E('ppSelected().department');
  const kidS0=E('ppSelected().startDate');
  const parentBar=doc.querySelector('#npv-body .npv-row.parent .npv-bar');
  ok('a parent row exists after the split',!!parentBar);
  mev('mousedown',parentBar,100);
  mev('mousemove',doc,100+E('NPV_GEO.dw'));
  mev('mouseup',doc,100+E('NPV_GEO.dw'));
  const kidNow=E('NPV_TASKS.find(t=>t.label==="Chunk B").startDate');
  const kidWant=E('fmtDate(addDays(parseDate('+JSON.stringify(kidS0)+'),1))');
  ok('the subtask rode along one day',kidNow===kidWant,kidS0+' -> '+kidNow+' (want '+kidWant+')');

  sec('the department select is honest on drafts');
  const ds=doc.querySelector('#pp-insp [data-f="department"]');
  ok('it renders but is disabled with an explanation',
     !!ds&&ds.disabled&&/checklist/i.test(ds.title||''),
     'sel='+E('PP_SEL')+' resolved='+!!E('ppSelected()')+' ds='+(ds?('disabled='+ds.disabled+' title='+ds.title):'null'));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
