/* v1.62.7 — item 52 step 5: the developer pages to the wireframes. Owner, 2026-11-20:
   "Yes, with wording" (the mock, with App Settings and Viewer Permissions in Title Case).
   R1 the Changelog and Bug Reports lists share Open Issues' 13px rows; the project page's own
   changelog dock is not touched · R2 the Changelog filter is a real field · R3 App Settings:
   heading, trail and section in Title Case, the Help menu row as before; the Config note and the
   "Stale after" field use the tokens.
   Run: node tests/test-v1627.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

sec('R1–R3: the recipes in the source');
ok('R1 the full-page lists have 13px rows', /font-size:13px/.test(rule('.pg.dash>.clog-list .clog-row')));
ok('R1 Open Issues keeps its rows', /padding:10px 16px/.test(rule('.fb-3col .clog-row')));
ok('R2 the filter is a field with the control edge', /border:1px solid var\(--ts-control-line\)/.test(rule('.clog-tools input'))&&/min-height:32px/.test(rule('.clog-tools input')));
ok('R3 the Config note uses the tokens', /color:var\(--ts-muted\)/.test(rule('.as-src'))&&/border:1px solid var\(--ts-line\)/.test(rule('.as-src')));
ok('R3 …and its warning keeps its own colours', /#FCF4E4/.test(rule('.as-src.warn'))&&raw.indexOf('\n.as-src.warn{')>raw.indexOf('\n.as-src{'));
ok('R3 "Stale after" is a field with the control edge', /border:1px solid var\(--ts-control-line\)/.test(rule('#as-stale')));

const DEV={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]',role:'',admin:'dev'};
const URL0='https://example.github.io/Project-Scheduler/timeline/';
const start=hash=>boot(FILE,{url:URL0+hash,data:{projects:[],tasks:[],staff:[DEV],todos:[]}}).window;

(async()=>{
  sec('R3: App Settings, as rendered');
  let w=start('#/settings');await wait(900);
  let d=w.document;
  {const h=d.querySelector('#page .cd-head h2'),c=d.querySelector('#page .pg-trail .cur');ok('R3 heading and trail read App Settings', !!h&&h.textContent==='App Settings'&&!!c&&c.textContent==='App Settings',(h&&h.textContent)+' | '+(c&&c.textContent));}
  ok('R3 the section reads Viewer Permissions', [...d.querySelectorAll('.as-body h3')].some(e=>e.textContent==='Viewer Permissions'));
  ok('R3 the Help menu row is unchanged', d.getElementById('mi-appset').textContent==='App settings');

  sec('R1/R2: Changelog, as rendered');
  w=start('#/changelog');await wait(900);d=w.document;
  ok('R1 the list sits straight under the page', !!d.querySelector('#page .pg.dash>.clog-list#clog-list'));
  ok('R2 the filter is there', !!d.querySelector('.clog-tools #clog-q'));
  done();
})();
