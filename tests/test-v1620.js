/* v1.62.0 — item 87: the People app. Timeline's People page becomes its own product at people/,
   built on the Office shell with the owner's wording of 2026-11-19 ("Wording OK, go with option
   (a)"): the merge stays in People and rewrites the duplicate's names on Timeline's projects,
   phases and to-dos. It owns ShopTimeline_Staff; it reads Projects, phases, to-dos and Config.
   R1 the page: the tab, the header, Apps (People ticked), the heading and its line, the count,
   no left rail, the sign-in-expired words · R2 the directory: A–Z, the columns, search (a phone
   number however typed), the department filter, ↑↓ · R3 a person's record: the fields, "On the
   schedule" from Timeline's phases (a phase with no crew follows the project's role), private
   time-off notes · R4 editing: + Add person POSTs, a duplicate name is refused, the last admin
   stays, Remove asks with the phase count and DELETEs · R5 the merge (option a): the count in
   the question, the roster saves first, then only the name fields (and refs) on projects,
   phases and to-dos are PATCHed; a free-text department's crew and other names stay; a failed
   roster save holds the renames until the retry · R6 access: everyone reads, only admins edit
   · R7 the app writes Staff, and elsewhere only the merge's names · R8 Timeline: no People page,
   Company Data keeps Changelog, an old #/people link goes on to the app, the empty lists point
   to People · R9 the shared rules live in common/, the update check holds for an open editor,
   npm run notes stamps the app · R10 the Systems page and the Apps menu open People.
   Run: node tests/test-v1620.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const ROOT=path.join(__dirname,'..'),APP=path.join(ROOT,'people','index.html');
const app=fs.readFileSync(APP,'utf8').replace(/\r\n/g,'\n');
const js=fs.readFileSync(path.join(ROOT,'common','common.js'),'utf8').replace(/\r\n/g,'\n');
const sys=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ver=(/const APP_VER='([^']+)'/.exec(raw)||[])[1];
const URL_P='https://example.github.io/Project-Scheduler/people/';

const S=(id,name,extra)=>({appId:id,Title:name,depts:'[]',ooo:'[]',email:'',phone:'',role:'',admin:'',...(extra||{})});
const SAM=S('s1','Sam',{email:'user@example.com',admin:'1',depts:'["pm"]',role:'PM1 - Project Manager'});
const staff=[SAM,
  S('s2','Pat Doe',{phone:'(555) 555 0102',depts:'["fab"]'}),
  S('s3','Pat D.',{email:'pat@example.com',ext:'214',depts:'["fab"]',driver:'1',
    ooo:JSON.stringify([{id:'o1',start:'2026-12-01',end:'2026-12-03',note:'family visit'}])}),
  S('s4','Alex Reyes',{phone:'555-555-0104',depts:'["td"]',feedbackRecipient:'1'})];
const projects=[
  {appId:'p1',Title:'Window Job',client:'',status:'auto',projectManager:'Sam',drafter:'Alex Reyes',leadFab:'Pat D.',fabricators:'Pat D., Alex Reyes',activeDepartments:'[]',
    refs:JSON.stringify({people:{'Pat D.':'s3','Sam':'s1'},client:{}})},
  {appId:'p2',Title:'Case Job',client:'',status:'auto',projectManager:'Sam',leadFab:'Alex Reyes',activeDepartments:'[]'}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',startDate:'2026-11-10',endDate:'2026-11-30',assignee:'Pat D., Sam'},
  {appId:'t2',projectId:'p1',department:'install',startDate:'2026-12-10',endDate:'2026-12-11',assignee:JSON.stringify(['Pat D.','Installation'])},
  {appId:'t3',projectId:'p2',department:'fab',startDate:'2026-11-12',endDate:'2026-11-20',assignee:''},
  {appId:'t4',projectId:'p1',department:'othshop',startDate:'2026-11-12',endDate:'2026-11-13',assignee:'Pat D.',label:'Pat D.'}];
const todos=[{appId:'d1',projectId:'p1',Title:'Order hinges',assignees:JSON.stringify(['Pat D.','Sam'])},
  {appId:'d2',projectId:'p2',Title:'Call client',assignees:JSON.stringify(['Sam'])}];
const cols={ShopTimeline_Projects:['refs'],ShopTimeline_Tasks:['refs'],ShopTimeline_Tasks2:[]};
const start=(data,opts)=>boot(APP,{url:URL_P,todosList:true,columns:cols,data,...(opts||{})}).window;

(async()=>{try{await run();}catch(e){ok('suite threw: '+(e&&e.stack||e),false);}done();})();

async function run(){
  const W=start({staff,projects,tasks,todos});await wait(1500);
  const d=W.document,q=s=>d.querySelector(s),qa=s=>[...d.querySelectorAll(s)],E=s=>W.eval(s),txt=el=>el?el.textContent.trim():'';
  const click=el=>el.dispatchEvent(new W.MouseEvent('click',{bubbles:true}));
  const type=(el,v)=>{el.value=v;el.dispatchEvent(new W.Event('input',{bubbles:true}));};
  const key=k=>d.dispatchEvent(new W.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
  const calls=()=>W.__spCalls;

  sec('R1: the page');
  ok('the tab reads "People — TWOSEVEN INC."', d.title==='People — TWOSEVEN INC.', d.title);
  ok('the header: TWOSEVEN INC. (to the Systems page), then PEOPLE', q('.ts-top .ts-brand').getAttribute('href')==='../'&&txt(q('.ts-top .ts-app'))==='People');
  ok('the sync pill reads synced', /synced/.test(txt(q('#sync-pill'))));
  ok('item 101: the version sits before the sync pill, as in Timeline\'s header', txt(q('#tb-rev'))==='v'+ver&&q('#tb-rev').nextElementSibling===q('#sync-pill'), txt(q('#tb-rev')));
  click(q('#btn-apps'));
  const it=qa('#apps-menu .ts-apps-item');
  ok('Apps lists Timeline, Office, People — People ticked, the other two links',
    it.map(x=>x.dataset.app).join()==='Timeline,Office,People'&&it[2].getAttribute('aria-current')==='page'
    &&it[0].getAttribute('href')==='../timeline/'&&it[1].getAttribute('href')==='../office/');
  key('Escape');
  ok('Escape closes it', q('#apps-menu').classList.contains('hidden'));
  ok('the heading and its line, unchanged', txt(q('#cd-head h1'))==='People'&&txt(q('.cd-sub'))==='The company roster — roles, departments and availability');
  ok('the count: "4 people · SharePoint"', txt(q('.cd-src'))==='4 people · SharePoint', txt(q('.cd-src')));
  ok('no breadcrumb or × (the header replaces them)', !q('#cd-back')&&!q('#cd-x'));
  ok('no left rail while the directory is the only section', !q('nav.sidebar,.rail'));
  ok('the sign-in-expired box, in the owner\'s words', app.includes('People paused while you were away. Sign in to pick up where you left off. Anything you changed is still on screen and saves once you\'re back.'));

  sec('R2: the directory');
  const rows=()=>qa('#cd-rows .cd-row');
  ok('everyone, A–Z', rows().map(r=>txt(r.querySelector('b'))).join('|')==='Alex Reyes|Pat D.|Pat Doe|Sam');
  ok('the nine columns', qa('.cd-cols>span').map(txt).join('|')==='Name|Title|Phone|Office Extension|Email|Perms|Driver|Status|Schedule');
  ok('a title shows without its HR code, a phone in the one format', rows()[3].children[1].textContent==='Project Manager'&&rows()[2].children[2].textContent==='555-555-0102');
  type(q('#cd-q'),'5550102');
  ok('a phone number finds its person however it\'s typed', rows().length===1&&/Pat Doe/.test(txt(rows()[0])));
  type(q('#cd-q'),'zzz');
  ok('no match: "No matches."', txt(q('#cd-rows-in .cd-empty'))==='No matches.');
  type(q('#cd-q'),'');
  q('#cd-dept').value='td';q('#cd-dept').dispatchEvent(new W.Event('change',{bubbles:true}));
  ok('the department filter', rows().length===1&&/Alex Reyes/.test(txt(rows()[0])));
  q('#cd-dept').value='all';q('#cd-dept').dispatchEvent(new W.Event('change',{bubbles:true}));
  ok('nothing selected: "Select a person to see their record."', txt(q('#cd-detail'))==='Select a person to see their record.');
  key('ArrowDown');
  ok('↓ selects the first person', txt(q('.cd-row.sel b'))==='Alex Reyes'&&q('.cd-row.sel').getAttribute('aria-current')==='true');
  key('ArrowDown');
  ok('↓ again walks on', txt(q('.cd-row.sel b'))==='Pat D.');

  sec('R3: a person\'s record');
  const det=()=>txt(q('#cd-detail'));
  ok('the fields read first: work email, phone, extension, driver, departments', /Work email\s*pat@example\.com/.test(det())&&/Office Extension\s*214/.test(det())&&/Driver\s*Yes/.test(det())&&/Departments\s*Main Shop Fab/.test(det()), det());
  ok('time off, with its private note for an admin', /Dec 1 – Dec 3/.test(det())&&/family visit/.test(det()));
  ok('"On the schedule" counts Timeline\'s phases', /On the schedule\s*On 3 phases across 1 project/.test(det()), det());
  click(rows().find(r=>/Alex/.test(txt(r))));
  ok('a phase with no crew follows the project\'s role (Project lead on Case Job)', /On 1 phase across 1 project/.test(det()), det());

  sec('R4: editing');
  let asked='';W.confirm=m=>{asked=m;return true;};
  const n0=calls().length;
  click(q('#cd-add'));
  ok('+ Add person opens "New person"', txt(q('.cdd-hd h3'))==='New person'&&!q('#cde-del')&&!q('#cde-merge'));
  type(q('#cde-name'),'  Jo Park  ');type(q('#cde-phone'),'555.555.0199');click(q('#cde-save'));await wait(200);
  const post=calls().slice(n0).find(c=>c.method==='POST'&&/ShopTimeline_Staff/.test(c.url));
  ok('save POSTs the person to the Staff list, trimmed, phone in the one format', !!post&&post.body.fields.Title==='Jo Park'&&post.body.fields.phone==='555-555-0199');
  ok('…shows the record and says so', txt(q('.cdd-hd h3'))==='Jo Park'&&/Jo Park saved/.test(txt(q('#toasts'))));
  click(q('#cd-add'));type(q('#cde-name'),'sam');click(q('#cde-save'));
  ok('a duplicate name is refused', /Two people share the name "sam"/.test(txt(q('#toasts')))&&!!q('#cde-name'));
  click(q('#cde-cancel'));
  click(rows().find(r=>/^Sam/.test(txt(r))));click(q('#cdd-edit'));
  q('#cde-admin').checked=false;q('#cde-admin').dispatchEvent(new W.Event('change'));click(q('#cde-save'));
  ok('the last admin can\'t be demoted', /You can't remove the last admin/.test(txt(q('#toasts'))));
  click(q('#cde-cancel'));
  click(rows().find(r=>/Jo Park/.test(txt(r))));click(q('#cdd-edit'));click(q('#cde-del'));await wait(150);
  ok('Remove asks, then DELETEs the row', asked==='Remove Jo Park from the roster?'&&calls().some(c=>c.method==='DELETE'&&/ShopTimeline_Staff/.test(c.url)));
  click(rows().find(r=>/Pat D\./.test(txt(r))));click(q('#cdd-edit'));asked='';W.confirm=m=>{asked=m;return false;};click(q('#cde-del'));
  ok('…with the phase count when the person is on the schedule', /^Pat D\. is on 3 phases across 1 project\.\nThose bars keep the stored name/.test(asked), asked);
  W.confirm=m=>{asked=m;return true;};click(q('#cde-cancel'));

  sec('R5: the merge (the owner\'s option a)');
  click(rows().find(r=>/Pat Doe/.test(txt(r))));click(q('#cdd-edit'));
  click(q('#cde-merge'));
  ok('Merge duplicate… offers everyone else', qa('#cde-merge-sel option').map(o=>o.textContent).join('|')==='Fold in which duplicate?|Alex Reyes|Pat D.|Sam');
  q('#cde-merge-sel').value='s3';
  const m0=calls().length;
  await E("cdMergePerson('s2','s3')");await wait(300);
  ok('the question names the count (5 fields)', /^Fold "Pat D\." into "Pat Doe"\?\n\n5 stored assignment fields will be rewritten to "Pat Doe"\./.test(asked), asked);
  const mc=calls().slice(m0).filter(c=>c.method!=='GET');
  const at=re=>mc.filter(c=>re.test(c.url));
  ok('the roster saves first: the kept row PATCHed (details filled in), the duplicate DELETEd',
    mc[0].method==='PATCH'&&/ShopTimeline_Staff/.test(mc[0].url)&&mc[0].body.email==='pat@example.com'&&mc[0].body.ext==='214'
    &&mc.some(c=>c.method==='DELETE'&&/ShopTimeline_Staff/.test(c.url)), mc.map(c=>c.method+' '+c.url.split('/lists/')[1]).join(' | '));
  const pj=at(/ShopTimeline_Projects/);
  ok('the project: only its role fields that named the duplicate, and refs linking the kept person',
    pj.length===1&&JSON.stringify(Object.keys(pj[0].body).sort())==='["fabricators","leadFab","refs"]'
    &&pj[0].body.leadFab==='Pat Doe'&&pj[0].body.fabricators==='Pat Doe, Alex Reyes'
    &&JSON.stringify(JSON.parse(pj[0].body.refs))==='{"people":{"Sam":"s1","Pat Doe":"s2"},"client":{}}', JSON.stringify(pj.map(c=>c.body)));
  const tk=at(/ShopTimeline_Tasks\//);
  ok('the phases: the crew list and the install crew (its JSON, "Installation" kept); the free-text department\'s label left alone',
    tk.length===2&&tk.every(c=>Object.keys(c.body).sort().join()==='assignee,refs')
    &&tk.some(c=>c.body.assignee==='Pat Doe, Sam')&&tk.some(c=>c.body.assignee==='["Pat Doe","Installation"]'), JSON.stringify(tk.map(c=>c.body)));
  const td=at(/ShopTimeline_Tasks2/);
  ok('the to-do: its assignees only (that list has no refs column, so none is sent)', td.length===1&&JSON.stringify(td[0].body)==='{"assignees":"[\\"Pat Doe\\",\\"Sam\\"]"}', JSON.stringify(td.map(c=>c.body)));
  ok('nothing is created or deleted outside Staff', mc.filter(c=>!/ShopTimeline_Staff/.test(c.url)).every(c=>c.method==='PATCH'));
  ok('the toast says so, and the record\'s phase count follows at once (the free-text label isn\'t a person)', /Merged "Pat D\." into "Pat Doe" — 5 assignment fields rewritten\./.test(txt(q('#toasts')))&&/On 2 phases across 1 project/.test(det()), det());

  sec('R5b: a failed roster save holds the renames');
  const F=start({staff,projects,tasks,todos});await wait(1500);
  F.confirm=()=>true;
  const fd=F.document,f0=F.fetch;
  F.fetch=(u,i)=>(i&&i.method&&/ShopTimeline_Staff/.test(u))?Promise.resolve({ok:false,status:500,json:async()=>({}),text:async()=>'boom'}):f0(u,i);
  const k0=F.__spCalls.length;
  await F.eval("cdMergePerson('s2','s3')");await wait(300);
  ok('the pill says "staff not saved — click to retry", and no record was renamed',
    /staff not saved — click to retry/.test(fd.getElementById('sync-pill').textContent)
    &&!F.__spCalls.slice(k0).some(c=>c.method==='PATCH'&&!/ShopTimeline_Staff/.test(c.url)));
  const bu=new F.Event('beforeunload',{cancelable:true});F.dispatchEvent(bu);
  ok('leaving now warns, and a reload is held back', bu.defaultPrevented&&F.eval('updBusy()')===true);
  F.fetch=f0;fd.getElementById('sync-pill').dispatchEvent(new F.MouseEvent('click',{bubbles:true}));await wait(300);
  ok('the retry lands the roster, then the renames', /synced/.test(fd.getElementById('sync-pill').textContent)
    &&F.__spCalls.slice(k0).some(c=>c.method==='PATCH'&&/ShopTimeline_Projects/.test(c.url)&&c.body.leadFab==='Pat Doe'));

  sec('R3b: the projects unreadable');
  const U=start({staff,projects,tasks,todos});
  const u0=U.fetch;U.fetch=(url,i)=>/ShopTimeline_Tasks\//.test(String(url))&&!(i&&i.method)?Promise.resolve({ok:false,status:403,json:async()=>({}),text:async()=>'denied'}):u0(url,i);
  await wait(1500);
  U.eval("CD_SEL='s3';cdPaintDetail()");
  ok('the record says so, never "No phases assigned"', /On the schedule\s*Couldn't read the projects from SharePoint\./.test(U.document.getElementById('cd-detail').textContent), U.document.getElementById('cd-detail').textContent);
  let uq='';U.confirm=m=>{uq=m;return false;};U.eval("CD_EDIT=JSON.parse(JSON.stringify(PEOPLE.find(p=>p.id==='s3')));cdRemovePerson()");
  ok('…and Remove says the phases weren\'t counted', /^Couldn't read the projects, so Pat D\.'s phases weren't counted\./.test(uq), uq);

  sec('R6: access');
  ok('an admin wears the ADMIN chip', /Sam\s*ADMIN/.test(txt(q('#who'))));
  const V=start({staff:[{...SAM,admin:''},S('s9','Bo Lee',{admin:'1'})],projects,tasks,todos});await wait(1500);
  const vd=V.document;
  ok('a non-admin reads the roster', vd.querySelectorAll('#cd-rows .cd-row').length===2);
  vd.querySelector('#cd-rows .cd-row').dispatchEvent(new V.MouseEvent('click',{bubbles:true}));
  ok('…with no Add, Import, Tidy or Edit', !vd.getElementById('cd-add')&&!vd.getElementById('cd-import')&&!vd.getElementById('cd-tidy')&&!vd.getElementById('cdd-edit'));

  sec('R7: what it writes');
  const writes=calls().filter(c=>c.method!=='GET');
  ok('Staff, and elsewhere only the merge\'s PATCHes', writes.every(c=>/ShopTimeline_Staff/.test(c.url)||(c.method==='PATCH'&&/ShopTimeline_(Projects|Tasks|Tasks2)\//.test(c.url))),
    writes.map(c=>c.method+' '+c.url.split('/lists/')[1]).join(' | '));

  sec('R8: Timeline');
  ok('Timeline has no People page, and Company Data keeps only Changelog', !/id="mi-people"/.test(raw)&&!/function renderCompanyPage/.test(raw)&&!/function cdMergePerson/.test(raw)&&/id="mi-changelog"/.test(raw));
  ok('an old #/people link goes on to the People app', /if\(h==='people'\|\|h\.indexOf\('people\/'\)===0\)\{location\.replace\('\.\.\/people\/'\)/.test(raw));
  ok('the empty name lists point to People', (raw.match(/add them in People/g)||[]).length===4&&!/Company Data (&rsaquo;|›) People/.test(raw));
  const TW=boot(FILE,{url:'https://example.github.io/Project-Scheduler/timeline/',data:{projects:[],tasks:[],staff:[SAM],todos:[]}}).window;await wait(1300);
  const items=[...TW.document.querySelectorAll('#resources-menu .sm-item')].map(x=>x.textContent);
  ok('…the menu, live: Changelog only', items.join()==='Changelog', items.join());
  ok('Timeline still reads Staff (its roster loads)', TW.eval('PEOPLE.length')===1&&TW.eval('STAFF_OK')===true);

  sec('R9: the shared rules');
  const decl=(text,n)=>new RegExp('(^|\\n)\\s*(async\\s+)?(function\\s+'+n+'\\s*\\(|(const|let)\\s+[^\\n;]*\\b'+n+'\\s*=)').test(text);
  const moved=['addDays','fmtNice','genId','holidaysFor','isWorking','GROUPS','grpDepts','roleList','roleListFor','crewOf','pdCanon','SM_DEPTS','schedSafe','fmtPhone','PERSON_COLS','personToFields','fieldsToPerson'];
  ok('each is declared in common.js', moved.every(n=>decl(js,n)), moved.filter(n=>!decl(js,n)).join(','));
  ok('…and not in Timeline or the People app', moved.every(n=>!decl(raw,n)&&!decl(app,n)), moved.filter(n=>decl(raw,n)||decl(app,n)).join(','));
  ok('the app loads ../common/ with the running version, and carries it as its own', [...app.matchAll(/\.\.\/common\/common\.(?:js|css)\?v=([^"]+)"/g)].map(m=>m[1]).join()===ver+','+ver
    &&app.includes("const APP_VER='"+ver+"'"));
  ok('npm run notes stamps it', /path\.join\(ROOT,'people','index\.html'\)/.test(fs.readFileSync(path.join(ROOT,'tools','gen-release-notes.js'),'utf8')));
  E("CD_EDIT={id:'x',name:'',_new:true}");
  ok('an open editor holds the update check', E('updBusy()')===true&&/finish or cancel the record/.test(E('updWhyNot()')));
  E("CD_EDIT=null");

  sec('R10: the Systems page and the Apps menu');
  ok('the People card opens people/, "Open People"', /<a class="app-link" href="people\/">[\s\S]*?<span class="app-name">People<\/span>[\s\S]*?<span class="app-foot">Open People<\/span><\/a>/.test(sys)&&!/In Timeline for now/.test(sys));
  ok('the Apps menu links People', /\{name:'People',href:'people\/'\}/.test(js));
}
