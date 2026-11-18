/* v1.56.0 — item 49 (D4's reshape): the Systems page takes the root and Timeline moves into
   timeline/. No behaviour change inside Timeline.
   R1 the root page is the Systems page, laid out as the owner's Portal Option 1 wireframe, four cards in the owner's wording
      (2026-11-17: all four, Office greyed) · R2 the tiles' links · R3 old links: a #/… route
      or a #view= link at the root goes on to timeline/ with the route; a sign-in reply
      (#code=…) and a bare visit stay · R4 a tab opened before the move (it checks the root
      for a newer build) is offered the reload, and update.minVersion still retires it ·
      R5 Timeline runs from timeline/: its own MSAL file and the font one folder up, sign-in
      returns to timeline/, and both project pages render there (the REV49 lesson) · R6 the
      tools (npm test, the test runner, npm run notes) target timeline/index.html.
   Run: node tests/test-v1560.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path'),os=require('os');
const {JSDOM}=require('jsdom');
const {boot,suite}=require('./harness');
const {FILE,src,raw,ok,done}=suite();
const ROOT=path.join(__dirname,'..');
const portal=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

sec('R1: the root page is the Systems page');
const pd=new JSDOM(portal,{url:'https://example.github.io/Project-Scheduler/'}).window.document;
const txt=el=>el?el.textContent.trim():'';
/* Laid out as the owner's Portal Option 1 wireframe (design/wireframes/), wording approved 2026-11-17 */
/* v1.57.0 (item 52 step 4): the header is the shell's, from common/common.css */
ok('the header: the wordmark, then "Systems"', txt(pd.querySelector('.ts-top .ts-brand'))==='TWOSEVEN INC.'&&txt(pd.querySelector('.ts-top .ts-app'))==='Systems');
ok('the page title and its line', txt(pd.querySelector('h1'))==='Your workspace'&&txt(pd.querySelector('.intro p'))==='Open an app to get started.');
ok('the title names Systems', /^Systems/.test(pd.title), pd.title);
const tiles=[...pd.querySelectorAll('.app-grid > li > .app-link')];
/* v1.58.0 (item 86): Clients opens its own app; People shows greyed until launch 2 */
const want=[['Timeline','Project schedules, phases and crews','Open Timeline','timeline/'],
  ['People','Staff, contact details and time off','In Timeline for now',null],
  ['Clients','The client list','Open Clients · admins only','clients/'],
  ['Office','Leads, estimates and job setup.','Not built yet',null]];
const part=(t,c)=>t?txt(t.querySelector(c)):'';
ok('four cards, in order', tiles.length===4&&want.every((w,i)=>part(tiles[i],'.app-name')===w[0]), tiles.map(t=>part(t,'.app-name')).join(','));
want.forEach((w,i)=>ok(w[0]+' reads "'+w[1]+'" over "'+w[2]+'"',
  part(tiles[i],'.app-description')===w[1]&&part(tiles[i],'.app-foot')===w[2], part(tiles[i],'.app-description')+' / '+part(tiles[i],'.app-foot')));
ok('each card has its icon', tiles.every(t=>t.querySelector('.icon svg')));

sec('R2: the cards\' links');
want.forEach((w,i)=>w[3]
  ?ok(w[0]+' links to '+w[3]+', with the → arrow', tiles[i]&&tiles[i].tagName==='A'&&tiles[i].getAttribute('href')===w[3]&&part(tiles[i],'.go')==='→')
  :ok(w[0]+' is greyed, not a link, and has no arrow', !!tiles[i]&&tiles[i].tagName!=='A'&&tiles[i].classList.contains('off')&&!tiles[i].closest('a')&&!tiles[i].querySelector('.go')));
ok('the page loads no script file and no MSAL: it never signs in', !/\ssrc=/.test(portal)&&!/msal/i.test(portal.replace(/<!--[\s\S]*?-->/g,'')));

sec('R3: old links go on to timeline/');
const fwd=(portal.match(/<script>([\s\S]*?)<\/script>/)||[])[1]||'';
const go=hash=>{let to=null;new Function('location',fwd)({hash,replace:u=>{to=u;}});return to;};
ok('#/project/p1 → timeline/#/project/p1', go('#/project/p1')==='timeline/#/project/p1', go('#/project/p1'));
ok('#/people → timeline/#/people', go('#/people')==='timeline/#/people');
ok('#/ → timeline/#/', go('#/')==='timeline/#/');
ok('a shared view (#view=…) → timeline/#view=…', go('#view=%7B%7D')==='timeline/#view=%7B%7D');
ok('a bare visit stays on the Systems page', go('')===null);
ok('a sign-in reply (#code=…&state=…) stays put for the window that asked', go('#code=abc&state=xyz')===null&&go('#error=x&state=y')===null);
ok('the forward runs before the page draws (in <head>)', portal.indexOf(fwd)<portal.indexOf('<body>'));

sec('R4: a tab opened before the move');
/* The booted old build below proves Timeline's own update check reads it; here, the value. */
const named=(/APP_VER\s*=\s*'(\d[^']*)'/.exec(portal)||[])[1];
ok('the Systems page names v1.56.0 for it', named==='1.56.0', named);
const ico=s=>(/<link rel="icon"[^>]*href="([^"]+)"/.exec(s)||[])[1];
ok('the Systems page carries Timeline\'s favicon, unchanged', !!ico(portal)&&ico(portal)===ico(src));

/* Boot this build as the old one: v1.55.1, served from the root, checking the root. */
const oldFile=path.join(os.tmpdir(),'tl-v1560-old-'+process.pid+'.html');
fs.writeFileSync(oldFile,src.replace(/const APP_VER='[^']+'/,"const APP_VER='1.55.1'"));
const S={min:'',probes:[]};
const odom=boot(oldFile,{url:'https://example.github.io/Project-Scheduler/#/',data:{projects:[],tasks:[],staff:[],todos:[]}});
const ow=odom.window,OE=s=>ow.eval(s),oq=s=>ow.document.querySelector(s);
const f0=ow.fetch;
ow.fetch=(u,i)=>{const s=String(u);
  if(/\?v=\d+/.test(s)){S.probes.push(s);return Promise.resolve({ok:true,status:200,text:async()=>portal});}
  if(/ShopTimeline_Config/.test(s)&&!(i&&i.method))
    return Promise.resolve({ok:true,status:200,json:async()=>({value:S.min?[{id:'c1',fields:{Title:'update.minVersion',value:S.min}}]:[]})});
  return f0(u,i);};

/* R5: Timeline from timeline/, on a saved project and then the draft page */
const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',deadline:'2026-12-20',status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-11-01',sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-11-05',endDate:'2026-11-20',
  estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const ndom=boot(FILE,{url:'https://example.github.io/Project-Scheduler/timeline/#/project/p1',data:{projects,tasks,staff:[],todos:[]}});
const nw=ndom.window,NE=s=>nw.eval(s),nq=s=>nw.document.querySelector(s);

setTimeout(async()=>{
  try{await run();}catch(e){ok('suite threw: '+(e&&e.stack||e),false);}
  try{fs.unlinkSync(oldFile);}catch(e){}
  done();
},1300);

async function run(){
  ok('…and that is no newer than this build (only pre-move tabs read it)', NE("verCmp('"+named+"',APP_VER)")<=0);
  OE('UPD_SHOWN=""');await OE('updCheck(true)');
  ok('it checks the page it was opened from (the root)', /^\/Project-Scheduler\/\?v=\d+$/.test(S.probes[0]||''), S.probes[0]);
  const t=oq('#upd-toast');
  ok('…and is offered "v1.56.0 is available — Reload"', !!t&&/v1\.56\.0 is available/.test(t.textContent)&&/Reload/.test(t.textContent), t&&t.textContent);
  if(t&&t.querySelector('.toast-x'))t.querySelector('.toast-x').dispatchEvent(new ow.MouseEvent('click',{bubbles:true}));
  OE('window.updGo=()=>{window.__reloads=(window.__reloads||0)+1;}');
  S.min='1.56.0';OE('UPD_SHOWN=""');await OE('updCheck(true)');
  const r=oq('#upd-toast');
  ok('"Ask everyone to reload" (update.minVersion 1.56.0) still retires it', !!r&&/retired/.test(r.textContent), r&&r.textContent);

  sec('R5: Timeline runs from timeline/');
  /* v1.56.1 (item 85): MSAL moved on from timeline/ into common/, shared by every product */
  ok('its MSAL file loads from common/, and is there', raw.includes('<script src="../common/msal-browser.min.js"></script>')&&fs.existsSync(path.join(ROOT,'common','msal-browser.min.js')));
  /* v1.56.1: the root keeps an MSAL copy for one release, for a page cached from before the move
     (test-v1561 checks it's identical); the Systems page itself never loads it. */
  ok('the root no longer holds the app, and the Systems page loads no MSAL', !/const APP_VER=/.test(portal)&&!/msal-browser/.test(portal));
  const font=(/url\('([^']*BrNStdBd\.otf)'\)/.exec(src)||[])[1];
  ok('the wordmark font is one folder up, and there', font==='../design/fonts/BrNStdBd.otf'&&fs.existsSync(path.join(ROOT,'timeline',font)), font);
  /* v1.57.0 (item 52 step 4): both pages read the font through common/common.css */
  const ccss=fs.readFileSync(path.join(ROOT,'common','common.css'),'utf8');
  const pfont=(/url\('([^']*BrNStdBd\.otf)'\)/.exec(ccss)||[])[1];
  ok('the Systems page reads the same font, through common.css', /<link rel="stylesheet" href="common\/common\.css/.test(portal)
    &&!!pfont&&fs.existsSync(path.join(ROOT,'common',pfont)), pfont);
  ok('sign-in returns to timeline/ (the redirect URI the owner registers)',
    NE('PCA.cfg.auth.redirectUri')==='https://example.github.io/Project-Scheduler/timeline/', NE('PCA.cfg.auth.redirectUri'));
  ok('"Ask everyone to reload" still knows /preview/timeline/ is the preview',
    src.includes('if(/\\/preview\\//.test(location.pathname))')&&/\/preview\//.test('/Project-Scheduler/preview/timeline/'));
  ok('a saved project renders at timeline/#/project/p1', NE('ROUTE.view')==='project'&&!!nq('#npv-body .npv-bar'), NE('ROUTE.view'));
  nw.location.hash='#/project/new';await wait(400);
  ok('the New Project draft renders at timeline/#/project/new', NE('ROUTE.creating')===true&&!!nq('#pp-name,#npv-body'), String(NE('ROUTE.creating')));

  sec('R6: the tools target timeline/index.html');
  const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8').replace(/^﻿/,'')); /* the file starts with a BOM */
  ok('npm test runs the suites against timeline/index.html', pkg.scripts.test==='node tests/run.js timeline/index.html', pkg.scripts.test);
  ok('the runner and the harness default to it', /process\.argv\[2\] \|\| 'timeline\/index\.html'/.test(fs.readFileSync(path.join(__dirname,'run.js'),'utf8'))
    &&/process\.argv\[2\]\|\|'timeline\/index\.html'/.test(fs.readFileSync(path.join(__dirname,'harness.js'),'utf8')));
  ok('npm run notes writes into it', /path\.join\(ROOT,'timeline','index\.html'\)/.test(fs.readFileSync(path.join(ROOT,'tools','gen-release-notes.js'),'utf8')));
  ok('package.json carries the app version', pkg.version===(/const APP_VER='([^']+)'/.exec(src)||[])[1], pkg.version);
}
