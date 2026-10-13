/* v1.47.3 — the 2026-10-13 whole-release review (main v1.45.1 → v1.47.2), two fixes:
   (1) shared computer: the previous person's Protect dates reset even when the next person's staff list
       lands on a New Project page (updBusy() used to skip the reset but still wipe the cache, leaving it on
       for the session); only a drag in flight waits;
   (2) a New Project draft opened before the roster arrived repaints its footer when the staff list loads,
       so the Project Manager rule is counted and listed.
   Run: node tests/test-v1473.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('v1.47.3: the switch resets even on a New Project page')<0){
  console.log('  SKIP  test-v1473: pre-v1.47.3 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
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

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
})();
