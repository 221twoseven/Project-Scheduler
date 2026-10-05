/* v1.33.0 — the update check (docs/TODO.md §3 item 46).
   R1 a tab coming back into view probes index.html (a no-store GET with a cache-busting
   query), at most once per 30 min; the 12 h timer and a retired boot force it · R2 a newer
   served build → a toast with Reload that stays until acted on; nothing reloads by itself,
   and a version is offered once · R3 Config update.minVersion newer than the running build
   → the retired notice counts down and reloads on its own, holding while a drag is live
   (saved page) or the draft is dirty (New Project) · R4 after a reload onto a new build one
   "Updated to vX" toast opens Help ▸ Release notes; a first visit gets none · R5 (owner
   rule) an update never costs work: every busy state (New Project, drag, editor, overlay,
   menu, tour, cursor in a field, save in flight or parked) holds the check and the
   countdown, and a Reload that would lose a save or a mid-edit record is refused · D1 a
   minVersion the served build cannot satisfy never starts a reload loop.
   Run: node tests/test-v1330.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function updCheck')<0){
  console.log('  SKIP  test-v1330: pre-v1.33.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:'2026-09-15',status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm']),createdAt:'2026-07-01',sortIndex:0}];
const tasks=[{appId:'t0',projectId:'p1',department:'pm',assignee:'Sam',startDate:'2026-08-03',endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''}];
const data={projects,tasks,staff,todos:[]};

/* The probe and the Config read both go through window.fetch. Wrap the harness stub so
   the served index.html carries a chosen version and Config a chosen minVersion. */
function wrapFetch(win,state){
  const f0=win.fetch;
  win.fetch=(u,i)=>{const s=String(u);
    if(/\?v=\d+/.test(s)){state.probes.push({url:s,init:i});
      return Promise.resolve({ok:true,status:200,text:async()=>state.served?"const APP_VER='"+state.served+"';":'<html>no version here</html>'});}
    if(/ShopTimeline_Config/.test(s)&&!(i&&i.method)){
      if(state.cfgFail)return Promise.resolve({ok:false,status:503,json:async()=>({}),text:async()=>'boom'});
      return Promise.resolve({ok:true,status:200,json:async()=>({value:state.min?[{id:'c1',fields:{Title:'update.minVersion',value:state.min}}]:[]})});}
    return f0(u,i);};
}

const dom=boot(FILE,{data});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const input=(el,v)=>{el.value=v;el.dispatchEvent(new win.Event('input',{bubbles:true}));};
const S={served:'',min:'',probes:[]};
wrapFetch(win,S);
const focus=()=>doc.dispatchEvent(new win.Event('visibilitychange'));
const reloads=()=>E("window.__reloads||0");

setTimeout(async()=>{
  try{await run();}catch(e){fail++;console.log('  FAIL  suite threw: '+(e&&e.stack||e));}
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1300);

async function run(){
  sec('R4: a first visit — no "Updated" toast, the version is recorded');
  ok('no toast on a first visit', !q('#upd-new'));
  ok('the running version is recorded', win.localStorage.getItem('shopTimelineSeenVer')===E('APP_VER'));

  sec('verCmp — numeric, three parts');
  ok('1.33.0 > 1.32.0', E("verCmp('1.33.0','1.32.0')")>0);
  ok('1.10.0 > 1.9.9 (numbers, not text)', E("verCmp('1.10.0','1.9.9')")>0);
  ok('2.0 == 2.0.0', E("verCmp('2.0','2.0.0')")===0);
  ok('a hand-typed "v1.34.0" still compares', E("verCmp('1.33.0','v1.34.0')")<0&&E("verCmp(' V1.34.0 ','1.33.0')")>0);

  sec('R1: the focus probe, throttled to once per 30 min');
  E("UPD_LAST=Date.now()");
  focus();await wait(60);
  ok('a tab that just booted does not probe on focus', S.probes.length===0);
  E("UPD_LAST=0");
  focus();await wait(120);
  ok('30 min later the focus probe fires', S.probes.length===1);
  ok('…as a no-store GET of index.html with a cache-busting query',
     S.probes.length===1&&/^\/shop-timeline\/\?v=\d+$/.test(S.probes[0].url)&&S.probes[0].init&&S.probes[0].init.cache==='no-store', S.probes[0]&&S.probes[0].url);
  ok('the served build carries no newer version → no toast', !q('#upd-toast'));
  focus();await wait(60);
  ok('a second focus inside 30 min does not probe again', S.probes.length===1);

  sec('R2: a newer served build offers Reload and never reloads by itself');
  E("updGo=()=>{window.__reloads=(window.__reloads||0)+1;}"); /* the guard in updReload stays real */
  S.served='9.9.9';
  await E("updCheck(true)");
  const t=q('#upd-toast');
  ok('toast "v9.9.9 is available"', !!t&&/^v9\.9\.9 is available/.test(t.textContent), t&&t.textContent);
  ok('…with a Reload button', !!t&&!!t.querySelector('button.undo')&&t.querySelector('button.undo').textContent==='Reload');
  ok('…and a dismiss ×', !!t&&!!t.querySelector('.toast-x'));
  ok('a plain strip, not an error', !!t&&!t.classList.contains('err'));
  await wait(3000);
  ok('it stays — no fade after 3 s', q('#upd-toast')===t&&!t.classList.contains('out'));
  ok('nothing reloaded by itself', reloads()===0);
  click(t.querySelector('button.undo'));
  ok('Reload reloads', reloads()===1);
  ok('…and the toast is gone', !q('#upd-toast'));
  E("window.__reloads=0");
  await E("updCheck(true)");
  ok('the same version is not offered twice', !q('#upd-toast'));
  E("UPD_SHOWN=''");await E("updCheck(true)");
  click(q('#upd-toast .toast-x'));
  ok('× dismisses the offer', !q('#upd-toast'));
  await E("updCheck(true)");
  ok('…but only snoozes it: the next check offers again', !!q('#upd-toast'));
  click(q('#upd-toast .toast-x'));
  S.cfgFail=true;E("CFG_RAW['keep.me']='1'");
  await E("updCheck(true)");
  ok('a Config read that fails leaves CFG_OK and the last raw values alone', E("CFG_OK")===true&&E("CFG_RAW['keep.me']")==='1');
  S.cfgFail=false;

  sec('R3 on a saved project: update.minVersion retires the build; a live drag holds the countdown');
  E("UPD_GRACE=2;location.hash='#/project/p1';applyRoute()");
  await wait(600);
  ok('saved project page open', !!q('#npv-body'));
  if(doc.activeElement&&doc.activeElement.blur)doc.activeElement.blur();
  S.min='9.9.9';
  E("const _o=document.getElementById('upd-toast');if(_o)_o.remove();UPD_SHOWN='';DRAG={}");
  await E("updCheck(true)");
  ok('R5: a tab mid-drag does not even check', !q('#upd-toast'), q('#upd-toast')&&q('#upd-toast').textContent);
  E("DRAG=null;clearTimeout(UPD_RETRY);UPD_RETRY=null");
  await E("updCheck(true)");
  E("DRAG={}"); /* the drag starts after the notice is up */
  const r=q('#upd-toast');
  ok('the retired notice shows as an error strip', !!r&&/retired/.test(r.textContent)&&r.classList.contains('err'), r&&r.textContent);
  ok('it counts down from the grace period', !!r&&/reloading in 2 s/.test(r.textContent));
  ok('no dismiss × — the reload is the way out', !!r&&!r.querySelector('.toast-x'));
  ok('a "Reload now" button', !!r&&!!r.querySelector('button.undo')&&r.querySelector('button.undo').textContent==='Reload now');
  await wait(2600);
  ok('a live drag holds the countdown', !!r&&/reloading in 2 s/.test(r.textContent)&&reloads()===0, r&&r.textContent);
  E("toast('an edit landed')");
  ok('a later toast lands after the notice', q('#toasts').lastElementChild!==r);
  E("DRAG=null");
  await wait(2600);
  ok('drag over → it reloads on its own', reloads()===1);
  ok('the notice moved back to newest, so it was never hidden', q('#toasts').lastElementChild===r);
  ok('the notice is shown once (no second countdown)', E("!!UPD_RETIRE"));

  sec('D1: a minVersion the served build cannot satisfy never starts a reload loop');
  E("clearInterval(UPD_RETIRE);UPD_RETIRE=null;UPD_SHOWN='';window.__reloads=0;const _t=document.getElementById('upd-toast');if(_t)_t.remove();");
  S.served='1.0.0';S.min='9.9.9';
  await E("updCheck(true)");
  ok('no retired notice while the served build is older than minVersion', !q('#upd-toast'));
  ok('nothing reloaded', reloads()===0);

  sec('R3/R5 on the New Project draft: a check never runs there, and a countdown started elsewhere holds');
  E("location.hash='#/';applyRoute()");
  await wait(300);
  if(doc.activeElement&&doc.activeElement.blur)doc.activeElement.blur();
  S.served='9.9.9';S.min='9.9.9';
  await E("updCheck(true)");
  const r2=q('#upd-toast');
  ok('the retired notice shows on the timeline', !!r2&&/retired/.test(r2.textContent));
  E("location.hash='#/project/new';applyRoute()");
  await wait(900);
  const nm=q('#pp-name');
  ok('draft page open', !!nm);
  E("UPD_LAST=0");const np=S.probes.length;
  focus();await wait(80);
  ok('R5: no check runs on New Project, even a clean one', S.probes.length===np);
  E("clearTimeout(UPD_RETRY);UPD_RETRY=null");
  input(nm,'Dirty draft');
  ok('the draft reads dirty', E("ppDraftDirty()")===true);
  await wait(2600);
  ok('a dirty draft holds the countdown', reloads()===0&&!!r2&&/reloading in 2 s/.test(r2.textContent), r2&&r2.textContent);
  input(nm,'');
  if(doc.activeElement&&doc.activeElement.blur)doc.activeElement.blur();
  ok('the draft reads clean again', E("ppDraftDirty()")===false);
  await wait(2600);
  ok('R5: a clean draft still holds — New Project itself is busy', reloads()===0);
  E("location.hash='#/';applyRoute()");
  await wait(2600);
  ok('leaving New Project → it reloads', reloads()===1);
  E("clearInterval(UPD_RETIRE)");

  sec('R5: an update never costs work — every busy state holds, and a Reload that would lose a save is refused');
  const busy=(setup,undo,label)=>{E(setup);const b=E("updBusy()");E(undo);ok(label+' counts as busy', b===true&&E("updBusy()")===false);};
  ok('idle timeline is not busy', E("updBusy()")===false);
  busy("DRAG={}","DRAG=null",'a timeline drag');
  busy("COACH={}","COACH=null",'the tour');
  busy("CD_EDIT={}","CD_EDIT=null",'a Company Data record mid-edit');
  busy("SYNCING=1","SYNCING=0",'a save in flight');
  busy("PENDING_SYNC={}","PENDING_SYNC=null",'a parked project save');
  busy("PENDING_STAFF={}","PENDING_STAFF=null",'a parked staff save');
  busy("document.getElementById('task-overlay').classList.remove('hidden')","document.getElementById('task-overlay').classList.add('hidden')",'an open overlay');
  busy("const d=document.createElement('div');d.id='bz';d.className='cal-dragging';document.body.appendChild(d)","document.getElementById('bz').remove()",'a calendar drag');
  busy("const i=document.createElement('input');i.id='bi';document.body.appendChild(i);i.focus()","document.getElementById('bi').blur();document.getElementById('bi').remove()",'a cursor in a field');
  busy("const m=document.createElement('div');m.id='npv-menu';document.body.appendChild(m)","document.getElementById('npv-menu').remove()",'an open context menu');
  E("UPD_LAST=0;CD_EDIT={}");const n0=S.probes.length;
  focus();await wait(80);
  ok('a busy tab does not probe on focus', S.probes.length===n0);
  ok('…and arms one retry', E("!!UPD_RETRY"));
  E("clearTimeout(UPD_RETRY);UPD_RETRY=null;CD_EDIT=null;UPD_SHOWN='';window.__reloads=0");
  S.served='9.9.9';S.min='';
  await E("updCheck(true)");
  ok('offer shown again', !!q('#upd-toast'));
  E("SYNCING=1");
  click(q('#upd-toast button.undo'));
  ok('Reload is refused while a save is in flight', reloads()===0);
  ok('…the offer stays', !!q('#upd-toast'));
  ok('…and says why', [...doc.querySelectorAll('.toast.err')].some(t=>/Not reloaded: a save is still going/.test(t.textContent)));
  E("SYNCING=0;CD_EDIT={}");
  click(q('#upd-toast button.undo'));
  ok('Reload is refused while a record is mid-edit', reloads()===0&&!!q('#upd-toast'));
  E("CD_EDIT=null");
  click(q('#upd-toast button.undo'));
  ok('free again → Reload reloads and the offer goes', reloads()===1&&!q('#upd-toast'));

  sec('R4: after a reload onto a new build — one "Updated to vX" toast opens Release notes');
  const dom2=boot(FILE,{data,localStorage:{shopTimelineSeenVer:'1.0.0'}});
  const w2=dom2.window,d2=w2.document;
  wrapFetch(w2,{served:'',min:'',probes:[]});
  await wait(1300);
  const u=d2.querySelector('#upd-new');
  ok('toast "Updated to v'+w2.eval('APP_VER')+'"', !!u&&u.textContent.indexOf('Updated to v'+w2.eval('APP_VER'))===0, u&&u.textContent);
  ok('…with a What’s new button', !!u&&!!u.querySelector('button.undo')&&/What/.test(u.querySelector('button.undo').textContent));
  ok('the new version is recorded', w2.localStorage.getItem('shopTimelineSeenVer')===w2.eval('APP_VER'));
  if(u)u.querySelector('button.undo').dispatchEvent(new w2.MouseEvent('click',{bubbles:true,cancelable:true}));
  await wait(80);
  ok('What’s new opens Help ▸ Release notes', w2.location.hash==='#/releases', w2.location.hash);
  ok('…and the toast is gone', !d2.querySelector('#upd-new'));
}
