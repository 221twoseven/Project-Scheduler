/* v1.10.0–v1.13.0 — the 2026-09-02 owner asks:
   - v1.10.0: dock re-layout (Working on + Time off stacked; Milestones/Notes own
     columns), comprehensive People-page departments derived from DEPTS + Logistics,
     wordmark navigates home, signed-in name + DEV/ADMIN chip, home tour chains into
     the project tour through a real + New Project click.
   - v1.11.0: dev App Settings page (Help ▸ App settings) + granular viewer grants
     (viewer.* keys on ShopTimeline_Config) opening single edit doors via vcan().
   - v1.12.0: "Listening to" — four tristate staff columns, Summary-header display,
     own-dashboard thought-cloud editor, behind exp.listening.
   - v1.13.0: People page mirrors Employee Contacts (read-only HR list): adds active
     employees, HR wins on title/phone/status, curated departments kept.
   Run: node tests/test-v1100.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cdImportEC')<0){
  console.log('test-v1100: skipped — pre-v1.10.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const staff=[
  {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',phone:'',role:'PM',admin:'dev'},
  {appId:'s2',Title:'Pat',depts:JSON.stringify(['fab']),ooo:'[]',email:'pat@x.co',phone:'',role:'',admin:'1',
   listeningTo:'Chet Baker',listeningLink:'example.com/chet',listeningVerb:'listening to',listeningShow:'1'},
  {appId:'s3',Title:'Kim',depts:JSON.stringify(['fab']),ooo:'[]',email:'',phone:'',role:'',admin:''}];
const projects=[{appId:'p1',Title:'Alpha',client:'Acme',jobCode:'J1',deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',
  startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const events=[{appId:'e1',projectId:'p1',department:'fab',Title:'Walkthrough',date:D(5),notes:''}];
const todos=[{appId:'k1',Title:'Order steel',projectId:'p1',department:'fab',assignees:JSON.stringify(['Sam']),
  dueDate:D(3),startDate:null,progress:'notstarted',priority:'medium',notes:'',createdBy:'',
  completedOn:null,completedBy:'',sortIndex:0}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos,events},todosList:true,eventsList:true});
const win=dom.window,doc=win.document,E=s=>win.eval(s);

setTimeout(main,1300);

function main(){
  sec('v1.10.0 — departments: one comprehensive list + Logistics');
  /* v1.14.0: people departments are the COARSE list — DFAB folds the machine-level
     Digital Fab depts, Finishing folds Pre-Finishing + Painting (pdCanon). */
  ok('SM_DEPTS derives from DEPTS (canonical, no free-text buckets)',
     E('SM_DEPTS.length')===E("new Set(DEPTS.filter(d=>!d.freeText).map(d=>pdCanon(d.id))).size")
     &&E("SM_DEPTS.every(m=>m[0]===pdCanon(m[0]))"));
  ok('DFAB and Finishing fold their machine-level depts',
     E("SM_DEPTS.some(m=>m[0]==='dfab'&&m[1]==='DFAB')")
     &&E("SM_DEPTS.some(m=>m[0]==='finish'&&m[1]==='Finishing')")
     &&E("pdCanon('cnc')")==='dfab'&&E("pdCanon('prefinish')")==='finish'
     &&E("SM_DEPTS.every(m=>!['cnc','beamsaw','3dprint','laser','print','prefinish'].includes(m[0]))"));
  ok('Logistics is a department, group and lens section',
     E("!!deptById('logistics')")&&E("GROUPS.some(g=>g.id==='logi')")
     &&E("SECTIONS.some(s=>s.kind==='dept'&&s.id==='logistics')"));
  ok('Logistics has a team color', E("!!DEPT_COLORS.logistics"));

  sec('v1.10.0 — signed-in badge next to the status pill');
  const tu=doc.getElementById('tb-user');
  ok('the name shows', !tu.classList.contains('hidden')&&/Sam/.test(tu.textContent));
  ok('the developer wears a DEV chip', !!tu.querySelector('.tb-acc.dev'));
  ok('it sits in the dev cluster ahead of the version number',
     tu.nextElementSibling===doc.getElementById('tb-rev')
     &&doc.getElementById('tb-devview').parentElement===tu.parentElement);

  sec('v1.10.0 — dock re-layout: Time off under Working on, own columns back');
  E("enterDash('Sam')");
  const secs=doc.querySelectorAll('#me-dock .ins-body>.ins-sec');
  const h4=el=>el.querySelector('h4').textContent;
  ok('own dashboard: stack | Milestones | Notes | User Notes', secs.length===4
     &&secs[0].classList.contains('md-stack')
     &&/Working on/.test(secs[0].querySelectorAll('h4')[0].textContent)
     &&/Time off/.test(secs[0].querySelectorAll('h4')[1].textContent)
     &&/Milestones/.test(h4(secs[1]))&&/Notes/.test(h4(secs[2]))&&/User Notes/.test(h4(secs[3])));
  E('exitDash()');

  sec('v1.14.0 — Not me: your own Summary as others see it');
  E('DEV_NOTME=true');
  E("enterDash('Sam')");
  ok('dashSelf answers false and User Notes hides while Not me is on',
     E('dashSelf()')===false&&!doc.getElementById('md-unotes')
     &&/Summary · Sam/.test(doc.getElementById('db-name').textContent));
  ok('the toggle rides the dev cluster', !doc.getElementById('tb-notme').classList.contains('hidden'));
  E('DEV_NOTME=false');E('exitDash()');

  sec('v1.10.0 — the wordmark goes home');
  ok('the wordmark is a button', doc.getElementById('tb-home').tagName==='BUTTON');
  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    ok('…from the People page', E('ROUTE.view')==='people');
    ok('the people index carries the at-a-glance columns (v1.14.0)',
       [...doc.querySelectorAll('.cd-cols span')].map(s=>s.textContent).join(',')==='Name,Title,Phone,Email,Perms,Status'
       &&doc.querySelector('.cd-row.pp6').children.length===6);
    doc.getElementById('tb-home').click();
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      ok('one click lands on the timeline', E('ROUTE.view')==='timeline');
      stageSettings();
    },300);
  },300);
}

function stageSettings(){
  sec('v1.11.0 — App Settings: dev-only page, shared config, defaults off');
  ok('Help carries the App settings entry for the developer',
     !doc.getElementById('mi-appset').classList.contains('hidden'));
  ok('every grant defaults OFF', E("CFG_META.every(m=>CFG[m[0]]===false)"));
  win.location.hash='#/settings';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    ok('the page renders one row per switch',
       E('ROUTE.view')==='settings'
       &&doc.querySelectorAll('.as-row').length===E('CFG_META.length'));
    ok('a non-developer bounces home', (()=>{
      E("PEOPLE.find(p=>p.name==='Sam').developer=false");
      E('renderAppSettings()');
      const bounced=E('ROUTE.view')==='timeline';
      E("PEOPLE.find(p=>p.name==='Sam').developer=true");
      return bounced;})());
    E("saveConfigKey('viewer.notes',true)");

    sec('v1.11.0 — the notes grant opens ONE door for a viewer');
    E('DEV_VIEW=true');E('render()');
    ok('previewing as a viewer', E('isViewer()')===true&&doc.body.classList.contains('viewer'));
    ok('the grant class rides the body', doc.body.classList.contains('vg-notes')
       &&!doc.body.classList.contains('vg-phases'));
    ok('vcan grades the doors', E("vcan('notes')")===true&&E("vcan('milestones')")===false
       &&E("vcan('phases')")===false);
    win.location.hash='#/project/p1';
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      ok('the toggle wrote a key row to ShopTimeline_Config',
         (win.__spCalls||[]).some(c=>c.method==='POST'&&/ShopTimeline_Config/.test(c.url)
           &&c.body&&c.body.fields&&c.body.fields.Title==='viewer.notes'&&c.body.fields.value==='1'));
      ok('the agenda offers + Note but not + Milestone',
         !!doc.querySelector('.ag-add [data-ag="tk"]')&&!doc.querySelector('.ag-add [data-ag="ev"]'));
      const rows=[...doc.querySelectorAll('#pp-insp .ag-i')];
      ok('the note row keeps its delete ×, the milestone row does not',
         rows.some(r=>r.dataset.agK==='tk'&&r.querySelector('.del'))
         &&rows.every(r=>r.dataset.agK!=='ev'||!r.querySelector('.del')));
      const evRow=rows.find(r=>r.dataset.agK==='ev'),tkRow=rows.find(r=>r.dataset.agK==='tk');
      ok('agenda inputs self-grade: note editable, milestone locked',
         tkRow&&[...tkRow.querySelectorAll('input')].every(i=>!i.disabled)
         &&evRow&&[...evRow.querySelectorAll('input')].every(i=>i.disabled));
      ok('the write choke point lets the granted viewer through',
         (()=>{E("saveState({projects:ST.projects,tasks:ST.tasks,todos:(ST.todos||[]).map(t=>({...t,title:t.title==='Order steel'?'Order MORE steel':t.title}))})");
           return E("(ST.todos||[]).some(t=>t.title==='Order MORE steel')");})());
      E("saveConfigKey('viewer.notes',false)");E('DEV_VIEW=false');
      win.location.hash='#/';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(stageListening,300);
    },400);
  },300);
}

function stageListening(){
  sec('v1.12.0 — Listening to: mappers are tristate');
  const rt=JSON.parse(E("JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'A',email:'',phone:'',role:'',depts:[],ooo:[],admin:null,listeningTo:'Blue Train',listeningLink:'x.co',listeningVerb:'reading',listeningShow:true})))"));
  ok('the quartet survives the round trip',
     rt.listeningTo==='Blue Train'&&rt.listeningLink==='x.co'&&rt.listeningVerb==='reading'&&rt.listeningShow===true);
  ok('a row that never carried the columns stays null (no 400 risk)', (()=>{
     const f=JSON.parse(E("JSON.stringify(personToFields({id:'y',name:'B',email:'',phone:'',role:'',depts:[],ooo:[],admin:null,listeningTo:null,listeningShow:null}))"));
     return f.listeningTo===undefined&&f.listeningShow===undefined;})());

  sec('v1.12.0 — display on someone else\'s Summary, editor on your own');
  E("CFG['exp.listening']=true");
  E("enterDash('Pat')");
  const li=doc.querySelector('#me-dock .md-listen');
  ok('the header line shows on the Summary', !!li&&/listening to: Chet Baker/.test(li.textContent));
  ok('the title hyperlinks (bare domain gets https)',
     li.querySelector('a')&&li.querySelector('a').href==='https://example.com/chet');
  ok('no thought-cloud editor on someone else\'s Summary', !doc.getElementById('md-thought'));
  E("enterDash('Sam')");
  ok('your own dashboard: editor, no header line',
     !!doc.getElementById('md-thought')&&!doc.querySelector('#me-dock .md-listen'));
  doc.getElementById('md-thought').click();
  ok('the popover opens', !doc.getElementById('md-tpop').classList.contains('hidden'));
  doc.getElementById('lt-verb').value='reading';
  doc.getElementById('lt-title').value='Dune';
  doc.getElementById('lt-link').value='dune.example';
  doc.getElementById('lt-show').checked=true;
  doc.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true}));
  setTimeout(()=>{
    ok('closing commits the quartet through the self-row save',
       E("PEOPLE.find(p=>p.name==='Sam').listeningTo")==='Dune'
       &&E("PEOPLE.find(p=>p.name==='Sam').listeningVerb")==='reading'
       &&E("PEOPLE.find(p=>p.name==='Sam').listeningShow")===true);
    ok('the staff PATCH carries the fields',
       (win.__spCalls||[]).some(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url)
         &&/Dune/.test(String(c.init&&c.init.body))));
    ok('the toggle off hides everything', (()=>{
       E("CFG['exp.listening']=false");E("enterDash('Pat')");
       const gone=!doc.querySelector('#me-dock .md-listen');
       E('exitDash()');return gone;})());
    stageImport();
  },300);
}

function stageImport(){
  sec('v1.13.0 — Employee Contacts import: unit pieces');
  ok('ecDept maps names, groups and aliases',
     E("ecDept('Fabrication')")==='fab'&&E("ecDept('Logistics')")==='logistics'
     &&E("ecDept('Technical Design')")==='td'&&E("ecDept('Installation')")==='install'
     &&E("ecDept('Warehouse')")===null&&E("ecDept('')")===null);
  ok('ecField reads _x0020_/case/space-insensitively', (()=>{
     E("var m={};for(const k in {Primary_x0020_Phone:'555-9',Title:'X'})m[ecNorm(k)]=({Primary_x0020_Phone:'555-9',Title:'X'})[k];");
     return E("ecField(m,['primaryphone','phone'])")==='555-9';})());

  sec('v1.13.0 — the mirror pass (HR list stubbed, read-only)');
  E("gpageAll=async u=>{u=String(u);"
   +"if(u.indexOf('Employee')>=0)return ["
   +"{id:'e1',fields:{Title:'Pat',Status:'Active',Email:'pat@x.co',Primary_x0020_Phone:'555-1',Current_x0020_Title:'Shop Lead',Department:'Fabrication',Pay_x0020_Type:'NOPE'}},"
   +"{id:'e2',fields:{Title:'Marcus Webb',Status:'Active',Email:'marcus@x.co',Current_x0020_Title:'Logistics Coordinator',Department:'Logistics'}},"
   +"{id:'e3',fields:{Title:'Gone Guy',Status:'Terminated',Email:'gone@x.co'}}];"
   +"if(u.indexOf('/columns')>=0)return [{name:'Title'},{name:'status'}];"
   +"return [];};");
  E("cdImportEC({disabled:false})");
  setTimeout(()=>{
    ok('the active newcomer is added with a mapped department',
       (()=>{const m=E("JSON.stringify(PEOPLE.find(p=>p.name==='Marcus Webb')||null)");
         const p=JSON.parse(m);return p&&p.role==='Logistics Coordinator'&&p.depts[0]==='logistics'&&p.status==='Active';})());
    ok('the matched person takes HR title/phone/status but keeps curated depts',
       (()=>{const p=JSON.parse(E("JSON.stringify(PEOPLE.find(p=>p.name==='Pat'))"));
         return p.role==='Shop Lead'&&p.phone==='555-1'&&p.status==='Active'
           &&p.depts.length===1&&p.depts[0]==='fab';})());
    ok('a non-active HR row never creates a person', E("!PEOPLE.some(p=>p.name==='Gone Guy')"));
    ok('the HR-sensitive field is nowhere on the roster',
       E("JSON.stringify(PEOPLE)").indexOf('NOPE')<0);
    ok('nothing ever writes to the Employee Contacts list',
       (win.__spCalls||[]).every(c=>!(/Employee/.test(c.url)&&c.method!=='GET')));
    stage15();
  },500);
}

function stage15(){
  sec('v1.15.0 — nickname: display everywhere, identity untouched');
  const rt=JSON.parse(E("JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'A',email:'',phone:'',role:'',depts:[],ooo:[],admin:null,nickname:'Ace'})))"));
  ok('nickname survives the mapper round trip (tristate)', rt.nickname==='Ace'
     &&JSON.parse(E("JSON.stringify(personToFields({id:'y',name:'B',email:'',phone:'',role:'',depts:[],ooo:[],admin:null,nickname:null}))")).nickname===undefined);
  E("PEOPLE.find(p=>p.name==='Sam').nickname='Sammy'");
  ok('dispName reads the nickname; canonical name stays the identity',
     E("dispName('Sam')")==='Sammy'&&E("canonName('Sam')")==='Sam');
  ok('bar crew chips show the nickname',
     E("assigneeText(ST.tasks[0])")==='Sammy');
  E("PEOPLE.find(p=>p.name==='Sam').nickname=null");

  sec('v1.15.0 — merge duplicate: assignments rewritten, fields backfilled, row gone');
  E("PEOPLE.push({id:'dupX',name:'Samuel (Sam) Q',depts:['fab'],ooo:[],email:'samq@x.co',phone:'555-9',role:'Fabricator',admin:null})");
  E("ST.tasks.push({id:'tmX',projectId:'p1',department:'fab',assignee:'Samuel (Sam) Q',startDate:'"+D(2)+"',endDate:'"+D(4)+"',estimatedDays:2,ticketNodes:[],notes:'',pinned:false,label:''})");
  E("cdMergePerson(PEOPLE.find(p=>p.name==='Kim').id,'dupX')"); /* harness confirm = yes */
  ok('the stored assignment now carries the kept name',
     E("ST.tasks.find(t=>t.id==='tmX').assignee")==='Kim');
  ok('the duplicate row is gone and fields backfilled',
     E("!PEOPLE.some(p=>p.id==='dupX')")
     &&E("PEOPLE.find(p=>p.name==='Kim').phone")==='555-9'
     &&E("PEOPLE.find(p=>p.name==='Kim').role")==='Fabricator');

  sec('v1.15.0 — a project page opened from an active Summary drops the dock');
  E("enterDash('Pat')");
  ok('the dock is up on the Summary', doc.body.classList.contains('me-dock-on'));
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    ok('…and gone on the project page (the stuck-dock bug)',
       E('ROUTE.view')==='project'&&!doc.body.classList.contains('me-dock-on'));
    win.location.hash='#/';
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      ok('…and back when the timeline returns', doc.body.classList.contains('me-dock-on'));
      E('exitDash()');
      ok('the listening line hugs the collapse chevron (CSS sibling rule)',
         /\.md-listen\+#md-collapse\{margin-left:10px\}/.test(src));
      stageTour();
    },300);
  },300);
}

function stageTour(){
  sec('v1.10.0 — one tour: the home tour chains into the project tour');
  ok('the last home step is the chained + New Project step',
     E("COACH_STEPS[COACH_STEPS.length-1].sel")==='#btn-new-proj'
     &&E("COACH_STEPS[COACH_STEPS.length-1].chain")===true);
  E('coachStart()');
  const homeN=E('COACH.steps.length');
  ok('one continuous count across both halves (v1.14.0)',
     E('COACH.total')===homeN+E('COACH_PP_DRAFT_N')
     &&doc.getElementById('coach-step').textContent==='STEP 1 OF '+E('COACH.total'));
  E('COACH.i=COACH.steps.length-1;coachShow()');
  ok('the chain step: overlay class on, Next hidden by it',
     doc.getElementById('coach').classList.contains('chain'));
  doc.getElementById('btn-new-proj').click();
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    ok('the click opens the draft project page', E('ROUTE.view')==='project'&&E('ROUTE.creating')===true);
    ok('…and the project tour picks up there',
       E('COACH!==null')&&E("COACH.steps[0].sel")==='.pg-trail'
       &&!doc.getElementById('coach').classList.contains('hidden')
       &&!doc.getElementById('coach').classList.contains('chain'));
    ok('…continuing the count where the home half stopped (v1.14.0)',
       doc.getElementById('coach-step').textContent==='STEP '+(homeN+1)+' OF '+E('COACH.total'));
    E('coachEnd()');
    console.log('\ntest-v1100: '+pass+' passed, '+fail+' failed');
    process.exit(fail?1:0);
  },700);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
