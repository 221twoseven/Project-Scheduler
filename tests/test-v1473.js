/* v1.47.3 — the 2026-10-13 whole-release review (main v1.45.1 → v1.47.2), two fixes:
   (1) shared computer: the previous person's Protect dates reset even when the next person's staff list
       lands on a New Project page (updBusy() used to skip the reset but still wipe the cache, leaving it on
       for the session); only a drag in flight waits;
   (2) a New Project draft opened before the roster arrived repaints its footer when the staff list loads,
       so the Project Manager rule is counted and listed.
   Run: node tests/test-v1473.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]'};
const URL_NEW='https://example.github.io/shop-timeline/#/project/new';

(async()=>{
  sec('(1) shared computer, the next person lands on New Project');
  {const w=boot(FILE,{url:URL_NEW,data:{projects:[],tasks:[],staff:[SAM],todos:[]},
      localStorage:{shopTimelineProtect:'1',shopTimelineViewsOwner:'s2'}}).window;
    ok('the cache (Kim\'s) turned Protect dates on at launch',w.eval('DATE_LOCK')===true);
    await wait(1600);
    ok('Sam is on the New Project page (updBusy() is true there)',w.eval('ROUTE.creating')===true&&!!w.eval('updBusy()'));
    ok('Kim\'s Protect dates is off for Sam',w.eval('DATE_LOCK')===false&&!w.document.getElementById('lock-ck').checked);
    ok('her cached setting is gone',w.localStorage.getItem('shopTimelineProtect')===null);
    ok('the cache is now Sam\'s',w.localStorage.getItem('shopTimelineViewsOwner')==='s1');
  }
  {const w=boot(FILE,{data:{projects:[],tasks:[],staff:[SAM],todos:[]},
      localStorage:{shopTimelineProtect:'1',shopTimelineViewsOwner:'s2'}}).window;
    await wait(1600);
    w.eval("DATE_LOCK=true;localStorage.setItem('shopTimelineProtect','1');localStorage.setItem('shopTimelineViewsOwner','s2');DRAG={};viewsFromRow()");
    ok('a drag in flight waits: nothing changes mid-drag',w.eval('DATE_LOCK')===true&&w.localStorage.getItem('shopTimelineViewsOwner')==='s2');
    w.eval('DRAG=null;viewsFromRow()');
    ok('the next pass resets it',w.eval('DATE_LOCK')===false&&w.localStorage.getItem('shopTimelineViewsOwner')==='s1');
  }

  sec('(2) a draft opened before the roster arrives');
  {const w=boot(FILE,{url:URL_NEW,data:{projects:[],tasks:[],staff:[SAM],todos:[]}}).window;
    const needs=()=>w.document.getElementById('pp-needs');
    await wait(1600);
    ok('the roster has a Project Manager now',w.eval('(STAFF.projectManagers||[]).length')>0);
    ok('the footer counts three required fields',!!needs()&&/of 3 required/.test(needs().textContent),needs()&&needs().textContent);
    ok('and lists Project Manager',!!w.document.querySelector('.pp-need[data-need="pm"]'));
  }

  done();
})();
