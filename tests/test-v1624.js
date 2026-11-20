/* v1.62.4 — item 52 step 3, the last surface: the menus and popovers (the toolbar menus,
   the chart's right-click menu, the edit-in-place popover, the thought popover), given one
   floating frame. Owner, 2026-11-20: "Yes, build it" (the mock); no wording changes.
   R1 one frame: a 1px edge, 8px corners, the shared floating shadow, on .tb-menu, .npv-menu,
   .npv-pop and #md-tpop · R2 menu rows are 13px, at least 32px, in the text token; tick boxes
   16px · R3 section labels (.sm-sec, the right-click header .mh, the Legend's .lg-sec) read as
   written, not small capitals, and at least 11px · R4 "Show everything" is a small white
   secondary button · R5 keyboard focus inside a menu is the 2px ring, inset · R6 the chart's
   right-click menu renders its rows at 32px on the saved page and the New Project draft.
   Run: node tests/test-v1624.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FRAME=/border:1px solid var\(--ts-line\);border-radius:8px;box-shadow:0 4px 18px rgba\(13,19,29,\.18\)/;

sec('R1–R5: the recipes in the source');
ok('R1 toolbar menus wear the frame', FRAME.test(rule('.tb-menu')));
ok('R1 …the right-click menu', FRAME.test(rule('.npv-menu')));
ok('R1 …the edit-in-place popover', FRAME.test(rule('.npv-pop')));
ok('R1 …the thought popover', FRAME.test(rule('#md-tpop')));
ok('R2 menu rows: 13px, ≥ 32px, text token', /min-height:32px/.test(rule('.sm-item'))&&/font-size:13px/.test(rule('.sm-item'))&&/color:var\(--ts-text\)/.test(rule('.sm-item')));
ok('R2 …tick boxes 16px', /width:16px;height:16px/.test(rule('.sm-item input[type=checkbox],.sm-item input[type=radio]')));
for(const s of ['.sm-sec','.lg-sec'])
  ok('R3 '+s+' reads as written, 11px', !/uppercase/.test(rule(s))&&/font-size:11px/.test(rule(s)),rule(s));
ok('R3 the right-click header reads as written, 12px', !/uppercase/.test(rule('.npv-menu .mh'))&&/font-size:12px/.test(rule('.npv-menu .mh')));
ok('R4 "Show everything" is a white secondary button', /min-height:28px/.test(rule('.sm-all'))&&/border:1px solid var\(--ts-line\);background:#fff/.test(rule('.sm-all')));
ok('R5 focus inside a menu is the 2px ring, inset', raw.includes('\n.tb-menu :focus-visible,.npv-menu :focus-visible{outline:2px solid var(--ts-action);outline-offset:-2px}'));
ok('R5 …the name field no longer turns the outline off', !/outline:none/.test(rule('.npv-menu .mn')));

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'H1',deadline:'2026-12-20',status:'auto',
  projectManager:'Sam',drafter:'',leadFab:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-11-01',sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-11-05',endDate:'2026-11-20',
  estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["fab"]',ooo:'[]',role:'',admin:'1'};
const URL0='https://example.github.io/Project-Scheduler/timeline/';
const start=hash=>boot(FILE,{url:URL0+hash,data:{projects,tasks,staff:[SAM],todos:[]}}).window;

(async()=>{
  sec('R2–R3: the Filters menu, as rendered');
  let w=start('#/');await wait(600);
  w.document.getElementById('btn-filters').click();await wait(50);
  const item=w.document.querySelector('#filters-menu .sm-item');
  ok('a Filters row renders 13px', !!item&&w.getComputedStyle(item).fontSize==='13px',item&&w.getComputedStyle(item).fontSize);
  const sc=w.document.querySelector('#filters-menu .sm-sec');
  ok('the "Status" label is as written, not capitals', !!sc&&sc.textContent==='Status'&&w.getComputedStyle(sc).textTransform!=='uppercase');

  for(const [name,hash] of [['the saved page','#/project/p1'],['the New Project draft','#/project/new']]){
    sec('R6: the right-click menu on '+name);
    w=start(hash);await wait(600);
    const t=w.eval("(ROUTE.creating?PP_FORM.tasks||[]:ST.tasks).find(t=>t.department==='fab')||ST.tasks[0]");
    w.npvBarMenu(300,200,t);await wait(30);
    const m=w.document.getElementById('npv-menu');
    const b=m&&m.querySelector('button');
    ok('the menu opens with its rows', !!b);
    ok('…a row is at least 32px, 13px', !!b&&w.getComputedStyle(b).minHeight==='32px'&&w.getComputedStyle(b).fontSize==='13px',b&&w.getComputedStyle(b).minHeight);
    const mh=m&&m.querySelector('.mh');
    ok('…its header is not in capitals', !!mh&&w.getComputedStyle(mh).textTransform!=='uppercase');
  }
  done();
})();
