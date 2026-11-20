/* v1.62.6 — item 52 step 5: Release Notes and My Settings to the wireframes. Owner, 2026-11-20:
   "Yes, with wording" (the mock, with My Settings and Project Page in Title Case).
   R1 a full-width page's head is a 22px title over its line; Open Issues' column heads are not
   touched · R2 Release Notes: a 15px version, 13px notes at a reading width · R3 My Settings:
   heading, trail and section in Title Case, the Help menu row as before; the section heading is
   15px as written; the choices are 13px, and the chosen one wears the action blue · R4 the
   developer App settings page shares the settings recipe.
   Run: node tests/test-v1626.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

sec('R1–R3: the recipes in the source');
ok('R1 the page head stacks its title over its line', /flex-direction:column/.test(rule('.pg.dash>.cd-head')));
ok('R1 …a 22px, 600 title', /font-size:22px/.test(rule('.pg.dash>.cd-head h2'))&&/font-weight:600/.test(rule('.pg.dash>.cd-head h2')));
ok('R1 Open Issues keeps its 17px column heads', /font-size:17px/.test(rule('.fb-3col .cd-head h2')));
ok('R2 a version is 15px', /font-size:15px/.test(rule('.rn-hd b')));
ok('R2 notes are 13px at a reading width', /max-width:760px/.test(rule('.rn-notes'))&&/font-size:13px/.test(rule('.rn-notes')));
ok('R3 the section heading reads as written, 15px', !/uppercase/.test(rule('.as-body h3'))&&/font-size:15px/.test(rule('.as-body h3')));
ok('R3 choices are 13px', /font-size:13px/.test(rule('.as-txt b')));
ok('R3 the chosen one wears the action blue', /border-color:var\(--ts-action\)/.test(rule('.as-row:has(input:checked)')));

const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]',role:'',admin:'1'};
const URL0='https://example.github.io/Project-Scheduler/timeline/';
const start=hash=>boot(FILE,{url:URL0+hash,data:{projects:[],tasks:[],staff:[SAM],todos:[]}}).window;

(async()=>{
  sec('R2: Release Notes, as rendered');
  let w=start('#/releases');await wait(900);
  let d=w.document;
  ok('R2 the page shows its title in the page head', !!d.querySelector('.pg.dash>.cd-head h2')&&d.querySelector('.pg.dash>.cd-head h2').textContent==='Release Notes');
  const v=d.querySelector('.rn-ver .rn-hd b');
  ok('R2 the newest version comes first', !!v&&v.textContent==='v'+w.eval('APP_VER'),v&&v.textContent);

  sec('R3: My Settings, as rendered');
  w=start('#/mysettings');await wait(900);d=w.document;
  {const h=d.querySelector('#page .cd-head h2'),c=d.querySelector('#page .pg-trail .cur');ok('R3 heading and trail read My Settings', !!h&&h.textContent==='My Settings'&&!!c&&c.textContent==='My Settings',(h&&h.textContent)+' | '+(c&&c.textContent));}
  ok('R3 the section reads Project Page', d.querySelector('.as-body h3').textContent==='Project Page');
  ok('R3 the Help menu row is unchanged', d.getElementById('mi-myset').textContent==='My settings');
  ok('R3 one choice is ticked', d.querySelectorAll('.as-row input:checked').length===1);
  done();
})();
