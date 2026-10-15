/* v1.47.0 — TODO item 7: make repeat department work easy to find.
   (1) Duplicate on a project-page bar's right-click menu (an add, so it fits N11's add-only menu) and on its
   edit popover, on the saved page and the draft; (2) the timeline's ⋯ hover cue on project-page bars;
   (3) the New Project divider: a grip that shows before hover, and a footer that counts the required
   fields and links each missing one to its field.
   Run: node tests/test-v1470.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function ppPaintNeeds(')<0){
  console.log('  SKIP  test-v1470: pre-v1.47.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:'2026-09-15',status:'auto',
  projectManager:'Theo',activeDepartments:JSON.stringify(['td','fab']),createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
  {appId:'td1',projectId:'p1',department:'td',assignee:'Oscar',startDate:'2026-08-03',endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
  {appId:'f1',projectId:'p1',department:'fab',assignee:'Milo',startDate:'2026-08-20',endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const menu=()=>doc.getElementById('npv-menu');
const byAct=a=>menu()&&menu().querySelector('button[data-act="'+a+'"]');
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const rclick=el=>el.dispatchEvent(new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));
const bar=()=>q('#npv-body .npv-bar[data-i]');
const tdCount=()=>E("ST.tasks.filter(t=>t.projectId==='p1'&&t.department==='td').length");

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('(1) Duplicate on the saved page');
  win.location.hash='#/project/p1';await wait(700);
  rclick(bar());await wait(50);
  ok('the bar\'s right-click menu offers Duplicate',!!byAct('dup'));
  ok('the menu stays add-only: no Delete (N11)',!byAct('del'));
  const n0=tdCount();
  click(byAct('dup'));await wait(300);
  ok('Duplicate from the menu adds a bar',tdCount()===n0+1,tdCount());
  E("ppSelect('td1',true);npvEditPop('phase','td1',100,100)");await wait(50);
  const pd=q('#npv-pop [data-pop-dup]');
  ok('the bar\'s edit popover offers Duplicate',!!pd);
  ok('beside Delete',!!q('#npv-pop [data-pop-del]'));
  click(pd);await wait(300);
  ok('Duplicate from the popover adds a bar',tdCount()===n0+2,tdCount());
  ok('and closes the popover',!q('#npv-pop'));
  ok('a view-only user never sees the popover\'s Duplicate (CSS door, like Delete)',
    /body\.viewer:not\(\.vg-phases\) #npv-pop\[data-kind=phase\] \[data-pop-dup\]/.test(src));

  sec('(2) the ⋯ hover cue on project-page bars');
  ok('project-page bars show ⋯ on hover',/\.npv-bar:hover::after\{content:'⋯'/.test(src));

  sec('(3) the divider grip shows before hover');
  ok('the divider draws a grip at rest',/#dock-resize::after\{content:''/.test(src));
  ok('a collapsed panel still hides the divider (and its grip)',/\.dash-insp\.collapsed #pp-insp,\.dash-insp\.collapsed #dock-resize\{display:none\}/.test(src));

  sec('(1) Duplicate on a draft');
  win.location.hash='#/';await wait(300);
  E("location.hash='#/project/new';applyRoute()");await wait(800);
  const db=bar();
  ok('the draft draws a bar',!!db);
  if(db){
    const b0=E('NPV_TASKS.length');
    rclick(db);await wait(50);
    ok('the draft bar\'s menu offers Duplicate',!!byAct('dup'));
    click(byAct('dup'));await wait(300);
    ok('it adds a bar to the draft, not to SharePoint',E('NPV_TASKS.length')===b0+1&&tdCount()===n0+2,E('NPV_TASKS.length')+' vs '+b0);
  }

  sec('(3) the draft footer says what Create still needs');
  const needs=()=>q('#pp-needs');
  ok('the footer carries the needs line',!!needs());
  ok('it counts the required fields (2 here: with no PM roster the PM rule is waived)',
    /of 2 required/.test(needs().textContent)===!E('(STAFF.projectManagers||[]).length'),needs().textContent);
  const nm=q('.pp-need[data-need="name"]');
  ok('a missing name is a link',!!nm&&nm.tagName==='BUTTON');
  ok('the line is never the saved page\'s "Changes saved" (.pg-auto)',!q('#pp-needs.pg-auto'));
  click(nm);await wait(50);
  ok('the link takes the cursor to the name field',doc.activeElement&&doc.activeElement.id==='pp-name');
  ok('and marks it',q('#pp-name').classList.contains('err'));
  const dl=q('.pp-need[data-need="deadline"]');
  if(dl){click(dl);await wait(80);
    ok('the date link opens the form and goes to the date',doc.activeElement&&doc.activeElement.id==='pp-deadline');}
  const ni=q('#pp-name');ni.value='Lobby desk';ni.dispatchEvent(new win.Event('input',{bubbles:true}));await wait(20);
  ok('typing a name drops it from the list',!q('.pp-need[data-need="name"]'),needs().textContent);
  const di=q('#pp-deadline');
  if(di){di.value='2026-12-01';di.dispatchEvent(new win.Event('change',{bubbles:true}));await wait(50);}
  E("PP_FORM.projectManager='Theo'");E('ppPaintNeeds()');
  ok('with all three in, it reads "Ready to create"',/Ready to create/.test(needs().textContent),needs().textContent);

  sec('Create still names and focuses what is missing (unchanged behaviour)');
  E("PP_FORM.projectManager='';");
  const n2=q('#pp-name');n2.value='';n2.dispatchEvent(new win.Event('input',{bubbles:true}));
  click(q('#pp-save'));await wait(80);
  ok('it refuses and says what it needs',/Give it a name/.test(doc.body.textContent));
  ok('no project was created',E('ST.projects.length')===1);

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
