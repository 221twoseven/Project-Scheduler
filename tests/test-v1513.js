/* v1.51.3 — no more stacked login windows. Token renewal is silent-only (spToken never
   opens anything); an expiry heals through ssoSilent where the Microsoft session is still
   alive, and otherwise raises the in-page "Your sign-in expired" overlay, whose button is
   the ONE place an interactive login window opens (single-flighted). A save parked by the
   expiry replays after re-sign-in.
   Run: node tests/test-v1513.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const P={appId:'p1',Title:'Job p1',client:'Acme',jobCode:'A1',deadline:'2027-03-01',status:'auto',
  projectManager:'Theo',activeDepartments:'["td"]',createdAt:'2026-07-01',sortIndex:0};
const dom=boot(FILE,{data:{projects:[P],tasks:[],staff:[]}});
const win=dom.window,E=s=>win.eval(s);
const patches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Projects/')).length;
const overlayUp=()=>E("!document.getElementById('auth-overlay').classList.contains('hidden')");

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('the source');
  ok('nothing in the app can open a token popup',!/acquireTokenPopup/.test(src));
  ok('the poll sits out a signed-out tab',/if\(!store\.who\(\)\)return;/.test(src));

  sec('silent heal — an alive Microsoft session fixes an expired token invisibly');
  E("PCA.__sso=0;PCA.__login=0;"
   +"PCA.ssoSilent=async()=>{PCA.__sso++;return{account:{username:'user@example.com'}}};"
   +"PCA.loginPopup=async()=>{PCA.__login++;return{account:{username:'user@example.com'}}};"
   +"window.__fail=1;PCA.acquireTokenSilent=async()=>{if(window.__fail>0){window.__fail--;throw new Error('expired');}return{accessToken:'tok'}};");
  const before=patches();
  E("saveState({...ST,projects:ST.projects.map(p=>({...p,name:'Healed save'}))})");
  await wait(1200);
  ok('the save went out after the heal',patches()>before,String(patches()-before));
  ok('ssoSilent ran once',E('PCA.__sso')===1,String(E('PCA.__sso')));
  ok('no login window opened',E('PCA.__login')===0);
  ok('no overlay',!overlayUp());

  sec('real expiry — overlay, no windows, save parked');
  E("PCA.acquireTokenSilent=async()=>{throw new Error('expired')};"
   +"PCA.ssoSilent=async()=>{PCA.__sso++;throw new Error('no session')};");
  E("saveState({...ST,projects:ST.projects.map(p=>({...p,name:'Parked save'}))})");
  await wait(1200);
  ok('the sign-in expired overlay is up',overlayUp());
  ok('still no login window — only the button may open one',E('PCA.__login')===0);
  ok('the failed diff is parked for replay',!!E('PENDING_SYNC'));
  ok('the pill says why',/sign-in expired/.test(E("document.getElementById('sync-pill').textContent")));

  sec('the button — one window, overlay down, parked save replayed');
  const parked=patches();
  E("PCA.acquireTokenSilent=async()=>({accessToken:'tok'});"); /* fresh session after sign-in */
  E("document.getElementById('auth-signin').click()");
  await wait(1200);
  ok('exactly one login window',E('PCA.__login')===1,String(E('PCA.__login')));
  ok('the overlay is gone',!overlayUp());
  ok('the parked save went out',patches()>parked,String(patches()-parked));
  ok('nothing left parked',!E('PENDING_SYNC'));

  sec('single flight — concurrent sign-ins share one window');
  await E("Promise.all([spLogin(),spLogin(),spLogin()])");
  ok('three callers, one more window',E('PCA.__login')===2,String(E('PCA.__login')));
  done();
}
