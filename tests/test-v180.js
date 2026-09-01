/* v1.8.0 — permissions (§3 item 12): admin vs regular users + feedback recipients.
   - The staff list's `admin` column is the switch: while NO roster row carries a
     value (column absent / legacy fixtures), everyone is admin — the pre-v1.8.0
     world, which keeps every older suite meaningful. Once any row carries a value,
     only truthy rows are admins; everyone else is a viewer.
   - Viewers: read-only on shared data (saveState/savePeople/saveClients guarded),
     no client list, no project creation, Lock Dates forced on and the toggle
     hidden, project-edit fields render disabled ("visible, locked"), no create/
     delete doors (keys, menus, drags).
   - Admins manage two per-person checkboxes on the People page: Admin and
     Receives feedback. The last admin can't be demoted.
   - Feedback reports also mail everyone flagged feedbackRecipient — Graph
     /me/sendMail as the signed-in submitter, on its own Mail.Send token
     (consent missing → mail skipped, the report is already on the list).
   Run: node tests/test-v180.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function isAdmin(')<0){
  console.log('test-v180: skipped — pre-v1.8.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const mkProj=(id,name,i)=>({appId:id,Title:name,client:'C',jobCode:'J'+i,deadline:D(40+i),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:i});
const mkTask=(id,pid,dept,who,s,e)=>({appId:id,projectId:pid,department:dept,assignee:who,
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const mkStaff=(id,name,email,extra)=>Object.assign(
  {appId:id,Title:name,depts:JSON.stringify(['pm','fab']),ooo:'[]',email:email,phone:'',role:''},extra||{});

/* ---------- boot A: legacy fixtures (no admin column anywhere) ---------- */
const bootA=()=>boot(FILE,{data:{
  projects:[mkProj('p1','Alpha',0)],tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4))],
  staff:[mkStaff('s1','Sam','user@example.com'),mkStaff('s2','Nick','nick@x.co')],todos:[]}});
/* ---------- boot B: enforcement on, signed-in Sam is a VIEWER ---------- */
const bootB=()=>boot(FILE,{data:{
  projects:[mkProj('p1','Alpha',0)],tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4))],
  staff:[mkStaff('s1','Sam','user@example.com'),
         mkStaff('s2','Nick','nick@x.co',{admin:'1',feedbackRecipient:'1'}),
         mkStaff('s3','Ana','ana@x.co',{feedbackRecipient:'1'})],todos:[]}});
/* ---------- boot C: enforcement on, signed-in Sam is the (only) ADMIN ---------- */
const bootC=()=>boot(FILE,{data:{
  projects:[mkProj('p1','Alpha',0)],tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4))],
  staff:[mkStaff('s1','Sam','user@example.com',{admin:'1'}),
         mkStaff('s2','Nick','nick@x.co')],todos:[]}});

let dom=bootA(),win=dom.window,doc=win.document,E=s=>win.eval(s),calls=()=>win.__spCalls;

setTimeout(()=>{partA().catch(e=>{console.error(e);process.exit(1);});},1300);

async function partA(){
  sec('A · legacy fixtures: the column is the switch — everyone stays admin');
  ok('no admin values anywhere → isAdmin() true', E('isAdmin()')===true);
  ok('body carries no viewer class', !doc.body.classList.contains('viewer'));
  ok('Lock Dates stays a free choice', E('DATE_LOCK')===false);
  ok('personToFields OMITS null flags (no 400 on sites without the columns)',
     !('admin' in JSON.parse(E("JSON.stringify(personToFields({id:'x',name:'A',email:'',phone:'',role:'',depts:[],ooo:[]}))"))));
  const n0=calls().length;
  E("saveState({projects:ST.projects.map(p=>({...p,client:'C2'})),tasks:ST.tasks})");
  await wait(150);
  ok('edits flow (saveState not blocked)', E("projById('p1').client")==='C2'
     && calls().slice(n0).some(c=>c.method==='PATCH'));
  E("location.hash='#/people';applyRoute()");
  E("CD_SEL=PEOPLE.find(p=>p.name==='Nick').id;cdPaintDetail()");
  E("document.getElementById('cdd-edit').click()");
  ok('legacy mode: the editor offers NO permission checkboxes (columns may not exist)',
     !doc.getElementById('cde-admin'));

  dom=bootB();win=dom.window;doc=win.document;E=s=>win.eval(s);calls=()=>win.__spCalls;
  setTimeout(()=>{partB().catch(e=>{console.error(e);process.exit(1);});},1300);
}

async function partB(){
  sec('B · enforcement on: the signed-in user without the flag is a viewer');
  ok('isAdmin() false for Sam', E('isAdmin()')===false);
  ok('body carries the viewer class', doc.body.classList.contains('viewer'));
  ok('Lock Dates forced on', E('DATE_LOCK')===true && doc.body.classList.contains('dates-locked'));
  ok('flag round-trip: "1" reads true', E("PEOPLE.find(p=>p.name==='Nick').admin")===true);
  ok('flag round-trip: absent reads null', E("PEOPLE.find(p=>p.name==='Sam').admin")===null);

  sec('B · shared-data writes are blocked at the choke points');
  const n0=calls().length;
  E("saveState({projects:ST.projects.map(p=>({...p,client:'HACKED'})),tasks:ST.tasks})");
  await wait(150);
  ok('saveState refuses: state untouched', E("projById('p1').client")==='C');
  ok('…and nothing left for SharePoint', !calls().slice(n0).some(c=>c.method==='PATCH'||c.method==='POST'));
  E("savePeople(PEOPLE.filter(p=>p.name!=='Nick'))");
  await wait(120);
  ok('savePeople refuses', E("PEOPLE.some(p=>p.name==='Nick')")===true);
  E("saveClients([{name:'X',alias:''}])");
  await wait(120);
  ok('saveClients refuses', E('CLIENTS.length')===0);

  sec('B · admin-only doors are shut');
  E("location.hash='#/clients'");
  await wait(120);
  ok('the clients page bounces to the timeline', E('ROUTE.view')==='timeline');
  E("location.hash='#/project/new'");
  await wait(120);
  ok('the new-project draft bounces to the timeline', E('ROUTE.view')==='timeline');
  ok('a bar mousedown never arms a drag',
     E("(startDrag({clientX:0,clientY:0},'t1',document.createElement('div'),{}),DRAG===null)"));
  ok('the People page renders without + Add',
     (E("location.hash='#/people';applyRoute()"),!doc.getElementById('cd-add')));
  E("CD_SEL=PEOPLE.find(p=>p.name==='Nick').id;cdPaintDetail()");
  ok('a person record renders without Edit', !doc.getElementById('cdd-edit'));

  sec('B · the project page is visible, locked');
  E("location.hash='#/project/p1';applyRoute()");
  await wait(400);
  ok('project fields render disabled', E("document.getElementById('pp-name').disabled")===true
     && E("document.getElementById('pp-status').disabled")===true);
  ok('no Delete project / Mark complete in the footer',
     !doc.getElementById('pp-del')&&!doc.getElementById('pp-complete'));
  ok('the footer says view-only instead of "Changes saved"',
     /View only/i.test((doc.querySelector('.pg-auto')||{}).textContent||''));
  ok('the agenda offers no + Milestone / + Note', !doc.querySelector('.ag-add'));
  const ev0=E('(ST.events||[]).length'),tk0=E('(ST.todos||[]).length');
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'e'}));
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'t'}));
  await wait(120);
  ok('E/T create keys are inert', E('(ST.events||[]).length')===ev0&&E('(ST.todos||[]).length')===tk0);

  sec('B · feedback still works for everyone — and mails the recipients');
  E("location.hash='#/';applyRoute()");
  await wait(120);
  E('openFeedback()');
  E("document.getElementById('fb-desc').value='The zoom is great'");
  const n1=calls().length;
  E('sendFeedback()');
  await wait(250);
  const post=calls().slice(n1).find(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Feedback'));
  ok('the report posts to the list', !!post&&post.body.fields.description.indexOf('zoom')>=0);
  const mail=calls().slice(n1).find(c=>c.url.includes('/me/sendMail'));
  ok('sendMail goes out as the submitter', !!mail&&mail.method==='POST');
  const addrs=mail?mail.body.message.toRecipients.map(r=>r.emailAddress.address).sort().join('|'):'';
  ok('…to exactly the flagged recipients', addrs==='ana@x.co|nick@x.co', addrs);
  ok('…with the app version and kind in the mail', mail&&mail.body.message.body.content.indexOf('Bug report')>=0);

  dom=bootC();win=dom.window;doc=win.document;E=s=>win.eval(s);calls=()=>win.__spCalls;
  setTimeout(()=>{partC().catch(e=>{console.error(e);process.exit(1);});},1300);
}

async function partC(){
  sec('C · the admin keeps the full app');
  ok('isAdmin() true for the flagged Sam', E('isAdmin()')===true);
  ok('no viewer class', !doc.body.classList.contains('viewer'));
  ok('Lock Dates stays a free choice', E('DATE_LOCK')===false);

  sec('C · the People page manages the two flags');
  E("location.hash='#/people';applyRoute()");
  E("CD_SEL=PEOPLE.find(p=>p.name==='Nick').id;cdPaintDetail()");
  ok('read mode shows a Permissions row', /Permissions/.test(doc.getElementById('cd-detail').textContent));
  E("document.getElementById('cdd-edit').click()");
  ok('the editor carries both checkboxes', !!doc.getElementById('cde-admin')&&!!doc.getElementById('cde-fbr'));
  E("document.getElementById('cde-admin').click();document.getElementById('cde-fbr').click()");
  const n0=calls().length;
  E('cdSavePerson()');
  await wait(150);
  ok('Nick is now an admin in state', E("PEOPLE.find(p=>p.name==='Nick').admin")===true);
  const pat=calls().slice(n0).find(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&c.body.appId==='s2');
  ok("the PATCH writes admin:'1' and feedbackRecipient:'1'",
     !!pat&&pat.body.admin==='1'&&pat.body.feedbackRecipient==='1');

  sec('C · the last admin cannot be demoted');
  E("savePeople(PEOPLE.map(p=>p.name==='Nick'?{...p,admin:false}:p))"); /* Nick back to non-admin, Sam sole admin */
  await wait(150);
  E("CD_SEL=PEOPLE.find(p=>p.name==='Sam').id;cdPaintDetail()");
  E("document.getElementById('cdd-edit').click()");
  E("document.getElementById('cde-admin').click()"); /* uncheck self */
  E('cdSavePerson()');
  await wait(120);
  ok('the save refuses and Sam stays admin', E("PEOPLE.find(p=>p.name==='Sam').admin")===true);

  sec('C · no recipients → no mail');
  E("savePeople(PEOPLE.map(p=>({...p,feedbackRecipient:p.feedbackRecipient==null?null:false})))");
  await wait(150);
  E('openFeedback()');
  E("document.getElementById('fb-desc').value='quiet one'");
  const n1=calls().length;
  E('sendFeedback()');
  await wait(250);
  ok('the report still posts', calls().slice(n1).some(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Feedback')));
  ok('no sendMail call', !calls().slice(n1).some(c=>c.url.includes('/me/sendMail')));

  console.log('\ntest-v180: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},60000);
