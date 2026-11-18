/* v1.56.1 — item 85 (a): the shared module, common/. The core every Systems product needs
   moved out of timeline/index.html, verbatim, into common/common.js and common/common.css,
   with MSAL beside them. Nothing changes for users.
   R1 Timeline loads common/ by tag, styles before its own, MSAL and the core before its script
   · R2 the tags carry ?v=APP_VER, stamped by `npm run notes` · R3 the moved code lives only in
   common/ · R4 Timeline keeps its own hooks · R5 the shared file stands alone: it loads on a bare
   page and its toast, sync pill and sign-in overlay work there · R6 Timeline still boots on it, on a
   saved project and on the New Project draft, and saves through the shared store · R7 the tokens
   moved to common.css and Timeline's aliases still point at them · R8 the Entra values didn't change.
   Run: node tests/test-v1561.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const {boot,suite}=require('./harness');
const {FILE,src,raw,ok,done}=suite();
const ROOT=path.join(__dirname,'..'),C=f=>path.join(ROOT,'common',f);
const js=fs.readFileSync(C('common.js'),'utf8').replace(/\r\n/g,'\n');
const css=fs.readFileSync(C('common.css'),'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ver=(/const APP_VER='([^']+)'/.exec(raw)||[])[1];

sec('R1: Timeline loads common/');
ok('common/ holds common.js, common.css and MSAL', ['common.js','common.css','msal-browser.min.js'].every(f=>fs.existsSync(C(f))));
/* The old paths keep an identical copy for one release, so a page still cached from before the
   move (Pages caches 10 minutes) finds its MSAL; item 49's clean-up step removes them. */
const same=f=>fs.existsSync(f)&&fs.readFileSync(f).equals(fs.readFileSync(C('msal-browser.min.js')));
ok('Timeline loads MSAL only from common/; the old paths hold an identical copy for cached pages',
  !raw.includes('src="msal-browser.min.js"')&&same(path.join(ROOT,'timeline','msal-browser.min.js'))&&same(path.join(ROOT,'msal-browser.min.js')));
const iLink=raw.indexOf('<link rel="stylesheet" href="../common/common.css'),iStyle=raw.indexOf('<style>');
ok('the shared styles load before Timeline\'s own', iLink>0&&iStyle>iLink);
const iMsal=raw.indexOf('<script src="../common/msal-browser.min.js"></script>'),iJs=raw.indexOf('<script src="../common/common.js'),
  iMain=raw.indexOf('<script>',iJs);
ok('MSAL, then the shared core, then Timeline\'s script', iMsal>0&&iJs>iMsal&&iMain>iJs);

sec('R2: the tags carry the version');
const vs=[...raw.matchAll(/\.\.\/common\/common\.(?:js|css)\?v=([^"]+)"/g)].map(m=>m[1]);
ok('both tags name v'+ver, vs.length===2&&vs.every(v=>v===ver), vs.join(','));
const {stampCommon}=require('../tools/gen-release-notes.js');
ok('npm run notes stamps them', stampCommon('<script src="../common/common.js?v=0"></script><link href="../common/common.css?v=1.2.3">','9.9.9')
  ==='<script src="../common/common.js?v=9.9.9"></script><link href="../common/common.css?v=9.9.9">');

sec('R3: the moved code lives only in common/');
const decl=(text,n)=>new RegExp('(^|\\n)\\s*(async\\s+)?(function\\s+'+n+'\\s*\\(|(const|let)\\s+[^\\n;]*\\b'+n+'\\s*=)').test(text);
const moved=['CLIENT_ID','TENANT_ID','SITE_HOST','LIST_PROJECTS','LIST_CLIENTS','SCOPES','PCA','spInit','spLogin','spToken',
  'reauthSilently','gfetch','gpageAll','spSite','listUrl','STORE_LISTS','STORE_PAGE','store','toast','TOAST_MAX','toastLayout',
  'toastU','setSync','stamp','authShow'];
const notInCommon=moved.filter(n=>!decl(js,n)),stillInTimeline=moved.filter(n=>decl(raw,n));
ok('every moved name is declared in common.js', !notInCommon.length, notInCommon.join(','));
ok('…and none is declared in timeline/index.html any more', !stillInTimeline.length, stillInTimeline.join(','));

sec('R4: Timeline keeps its own hooks');
/* v1.58.0 (item 86, 85 (b)): the update check, updToast() with it, moved into common/ too;
   Timeline keeps its hooks for it (updWhyNot, updBusy, updGo) */
const kept=['toastPlace','retryPending','syncNow','SP_IDS','TODOS_OK','updWhyNot','updBusy','updGo'];
const lost=kept.filter(n=>!decl(raw,n));
ok('toastPlace, the save queue and its ids, and the update check\'s hooks stay in Timeline', !lost.length, lost.join(','));
ok('the sign-in button stays in Timeline (it replays Timeline\'s parked saves)', /getElementById\('auth-signin'\)\.addEventListener\('click'/.test(raw));
ok('the shared toast asks the product where its stack goes, if it says', js.includes("if(typeof toastPlace==='function')toastPlace();"));

sec('R5: the shared file stands alone');
const bare=new JSDOM(`<!doctype html><body><div id="toasts"></div><span id="sync-pill"></span>
  <div id="auth-overlay" class="overlay hidden"><button id="auth-signin">Sign in</button></div>
  <script>window.msal={PublicClientApplication:function(){}};</script><script>${js}</script></body>`,{runScripts:'dangerously'});
const bw=bare.window,BE=s=>bw.eval(s),bq=s=>bw.document.querySelector(s);
ok('it loads on a bare page and touches nothing while loading', BE('typeof store')==='object'&&BE('typeof toast')==='function'&&!bq('.toast'));
let threw='';try{BE("toast('Saved')");}catch(e){threw=e.message;}
ok('toast() works with no toastPlace() on the page', !threw&&bq('#toasts .toast')&&bq('#toasts .toast').textContent.startsWith('Saved'), threw);
BE("setSync('busy')");ok('setSync() drives the pill', bq('#sync-pill').className==='busy'&&/saving/.test(bq('#sync-pill').textContent));
BE('authShow()');ok('authShow() opens the sign-in overlay', !bq('#auth-overlay').classList.contains('hidden')&&bq('#sync-pill').className==='err');
ok('store reads every list by kind', BE("store.url.length===1&&Object.keys(STORE_LISTS).join()")==='proj,task,todo,event,staff,client,past,config,changelog,feedback,employeeContacts');

sec('R7: the tokens');
ok('common.css declares the --ts-* tokens, --sans and --mono', /--ts-action:#2F6FE4/.test(css)&&/--sans:Bahnschrift/.test(css)&&/--mono:ui-monospace/.test(css));
const tlStyle=raw.slice(raw.indexOf('<style>'),raw.indexOf('</style>'));
ok('…and Timeline\'s stylesheet no longer does', !/--ts-[a-z-]+\s*:/.test(tlStyle)&&!/--sans\s*:/.test(tlStyle));
ok('Timeline\'s own tokens still alias them', /--acc:var\(--ts-action\)/.test(tlStyle)&&/--paper:var\(--ts-paper\)/.test(tlStyle));
ok('the toast and sync-pill styles moved too', /\.toast\{/.test(css)&&/#sync-pill\{/.test(css)&&!/\n\.toast\{/.test(tlStyle)&&!/\n#sync-pill\{/.test(tlStyle));

sec('R8: Entra unchanged');
ok('the client and tenant IDs are the registered ones',
  js.includes("const CLIENT_ID='5ba3aabe-81f7-41c9-92a4-83a45d5407ab';")&&js.includes("const TENANT_ID='70aa5330-416f-48cb-a64f-1a89f0196577';"));
ok('the scopes are unchanged', js.includes("const SCOPES=['User.Read','Sites.ReadWrite.All'];"));

/* R6: Timeline on the shared core — a saved project, then the draft page */
const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',deadline:'2026-12-20',status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-11-01',sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-11-05',endDate:'2026-11-20',
  estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const dom=boot(FILE,{url:'https://example.github.io/Project-Scheduler/timeline/#/project/p1',data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s),q=s=>win.document.querySelector(s);
setTimeout(async()=>{
  try{
    sec('R6: Timeline boots on the shared core');
    ok('signed in through the shared sign-in', E('store.who()&&store.who().email')==='user@example.com');
    ok('the saved project renders', E('ROUTE.view')==='project'&&!!q('#npv-body .npv-bar'));
    E("toast('Hello from Timeline')");
    ok('a toast shows, placed by Timeline\'s toastPlace()', [...win.document.querySelectorAll('#toasts .toast')].some(t=>t.textContent.startsWith('Hello from Timeline')));
    const n0=win.__spCalls.length;
    E("saveState({...ST,projects:ST.projects.map(p=>p.id==='p1'?{...p,jobCode:'WMU005'}:p)})");
    await wait(300);
    const put=win.__spCalls.slice(n0).find(c=>c.method==='PATCH'&&/ShopTimeline_Projects/.test(c.url));
    ok('a save goes out through the shared store', !!put&&put.body&&put.body.jobCode==='WMU005', put&&JSON.stringify(put.body));
    ok('…and the shared pill reads synced', /synced/.test(q('#sync-pill').textContent), q('#sync-pill').textContent);
    win.location.hash='#/project/new';await wait(400);
    ok('the New Project draft renders', E('ROUTE.creating')===true);
  }catch(e){ok('suite threw: '+(e&&e.stack||e),false);}
  done();
},1300);
