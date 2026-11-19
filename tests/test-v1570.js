/* v1.57.0 — item 52 step 4: the shell. The header every Systems product shows, shared from
   common/: the TWOSEVEN INC. wordmark opens the Systems page, the product's name beside it
   ("Timeline") goes home to the full timeline, and an Apps menu lists the four products.
   Owner's picks, 2026-11-18: the wordmark → the Systems page; the name reads "Timeline";
   Timeline's own buttons stay in the header row; the menu lists all four, unbuilt ones greyed.
   R1 the wordmark is a link to the Systems page, with an accessible "home" name · R2 the name
   "Timeline" is the home button, from People and from a project page · R3 the Apps menu: four
   products in the Systems page's order, Timeline ticked, People and Clients as links, Office
   greyed; a pick closes it; non-admins don't see Clients, as on Company Data · R4 the menu and
   the Systems page's cards say the same · R5 the header row is 56px, the signed-in name sits
   last, and every page sits under the toolbar's measured height · R6 the shared pieces live in
   common/, and the Systems page loads them with the version stamped · R7 the Help menu reads
   "Timeline · v…"; printed titles keep "Shop Timeline" · R8 the header and menu work on a
   saved project and on the New Project draft (the REV49 lesson).
   Run: node tests/test-v1570.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const {boot,suite}=require('./harness');
const {FILE,src,raw,ok,done}=suite();
const ROOT=path.join(__dirname,'..');
const portal=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').replace(/\r\n/g,'\n');
const css=fs.readFileSync(path.join(ROOT,'common','common.css'),'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ver=(/const APP_VER='([^']+)'/.exec(raw)||[])[1];

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',deadline:'2026-12-20',status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-11-01',sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-11-05',endDate:'2026-11-20',
  estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]',role:''};
const PAT={appId:'s2',Title:'Pat',email:'pat@example.com',depts:'[]',ooo:'[]',role:'',admin:'1'};
const URL0='https://example.github.io/Project-Scheduler/timeline/';
const start=(hash,staff)=>boot(FILE,{url:URL0+hash,data:{projects,tasks,staff:staff||[],todos:[]}}).window;
const go=(w,h)=>{w.location.hash=h;w.dispatchEvent(new w.Event('hashchange'));};
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const items=w=>[...w.document.querySelectorAll('#apps-menu .ts-apps-item')];

sec('R6: the shared pieces live in common/');
ok('common.css holds the shell: the header bar, the wordmark, the product name, the menu rows',
  /\.ts-top\{[^}]*min-height:56px/.test(css)&&/\.ts-brand\{font-family:'Brauer Neue'/.test(css)&&/\.ts-app\{/.test(css)&&/\.ts-apps-item\{/.test(css));
ok('…with the Brauer Neue font, relative to common/', /@font-face\{font-family:'Brauer Neue';src:url\('\.\.\/design\/fonts\/BrNStdBd\.otf'\)/.test(css)
  &&fs.existsSync(path.join(ROOT,'common','..','design','fonts','BrNStdBd.otf')));
const tlStyle=raw.slice(raw.indexOf('<style>'),raw.indexOf('</style>'));
ok('Timeline no longer declares the font or its own wordmark style', !/@font-face/.test(tlStyle)&&!/\.tb-co\{/.test(tlStyle)&&!/\.tb-app\{/.test(tlStyle));
ok('the Systems page loads common.css with the running version', portal.includes('<link rel="stylesheet" href="common/common.css?v='+ver+'">'), ver);
const pStyle=portal.slice(portal.indexOf('<style>'),portal.indexOf('</style>'));
ok('…and keeps no token or font copy of its own', !/--ts-[a-z-]+\s*:/.test(pStyle)&&!/@font-face/.test(pStyle));
const pd=new JSDOM(portal).window.document;
ok('its header is the shared one: TWOSEVEN INC., then "Systems"',
  (pd.querySelector('.ts-top .ts-brand')||{}).textContent==='TWOSEVEN INC.'&&(pd.querySelector('.ts-top .ts-app')||{}).textContent==='Systems');
const {stampCommon}=require('../tools/gen-release-notes.js');
ok('npm run notes stamps the Systems page\'s tag too', stampCommon('<link href="common/common.css?v=0">','9.9.9')==='<link href="common/common.css?v=9.9.9">');

sec('R4: the menu and the Systems page say the same');
const cards=[...pd.querySelectorAll('.app-grid .app-link')].map(c=>({name:c.querySelector('.app-name').textContent,href:c.getAttribute('href')}));
const listed=new JSDOM('<script>'+fs.readFileSync(path.join(ROOT,'common','common.js'),'utf8')+';window.__A=SYSTEMS_APPS;</script>',
  {runScripts:'dangerously'}).window.__A;
ok('the same products, in the same order, with the same links (none = greyed)',
  listed.length===cards.length&&listed.every((a,i)=>a.name===cards[i].name&&(a.href||null)===cards[i].href),
  JSON.stringify(listed.map(a=>[a.name,a.href]))+' vs '+JSON.stringify(cards.map(c=>[c.name,c.href])));

sec('R7: wording kept and changed');
ok('printed titles keep "Shop Timeline" (the owner changed the header only)', src.includes("const title='Shop Timeline · '"));

/* Booted pages: an admin on the timeline, then People, then a saved project and the draft;
   a non-admin for the Clients row. */
const W=start('#/');
setTimeout(async()=>{
  try{await run();}catch(e){ok('suite threw: '+(e&&e.stack||e),false);}
  done();
},1300);

async function run(){
  const d=W.document,E=s=>W.eval(s),q=s=>d.querySelector(s);

  sec('R1: the wordmark opens the Systems page');
  const wm=q('#tb-systems');
  ok('TWOSEVEN INC. is a link to the Systems page (../)', !!wm&&wm.tagName==='A'&&wm.getAttribute('href')==='../'&&wm.textContent==='TWOSEVEN INC.');
  ok('…its accessible name says home and keeps the visible words', /^TwoSeven Inc\. home/i.test(wm.getAttribute('aria-label')||''));
  ok('…its tooltip says where it goes', wm.title==='All apps — the Systems page', wm.title);

  sec('R2: "Timeline" goes home');
  const home=q('#tb-home');
  ok('the product name reads Timeline and is a button', !!home&&home.tagName==='BUTTON'&&home.textContent==='Timeline'&&home.classList.contains('ts-app'));
  ok('…with the old tooltip', home.title==='Back to the full timeline');
  go(W,'#/people');await wait(300);
  ok('(on the People page)', E('ROUTE.view')==='people');
  click(W,home);await wait(300);
  ok('one click on "Timeline" lands on the full timeline', E('ROUTE.view')==='timeline', E('ROUTE.view'));

  sec('R3: the Apps menu');
  const btn=q('#btn-apps'),menu=q('#apps-menu');
  ok('an Apps button sits in the header row', !!btn&&btn.closest('.tb-global')&&/^Apps/.test(btn.textContent.trim())&&btn.title==='Switch to another Systems app');
  ok('the menu starts closed', menu.classList.contains('hidden'));
  click(W,btn);
  ok('the button opens it', !menu.classList.contains('hidden'));
  const it=items(W),names=it.map(x=>x.dataset.app);
  ok('three products, in order (v1.61.0: Clients became Office; v1.61.1: Office before People)', names.join()==='Timeline,Office,People', names.join());
  ok('Timeline is ticked as the app you\'re in, not a link', it[0].tagName!=='A'&&it[0].getAttribute('aria-current')==='page'&&/✓/.test(it[0].textContent));
  /* v1.58.0 (item 86): Clients is its own app; People greyed until launch 2 */
  ok('People is greyed, "In Timeline for now"', it[2].tagName!=='A'&&it[2].classList.contains('off')&&/In Timeline for now/.test(it[2].textContent));
  ok('Office links to the Office app, "admins only"', it[1].tagName==='A'&&it[1].getAttribute('href')==='../office/'&&/admins only/.test(it[1].textContent));
  click(W,btn);
  ok('the button closes it again', menu.classList.contains('hidden'));
  click(W,btn);click(W,it[1]);
  ok('picking a product closes the menu', menu.classList.contains('hidden'));
  await wait(400);
  click(W,btn);click(W,it[2]);
  ok('…and a greyed one opens nothing', E('ROUTE.view')==='timeline'&&!menu.classList.contains('hidden'), E('ROUTE.view'));
  click(W,btn);

  sec('R5: the header row and the page offsets');
  ok('the header row is 56px tall (guide §5)', /\.tb-global\{[^}]*min-height:56px/.test(src));
  const kids=[...q('.tb-global').children],row=kids.map(c=>c.id||c.className);
  const at=el=>kids.indexOf(el.closest('.tb-global > *'));
  ok('at the right: the version, the sync pill, Apps, then who\'s signed in, last',
    at(q('#tb-rev'))<at(q('#sync-pill'))&&at(q('#sync-pill'))<at(btn)&&at(btn)<at(q('#tb-user'))&&at(q('#tb-user'))===kids.length-1, row.join(' '));
  ok('the timeline and the pages sit under the measured toolbar (--tb-h), not a fixed 50px or 92px',
    /#main\{position:fixed;top:var\(--tb-h,/.test(src)&&/#page\{position:fixed;top:var\(--tb-h,/.test(src)&&!/#page\{[^}]*top:50px/.test(src)&&!/#main\{[^}]*top:92px/.test(src));
  ok('…and the fit sets it', d.documentElement.style.getPropertyValue('--tb-h')!=='');

  sec('R7: the Help menu');
  ok('the Help menu\'s version line reads "Timeline · v'+ver+'"', /^Timeline · v/.test(q('#help-menu .sm-note').textContent)&&q('#tb-rev-num').textContent.includes(ver), q('#help-menu .sm-note').textContent);

  sec('R8: on a saved project and on the New Project draft');
  for(const [label,hash,test] of [['a saved project','#/project/p1',()=>E('ROUTE.view')==='project'&&!E('ROUTE.creating')],
                                  ['the New Project draft','#/project/new',()=>E('ROUTE.creating')===true]]){
    go(W,hash);await wait(400);
    ok('('+label+')', test());
    ok(label+': the header shows the wordmark link, Timeline and Apps', ['#tb-systems','#tb-home','#btn-apps'].every(s=>q(s)&&W.getComputedStyle(q(s)).display!=='none'));
    click(W,btn);
    ok(label+': Apps opens with the three products', !menu.classList.contains('hidden')&&items(W).length===3);
    click(W,btn);
    ok(label+': the page sits under the toolbar\'s measured height', W.getComputedStyle(q('#page')).top!=='50px');
  }
  click(W,home);await wait(400);
  ok('"Timeline" leaves the draft for the full timeline', E('ROUTE.view')==='timeline'&&!E('ROUTE.creating'), E('ROUTE.view'));

  sec('R3: a non-admin');
  const V=start('#/',[SAM,PAT]);await wait(1300);
  ok('(Sam is a non-admin)', V.eval('isViewer()')===true&&V.document.body.classList.contains('viewer'));
  const vc=V.document.querySelector('#apps-menu [data-app="Office"]'); /* v1.61.0: Clients became Office */
  /* jsdom cascades by source order, not specificity, so read #mi-clients's rule from the source */
  /* v1.58.0 (item 86): Company Data ▸ Clients is gone; the rule now sits beside New Project and Changelog */
  ok('the Office row is hidden, by the rule that hides the other admin doors', !!vc&&V.getComputedStyle(vc).display==='none'
    &&src.includes('body.viewer #btn-new-proj,body.viewer #mi-changelog,body.viewer #apps-menu [data-app="Office"],'));
  ok('…and the others still show', ['Timeline','People'].every(n=>V.getComputedStyle(V.document.querySelector('#apps-menu [data-app="'+n+'"]')).display!=='none'));
}
