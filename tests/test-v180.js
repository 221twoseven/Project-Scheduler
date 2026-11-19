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
   Run: node tests/test-v180.js timeline/index.html  (or via tests/run.js) */
const {boot,bootPeople,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

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
  staff:[mkStaff('s1','Sam','user@example.com'),mkStaff('s2','Milo','milo@example.com')],todos:[]}});
/* ---------- boot B: enforcement on, signed-in Sam is a VIEWER ---------- */
const bootB=()=>boot(FILE,{data:{
  projects:[mkProj('p1','Alpha',0)],tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4))],
  staff:[mkStaff('s1','Sam','user@example.com'),
         mkStaff('s2','Milo','milo@example.com',{admin:'1',feedbackRecipient:'1'}),
         mkStaff('s3','Ana','ana@example.com',{feedbackRecipient:'1'})],todos:[]}});
/* ---------- boot C: enforcement on, signed-in Sam is the (only) ADMIN ---------- */
const bootC=()=>boot(FILE,{data:{
  projects:[mkProj('p1','Alpha',0)],tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4))],
  staff:[mkStaff('s1','Sam','user@example.com',{admin:'1'}),
         mkStaff('s2','Milo','milo@example.com')],todos:[]}});

/* v1.62.0 (item 87): the People page is the People app; each part boots it on the same roster */
const peopleOn=b=>{const staff=JSON.parse(JSON.stringify(b.__staff));return bootPeople({data:{projects:[],tasks:[],staff,todos:[]}}).window;};
const STAFF_A=[mkStaff('s1','Sam','user@example.com'),mkStaff('s2','Milo','milo@example.com')];
const STAFF_B=[mkStaff('s1','Sam','user@example.com'),mkStaff('s2','Milo','milo@example.com',{admin:'1',feedbackRecipient:'1'}),mkStaff('s3','Ana','ana@example.com',{feedbackRecipient:'1'})];
const STAFF_C=[mkStaff('s1','Sam','user@example.com',{admin:'1'}),mkStaff('s2','Milo','milo@example.com')];
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
  const pa=peopleOn({__staff:STAFF_A});await wait(1300);
  pa.eval("CD_SEL=PEOPLE.find(p=>p.name==='Milo').id;cdPaintDetail()");
  pa.eval("document.getElementById('cdd-edit').click()");
  ok('legacy mode: the editor offers NO permission checkboxes (columns may not exist)',
     !pa.document.getElementById('cde-admin'));

  dom=bootB();win=dom.window;doc=win.document;E=s=>win.eval(s);calls=()=>win.__spCalls;
  setTimeout(()=>{partB().catch(e=>{console.error(e);process.exit(1);});},1300);
}

async function partB(){
  sec('B · enforcement on: the signed-in user without the flag is a viewer');
  ok('isAdmin() false for Sam', E('isAdmin()')===false);
  ok('body carries the viewer class', doc.body.classList.contains('viewer'));
  ok('Lock Dates forced on', E('DATE_LOCK')===true && doc.body.classList.contains('dates-locked'));
  ok('flag round-trip: "1" reads true', E("PEOPLE.find(p=>p.name==='Milo').admin")===true);
  ok('flag round-trip: absent reads null', E("PEOPLE.find(p=>p.name==='Sam').admin")===null);

  sec('B · shared-data writes are blocked at the choke points');
  const n0=calls().length;
  E("saveState({projects:ST.projects.map(p=>({...p,client:'HACKED'})),tasks:ST.tasks})");
  await wait(150);
  ok('saveState refuses: state untouched', E("projById('p1').client")==='C');
  ok('…and nothing left for SharePoint', !calls().slice(n0).some(c=>c.method==='PATCH'||c.method==='POST'));
  E("savePeople(PEOPLE.filter(p=>p.name!=='Milo'))");
  await wait(120);
  ok('savePeople refuses', E("PEOPLE.some(p=>p.name==='Milo')")===true);
  /* v1.58.0 (item 86): Timeline has no client writer at all now; the Clients app owns the list
     and shows a non-admin its "Clients is for admins." page instead */
  ok('saveClients refuses: Timeline can\'t write clients at all', E('typeof saveClients')==='undefined');

  sec('B · admin-only doors are shut');
  E("location.hash='#/clients'");
  await wait(120);
  ok('the clients page bounces to the timeline (v1.58.0: on to the Clients app)', E('ROUTE.view')==='timeline');
  E("location.hash='#/project/new'");
  await wait(120);
  ok('the new-project draft bounces to the timeline', E('ROUTE.view')==='timeline');
  ok('a bar mousedown never arms a drag',
     E("(startDrag({clientX:0,clientY:0},'t1',document.createElement('div'),{}),DRAG===null)"));
  const pb=peopleOn({__staff:STAFF_B});await wait(1300);
  ok('the People app renders without + Add', !!pb.document.getElementById('cd-rows')&&!pb.document.getElementById('cd-add'));
  pb.eval("CD_SEL=PEOPLE.find(p=>p.name==='Milo').id;cdPaintDetail()");
  ok('a person record renders without Edit', !pb.document.getElementById('cdd-edit'));
  pb.eval("savePeople(PEOPLE.filter(p=>p.name!=='Milo'))");
  await wait(120);
  ok('…and its savePeople refuses too', pb.eval("PEOPLE.some(p=>p.name==='Milo')")===true&&!pb.__spCalls.some(c=>c.method!=='GET'));

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
  E("const s=document.getElementById('fb-subject');if(s)s.value='Zoom'"); /* v1.28.0 (#10): the subject is required */
  E("document.getElementById('fb-desc').value='The zoom is great'");
  const n1=calls().length;
  E('sendFeedback()');
  await wait(250);
  const post=calls().slice(n1).find(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Feedback'));
  ok('the report posts to the list', !!post&&post.body.fields.description.indexOf('zoom')>=0);
  const mail=calls().slice(n1).find(c=>c.url.includes('/me/sendMail'));
  ok('sendMail goes out as the submitter', !!mail&&mail.method==='POST');
  const addrs=mail?mail.body.message.toRecipients.map(r=>r.emailAddress.address).sort().join('|'):'';
  ok('…to exactly the flagged recipients', addrs==='ana@example.com|milo@example.com', addrs);
  ok('…with the app version and kind in the mail', mail&&mail.body.message.body.content.indexOf('Bug report')>=0);

  dom=bootC();win=dom.window;doc=win.document;E=s=>win.eval(s);calls=()=>win.__spCalls;
  setTimeout(()=>{partC().catch(e=>{console.error(e);process.exit(1);});},1300);
}

async function partC(){
  sec('C · the admin keeps the full app');
  ok('isAdmin() true for the flagged Sam', E('isAdmin()')===true);
  ok('no viewer class', !doc.body.classList.contains('viewer'));
  ok('Lock Dates stays a free choice', E('DATE_LOCK')===false);

  sec('C · the People app manages the two flags');
  const pc=peopleOn({__staff:STAFF_C});await wait(1300);
  const PE=x=>pc.eval(x),pdoc=pc.document,pcalls=()=>pc.__spCalls;
  PE("CD_SEL=PEOPLE.find(p=>p.name==='Milo').id;cdPaintDetail()");
  ok('read mode shows a Permissions row', /Permissions/.test(pdoc.getElementById('cd-detail').textContent));
  PE("document.getElementById('cdd-edit').click()");
  ok('the editor carries both checkboxes', !!pdoc.getElementById('cde-admin')&&!!pdoc.getElementById('cde-fbr'));
  PE("document.getElementById('cde-admin').click();document.getElementById('cde-fbr').click()");
  const n0=pcalls().length;
  PE('cdSavePerson()');
  await wait(150);
  ok('Milo is now an admin in state', PE("PEOPLE.find(p=>p.name==='Milo').admin")===true);
  const pat=pcalls().slice(n0).find(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&c.body.appId==='s2');
  ok("the PATCH writes admin:'1' and feedbackRecipient:'1'",
     !!pat&&pat.body.admin==='1'&&pat.body.feedbackRecipient==='1');

  sec('C · the last admin cannot be demoted');
  PE("savePeople(PEOPLE.map(p=>p.name==='Milo'?{...p,admin:false}:p))"); /* Milo back to non-admin, Sam sole admin */
  await wait(150);
  PE("CD_SEL=PEOPLE.find(p=>p.name==='Sam').id;cdPaintDetail()");
  PE("document.getElementById('cdd-edit').click()");
  PE("document.getElementById('cde-admin').click()"); /* uncheck self */
  PE('cdSavePerson()');
  await wait(120);
  ok('the save refuses and Sam stays admin', PE("PEOPLE.find(p=>p.name==='Sam').admin")===true);

  sec('C · no recipients → no mail');
  E("savePeople(PEOPLE.map(p=>({...p,feedbackRecipient:p.feedbackRecipient==null?null:false})))");
  await wait(150);
  E('openFeedback()');
  E("const s2=document.getElementById('fb-subject');if(s2)s2.value='Quiet'"); /* v1.28.0 (#10) */
  E("document.getElementById('fb-desc').value='quiet one'");
  const n1=calls().length;
  E('sendFeedback()');
  await wait(250);
  ok('the report still posts', calls().slice(n1).some(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Feedback')));
  ok('no sendMail call', !calls().slice(n1).some(c=>c.url.includes('/me/sendMail')));

  done();
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},60000);
