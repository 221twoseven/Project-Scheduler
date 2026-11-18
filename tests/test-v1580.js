/* v1.58.0 — item 86 (with 85 (b)): the Clients app. Timeline's Clients page becomes its own
   product at clients/, built to the owner's Clients wireframe with the owner's wording and picks
   of 2026-11-18 (no left rail; "The company's clients and their cost-code aliases."; a client's
   record lists its current projects; People greyed "In Timeline for now"). It owns the
   ShopTimeline_Clients list and reads Projects, phases, Staff and Config.
   R1 the page: the shell, the title and its line, + Add client, the search box · R2 the list:
   A–Z, alias, a count of current projects, search by name or alias, the empty and no-match
   lines · R3 a client's record: Details, Edit client, its current projects (soonest due first,
   code · due date, status · PM, a link into Timeline, "N in all"), matched by stable ID after a
   rename and by exact name otherwise; the none-current and no-project lines · R4 editing: new
   client, trim and uppercase, duplicates refused, a rename PATCHes, a removal asks with the
   project count and DELETEs, leaving a changed client asks first · R5 saving: a failure parks,
   the pill retries, leaving the page warns · R6 access: the ADMIN chip; a non-admin gets "Clients
   is for admins." · R7 it writes only the Clients list · R8 Timeline: no Clients page or menu
   entry, an old #/clients link goes on to the app, the dropdown's note links to it, and coming
   back to the tab brings a just-added client into the dropdown, on a saved project and on the
   New Project draft (the REV49 lesson) · R9 the shared rules and the update check live in
   common/ (85 (b)), and the app runs the update check with its own "busy" rule.
   Run: node tests/test-v1580.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {boot,suite}=require('./harness');
const {FILE,src,raw,ok,done}=suite();
const ROOT=path.join(__dirname,'..'),APP=path.join(ROOT,'clients','index.html');
const app=fs.readFileSync(APP,'utf8').replace(/\r\n/g,'\n');
const js=fs.readFileSync(path.join(ROOT,'common','common.js'),'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ver=(/const APP_VER='([^']+)'/.exec(raw)||[])[1];
const URL_C='https://example.github.io/Project-Scheduler/clients/';

const clients=[{Title:'Alder Studio',field_2:'ALD'},{Title:'Common Ground',field_2:'CG'},
  {Title:'Fieldwork Museum',field_2:'FWM'},{Title:'Northline Retail',field_2:'NLR'}];
const P=(id,name,client,code,status,pm,extra)=>({appId:id,Title:name,client,jobCode:code,status,projectManager:pm,activeDepartments:'[]',...(extra||{})});
const projects=[
  P('p1','Autumn window installation','Alder Studio','ALD-026','auto','Jamie Park'),
  P('p2','Flagship display fixtures','Alder Old Name','ALD-031','in-design','Jamie Park',{refs:JSON.stringify({people:{},client:{'Alder Old Name':'sp0'}})}),
  P('p3','Old job','Alder Studio','ALD-001','complete','Jamie Park'),
  P('p4','Museum case','fieldwork museum','FWM-002','auto','Sam'),
  P('p5','Done long ago','Common Ground','CG-010','auto','Sam')];
const T=(id,p,dept,s,e)=>({appId:id,projectId:p,department:dept,startDate:s,endDate:e,assignee:'',estimatedDays:1});
const tasks=[T('t1','p1','fab','2026-11-01','2026-11-20'),T('t2','p1','install','2026-12-01','2026-12-02'),
  T('t3','p2','install','2026-11-12','2026-11-12'),T('t4','p5','install','2026-10-01','2026-10-01')];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]',admin:'1'};
const SAM_V={...SAM,admin:''},PAT={appId:'s2',Title:'Pat',email:'pat@example.com',depts:'[]',ooo:'[]',admin:'1'};
const start=(data,opts)=>boot(APP,{url:URL_C,clientsList:true,data,...(opts||{})}).window;

sec('R9: the shared rules and the update check live in common/');
const decl=(text,n)=>new RegExp('(^|\\n)\\s*(async\\s+)?(function\\s+'+n+'\\s*\\(|(const|let)\\s+[^\\n;]*\\b'+n+'\\s*=)').test(text);
const moved=['today','parseDate','fmtDate','esc','isoDay','safeArr','DEPTS','deptById','isEndDept','dueOf','FAB_GRPS','statusOf',
  'STATUS_LBL','STATUS_MIGRATE','fieldsToProj','fieldsToTask','flagTruthy','adminFlag','staffMe','rosterAdmin','clientFromItem',
  'readConfig','CFG_RAW','SP_CFG_IDS','verCmp','updToast','updReload','updCheck','updApply','updRetire','updWatch'];
ok('each is declared in common.js', moved.every(n=>decl(js,n)), moved.filter(n=>!decl(js,n)).join(','));
ok('…and none in timeline/index.html or clients/index.html', moved.every(n=>!decl(raw,n)&&!decl(app,n)),
  moved.filter(n=>decl(raw,n)||decl(app,n)).join(','));
ok('Timeline\'s status and admin rules call the shared ones', /function _projStatus\(p\)\{return statusOf\(/.test(raw)&&/return rosterAdmin\(PEOPLE\);/.test(raw));
ok('the app loads ../common/ with the running version, and carries it as its own', [...app.matchAll(/\.\.\/common\/common\.(?:js|css)\?v=([^"]+)"/g)].map(m=>m[1]).join()===ver+','+ver
  &&app.includes("const APP_VER='"+ver+"'"));
const {stampCommon}=require('../tools/gen-release-notes.js');
ok('npm run notes stamps the app (its tags and its APP_VER)', /PRODUCTS=\[path\.join\(ROOT,'clients','index\.html'\)\]/.test(fs.readFileSync(path.join(ROOT,'tools','gen-release-notes.js'),'utf8'))
  &&stampCommon('<script src="../common/common.js?v=1"></script>','9.9.9').includes('?v=9.9.9'));

(async()=>{try{await run();}catch(e){ok('suite threw: '+(e&&e.stack||e),false);}done();})();

async function run(){
  const W=start({clients,projects,tasks,staff:[SAM]});await wait(1500);
  const d=W.document,q=s=>d.querySelector(s),qa=s=>[...d.querySelectorAll(s)],E=s=>W.eval(s),txt=el=>el?el.textContent.trim():'';
  const click=el=>el.dispatchEvent(new W.MouseEvent('click',{bubbles:true}));
  const type=(el,v)=>{el.value=v;el.dispatchEvent(new W.Event('input',{bubbles:true}));};

  sec('R1: the page');
  ok('the tab reads "Clients — TWOSEVEN INC."', d.title==='Clients — TWOSEVEN INC.', d.title);
  ok('the header: TWOSEVEN INC. (to the Systems page), then CLIENTS', q('.ts-top .ts-brand').getAttribute('href')==='../'&&txt(q('.ts-top .ts-app'))==='Clients');
  ok('the shell\'s sync pill reads synced', /synced/.test(txt(q('#sync-pill'))));
  click(q('#btn-apps'));
  const it=qa('#apps-menu .ts-apps-item');
  ok('Apps lists the four products, Clients ticked, People greyed "In Timeline for now"',
    it.map(x=>x.dataset.app).join()==='Timeline,People,Clients,Office'&&it[2].getAttribute('aria-current')==='page'
    &&it[1].classList.contains('off')&&/In Timeline for now/.test(txt(it[1]))&&it[0].getAttribute('href')==='../timeline/');
  ok('…and its button says it\'s open', q('#btn-apps').getAttribute('aria-expanded')==='true');
  d.dispatchEvent(new W.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Escape closes it', q('#apps-menu').classList.contains('hidden')&&q('#btn-apps').getAttribute('aria-expanded')==='false');
  ok('the title and its line, in the owner\'s words', txt(q('h1'))==='Clients'&&txt(q('.sub'))==='The company\'s clients and their cost-code aliases.');
  ok('+ Add client', txt(q('#add'))==='+ Add client');
  ok('the search box: "Search clients or aliases…"', q('#q').placeholder==='Search clients or aliases…');
  ok('no left rail while Clients is the only section (owner, 2026-11-18)', !q('nav.sidebar,.rail'));

  sec('R2: the list');
  const rows=()=>qa('#list .row');
  ok('every client, A–Z', rows().map(r=>txt(r.querySelector('b'))).join('|')==='Alder Studio|Common Ground|Fieldwork Museum|Northline Retail');
  ok('each with its alias', rows().map(r=>txt(r.querySelector('.alias'))).join()==='ALD,CG,FWM,NLR');
  ok('…and its current projects: 2, none, 1, none', rows().map(r=>txt(r.querySelector('.mut'))).join('|')
    ==='2 current projects|No current projects|1 current project|No current projects', rows().map(r=>txt(r.querySelector('.mut'))).join('|'));
  type(q('#q'),'fwm');
  ok('search finds an alias', rows().length===1&&/Fieldwork/.test(txt(rows()[0])));
  type(q('#q'),'zzz');
  ok('no match: "No matching clients."', txt(q('#list .empty'))==='No matching clients.');
  type(q('#q'),'');
  ok('nothing selected: "Select a client to see its record."', txt(q('#rec'))==='Select a client to see its record.');

  sec('R3: a client\'s record');
  click(rows()[0]);
  ok('the row reads as selected', rows()[0].getAttribute('aria-current')==='true');
  ok('the name with its alias, then Details: Client alias, and Edit client', txt(q('.rec-top h2'))==='Alder Studio'&&/Client alias\s*ALD/.test(txt(q('.kv')))&&txt(q('#edit'))==='Edit client');
  const pr=qa('#rec .proj');
  ok('its current projects, soonest due first — the renamed one found by its stable ID', pr.map(a=>txt(a.querySelector('.nm'))).join('|')==='Flagship display fixtures|Autumn window installation',
    pr.map(a=>txt(a.querySelector('.nm'))).join('|'));
  /* v1.59.0 (item 92): the dates now run start to due, and the status moved to a pill */
  ok('code · dates to the due date, the status (worked out from the phases, as in Timeline) and the PM',
    txt(pr[1].querySelector('.meta'))==='ALD-026 · Nov 1 – Dec 2, 2026 (due)'&&txt(pr[1].querySelector('.st-pill'))==='Fabrication'&&txt(pr[1].querySelector('.team'))==='PM Jamie Park'
    &&txt(pr[0].querySelector('.meta'))==='ALD-031 · Nov 12, 2026 (due)'&&txt(pr[0].querySelector('.st-pill'))==='Design'&&txt(pr[0].querySelector('.team'))==='PM Jamie Park', txt(pr[1])+' / '+txt(pr[0]));
  ok('each opens the project in Timeline', pr[1].getAttribute('href')==='../timeline/#/project/p1'&&/Open in Timeline →/.test(txt(pr[1])));
  ok('"3 in all" counts the finished one too', /3 in all/.test(txt(q('#rec'))));
  click(rows()[2]);
  ok('a name typed in another case still matches (one client by that name)', /Museum case/.test(txt(q('#rec')))&&/Estimating/.test(txt(q('#rec'))));
  click(rows()[1]);
  ok('none current: "Not on any current project. 1 finished."', /Not on any current project\. 1 finished\./.test(txt(q('#rec'))));
  click(rows()[3]);
  ok('none at all: "Not on any project yet."', /Not on any project yet\./.test(txt(q('#rec'))));

  sec('R4: editing');
  const calls=()=>W.__spCalls;const n0=calls().length;
  click(q('#add'));
  ok('+ Add client opens "New client" with Client name and Client alias', txt(q('.rec-top h2'))==='New client'
    &&qa('#rec .field span').map(s=>txt(s)).join()==='Client name,Client alias'&&q('#ce-alias').placeholder==='2–3 letter cost-code prefix'&&!q('#ce-del'));
  type(q('#ce-name'),'  Bergdorf  ');type(q('#ce-alias'),'bgd');click(q('#ce-save'));await wait(150);
  ok('save trims and uppercases, and the toast says so', E("CLIENTS.some(c=>c.name==='Bergdorf'&&c.alias==='BGD')")&&/Bergdorf saved/.test(txt(q('#toasts'))));
  ok('…POSTs Title + field_2 to the Clients list', calls().slice(n0).some(c=>c.method==='POST'&&/ShopTimeline_Clients/.test(c.url)&&c.body.fields.Title==='Bergdorf'&&c.body.fields.field_2==='BGD'));
  ok('…and shows its record', txt(q('.rec-top h2'))==='Bergdorf');
  click(q('#add'));type(q('#ce-name'),'alder studio');click(q('#ce-save'));
  ok('a duplicate name is refused and the editor stays', /Two clients share the name "alder studio"\. Please make names unique\./.test(txt(q('#toasts')))&&!!q('#ce-name'));
  let asked='';W.confirm=m=>{asked=m;return false;};
  click(rows()[0]);
  ok('leaving a changed client asks "Discard the changes to this client?"', asked==='Discard the changes to this client?'&&!!q('#ce-name'));
  W.confirm=m=>{asked=m;return true;};
  click(q('#ce-cancel'));
  click(rows().find(r=>/Alder/.test(txt(r))));click(q('#edit'));
  ok('Edit client opens the client\'s own name over the fields, with Remove client…', txt(q('.rec-top h2'))==='Alder Studio'&&txt(q('#ce-del'))==='Remove client…'&&q('#ce-name').value==='Alder Studio');
  type(q('#ce-alias'),'ALS');click(q('#ce-save'));await wait(150);
  ok('a change PATCHes that row by its item id', calls().some(c=>c.method==='PATCH'&&/ShopTimeline_Clients\/items\/sp0/.test(c.url)&&c.body.field_2==='ALS'));
  click(q('#edit'));asked='';click(q('#ce-del'));await wait(150);
  ok('Remove asks with the project count, in the owner\'s words', asked==='3 projects carry this client. They keep the client\'s name; only the list entry and its alias go away.\n\nRemove Alder Studio from the client list?', asked);
  ok('…then DELETEs the row and says so', calls().some(c=>c.method==='DELETE'&&/ShopTimeline_Clients\/items\/sp0/.test(c.url))&&/Alder Studio removed/.test(txt(q('#toasts'))));

  sec('R7: it writes only the Clients list');
  const writes=calls().filter(c=>c.method!=='GET');
  ok('every write went to ShopTimeline_Clients', writes.length>=3&&writes.every(c=>/ShopTimeline_Clients/.test(c.url)), writes.map(c=>c.method+' '+c.url.split('/lists/')[1]).join(' | '));

  sec('R5: a failed save');
  const f0=W.fetch;W.fetch=(u,i)=>(i&&i.method&&i.method!=='GET')?Promise.resolve({ok:false,status:500,json:async()=>({}),text:async()=>'boom'}):f0(u,i);
  click(rows().find(r=>/Common/.test(txt(r))));click(q('#edit'));type(q('#ce-alias'),'CGX');click(q('#ce-save'));await wait(200);
  ok('the pill says "clients not saved — click to retry"', /clients not saved — click to retry/.test(txt(q('#sync-pill'))));
  ok('the change stays on screen', /CGX/.test(txt(q('#rec'))));
  const bu=new W.Event('beforeunload',{cancelable:true});W.dispatchEvent(bu);
  ok('leaving the page now warns', bu.defaultPrevented);
  ok('a reload is held back with the reason', /a save hasn’t reached SharePoint yet/.test(E('updWhyNot()'))&&E('updBusy()')===true);
  W.fetch=f0;click(q('#sync-pill'));await wait(200);
  ok('a click on the pill retries, and it lands', /synced/.test(txt(q('#sync-pill')))&&calls().some(c=>c.method==='PATCH'&&c.body&&c.body.field_2==='CGX'));

  sec('R6: access');
  ok('an admin wears the ADMIN chip', /Sam\s*ADMIN/.test(txt(q('#who'))));
  const V=start({clients,projects,tasks,staff:[SAM_V,PAT]});await wait(1500);
  const vd=V.document;
  ok('a non-admin gets "Clients is for admins." and the way back to Timeline',
    /Clients is for admins\./.test(vd.getElementById('main').textContent)&&/Ask an admin to add or change a client\. You can still pick a project's client in Timeline\./.test(vd.getElementById('main').textContent)
    &&vd.querySelector('#main a.btn').getAttribute('href')==='../timeline/'&&!vd.getElementById('list'));
  ok('the staff list unreachable: Timeline\'s cached roster decides, not "everyone\'s an admin"',
    /else try\{PEOPLE=JSON\.parse\(localStorage\.getItem\('shopTimelinePeople_v1'\)\)\|\|\[\];\}/.test(app)&&raw.includes("const PEOPLE_KEY='shopTimelinePeople_v1'"));
  E("PROJ_OK=false;SEL='Common Ground';paint()");
  ok('the projects unreachable: no count reads as "none", and the record says why',
    rows().every(r=>txt(r.querySelector('.mut'))==='')&&/Couldn't read the projects from SharePoint\./.test(txt(q('#rec'))));
  E("PROJ_OK=true;paint()");
  ok('the sign-in-expired box, in Timeline\'s words', /Your sign-in expired/.test(app)&&app.includes('Clients paused while you were away. Sign in to pick up where you left off.'));

  sec('R9: the update check runs here too');
  ok('updCheck, its watcher and the busy hooks are wired', E('typeof updCheck')==='function'&&/updWatch\(\);/.test(app));
  E("EDIT={name:'x',alias:'',_new:true}");
  ok('an open editor holds it', E('updBusy()')===true);
  E("EDIT=null");

  sec('R8: Timeline');
  ok('Company Data no longer lists Clients, and Timeline has no Clients page', !/id="mi-clients"/.test(raw)&&!/view==='clients'/.test(raw)&&!/function cdSaveClient/.test(raw));
  ok('an old #/clients link goes on to the Clients app', /if\(h==='clients'\|\|h\.indexOf\('clients\/'\)===0\)\{location\.replace\('\.\.\/clients\/'\)/.test(raw));
  ok('the poll re-reads the client list every other tick', /if\(POLL_N%2===0&&await clientsRefresh\(\)&&relink\(\)\)dirty=true;/.test(raw));
  const tdata={projects:[{appId:'q1',Title:'Window Job',client:'Brand New Co',jobCode:'BNC-1',status:'auto',projectManager:'Sam',activeDepartments:JSON.stringify(['pm'])}],
    tasks:[],staff:[],todos:[],clients:[{Title:'Acme Corp',field_2:'ACM'}]};
  const TW=boot(FILE,{url:'https://example.github.io/Project-Scheduler/timeline/#/project/q1',clientsList:true,data:tdata}).window;await wait(1500);
  const tq=s=>TW.document.querySelector(s),opts=()=>[...TW.document.querySelectorAll('#pp-client option')].map(o=>o.value);
  const note=tq('#pp-client+.ins-note');
  ok('a saved project: the note links to the Clients app, in a new tab',
    !!note&&/add it in Clients ↗ first\./.test(note.textContent)&&note.querySelector('a').getAttribute('href')==='../clients/'&&note.querySelector('a').target==='_blank');
  const sel0=tq('#pp-client');
  tdata.clients.push({Title:'Brand New Co',field_2:'BNC'});
  TW.document.dispatchEvent(new TW.Event('visibilitychange'));await wait(300);
  ok('back on the tab, the client added in the app is in the dropdown, selected', opts().includes('Brand New Co')&&tq('#pp-client').value==='Brand New Co');
  ok('…its note is gone, and it\'s the same dropdown (its listeners kept)', !tq('#pp-client+.ins-note')&&tq('#pp-client')===sel0);
  TW.location.hash='#/project/new';await wait(400);
  ok('(the New Project draft)', TW.eval('ROUTE.creating')===true);
  tdata.clients.push({Title:'Zephyr Labs',field_2:'ZPH'});
  TW.document.dispatchEvent(new TW.Event('visibilitychange'));await wait(300);
  ok('the draft: a client added in the app shows up too', opts().includes('Zephyr Labs'));
}
