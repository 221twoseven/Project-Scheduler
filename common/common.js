/* common/common.js — the core every Systems product shares (item 85 (a), v1.56.1).
   Loaded as a plain script before the product's own, so its top-level names are shared
   globals, exactly as they were inside Timeline's single file (D4: one file per product,
   plus this folder). It touches no page element while loading; its functions expect:
     #toasts                      — toast() and toastLayout();
     #sync-pill                   — setSync();
     #auth-overlay, #auth-signin  — authShow();
     the product's Apps menu      — appsMenu(el, current, up), item 52 step 4.
   Optional hooks a product may define: toastPlace() (where the toast stack sits) and
   undo() (what a toast's Undo runs when it isn't given a function).
   The update check (item 86, from 85 (b)) needs the product's const APP_VER and three
   hooks: updWhyNot() (why a reload would lose work, or ''), updBusy() (don't disturb right
   now) and updGo() (reload, after stashing anything the product can restore).
   Moved verbatim from timeline/index.html; the history comments travel with the code. */

/* ===================== SHAREPOINT DATA LAYER ===================== */
const CLIENT_ID='5ba3aabe-81f7-41c9-92a4-83a45d5407ab';
const TENANT_ID='70aa5330-416f-48cb-a64f-1a89f0196577';
const SITE_HOST='twosevennet.sharepoint.com';
const SITE_PATH='/sites/TWOSEVENINC';
const LIST_PROJECTS='ShopTimeline_Projects';
const LIST_TASKS='ShopTimeline_Tasks';
const LIST_STAFF='ShopTimeline_Staff';
/* Tasks live in their own list. Deliberately not 'ShopTimeline_Tasks', which already holds
   the Gantt phases. If this list doesn't exist yet the app runs fine and simply keeps
   tasks in the session, with one warning, the same way staff degrades. */
const LIST_TODOS='ShopTimeline_Tasks2';
/* Standalone events get their own list so deleting a phase no longer deletes its events.
   Additive — the colleague app never reads it. Until the list exists on the site the app
   falls back to the legacy behaviour: an event saves as a ticketNode on a host phase. */
const LIST_EVENTS='ShopTimeline_Events';
/* N3: the client roster, imported from the Excel master. App-only — the colleague app
   never reads it. Columns: Title = client name, field_2 = cost-code alias. */
const LIST_CLIENTS='ShopTimeline_Clients';
/* Item 93 (v1.60.0): projects from before Timeline, in a client's history. Clients owns it;
   owner-created 2026-11-18. Columns: Title (name), clientId (number: the client's item ID),
   jobCode, startDate and endDate (date only), team (multi-line). */
const LIST_PAST='ShopTimeline_PastProjects';
/* v1.6.0 (v2 obj 2): bug reports / feature requests. App-only, owner-created
   2026-08-31. Columns (all text): Title, kind, name, email, description (multi-line),
   appVersion, appId. Screenshots go to the site's default document library (Graph
   v1.0 has no list-item attachment API) and the item links to them. */
const LIST_FEEDBACK='ShopTimeline_Feedback';
/* v1.19.0 (§3 item 26): the change log. App-only, owner-created 2026-08-31. Columns
   (all single-line text except detail, multi-line): Title, projectId, who, at, field,
   detail, appId. One row per changed record per save; nothing backfills edits made
   before this shipped. */
const LIST_CHANGELOG='ShopTimeline_Changelog';
/* v1.11.0 (owner ask 09-02): app-wide settings — key/value rows edited on the dev
   App Settings page. App-only, additive; owner creates it (Title = key, plus one
   single-line text column `value`). Missing list = settings stay browser-local. */
const LIST_CONFIG='ShopTimeline_Config';
/* v1.13.0 (owner ask 09-02): the HR manager's Employee Contacts list — READ-ONLY
   REFERENCE, never written, never schema-touched (item 13 ruling). The People-page
   import mirrors its non-sensitive columns into ShopTimeline_Staff; the HR-sensitive
   ones (Pay Type, PersonalEmail) are never even read. */
const LIST_EC='Employee Contacts';
const SCOPES=['User.Read','Sites.ReadWrite.All'];
let PCA=null,ACCOUNT=null,SITE_ID=null;

async function spInit(){
  PCA=new msal.PublicClientApplication({
    auth:{clientId:CLIENT_ID,authority:'https://login.microsoftonline.com/'+TENANT_ID,redirectUri:window.location.href.split('#')[0].split('?')[0]},
    cache:{cacheLocation:'sessionStorage'}
  });
  const accts=PCA.getAllAccounts();
  if(accts.length){ACCOUNT=accts[0];PCA.setActiveAccount(ACCOUNT);}
  else{await spLogin();}
}
/* v1.51.3: THE one interactive sign-in — a popup Microsoft requires (its login page
   refuses to be framed). Single-flight: concurrent callers share one window instead of
   stacking them. Nothing calls this on its own timer; only boot and the expired-session
   overlay's button (a user gesture, so popup blockers allow it) reach it. */
let LOGIN_FLIGHT=null;
function spLogin(){
  LOGIN_FLIGHT=LOGIN_FLIGHT||PCA.loginPopup({scopes:SCOPES})
    .then(r=>{ACCOUNT=r.account;PCA.setActiveAccount(ACCOUNT);return ACCOUNT;})
    .finally(()=>{LOGIN_FLIGHT=null;});
  return LOGIN_FLIGHT;
}
/* Item 48, PR 7: `scopes` asks for an extra permission on its own SILENT token (Team members,
   Mail.Send): no consent or no token throws, and the caller's degrade path runs — never a popup. */
/* v1.51.3: the default path is silent-only too. It used to fall back to an interactive
   token popup, and the 90s poll runs through here — a tab left open overnight with an expired session
   opened a fresh login window every tick (fifteen stacked prompts by morning). A silent
   failure now throws tagged authRequired; gfetch heals it or raises the sign-in overlay. */
async function spToken(scopes){
  if(scopes)return (await PCA.acquireTokenSilent({scopes,account:ACCOUNT})).accessToken;
  try{return (await PCA.acquireTokenSilent({scopes:SCOPES,account:ACCOUNT})).accessToken;}
  catch(e){throw Object.assign(new Error('Your sign-in expired.'),{authRequired:true,cause:e});}
}
/* v1.51.3: an expired token over a still-alive Microsoft session heals invisibly
   (ssoSilent runs a fresh auth in a hidden iframe off the AAD session cookie, where
   acquireTokenSilent's refresh token had expired). Only when that also fails does the
   in-page overlay appear — never a window the person didn't ask for. Single-flight,
   like spLogin: a poll tick and a save failing together share one attempt. */
let REAUTH=null;
function reauthSilently(){
  REAUTH=REAUTH||PCA.ssoSilent({scopes:SCOPES,account:ACCOUNT})
    .then(r=>{if(r.account)ACCOUNT=r.account;PCA.setActiveAccount(ACCOUNT);return true;})
    .catch(()=>{authShow();return false;})
    .finally(()=>{REAUTH=null;});
  return REAUTH;
}
async function gfetch(url,opts,scopes){
  opts=opts||{};
  let t;
  try{t=await spToken(scopes);}
  catch(e){
    /* Default-scope expiry only — a scoped (Team members, Mail.Send) failure isn't
       tagged and falls straight to its caller's degrade path, as before. */
    if(e&&e.authRequired&&await reauthSilently())t=await spToken(scopes);
    else throw e;
  }
  opts.headers=Object.assign({'Content-Type':'application/json'},opts.headers,{Authorization:'Bearer '+t});
  let r=await fetch(url,opts);
  if(r.status===429||r.status===503){
    /* Graph throttling: wait out Retry-After once instead of re-hammering next tick and
       deepening the throttle. Capped so a bad header can't hang the call. */
    const ra=Math.min(Number((r.headers&&r.headers.get&&r.headers.get('Retry-After'))||5)||5,60);
    await new Promise(res=>setTimeout(res,ra*1000));
    r=await fetch(url,opts);
  }
  if(!r.ok){const txt=await r.text();throw new Error('SharePoint '+r.status+': '+txt.slice(0,180));}
  return r.status===204||r.status===202?null:r.json();
}
/* REV90: follow @odata.nextLink — $top is a page size, not a limit. Without this,
   rows past the first page silently vanished from every load and poll. */
async function gpageAll(url,scopes){
  let r=await gfetch(url,null,scopes),v=r.value||[];
  while(r['@odata.nextLink']){r=await gfetch(r['@odata.nextLink'],null,scopes);v=v.concat(r.value||[]);}
  return v;
}
async function spSite(){
  if(SITE_ID)return SITE_ID;
  const s=await gfetch('https://graph.microsoft.com/v1.0/sites/'+SITE_HOST+':'+SITE_PATH);
  SITE_ID=s.id;return SITE_ID;
}
function listUrl(l){return 'https://graph.microsoft.com/v1.0/sites/'+SITE_ID+'/lists/'+l;}

/* Item 48 (the storage seam), PR 1: one object that owns every conversation with the
   lists. No callers yet; PRs 2–7 move each call site onto it, with the Graph requests
   unchanged byte for byte (docs/Architecture-Review-Storage.md, "Proposed PR sequence").
   Items come back raw ({id, fields, lastModifiedBy, …}), so the fieldsTo* mappers stay
   where they are. */
const STORE_LISTS={
  proj:LIST_PROJECTS, task:LIST_TASKS, todo:LIST_TODOS, event:LIST_EVENTS,
  staff:LIST_STAFF, client:LIST_CLIENTS, past:LIST_PAST, config:LIST_CONFIG, changelog:LIST_CHANGELOG,
  feedback:LIST_FEEDBACK, employeeContacts:LIST_EC
};
/* Item 68: one page size for every list — gpageAll follows @odata.nextLink, so this is a
   page, not a limit. 2000 is the size the big lists already used live: one request each. */
const STORE_PAGE=2000;
const store={
  signIn:spInit,
  /* PR 7: who is signed in, as {name, email}, or null — the one reader of MSAL's account */
  who(){return ACCOUNT?{name:ACCOUNT.name||'',email:ACCOUNT.username||''}:null;},
  url(kind){
    const l=STORE_LISTS[kind];
    if(!l)throw new Error('store: unknown kind '+kind);
    return listUrl(encodeURIComponent(l));
  },
  /* expand: 'fields' by default; the Employee Contacts import passes its own select. */
  async list(kind,expand){
    await spSite();
    return gpageAll(store.url(kind)+'/items?expand='+(expand||'fields')+'&$top='+STORE_PAGE);
  },
  async columns(kind){await spSite();return gpageAll(store.url(kind)+'/columns');},
  async create(kind,fields){await spSite();return gfetch(store.url(kind)+'/items',{method:'POST',body:JSON.stringify({fields})});},
  async update(kind,id,fields){await spSite();return gfetch(store.url(kind)+'/items/'+id+'/fields',{method:'PATCH',body:JSON.stringify(fields)});},
  async remove(kind,id){await spSite();return gfetch(store.url(kind)+'/items/'+id,{method:'DELETE'});},
  /* PR 8, the one error rule (wording: owner, 2026-10-14): why a call failed, in one sentence.
     Messages read "<what failed>: <explain> <next step>", with the raw error under the toast's
     Details. `panel`: the text sits in a panel, which has no Details link to point at. */
  explain(e,panel){
    /* unanchored: the staff sync wraps the Graph error ("2 staff rows didn't save — Sam: SharePoint 400: …") */
    const m=String((e&&e.message)||e||''),st=+((m.match(/SharePoint (\d{3})/)||[])[1]||0);
    if(e&&e.authRequired)return 'Your Microsoft sign-in expired. Sign in again to continue.';
    if(!st&&/failed to fetch|networkerror|load failed|network request failed|endpoints_resolution_error|no_network/i.test(m))return 'This computer looks offline. Check your internet connection.';
    if(st===401||st===403)return 'Your Microsoft account doesn’t have access to that list.';
    if(st===404&&!/itemNotFound/i.test(m))return 'The list isn’t on the TWOSEVENINC site.'; /* a row someone else deleted is a 404 too */
    if(st===400&&/not recognized|does not exist/i.test(m))return 'A column is missing from the list.'+(panel?'':' Click Details below to see which one.'); /* other 400s are bad values */
    if(st===429||st>=500)return 'SharePoint is busy right now.';
    return 'SharePoint returned an error.'+(panel?'':' Click Details below for the full message.');
  }
};

/* ===================== TOASTS ===================== */
/* REV49: a toast can carry its own Undo. Every Gantt tool's loudest complaint is the
   accidental drag or delete, and an undo you have to know the shortcut for isn't one. */
/* `details` (optional string) tucks the raw technical error behind a collapsible
   "Details" — users read the sentence, whoever maintains the app opens the details. */
function toast(msg,kind,undoable,details){
  const box=document.getElementById('toasts');
  /* D3: an identical message right behind the last one bumps a ×N badge on it instead of
     stacking a copy. v1.26.2 (tracker #23): quick undoable edits stack into one
     "N changes · Undo" whose Undo reverses the latest edit. */
  const prev=box.lastElementChild;
  if(prev&&prev.classList.contains('toast')&&!prev.classList.contains('out')){
    if(!undoable&&!prev._undo&&prev.dataset.msg===msg){prev._bump();return;}
    if(undoable&&prev._undo){prev._undo=undoable;prev._more();return;}
  }
  const el=document.createElement('div');el.className='toast'+(kind==='err'?' err':'');
  el.textContent=msg;el.dataset.msg=msg;el._undo=undoable||null;
  const full=kind==='err'?5200:(undoable?5200:2600);
  let tm,t0=0,left=full,count=1,badge=null;
  const gone=()=>{el.remove();toastLayout();};
  const hide=()=>{el.classList.add('out');setTimeout(gone,350);};
  /* The fade pauses while the pointer is on the toast's controls and resumes with the time
     that was left (#23: a pointer passing nearby no longer keeps a toast alive). */
  const arm=()=>{clearTimeout(tm);t0=Date.now();tm=setTimeout(hide,left);};
  const pause=()=>{clearTimeout(tm);left=Math.max(0,left-(Date.now()-t0));};
  if(undoable){
    const b=document.createElement('button');b.className='undo';b.textContent='Undo';
    /* Pass a function as `undoable` to run it instead of the ST undo stack —
       draft-page mutations live outside ST and bring their own reverser. Read at click
       time, so a stacked toast undoes the latest edit. */
    b.addEventListener('click',()=>{gone();typeof el._undo==='function'?el._undo():undo();});
    el.appendChild(b);
  }
  const x=document.createElement('button');x.className='toast-x';x.textContent='×';
  x.title='Dismiss';x.setAttribute('aria-label','Dismiss');x.addEventListener('click',gone);
  el.appendChild(x);
  if(details){
    const d=document.createElement('details');
    const s=document.createElement('summary');s.textContent='Details';d.appendChild(s);
    const t=document.createElement('div');t.className='toast-tech';t.textContent=details;d.appendChild(t);
    el.appendChild(d);
  }
  el._bump=()=>{count++;
    if(!badge){badge=document.createElement('span');badge.className='toast-n';el.insertBefore(badge,el.childNodes[1]||null);}
    badge.textContent='×'+count;left=full;arm();};
  el._more=()=>{count++;el.firstChild.nodeValue=count+' changes';left=full;arm();};
  el.addEventListener('mouseenter',pause);
  el.addEventListener('mouseleave',arm);
  box.appendChild(el);
  toastLayout();
  if(typeof toastPlace==='function')toastPlace(); /* item 85: the product places its stack (Timeline: off the bars) */
  arm();
}
/* D3: at most 3 toasts visible; older ones hide behind a "+N more" counter at the top of
   the stack. Hidden toasts keep their timers, so the counter drains by itself. */
let TOAST_MAX=3; /* v1.26.2 (#23): 1 when the stack sits on the legend band or the dashboard header, where it would grow down into the rows */
function toastLayout(){
  const box=document.getElementById('toasts');
  const ts=[...box.querySelectorAll('.toast')];
  ts.forEach((t,i)=>{t.style.display=i<ts.length-TOAST_MAX?'none':'';});
  let m=document.getElementById('toast-more');
  if(ts.length>TOAST_MAX&&TOAST_MAX>1){
    if(!m){m=document.createElement('div');m.id='toast-more';box.prepend(m);}
    m.textContent='+'+(ts.length-TOAST_MAX)+' more';
  }else if(m)m.remove();
}
const toastU=msg=>toast(msg,null,true);

/* ===================== SYNC STATUS ===================== */
function setSync(state,msg){
  const el=document.getElementById('sync-pill');
  el.className=state;
  el.textContent='● '+(msg||(state==='ok'?'synced':state==='busy'?'saving…':'not saved'));
}
function stamp(){return new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});}

/* ===================== SIGN-IN EXPIRED ===================== */
/* v1.51.3: the expired-session overlay. Shown (never auto-signing) when silent renewal
   AND the ssoSilent heal both fail; the poll and update check already pause on any
   visible .overlay (updBusy), so an expired tab just sits quietly until the click. */
function authShow(){
  document.getElementById('auth-overlay').classList.remove('hidden');
  document.getElementById('auth-signin').focus(); /* keyboard users land on the one action */
  setSync('err','signed out');
}

/* ===================== SHARED DATA RULES ===================== */
/* Item 86 (v1.58.0): the rules every product reads the shared lists by, moved word for word
   out of timeline/index.html when the Clients app became the second product to read them:
   dates, the departments, a project's status and due date, the project and phase readers,
   the staff flags and the admin rule, and the client reader. The writers stay with the
   product that owns the data (projects and phases: Timeline; clients: the Clients app). */
function today(){const d=new Date();d.setHours(0,0,0,0);return d;}
function parseDate(s){if(!s)return today();const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);}
function fmtDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const isoDay=v=>v?String(v).slice(0,10):'';
function safeArr(s){if(Array.isArray(s))return s;try{const a=JSON.parse(s);return Array.isArray(a)?a:[];}catch(e){return[];}}
const DEPTS=[
  /* 1 · OFFICE */
  {id:'pm',        name:'Project Management', roster:'projectManagers', grp:'pmg'},
  {id:'td',        name:'Technical Design',   roster:'drafters', est:10, grp:'tdg'},
  /* v1.20.1 (owner): Technical Design is standalone like PM — no Other bucket. The id
     stays (retired) so any existing othoffice rows keep rendering; it just never
     appears in a picker again. */
  {id:'othoffice', name:'Other (Office)',     freeText:true, est:3, grp:'tdg', retired:true},
  /* 2 · DIGITAL FABRICATION */
  {id:'cnc',       name:'CNC',          est:5, grp:'dfab'},
  {id:'beamsaw',   name:'Beamsaw',      est:3, grp:'dfab'},
  {id:'3dprint',   name:'3D Printing',  est:7, grp:'dfab'},
  {id:'laser',     name:'Lasercutting', est:3, grp:'dfab'},
  {id:'print',     name:'Printing',     est:3, grp:'dfab'},
  {id:'other',     name:'Other (Digital Fab)', freeText:true, est:3, grp:'dfab'},
  /* 3 · MAIN SHOP FAB */
  {id:'fab',       name:'Main Shop Fab', roster:'leadFabs', est:10, grp:'shop'},
  {id:'othshop',   name:'Other (Shop)',  freeText:true, est:3, grp:'shop'},
  /* 4 · METAL SHOP */
  {id:'metal',     name:'Metal Shop',    est:5, grp:'metal'},
  /* 5 · UNIT 7 — runs parallel to Main Shop Fab. softgoods and electrical keep their ids
     so existing SharePoint rows carry over untouched; only their group changed. */
  {id:'softgoods', name:'Soft Goods',    est:5, grp:'unit7'},
  {id:'vinyl',     name:'Vinyl Application', est:3, grp:'unit7'},
  {id:'electrical',name:'Electrical',    est:5, grp:'unit7'},
  {id:'othunit7',  name:'Other (Unit 7)', freeText:true, est:3, grp:'unit7'},
  /* 4 · FINISHING — legacy id 'finish' kept so existing SharePoint tasks migrate cleanly */
  {id:'prefinish', name:'Pre-Finishing', est:3, grp:'finish'},
  {id:'finish',    name:'Painting',      est:5, grp:'finish'},
  {id:'othfinish', name:'Other (Finishing)', freeText:true, est:3, grp:'finish'},
  /* 5 · INSTALLATION */
  {id:'install',   name:'Installation',  est:2, grp:'install'},
  {id:'shipping',  name:'Shipping',      est:2, grp:'install'}, /* v1.20.6: the other way a job ends — one or both */
  /* 6 · LOGISTICS — its own department (owner ask 09-02, v1.10.0) */
  {id:'logistics', name:'Logistics',     est:2, grp:'logi'},
];
const DEPT_IDX=Object.fromEntries(DEPTS.map((d,i)=>[d.id,i]));
const deptById=id=>DEPTS[DEPT_IDX[id]];
const isEndDept=id=>id==='install'||id==='shipping';
/* v1.26.0 (tracker #15, #20): a project's due date is the end of its Installation block
   (the latest end if there are several), else the end of its Shipping block, else none.
   The Setup "install date" (p.deadline) only anchors the first layout of a new job; it is
   no longer shown on a saved project or read for lateness, so a job with neither block has
   no due date and is never late. One rule for the sidebar chip, the chart drop-line, the
   header strip, the tooltip, the PM late prompt, the Meeting Sheet and the Due-date sort. */
function dueOf(tasks){
  for(const k of ['install','shipping']){
    let d='';
    for(const t of (tasks||[]))if(t.department===k&&t.endDate&&t.endDate>d)d=t.endDate;
    if(d)return{d,k};
  }
  return null;
}
const FAB_GRPS=['dfab','shop','metal','unit7','finish','install'];
/* A project's status: the one it was given, or, for "auto" (the default), the one its phases
   say — complete once its last install or shipping block has ended, fabrication once a
   fabrication-group phase has started, design once a design phase has, else estimating.
   ts = the project's phases, t = today at midnight. Timeline's _projStatus() until item 86. */
function statusOf(p,ts,t){
  if(p.status&&p.status!=='auto')return STATUS_MIGRATE[p.status]||p.status;
  const ends=ts.filter(x=>isEndDept(x.department)).map(x=>parseDate(x.endDate).getTime());
  if(ends.length&&t.getTime()>Math.max(...ends))return 'complete';
  const started=g=>{
    const m=ts.filter(x=>{const d=deptById(x.department);return d&&g.includes(d.grp);});
    return m.length&&t.getTime()>=Math.min(...m.map(x=>parseDate(x.startDate).getTime()));
  };
  if(started(FAB_GRPS))return 'in-fabrication';
  if(started(['tdg']))return 'in-design';
  return 'estimating';
}
const STATUS_LBL={'forecast':'Forecast','estimating':'Estimating','in-design':'Design','in-fabrication':'Fabrication','on-hold':'On Hold','complete':'Complete'};
/* Retired statuses -> where they land. Applied once on load, in migrate(). */
const STATUS_MIGRATE={'approved':'in-fabrication','in-production':'in-fabrication','installing':'in-fabrication','invoiced':'complete','called-off':'complete'};
function fieldsToProj(f){return{id:f.appId,name:f.Title||'',client:f.client||'',jobCode:f.jobCode||'',deadline:isoDay(f.deadline),status:f.status||'auto',projectManager:f.projectManager||'',drafter:f.drafter||'',leadFab:f.leadFab||'',fabricators:f.fabricators||'',activeDepartments:safeArr(f.activeDepartments),sortIndex:f.sortIndex==null?null:Number(f.sortIndex),createdAt:isoDay(f.createdAt),
  ...(f.confirmedAt?{confirmedAt:String(f.confirmedAt),confirmedBy:String(f.confirmedBy||'')}:{})};} /* v1.48.0 (item 6): "Schedule still accurate", read only when set; projToFields never writes it — only ppConfirmSchedule does */
function fieldsToTask(f){const a=(isEndDept(f.department)&&typeof f.assignee==='string'&&f.assignee.trim().startsWith('['))?safeArr(f.assignee):(f.assignee||'');return{id:f.appId,projectId:f.projectId,department:f.department,assignee:a,startDate:isoDay(f.startDate),endDate:isoDay(f.endDate),estimatedDays:Number(f.estimatedDays)||1,ticketNodes:safeArr(f.ticketNodes),notes:f.notes||'',pinned:!!f.pinned,label:f.label||'',...(f.range?{range:true}:{})};} /* v1.32.0 (#16): tristate on the read side too — a loaded non-range row keeps its pre-v1.32.0 shape, so stripStamps() still matches a row created in this session and the poll never wipes the undo stack over it */
function flagTruthy(v){return v===true||v===1||/^(1|yes|true)$/i.test(String(v||''));}
/* v1.8.0: the admin column's three values — '1' admin, 'dev' admin and developer, empty no —
   and null when the row never carried the column (tristate, see flagTruthy). */
function adminFlag(v){return v==null?null:(flagTruthy(v)||/^dev/i.test(String(v)));}
/* REV66: the identity chain — who is the signed-in user on a staff list? Login email against
   the row's email first, display name second. Null when unresolved. (Timeline's meName().) */
function staffMe(people){
  const w=store.who();
  if(!w)return null;
  const em=w.email.trim().toLowerCase();
  let p=em?people.find(x=>String(x.email||'').trim().toLowerCase()===em):null;
  if(!p){const nm=w.name.trim().toLowerCase();
    if(nm)p=people.find(x=>x.name.trim().toLowerCase()===nm);}
  return p||null;
}
/* v1.8.0 (§3 item 12): admin vs regular users. The staff list's admin column is the switch:
   while NO roster row carries a value (column absent / legacy data), everyone is admin.
   Once any row carries a value, only truthy rows are admins; everyone else (unmatched
   sign-ins included) is a viewer. UI gating is workflow protection, NOT security — every
   signed-in token still carries Sites.ReadWrite.All. */
function rosterAdmin(people){
  if(!people.length||people.every(p=>p.admin==null))return true;
  const p=staffMe(people);
  return !!(p&&p.admin);
}
/* REV69 (N3): a Clients list row. Title is the client's name, field_2 its 2–3 letter
   cost-code alias; rows carry no appId, so a client is keyed on its SharePoint item id. */
function clientFromItem(it){return{spId:it.id,name:it.fields.Title||'',alias:it.fields.field_2||''};}
async function readConfig(){
  const raw={},ids={};
  for(const it of await store.list('config')){raw[it.fields.Title]=String(it.fields.value||'');ids[it.fields.Title]=it.id;}
  return{raw,ids};
}

/* ===================== PEOPLE RULES (item 87) ===================== */
/* Moved word for word out of timeline/index.html when the People app became the second
   product to read and write ShopTimeline_Staff: the dates and holidays time off is read by,
   the department groups, a phase's crew and the project roles, the people-department ids,
   and the Staff record's reader and writer. */
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r;}
function fmtNice(s){return parseDate(s).toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
const HOL_CACHE={},HOL_NAMES={};
function observed(d){const w=d.getDay();if(w===6)return addDays(d,-1);if(w===0)return addDays(d,1);return d;}
function nthDow(y,m,dow,n){const d=new Date(y,m,1);let c=0;while(true){if(d.getDay()===dow){c++;if(c===n)return new Date(d);}d.setDate(d.getDate()+1);}}
function lastDow(y,m,dow){const d=new Date(y,m+1,0);while(d.getDay()!==dow)d.setDate(d.getDate()-1);return new Date(d);}
function holidaysFor(y){
  if(HOL_CACHE[y])return HOL_CACHE[y];
  const s=new Set(),names=HOL_NAMES[y]={};
  const add=(d,nm)=>{s.add(fmtDate(d));names[fmtDate(d)]=nm;};
  /* REV90: observed New Year can land in the neighbouring year (Jan 1 on a Saturday
     observes Fri Dec 31 of y-1; on a Sunday, Mon Jan 2). isWorking(d) looks up
     d's OWN year, so each year's set must carry only dates inside that year —
     including next year's New Year when it observes back into this December. */
  const d1=observed(new Date(y,0,1));if(d1.getFullYear()===y)add(d1,"New Year's Day");
  const d2=observed(new Date(y+1,0,1));if(d2.getFullYear()===y)add(d2,"New Year's Day");
  add(lastDow(y,4,1),'Memorial Day');
  add(observed(new Date(y,6,4)),'Independence Day');
  add(nthDow(y,8,1,1),'Labor Day');
  add(nthDow(y,10,4,4),'Thanksgiving');
  add(observed(new Date(y,11,25)),'Christmas');
  HOL_CACHE[y]=s;return s;
}
function holidayName(d){const y=d.getFullYear();holidaysFor(y);return (HOL_NAMES[y]||{})[fmtDate(d)]||'';}
function isWorking(d){const w=d.getDay();if(w===0||w===6)return false;return !holidaysFor(d.getFullYear()).has(fmtDate(d));}
const GROUPS=[
  {id:'pmg',       label:'Project Management'},
  {id:'tdg',       label:'Technical Design'},
  {id:'dfab',      label:'Digital Fabrication'},
  {id:'shop',      label:'Main Shop Fab'},
  {id:'metal',     label:'Metal Shop'},
  {id:'unit7',     label:'Unit 7'},
  {id:'finish',    label:'Finishing'},
  {id:'install',   label:'Installation / Shipping'},
  {id:'logi',      label:'Logistics'},
];
const grpDepts=g=>DEPTS.filter(d=>d.grp===g).map(d=>d.id);
/* Roles are stored as comma-joined names ("Milo, Ines") so SharePoint columns stay plain text */
function roleList(v){return String(v||'').split(',').map(s=>s.trim()).filter(Boolean);}
function roleField(deptId){return deptId==='pm'?'projectManager':deptId==='td'?'drafter':deptId==='fab'?'leadFab':null;}
function roleListFor(p,deptId){const f=roleField(deptId);return f?roleList(p[f]):[];}
/* A bar's crew. Stored as an array (install), a JSON string (legacy install rows) or a
   comma-joined name list — the same convention roles use, so the shared SharePoint
   column stays readable in the colleague app. */
function crewOf(t){const a=t.assignee;if(Array.isArray(a))return a;if(typeof a==='string'&&a.trim().startsWith('['))return safeArr(a);return String(a||'').split(',').map(x=>x.trim()).filter(x=>x&&x!=='Installation');}
/* v1.10.0 (owner ask 09-02): a person's departments are the COMPREHENSIVE department list —
   derived from the same DEPTS the phase picker uses, so the two can never drift. Free-text
   "Other" buckets aren't departments a person can belong to.
   v1.14.0 (owner 09-02 PM): a PERSON's department is coarser than a phase's — the
   machine-level Digital Fab depts read as ONE "DFAB", Pre-Finishing + Painting as
   ONE "Finishing". pdCanon folds legacy stored ids into the canonical people ids;
   PHASE departments (DEPTS) are untouched — shared task rows keep their ids. */
const PD_ALIAS={shipping:'install',cnc:'dfab',beamsaw:'dfab','3dprint':'dfab',laser:'dfab',print:'dfab',prefinish:'finish'};
const pdCanon=id=>PD_ALIAS[id]||id;
const PD_LBL={dfab:'DFAB',finish:'Finishing'};
const SM_DEPTS=(()=>{const seen=new Set(),out=[];
  for(const d of DEPTS){if(d.freeText)continue;const id=pdCanon(d.id);
    if(seen.has(id))continue;seen.add(id);out.push([id,PD_LBL[id]||d.name]);}
  return out;})();
/* v1.22.0: a person's weekly schedule, {days:[getDay ints], start:'HH:MM', end:'HH:MM'}, stored as
   JSON in the `schedule` staff column; showing and editing it is the People app's. */
function schedSafe(s){if(s&&typeof s==='object')return s;try{const o=JSON.parse(s);return o&&typeof o==='object'?{days:safeArr(o.days),start:o.start||'',end:o.end||''}:{days:[],start:'',end:''};}catch(e){return{days:[],start:'',end:''};}}
/* v1.43.0 (item 9c, owner 2026-10-08): one phone format everywhere, 555-555-5555. Ten digits
   (or eleven with a leading 1), written with any mix of spaces, dots, dashes or brackets,
   become the hyphenated form; anything else (a foreign number, text) stays exactly as typed. */
function fmtPhone(v){const s=String(v||'').trim(),d=s.replace(/\D/g,''),n=d.length===11&&d[0]==='1'?d.slice(1):d;
  return n.length===10&&/^[\d\s().+-]+$/.test(s)?n.slice(0,3)+'-'+n.slice(3,6)+'-'+n.slice(6):s;}
/* Item 61: the optional Staff columns, in write order. Each is tristate: omitted until the row
   carries it (null), so a site without the column never 400s. text = as typed; flag = '1'/'';
   json = JSON text. admin also carries developer ('dev'). */
const PERSON_COLS=[
  ['ext','text'],              /* v1.43.0 (item 9): Office Extension — its own field, never part of the phone number; typed by hand, Employee Contacts has none */
  ['admin','admin'],           /* v1.8.0: '1' admin, 'dev' admin + developer */
  ['feedbackRecipient','flag'],
  ['personalNotes','text'],    /* v1.9.0 (item 30) */
  ['status','text'],           /* v1.13.0: lifecycle, vocabulary = Employee Contacts' Status (Active/Off Payroll/Terminated/Archived) */
  ['nickname','text'],         /* v1.15.0: how the name reads everywhere (display only) */
  ['driver','flag'],           /* v1.17.0: drives for the company */
  ['availability','text'],     /* v1.18.0: manual available/unavailable (freelancers); OOO ranges override */
  ['schedule','json'],         /* v1.22.0: weekly hours {days:[getDay ints],start:'HH:MM',end:'HH:MM'} */
  ['freelance','flag'],        /* v1.23.0: freelancer — no set weekly schedule */
  ['listeningTo','text'],['listeningLink','text'],['listeningVerb','text'],['listeningShow','flag'] /* v1.12.0 (item 30): the "Listening to" quartet */
];
function personToFields(p){const f={Title:p.name||'',depts:JSON.stringify(p.depts||[]),ooo:JSON.stringify(p.ooo||[]),email:p.email||'',phone:p.phone||'',role:p.role||'',appId:p.id};
  for(const[k,t]of PERSON_COLS){const v=p[k];if(v==null)continue;
    f[k]=t==='flag'?(v?'1':''):t==='json'?JSON.stringify(v):t==='admin'?((p.developer&&v)?'dev':(v?'1':'')):v;}
  return f;}
function fieldsToPerson(f){const p={id:f.appId,name:f.Title||'',depts:safeArr(f.depts),ooo:safeArr(f.ooo),email:f.email||'',phone:fmtPhone(f.phone),role:f.role||''}; /* v1.43.0 (9c): stored numbers read in the one format; the row is rewritten the next time it's saved */
  for(const[k,t]of PERSON_COLS){const v=f[k];
    if(t==='admin'){p.admin=adminFlag(v);p.developer=v!=null&&/^dev/i.test(String(v));continue;}
    p[k]=v==null?null:t==='flag'?flagTruthy(v):t==='json'?schedSafe(v):String(v);}
  return p;}

/* ===================== UPDATE CHECK ===================== */
/* GitHub Pages serves index.html with max-age=600, which the page's no-cache metas don't
   override, so an open tab ran an old build until someone happened to reload it. Every
   12 h, and when the tab comes back into view (at most once per 30 min), the app GETs
   its own index.html with cache:'no-store', reads the APP_VER in it and re-reads
   ShopTimeline_Config. Newer build → a toast with Reload that stays until acted on.
   Config key update.minVersion (the owner's lever: App settings ▸ "Ask everyone to
   reload", or the list item) newer than the running build → a "retired" notice that
   reloads by itself after UPD_GRACE seconds, never mid-drag, mid-save or over an unsaved
   draft. Never tied to the 90 s data poll: this is one document GET, not Graph.
   ponytail: retire holds until the served build satisfies minVersion — a minVersion set
   from /preview/ never loops production tabs through a reload that can't help.
   v1.56.0 (item 49): a tab opened before Timeline moved into timeline/ still checks the
   root, which is now the Systems page. That page names v1.56.0 in a comment, so those
   tabs are offered the reload, and its forward sends their #/… route on to timeline/. */
const UPD_MS=12*3600e3,UPD_FOCUS_MS=30*60e3;
let UPD_GRACE=30,UPD_LAST=Date.now(),UPD_SHOWN='',UPD_RETIRE=null;
/* Item 86 (85 b): the Config list's raw values and row ids, read with the rest at load by the
   product and re-read here (update.minVersion). */
let SP_CFG_IDS={};
let CFG_RAW={}; /* v1.33.0: every key's value as text, for string keys (update.minVersion) */
/* Tolerates a hand-typed "v1.34.0" on the list (a NaN part would otherwise read as equal). */
function verCmp(a,b){const p=s=>String(s).trim().replace(/^v/i,'').split('.').map(Number);const x=p(a),y=p(b);for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d;}return 0;}
/* One toast per purpose (id) with its own button label; it stays until acted on unless
   ttl is given. Same strip and controls as toast() — Design-Language §6. */
function updToast(id,msg,label,fn,kind,ttl){
  const box=document.getElementById('toasts');
  let el=document.getElementById(id);
  if(!el){el=document.createElement('div');el.id=id;box.appendChild(el);}
  el.className='toast'+(kind==='err'?' err':'');el.textContent=msg;
  const gone=()=>{el.remove();toastLayout();};
  const b=document.createElement('button');b.className='undo';b.textContent=label;b.addEventListener('click',()=>{if(fn()!==false)gone();});el.appendChild(b); /* a refused reload keeps the toast */
  const x=document.createElement('button');x.className='toast-x';x.textContent='×';x.title='Dismiss';x.setAttribute('aria-label','Dismiss');
  x.addEventListener('click',gone);el.appendChild(x);
  if(ttl)setTimeout(()=>{if(el.isConnected){el.classList.add('out');setTimeout(gone,350);}},ttl);
  toastLayout();if(typeof toastPlace==='function')toastPlace();
  return el;
}
function updReload(){
  const why=updWhyNot();
  if(why){toast('Not reloaded: '+why+'.','err');return false;}
  updGo();
}
let UPD_RETRY=null;
async function updCheck(force){
  if(!force&&Date.now()-UPD_LAST<UPD_FOCUS_MS)return;
  /* Busy: don't even look. One retry a minute later (a single timer, however many
     focus events arrive), so a release lands once the person is done. */
  if(updBusy()){if(!UPD_RETRY)UPD_RETRY=setTimeout(()=>{UPD_RETRY=null;updCheck(true);},60e3);return;}
  UPD_LAST=Date.now();
  let latest='';
  try{
    const r=await fetch(location.pathname+'?v='+Date.now(),{cache:'no-store'});
    const m=/APP_VER\s*=\s*'(\d[^']*)'/.exec(await r.text());if(m)latest=m[1];
  }catch(e){}
  /* Refresh only the raw values (minVersion) — never loadConfig(): a blip here must not
     flip CFG_OK or overwrite the grants, which stay read-at-load by design. */
  if(store.who())try{
    const c=await readConfig();Object.assign(SP_CFG_IDS,c.ids);CFG_RAW=c.raw;
  }catch(e){}
  updApply(latest);
}
function updApply(latest){
  const min=CFG_RAW['update.minVersion']||'';
  if(min&&verCmp(APP_VER,min)<0&&latest&&verCmp(latest,min)>=0)return updRetire();
  if(latest&&verCmp(latest,APP_VER)>0&&UPD_SHOWN!==latest){UPD_SHOWN=latest;
    const el=updToast('upd-toast','v'+latest+' is available','Reload',updReload);
    /* × only snoozes it: the next check (30 min focus / 12 h) offers again. */
    el.querySelector('.toast-x').addEventListener('click',()=>{UPD_SHOWN='';});}
}
function updRetire(){
  if(UPD_RETIRE)return;
  let left=UPD_GRACE;
  const txt=()=>'This version has been retired — reloading in '+left+' s';
  const el=updToast('upd-toast',txt(),'Reload now',updReload,'err');
  el.querySelector('.toast-x').remove(); /* not dismissable: the reload is the way out */
  UPD_RETIRE=setInterval(()=>{
    if(updBusy())return; /* hold the countdown while someone is mid-edit */
    if(el.nextElementSibling){el.parentNode.appendChild(el);toastLayout();} /* stay newest: never hidden behind later toasts */
    left=Math.max(0,left-1);el.firstChild.nodeValue=left?txt():'This version has been retired — reloading now';
    if(left<=0&&updReload()!==false)clearInterval(UPD_RETIRE); /* a refused reload keeps trying each second */
  },1000);
}
/* Item 86: start watching. A build that boots already retired (served from the 10-minute
   Pages cache after the lever was pulled) probes at once; then every 12 h, and on coming back
   to the tab. A product calls it once, after its first load. */
function updWatch(){
  if(CFG_RAW['update.minVersion']&&verCmp(APP_VER,CFG_RAW['update.minVersion'])<0)updCheck(true);
  setInterval(()=>updCheck(true),UPD_MS);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updCheck();});
}

/* ===================== THE SYSTEMS SHELL ===================== */
/* Item 52 step 4 (v1.57.0): the Systems products, in the Systems page's order. href is from
   the site root; no href = not built yet, shown greyed (owner, 2026-11-18: all four listed).
   Keep it in step with the Systems page's cards (test-v1570 checks).
   Item 86 (v1.58.0): Clients is its own app; People shows greyed until it is too (launch 2),
   so nothing here points into Timeline's pages (owner, 2026-11-18: "In Timeline for now").
   Item 94 (v1.61.0): Clients became Office (owner, 2026-11-19), at office/.
   Item 99 (v1.61.1): Office before People (owner, 2026-11-19: "swap the order of these").
   Item 87 (v1.62.0): People is its own app, at people/. */
const SYSTEMS_APPS=[
  {name:'Timeline',href:'timeline/'},
  {name:'Office',href:'office/',note:'admins only'},
  {name:'People',href:'people/'}];
/* Fill a product's Apps menu: the product you're in ticked, the others as links, the unbuilt
   ones greyed. up = the way from this page to the site root ('../' for a product folder). */
function appsMenu(el,current,up){
  el.innerHTML=SYSTEMS_APPS.map(a=>{
    const note=a.note?'<span class="ts-apps-note">'+a.note+'</span>':'';
    return a.name===current
      ?'<span class="ts-apps-item cur" data-app="'+a.name+'" aria-current="page">'+a.name+'<span class="ts-apps-note">✓</span></span>'
      :a.href?'<a class="ts-apps-item" data-app="'+a.name+'" href="'+up+a.href+'">'+a.name+note+'</a>'
      :'<span class="ts-apps-item off" data-app="'+a.name+'" aria-disabled="true">'+a.name+note+'</span>';
  }).join('');
}
