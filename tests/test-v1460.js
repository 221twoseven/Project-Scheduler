/* v1.46.0 — TODO item 25 (owner ruling 2026-09-24): saved views follow the person, not the browser.
   The signed-in user's own ShopTimeline_Staff row holds them in `savedViews` (plain-text JSON
   {views:[…]}); this browser's shopTimelineViews_v1 copy is the cache. Writes are one-column PATCHes on
   that row only; a missing column (400) leaves views browser-local, as before.
   Run: node tests/test-v1460.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function viewsFromRow(')<0){
  console.log('  SKIP  test-v1460: pre-v1.46.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]'};
const KIM={appId:'s2',Title:'Kim',email:'kim@example.com',depts:'[]',ooo:'[]'};
const VK='shopTimelineViews_v1';
const crunch=[{name:'Install crunch',state:{lens:'dept',view:'week'},launch:true}];
const staffPatches=w=>w.__spCalls.filter(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff'));

/* boot with the staff row Sam carries; failCol = the list has no savedViews column */
function start(rowViews,local,failCol,owner){
  const staff=[{...SAM,...(rowViews?{savedViews:JSON.stringify({views:rowViews})}:{})},KIM];
  const ls=local?{[VK]:JSON.stringify(local)}:{};if(owner)ls.shopTimelineViewsOwner=owner;
  const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]},localStorage:ls});
  const w=dom.window;
  if(failCol){const f0=w.fetch;
    w.fetch=function(url,init){
      if(init&&init.method==='PATCH'&&String(url).includes('ShopTimeline_Staff')&&String(init.body).includes('savedViews')){
        w.__spCalls.push({url:String(url),init,body:JSON.parse(init.body),method:'PATCH'});
        return Promise.resolve({ok:false,status:400,json:async()=>({}),text:async()=>"Field 'savedViews' is not recognized"});}
      return f0.apply(this,arguments);};
  }
  return w;
}

(async()=>{
  sec('the first load after the release moves this browser\'s views up');
  {const w=start(null,crunch);await wait(1500);
    const p=staffPatches(w);
    ok('one PATCH, on the signed-in user\'s own row (sp0 = Sam)',p.length===1&&/\/items\/sp0\/fields$/.test(p[0].url),p.map(c=>c.url).join());
    ok('it writes savedViews only, never the rest of the row',p[0]&&Object.keys(p[0].body).join()==='savedViews',p[0]&&Object.keys(p[0].body).join());
    ok('the value is {views:[…]} holding the browser\'s views',p[0]&&JSON.parse(p[0].body.savedViews).views[0].name==='Install crunch');
    ok('no write to anyone else\'s row (Kim, sp1)',!w.__spCalls.some(c=>c.method!=='GET'&&c.url.includes('/items/sp1')));
  }

  sec('a computer with no copy picks the views up from the row');
  {const w=start(crunch,null);await wait(1500);
    const loc=JSON.parse(w.localStorage.getItem(VK)||'null');
    ok('the browser cache now holds the row\'s views',loc&&loc[0].name==='Install crunch');
    ok('the starred view opens on that first visit',w.eval('LENS')==='dept',w.eval('LENS'));
    ok('nothing written back (the row already had them)',staffPatches(w).length===0);
    w.document.getElementById('btn-views').click();
    ok('the menu says views follow you',/follow you/.test(w.document.querySelector('#views-menu .sm-note').textContent));
  }

  sec('a shared computer: the cache belongs to Kim, Sam signs in');
  {const w=start(null,crunch,false,'s2');await wait(1500);
    ok('Kim\'s views are never copied to Sam\'s row',staffPatches(w).length===0);
    ok('and they leave the cache, so Sam\'s menu starts fresh',w.localStorage.getItem(VK)===null);
    ok('the cache is now Sam\'s',w.localStorage.getItem('shopTimelineViewsOwner')==='s1');
  }
  {const w=start(crunch,[{name:'Kim view',state:{}}],false,'s2');await wait(1500);
    ok('Sam\'s row replaces Kim\'s cache',JSON.parse(w.localStorage.getItem(VK))[0].name==='Install crunch');
    ok('and Sam\'s starred view opens (a first visit for Sam)',w.eval('LENS')==='dept');
  }

  sec('the row wins over an older browser copy');
  {const w=start(crunch,[{name:'Old',state:{}}]);await wait(1500);
    ok('the cache is replaced by the row',JSON.parse(w.localStorage.getItem(VK))[0].name==='Install crunch');
  }

  sec('saving a view writes the row (rename, delete and star save the same way)');
  {const w=start(crunch,crunch);await wait(1500);
    w.eval("saveViews([...loadViews(),{name:'Mine',state:viewState()}])");await wait(50);
    const p=staffPatches(w);
    ok('a save PATCHes the row once',p.length===1);
    ok('with both views',p[0]&&JSON.parse(p[0].body.savedViews).views.map(v=>v.name).join()==='Install crunch,Mine');
    /* an admin's People-page save of Sam's row must not carry savedViews */
    const f=w.eval("personToFields(PEOPLE.find(p=>p.name==='Sam'))");
    ok('personToFields never writes savedViews',!('savedViews' in f));
  }

  sec('no savedViews column: views stay in this browser, as before');
  {const w=start(null,crunch,true);await wait(1500);
    ok('the one move-up attempt was made',staffPatches(w).length===1);
    w.eval("saveViews([{name:'Local',state:{}}])");await wait(50);
    ok('after the 400 no further writes are tried',staffPatches(w).length===1);
    ok('the browser copy still saves',JSON.parse(w.localStorage.getItem(VK))[0].name==='Local');
    w.document.getElementById('btn-views').click();
    ok('the menu still says "this browser only"',/this browser only/.test(w.document.querySelector('#views-menu .sm-note').textContent));
  }

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
})();
