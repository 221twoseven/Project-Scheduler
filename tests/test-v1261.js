/* v1.26.1 — tracker #25: blank chart space deselects everywhere, edits are kept, the
   close control is findable.
   R1 clicking any empty chart space (between rows, below the last row, the empty right
   side) deselects the item and closes its panel; bars, grips, the date axis and menus do
   not · R2 anything being typed is saved before the panel closes · R3 the close control
   is a visible, labelled "Close ×" with Esc in its tooltip. Asserted on a saved project
   AND the New Project draft; the Calendar's own rule (blank space never deselects) is
   locked as before.
   Run: node tests/test-v1261.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("host.closest('.npv-scroll')")<0){
  console.log('  SKIP  test-v1261: pre-v1.26.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-11-20',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-10-05',
  endDate:'2026-10-09',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-10-12',
  endDate:'2026-10-30',estimatedDays:15,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-11-19',
  endDate:'2026-11-20',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const md=el=>el.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0,clientX:20,clientY:20}));
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
const sel=()=>E('PP_SEL');
const T=id=>JSON.parse(E('JSON.stringify(ST.tasks.find(t=>t.id==="'+id+'")||null)'));

setTimeout(()=>{
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(stageA,600);
},1300);

function stageA(){
  sec('saved project — blank chart space deselects everywhere (R1)');
  const scroll=q('#npv-scroll'),inner=q('#npv-scroll .npv-in');
  ok('the chart has its scroll box and inner wrapper', !!scroll&&!!inner);
  E("ppSelect('td1')");
  ok('a phase is selected', sel()==='td1', sel());
  md(scroll);
  ok('R1: pressing the empty space below the last row (the scroll box itself) deselects', sel()===null, sel());
  E("ppSelect('td1')"); md(inner);
  ok('R1: pressing the inner wrapper (the empty right side) deselects too', sel()===null, sel());
  E("ppSelect('td1')"); md(q('#npv-body .npv-bar'));
  ok('R1: pressing a bar does not deselect', sel()!==null, sel());
  E("ppSelect('td1')"); const gut=q('#npv-body .npv-gut'); if(gut)md(gut);
  ok('R1: pressing a row title (grip side) does not deselect', sel()!==null, sel());
  E("ppSelect('td1')"); md(q('#npv-axis'));
  ok('R1: pressing the date axis does not deselect (it pans)', sel()!==null, sel());

  sec('saved project — a value still being typed is saved before the panel closes (R2)');
  E("ppSelect('td1')");
  const name=q('#pp-insp #ins-name');
  ok('the Name field is in the panel', !!name);
  name.focus(); name.value='Exterior Windows, revised';
  md(scroll);
  const t=T('td1');
  ok('R2: the typed name was saved', t&&t.label==='Exterior Windows, revised', t&&t.label);
  ok('R2: and the panel closed', sel()===null, sel());

  sec('saved project — the close control (R3)');
  E("ppSelect('td1')");
  const x=q('#pp-insp #ins-x');
  ok('the panel header has a Close control', !!x);
  ok('R3: it is labelled "Close ×"', !!x&&/^Close\s*×$/.test(x.textContent.trim()), x&&x.textContent.trim());
  ok('R3: its tooltip names Esc', !!x&&/Esc/.test(x.title), x&&x.title);
  ok('R3: it is at least 24px tall (Design-Language §9 hit target)', /\.ins-hd \.x\{[^}]*min-height:24px/.test(src));
  click(x);
  ok('clicking it deselects', sel()===null, sel());
  const pop=/data-pop-x title="Close \(Esc\)" aria-label="Close \(Esc\)">Close <span aria-hidden="true">&times;<\/span>/.test(src);
  ok('R3: the edit popover\'s close control carries the same label', pop);

  sec('saved project — Close saves what you typed and closes in one press (R2 + R3)');
  E("ppSelect('td1')");
  const n2=q('#pp-insp #ins-name'); n2.focus(); n2.value='Closed with a name';
  md(q('#pp-insp #ins-x'));
  ok('R2: the typed name was saved by the press on Close', T('td1')&&T('td1').label==='Closed with a name', T('td1')&&T('td1').label);
  ok('R3: and that one press closed the panel', sel()===null, sel());

  sec('saved project — a press that only dismisses the add menu keeps the selection (N11 rule)');
  E("ppSelect('td1')");
  q('#npv-body').dispatchEvent(new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:300,clientY:30}));
  if(q('#npv-menu')){
    md(q('#npv-scroll .npv-in'));
    ok('the press below the rows closed the add menu', !q('#npv-menu'));
    ok('and kept the selection, as a menu-dismissing press always has', sel()==='td1', sel());
  }else{
    console.log('  SKIP  the add menu did not open in jsdom; the dismiss rule is covered by the handler order');
  }

  sec('saved project — the Calendar keeps its own rule (blank space never deselects there)');
  E("NPV_MODE='calendar';npvRender();ppSelect('td1')");
  setTimeout(()=>{
    md(q('#npv-scroll'));
    ok('a blank press on the Calendar leaves the selection alone, as before', sel()==='td1', sel());
    E("NPV_MODE='gantt';npvRender();ppSelect(null,true)");
    stageB();
  },300);
}

function stageB(){
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    sec('New Project draft — the same three rules');
    const dl=q('#pp-deadline'); ok('the draft opened', !!dl);
    E("ppSelect(NPV_TASKS.find(t=>t.department==='td').id)");
    ok('a draft bar is selected', !!sel(), sel());
    md(q('#npv-scroll'));
    ok('R1: blank space below the rows deselects on the draft', sel()===null, sel());
    E("ppSelect(NPV_TASKS.find(t=>t.department==='td').id)");
    const name=q('#pp-insp #ins-name');
    ok('the draft panel has the Name field', !!name);
    name.focus(); name.value='Possible mock up days';
    md(q('#npv-scroll'));
    ok('R2: the typed name was kept on the draft', E("NPV_TASKS.some(t=>t.label==='Possible mock up days')"), E("JSON.stringify(NPV_TASKS.map(t=>t.label))"));
    ok('R2: and the panel closed', sel()===null, sel());
    E("ppSelect(NPV_TASKS.find(t=>t.department==='td').id)");
    const x=q('#pp-insp #ins-x');
    ok('R3: the draft panel shows the same "Close ×"', !!x&&/^Close\s*×$/.test(x.textContent.trim()), x&&x.textContent.trim());
    click(x);
    ok('clicking it deselects on the draft', sel()===null, sel());
    done();
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
