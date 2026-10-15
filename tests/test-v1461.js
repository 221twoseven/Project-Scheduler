/* v1.46.1 — TODO item 2 (c): Protect dates is remembered for the person, not the browser tab. It rides
   in the signed-in user's own `savedViews` value beside the views ({views:[…],protectDates:bool}), with a
   browser cache (shopTimelineProtect) and the same shared-computer owner rule as item 25. Viewers stay
   forced on.
   Run: node tests/test-v1461.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]'};
const VK='shopTimelineViews_v1',PK='shopTimelineProtect',OK_='shopTimelineViewsOwner';
const crunch=[{name:'Install crunch',state:{}}];
const rowPatches=w=>w.__spCalls.filter(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&'savedViews' in c.body);
const lastRow=w=>{const p=rowPatches(w);return p.length?JSON.parse(p[p.length-1].body.savedViews):null;};

function start(row,ls,extra){
  const staff=[{...SAM,...(extra||{}),...(row?{savedViews:JSON.stringify(row)}:{})}];
  return boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]},localStorage:ls||{}}).window;
}
const ck=w=>w.document.getElementById('lock-ck');
function toggle(w,on){const c=ck(w);c.checked=on;c.dispatchEvent(new w.Event('change',{bubbles:true}));}

(async()=>{
  sec('turning it on is remembered on the row, beside the views');
  {const w=start({views:crunch});await wait(1500);
    ok('starts off',!w.eval('DATE_LOCK'));
    toggle(w,true);await wait(50);
    const r=lastRow(w);
    ok('one row write',rowPatches(w).length===1);
    ok('it carries protectDates:true',r&&r.protectDates===true);
    ok('and keeps the views (the row never loses the other half)',r&&Array.isArray(r.views)&&r.views[0].name==='Install crunch');
    ok('the browser cache holds it',w.localStorage.getItem(PK)==='1');
  }

  sec('a new computer picks it up from the row');
  {const w=start({views:crunch,protectDates:true});await wait(1500);
    ok('Protect dates is on',w.eval('DATE_LOCK')===true);
    ok('the switch shows it',ck(w).checked);
    ok('the page carries the locked class',w.document.body.classList.contains('dates-locked'));
    ok('nothing written back',rowPatches(w).length===0);
  }

  sec('the browser cache applies at launch, before the row loads');
  {const w=start(null,{[PK]:'1',[OK_]:'s1'});
    ok('on from the first paint',w.eval('DATE_LOCK')===true);
    await wait(1500);
    const r=lastRow(w);
    ok('an empty row gets it moved up',r&&r.protectDates===true);
    ok('no views key invented (this browser holds none)',r&&!('views' in r));
  }

  sec('the row wins over this browser');
  {const w=start({protectDates:false},{[PK]:'1',[OK_]:'s1'});await wait(1500);
    ok('off, as the row says',w.eval('DATE_LOCK')===false&&!ck(w).checked);
    ok('the cache follows the row',w.localStorage.getItem(PK)==='0');
  }

  sec('a shared computer: someone else\'s setting is dropped');
  {const w=start(null,{[PK]:'1',[OK_]:'s2'});await wait(1500);
    ok('not copied to Sam\'s row',rowPatches(w).length===0);
    ok('and gone from the cache',w.localStorage.getItem(PK)===null);
    ok('and the switch Kim\'s cache set at launch is back off for Sam',w.eval('DATE_LOCK')===false&&!ck(w).checked);
  }

  sec('a view-only user stays forced on');
  {const w=start({protectDates:false},null,{admin:''}); /* a flag column with Sam off = Sam is view-only */
    await wait(1500);
    ok('Sam is view-only here',w.eval('isViewer()')===true);
    ok('the row\'s "off" never unlocks a viewer',w.eval('DATE_LOCK')===true&&ck(w).checked);
    toggle(w,false);await wait(50);
    ok('nor does the switch, and nothing is written',w.eval('DATE_LOCK')===true&&rowPatches(w).length===0);
  }

  done();
})();
