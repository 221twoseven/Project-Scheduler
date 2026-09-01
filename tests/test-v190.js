/* v1.9.0 — the 2026-09-01 late-evening owner asks:
   - Calendar edge-resize follows the pointer into previous/subsequent weeks: once the
     drag leaves the grabbed segment's home week row, the bands repaint live at the
     snapped span (NPV_CAL_RZ) instead of stretching inside one row.
   - My Dashboard dock: Milestones + Notes stack in one column; User Notes — a personal
     multi-line scratch pad stored on the person's staff row (item 30's personalNotes
     column) — takes its own column at the far right. Saving your OWN notes works even
     as a viewer (savePeople's promised self-row exception).
   - Developer view: admin column value 'dev' = developer (a full admin) whose toolbar
     gains a Viewer toggle next to the version number to preview the non-admin app.
   - My Dashboard is a navigation: entered from a Company Data or project page it walks
     the hash back to the timeline instead of arming the dock behind the open page.
   Run: node tests/test-v190.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('tb-devview')<0){
  console.log('test-v190: skipped — pre-v1.9.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* ---- boot 1: the timeline — perms, toggle, dock, navigation ---- */
const staff=[
  {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',phone:'',role:'PM',admin:'dev',personalNotes:'seed note'},
  {appId:'s2',Title:'Pat',depts:JSON.stringify(['fab']),ooo:'[]',email:'',phone:'',role:'',admin:'1',personalNotes:'private pat note'},
  {appId:'s3',Title:'Kim',depts:JSON.stringify(['fab']),ooo:'[]',email:'',phone:'',role:'',admin:''}];
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const projects=[{appId:'p1',Title:'Alpha',client:'Acme',jobCode:'J1',deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',
  startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]},todosList:true});
const win=dom.window,doc=win.document,E=s=>win.eval(s);

setTimeout(main,1300);

function main(){
  sec('source: the wiring the DOM can\'t show');
  ok('the poll defers while the dock textarea has focus', src.indexOf("closest('#me-dock'))return;")>=0);
  ok('npvPaintCalendar honours the live-resize override in BOTH loops',
     (src.match(/NPV_CAL_RZ&&(npvCalKey|calKey)\(t\)===NPV_CAL_RZ\.key/g)||[]).length>=2);

  sec("the admin column's third value: 'dev' = developer (still an admin)");
  ok('parse: dev row is admin AND developer',
     E("PEOPLE.find(p=>p.name==='Sam').admin")===true&&E("PEOPLE.find(p=>p.name==='Sam').developer")===true);
  ok('plain rows parse as before',
     E("PEOPLE.find(p=>p.name==='Pat').admin")===true&&E("PEOPLE.find(p=>p.name==='Kim').admin")===false
     &&E("PEOPLE.find(p=>p.name==='Pat').developer")===false);
  const wr=JSON.parse(E("JSON.stringify(personToFields(PEOPLE.find(p=>p.name==='Sam')))"));
  ok("write-back keeps 'dev' (a People-page save can't clobber it)", wr.admin==='dev');
  const dm=JSON.parse(E("JSON.stringify(personToFields({...PEOPLE.find(p=>p.name==='Sam'),admin:false}))"));
  ok("a deliberate admin demote drops 'dev'", dm.admin==='');
  const rt=JSON.parse(E("JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'Ana',email:'',phone:'',role:'',depts:[],ooo:[],admin:true,developer:false,feedbackRecipient:null,personalNotes:'keep me'})))"));
  ok('personalNotes survives the field-mapper round trip', rt.personalNotes==='keep me');
  ok('a row that never carried the column stays tristate-null (no 400 risk)',
     JSON.parse(E("JSON.stringify(personToFields({id:'y',name:'Bo',email:'',phone:'',role:'',depts:[],ooo:[],admin:null,personalNotes:null}))")).personalNotes===undefined);

  sec('the Viewer toggle: developers preview the non-admin app');
  ok('the toggle shows for the developer', !doc.getElementById('tb-devview').classList.contains('hidden'));
  ok('…and sits in the global toolbar row next to the version number',
     doc.getElementById('tb-devview').nextElementSibling===doc.getElementById('tb-rev'));
  ok('admin before the toggle', E('isAdmin()')===true);
  E('DATE_LOCK=false');
  doc.getElementById('tb-devview').click();
  ok('one click: the whole app answers viewer', E('isAdmin()')===false&&doc.body.classList.contains('viewer'));
  ok('the toggle lights while previewing', doc.getElementById('tb-devview').classList.contains('active'));
  ok('Lock Dates forced on, like a real viewer', E('DATE_LOCK')===true);
  ok('the choice is remembered per tab', E("sessionStorage.getItem('shopTimelineDevView')")==='1');

  sec('viewer preview: the dock, and the self-row notes exception');
  E("enterDash('Sam')");
  ok('the dashboard dock is on', doc.body.classList.contains('me-dock-on'));
  const stack=doc.querySelector('#me-dock .md-stack');
  ok('Milestones + Notes stack in ONE column', !!stack
     &&stack.querySelectorAll('h4').length===2
     &&/Milestones/.test(stack.querySelectorAll('h4')[0].textContent)
     &&/Notes/.test(stack.querySelectorAll('h4')[1].textContent));
  const secs=doc.querySelectorAll('#me-dock .ins-body>.ins-sec');
  ok('User Notes is the far-right column', secs.length===4
     &&/User Notes/.test(secs[3].querySelector('h4').textContent)
     &&!!secs[3].querySelector('#md-unotes'));
  const un=doc.getElementById('md-unotes');
  ok('the stored note is shown', un.value==='seed note');
  ok('your OWN dashboard edits it — even as a viewer', !un.disabled);
  un.value='new note';
  un.dispatchEvent(new win.Event('change',{bubbles:true}));
  ok('a change saves through the self-row exception (viewer guard bypassed)',
     E("PEOPLE.find(p=>p.name==='Sam').personalNotes")==='new note');
  E("enterDash('Pat')");
  ok("someone else's Summary never shows their personal notes (item 30 spec)",
     !doc.getElementById('md-unotes')
     &&doc.querySelectorAll('#me-dock .ins-body>.ins-sec').length===3
     &&doc.getElementById('me-dock').innerHTML.indexOf('private pat note')<0);
  E("enterDash('Sam')");
  ok('…while the plain guard still blocks a viewer', (()=>{ /* same list back = a people edit attempt */
     E('savePeople(PEOPLE.map(p=>({...p,role:"X"})))');
     return E("PEOPLE.find(p=>p.name==='Sam').role")!=='X';})());
  setTimeout(stage2,400);
}

function stage2(){
  const un=doc.getElementById('md-unotes'); /* re-queried: savePeople re-rendered the dock */
  ok('the staff PATCH carries personalNotes',
     (win.__spCalls||[]).some(c=>c.init&&c.init.method==='PATCH'&&/personalNotes/.test(String(c.init.body))
       &&/new note/.test(String(c.init.body))));

  sec('toggling back restores the admin');
  E('DEV_LOCK0===null'); /* touch to keep eval warm */
  doc.getElementById('tb-devview').click();
  ok('admin again', E('isAdmin()')===true&&!doc.body.classList.contains('viewer'));
  ok('DATE_LOCK restored to how it stood before the preview', E('DATE_LOCK')===false);

  sec('My Dashboard is a navigation, not a background state');
  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    ok('on the People page', E('ROUTE.view')==='people');
    doc.getElementById('btn-dash').click();
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      ok('the click walks the hash back to the timeline', String(win.location.hash).replace(/^#\/?$/,'#/')==='#/');
      ok('…which renders the dashboard as the page on screen',
         E('ROUTE.view')==='timeline'&&doc.body.classList.contains('me-dock-on'));
      stage3();
    },300);
  },300);
}

/* ---- boot 2: project-page calendar — the resize follows across week rows ---- */
let dom2,win2,doc2,E2;
function stage3(){
  const proj2=[{appId:'p1',Title:'Alpha',client:'Acme',jobCode:'J1',deadline:'2026-08-21',
    status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
    activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01',sortIndex:0}];
  const task2=[{appId:'f1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-08-03',
    endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
  const staff2=[{appId:'s1',Title:'Sam',depts:JSON.stringify(['pm','fab']),ooo:'[]',email:'user@example.com',phone:'',role:''}];
  dom2=boot(FILE,{data:{projects:proj2,tasks:task2,staff:staff2,todos:[]},todosList:true});
  win2=dom2.window;doc2=win2.document;E2=s=>win2.eval(s);
  setTimeout(()=>{
    E2('NPV_OPEN=new Set();LINK_SUBS=false;DATE_LOCK=false;');
    win2.location.hash='#/project/p1';
    win2.dispatchEvent(new win2.Event('hashchange'));
    setTimeout(()=>{E2("NPV_MODE='calendar';npvRender();");setTimeout(stage4,300);},700);
  },1300);
}
function stage4(){
  sec('calendar edge-resize follows the pointer into the next week row');
  const cell=iso=>doc2.querySelector('#npv-body .cal-col[data-d="'+iso+'"]');
  const band=doc2.querySelector('#npv-body .cal-band.ph');
  ok('the phase band paints with a true-end handle', !!band&&!!band.querySelector('.cal-hdl.r'));
  band.querySelector('.cal-hdl.r').dispatchEvent(new win2.MouseEvent('mousedown',
    {bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
  cell('2026-08-06').dispatchEvent(new win2.MouseEvent('mousemove',
    {bubbles:true,cancelable:true,clientX:130,clientY:100}));
  ok('inside the home week the override stays off (px stretch handles it)', E2('!NPV_CAL_RZ'));
  cell('2026-08-11').dispatchEvent(new win2.MouseEvent('mousemove',
    {bubbles:true,cancelable:true,clientX:160,clientY:160}));
  ok('crossing into the next week arms the live override',
     E2('!!NPV_CAL_RZ')&&E2('NPV_CAL_RZ.e')==='2026-08-11');
  const c2=cell('2026-08-11'); /* re-queried — the follow repainted the calendar */
  ok("the bar now paints in the pointer's week row",
     !!c2&&!!c2.closest('.cal-wk').querySelector('.cal-band.ph'));
  ok('…and the home-week segment keeps a band too',
     !!cell('2026-08-04')&&!!cell('2026-08-04').closest('.cal-wk').querySelector('.cal-band.ph'));
  doc2.dispatchEvent(new win2.MouseEvent('mouseup',{bubbles:true,cancelable:true,button:0}));
  setTimeout(()=>{
    ok('release commits the snapped end date',
       E2("ST.tasks.find(t=>t.id==='f1').endDate")==='2026-08-11');
    ok('the override clears on release', E2('!NPV_CAL_RZ'));
    console.log('\ntest-v190: '+pass+' passed, '+fail+' failed');
    process.exit(fail?1:0);
  },400);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
