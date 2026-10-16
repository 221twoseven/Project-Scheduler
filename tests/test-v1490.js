/* v1.49.0 — TODO item 3 / tracker #7: the tour's 6 <-> 7 loop, and "Don't show again".
   - Root cause: on step 7 (the + New Project hand-off) Next was hidden, which left Back in
     the card's forward corner — a user clicking onward went 7 -> 6 -> 7 -> 6. Next now
     stays and presses + New Project (as Enter already did).
   - A step whose target is gone is skipped in the direction of travel, never bounced back.
   - Enter on a focused Next advances exactly one step.
   - "Don't show again" ends the tour and writes a per-person ShopTimeline_Config row
     (tour.off.<account>) so the first-visit auto-run never starts again on any machine;
     Help still runs it. No Config list: quiet, this browser's seen flag only.
   Run: node tests/test-v1490.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const projects=[{appId:'p1',Title:'Alpha',client:'Acme',jobCode:'J1',deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',
  startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const KEY='tour.off.user@example.com';

/* Walk a running tour by clicking Next until it ends; returns the STEP labels seen. */
async function walk(win){
  const E=s=>win.eval(s),seen=[];
  for(let n=0;n<40&&E('COACH!==null');n++){
    seen.push(win.document.getElementById('coach-step').textContent);
    const chain=E('COACH.steps[COACH.i].chain===true');
    win.document.getElementById('coach-next').click();
    if(chain){win.dispatchEvent(new win.Event('hashchange'));await sleep(700);}
  }
  return seen;
}
const inOrder=(seen,total)=>seen.length===total&&seen.every((s,i)=>s==='STEP '+(i+1)+' OF '+total);

(async()=>{
  /* ---------- A: the home tour, chained into the draft ---------- */
  const a=boot(FILE,{data:{projects,tasks,todos:[]}});
  const win=a.window,doc=win.document,E=s=>win.eval(s);
  await sleep(1300);

  sec('R1 the chain step keeps a forward button');
  ok('no CSS hides Next on the chain step', !/#coach\.chain #coach-next\{display:none\}/.test(src));
  E('coachStart();COACH.i=COACH.steps.length-1;coachShow();');
  ok('step 7 is the chain step and Next reads "Next", not "Done"',
     E('COACH.steps[COACH.i].chain')===true&&doc.getElementById('coach-next').textContent==='Next');
  ok('…and it is displayed', win.getComputedStyle(doc.getElementById('coach-next')).display!=='none');
  ok('Next sits after Back, so the forward corner is forward',
     [...doc.querySelectorAll('#coach-card .coach-btns button')].map(b=>b.id).join(',')==='coach-skip,coach-off,coach-back,coach-next');
  E('coachEnd()');

  sec('R1 every step walks forward once, no step repeating (no project open)');
  E('tourStart()');
  const homeTotal=E('COACH.total');
  let seen=await walk(win);
  ok('the home tour chains into the draft and runs 1..'+homeTotal+' in order', inOrder(seen,homeTotal), seen.join(' / '));
  ok('it ends on the draft project page', E('ROUTE.view')==='project'&&E('ROUTE.creating')===true&&E('COACH===null'));

  sec('R1 the same with a draft project open');
  E('tourStart()');
  const draftTotal=E('COACH.total');
  ok('the draft tour shows the Create step, not the autosave one',
     E("COACH.steps.some(s=>s.sel==='#pp-save')&&!COACH.steps.some(s=>s.sel==='.pg-auto')"));
  seen=await walk(win);
  ok('the draft tour runs 1..'+draftTotal+' in order', inOrder(seen,draftTotal), seen.join(' / '));

  sec('R1 …and on a saved project');
  win.location.hash='#/project/p1';win.dispatchEvent(new win.Event('hashchange'));await sleep(300);
  E('tourStart()');
  const savedTotal=E('COACH.total');
  ok('the saved tour shows the autosave step', E("COACH.steps.some(s=>s.sel==='.pg-auto')"));
  seen=await walk(win);
  ok('the saved tour runs 1..'+savedTotal+' in order', inOrder(seen,savedTotal), seen.join(' / '));
  win.location.hash='#/';win.dispatchEvent(new win.Event('hashchange'));await sleep(300);

  sec('R2 a missing target is skipped, never bounced back');
  doc.body.insertAdjacentHTML('beforeend','<i id="tmp-a"></i><i id="tmp-b"></i>');
  const steps="[{sel:'#sidebar',t:'one',b:''},{sel:'#tmp-a',t:'two',b:''},{sel:'#tmp-b',t:'three',b:''},{sel:'#t-search',t:'four',b:''}]";
  E('coachStart('+steps+')');
  ok('all four steps start live', E('COACH.steps.length')===4);
  doc.getElementById('tmp-a').remove();
  doc.getElementById('coach-next').click();
  ok('Next past a vanished target lands on the step after it',
     doc.getElementById('coach-title').textContent==='three'&&doc.getElementById('coach-step').textContent==='STEP 2 OF 3');
  doc.getElementById('coach-next').click();
  doc.getElementById('tmp-b').remove();
  doc.getElementById('coach-back').click();
  ok('Back past a vanished target lands on the step before it',
     doc.getElementById('coach-title').textContent==='one'&&E('COACH.i')===0);
  E('coachEnd()');
  E("coachStart([{sel:'#sidebar',t:'one',b:''},{sel:'#gone-x',t:'x',b:''}])");
  ok('a step missing at start is dropped up front', E('COACH.steps.length')===1);
  E('coachEnd()');
  doc.body.insertAdjacentHTML('beforeend','<i id="tmp-c"></i>');
  E("coachStart([{sel:'#sidebar',t:'one',b:''},{sel:'#tmp-c',t:'last',b:''}])");
  doc.getElementById('tmp-c').remove();
  let threw=false;try{doc.getElementById('coach-next').click();}catch(e){threw=true;}
  ok('a vanished LAST target ends the tour cleanly', !threw&&E('COACH===null'));
  ok('the hidden-element fallback is for layout-less pages only (coachEl)',
     /document\.body\.getClientRects\(\)\.length\?null:els\[0\]/.test(src));

  sec('R3 Enter on a focused Next advances exactly one step');
  E('coachStart();COACH.i=4;coachShow();');
  const nx=doc.getElementById('coach-next');nx.focus();
  /* a browser activates a focused button on Enter unless keydown is cancelled — model it */
  const enter=()=>{const ev=new win.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});
    const el=doc.activeElement||doc.body;el.dispatchEvent(ev);
    if(!ev.defaultPrevented&&el.tagName==='BUTTON')el.click();return ev;};
  const ev=enter();
  ok('one Enter = one step (5 -> 6)', E('COACH.i')===5, String(E('COACH.i')));
  ok('the keydown is cancelled, so the button never also clicks', ev.defaultPrevented===true);
  enter();
  ok('Enter on step 6 reaches step 7', E('COACH.i')===6&&E('COACH.steps[COACH.i].chain')===true);
  enter();win.dispatchEvent(new win.Event('hashchange'));await sleep(700);
  ok('Enter on the chain step opens the draft tour at step 8 (once)',
     E('COACH!==null')&&doc.getElementById('coach-step').textContent.indexOf('STEP '+(E('COACH_STEPS.length')+1)+' OF')===0);
  E('coachEnd()');
  ok('the 700 ms auto-run never restarts a tour already up',
     /setTimeout\(\(\)=>\{if\(!COACH&&ROUTE\.view==='timeline'\)coachStart\(\);\},700\)/.test(src));
  win.location.hash='#/';win.dispatchEvent(new win.Event('hashchange'));await sleep(300);

  sec("R4 Don't show again");
  ok('the button reads exactly "Don\'t show again"', doc.getElementById('coach-off').textContent==="Don't show again");
  E('tourStart()');
  const before=win.__spCalls.length;
  doc.getElementById('coach-off').click();
  await sleep(50);
  const post=win.__spCalls.slice(before).find(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Config'));
  ok('it ends the tour', E('COACH===null')&&doc.getElementById('coach').classList.contains('hidden'));
  ok('it writes the per-person Config row', !!post&&post.body.fields.Title===KEY&&post.body.fields.value==='1',
     post?JSON.stringify(post.body):'no POST');
  doc.getElementById('coach-off').click(); /* hidden, but a second press must not write twice */
  await sleep(50);
  ok('a second press writes nothing more',
     win.__spCalls.slice(before).filter(c=>c.url.includes('ShopTimeline_Config')&&c.method!=='GET').length===1);
  doc.getElementById('mi-tour').click();
  ok('Help ▸ Take a tour still runs it', E('COACH!==null'));
  E('coachEnd()');

  sec("R4 the key never shows on App Settings");
  E("PEOPLE.length=0;PEOPLE.push({id:'s1',name:'Sam',email:'user@example.com',depts:['pm'],ooo:[],admin:true,developer:true});");
  win.location.hash='#/settings';win.dispatchEvent(new win.Event('hashchange'));await sleep(300);
  ok('App settings renders and lists no tour.off key',
     E('ROUTE.view')==='settings'&&doc.getElementById('page').textContent.indexOf('App settings')>=0
     &&doc.getElementById('page').innerHTML.indexOf('tour.off')<0);

  sec('R4 no Config list: quiet, this browser only');
  win.location.hash='#/';win.dispatchEvent(new win.Event('hashchange'));await sleep(300);
  E("CFG_OK=false;delete CFG_RAW['"+KEY+"'];localStorage.removeItem(COACH_KEY);");
  const toastsBefore=doc.getElementById('toasts').querySelectorAll('.err').length,callsBefore=win.__spCalls.length;
  E('tourStart()');doc.getElementById('coach-off').click();await sleep(50);
  ok('no error toast', doc.getElementById('toasts').querySelectorAll('.err').length===toastsBefore);
  ok('no Config write', !win.__spCalls.slice(callsBefore).some(c=>c.url.includes('ShopTimeline_Config')));
  ok("this browser's seen flag is set", E('localStorage.getItem(COACH_KEY)')==='1');

  /* ---------- B: a fresh browser for the same person ---------- */
  sec('R4 a fresh browser: the Config row suppresses the auto-run');
  const b=boot(FILE,{coachFirstRun:true,data:{projects,tasks,todos:[],config:[{Title:KEY,value:'1'}]}});
  const c=boot(FILE,{coachFirstRun:true,data:{projects,tasks,todos:[],config:[{Title:'tour.off.someone@example.com',value:'1'}]}});
  await sleep(1500);
  ok('with the row: localStorage is fresh, yet no tour', b.window.eval('localStorage.getItem(COACH_KEY)')===null&&b.window.eval('COACH===null'));
  ok("someone else's row doesn't stop yours", c.window.eval('COACH!==null'));
  b.window.document.getElementById('mi-tour').click();
  ok('Help still starts it there', b.window.eval('COACH!==null'));

  /* ---------- C: a viewer ---------- */
  sec('R4 a viewer can use it');
  const staff=[{appId:'s1',Title:'Sam',depts:'["pm"]',ooo:'[]',email:'user@example.com',role:'',admin:''},
               {appId:'s2',Title:'Kim',depts:'["pm"]',ooo:'[]',email:'kim@example.com',role:'',admin:'1'}];
  const v=boot(FILE,{coachFirstRun:true,data:{projects,tasks,todos:[],staff}});
  await sleep(1500);
  const V=s=>v.window.eval(s);
  ok('the viewer gets the auto-run, without the chain step', V('isViewer()')&&V('COACH!==null')&&!V('COACH.steps.some(s=>s.chain)'));
  const vb=v.window.__spCalls.length;let vthrew=false;
  try{v.window.document.getElementById('coach-off').click();}catch(e){vthrew=true;}
  await sleep(50);
  ok('Don\'t show again works for them too', !vthrew&&V('COACH===null')
     &&v.window.__spCalls.slice(vb).some(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Config')&&c.body.fields.Title===KEY));

  done();
})();
