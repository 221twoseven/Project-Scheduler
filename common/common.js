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
  staff:LIST_STAFF, client:LIST_CLIENTS, config:LIST_CONFIG, changelog:LIST_CHANGELOG,
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

/* ===================== THE SYSTEMS SHELL ===================== */
/* Item 52 step 4 (v1.57.0): the Systems products, in the Systems page's order. href is from
   the site root; no href = not built yet, shown greyed (owner, 2026-11-18: all four listed).
   Keep it in step with the Systems page's cards (test-v1570 checks). */
const SYSTEMS_APPS=[
  {name:'Timeline',href:'timeline/'},
  {name:'People',href:'timeline/#/people'},
  {name:'Clients',href:'timeline/#/clients',note:'admins only'},
  {name:'Office',note:'Not built yet'}];
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
