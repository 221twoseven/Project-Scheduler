/* C3 / Design-Language §2.1: status = pattern + pill on the project's own hue.
   Forecast keeps its identity color (no grayscale), complete dims + ✓, on-hold
   desaturates without recoloring, and the ? legend explains all five encodings.
   Run: node tests/test-c3-status.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* The frozen REV50 reference predates C3 — same convention as test-b1.js. */
if(!/btn-legend/.test(src)){
  console.log('test-c3-status: skipped — no legend button in '+FILE+' (pre-C3 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const proj=(id,name,status)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:'2026-12-20',status,projectManager:'Stan',drafter:'Ana',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01'});
const task=(id,pid,s,e)=>({appId:id,projectId:pid,department:'fab',assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[proj('p1','Hermes Windows','forecast'),proj('p2','Near Now','complete'),
  proj('p3','Held Job','on-hold')];
const tasks=[task('t1','p1','2026-08-10','2026-08-20'),task('t2','p2','2026-08-10','2026-08-20'),
  task('t3','p3','2026-08-10','2026-08-20')];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
/* jsdom normalises colour strings; run expectations through the same parser. */
const norm=v=>{const p=doc.createElement('div');p.style.color=v;return p.style.color;};

setTimeout(()=>{
  sec('forecast bars keep the project\'s identity color (§2.1 one-job rule)');
  ok('no grayscale filter left on forecast bars',
     !/data-st="forecast"\]\{[^}]*grayscale/.test(src));
  ok('forecast treatment is 40% opacity + 1.5px dashed outline',
     /\.job-bar\[data-st="forecast"\]\{[^}]*opacity:\.4/.test(src)
     &&/\.job-bar\[data-st="forecast"\]\{[^}]*outline:1\.5px dashed/.test(src));
  const fb=doc.querySelector('#gantt-canvas .job-bar[data-st="forecast"]');
  ok('a forecast bar renders',!!fb);
  ok('its computed background is the project\'s palette slot, not gray',
     fb&&norm(fb.style.background)===norm(E("projColor('p1')")),fb&&fb.style.background);
  ok('the dashed outline carries the same identity color',
     fb&&norm(fb.style.outlineColor)===norm(E("projColor('p1')")),fb&&fb.style.outlineColor);
  ok('the gray forecast pill overrides are gone',
     !/data-st="forecast"\] \.sum-pill/.test(src)&&!/\.mr-pill\[data-st="forecast"\]/.test(src));

  E("EXPANDED.add('p1');render();");
  const ft=doc.querySelector('#gantt-canvas .job-bar[data-st="forecast"][data-tid]');
  ok('an expanded forecast task bar also keeps the palette color',
     ft&&norm(ft.style.background)===norm(E("projColor('p1')")),ft&&ft.style.background);

  sec('complete = muted + ✓, no hue change');
  ok('complete is 60% opacity with no desaturating filter',
     /\.job-bar\[data-st="complete"\]\{opacity:\.6\}/.test(src)
     &&!/data-st="complete"\]\{[^}]*filter/.test(src));
  ok('the pill gains a ✓',/data-st="complete"\][^{]*::before[^{]*\{content:'✓ '\}/.test(src)
     ||/::before\{content:'✓ '\}/.test(src));
  const cb=doc.querySelector('#gantt-canvas .job-bar[data-st="complete"]');
  ok('a complete bar still carries its project color',
     cb&&norm(cb.style.background)===norm(E("projColor('p2')")),cb&&cb.style.background);

  sec('on-hold desaturates, never recolors');
  const oh=(src.match(/\.job-bar\[data-st="on-hold"\]\{([^}]*)\}/)||[])[1]||'';
  ok('on-hold keeps opacity + hatch',/opacity:\.55/.test(oh)&&/repeating-linear-gradient/.test(oh));
  ok('the hatch is a white overlay (lightens the hue), not a replacement color',
     /rgba\(255,255,255/.test(oh)&&!/background:#/.test(oh));
  const hb=doc.querySelector('#gantt-canvas .job-bar[data-st="on-hold"]');
  ok('an on-hold bar still carries its project color',
     hb&&norm(hb.style.background)===norm(E("projColor('p3')")),hb&&hb.style.background);
  ok('bars set background-color, not the shorthand, so the hatch actually renders',
     hb&&hb.style.backgroundImage==='',hb&&hb.style.backgroundImage);

  sec('legend popover — the five encodings on one screen');
  const btn=doc.getElementById('btn-legend'),menu=doc.getElementById('legend-menu');
  ok('? button sits on the toolbar',!!btn&&btn.closest('#toolbar')!==null);
  /* one overlay at a time: open the status menu first, the legend must close it */
  doc.getElementById('btn-status').click();
  ok('status menu opens',!doc.getElementById('status-menu').classList.contains('hidden'));
  btn.click();
  ok('opening the legend closes the other menu (§6 one overlay)',
     doc.getElementById('status-menu').classList.contains('hidden')
     &&!menu.classList.contains('hidden'));
  const sw=[...menu.querySelectorAll('.job-bar[data-st]')];
  ok('every status has a live swatch',sw.length===E('ALL_STATUSES').length,sw.length+' swatches');
  ok('swatches are drawn from the same CSS (real .job-bar elements, project hue)',
     sw.every(s=>norm(s.style.background)===norm(E('PCOLS[0]'))));
  ok('red = installation is documented',
     [...menu.querySelectorAll('.lg-bar')].some(s=>norm(s.style.background)===norm(E('INSTALL_RED'))));
  const chips=[...menu.querySelectorAll('.role-tag')].map(c=>c.textContent);
  ok('PM/D/F chip letters are documented',chips.join(',')==='PM,D,F',chips.join(','));
  ok('Today marker is documented',!!menu.querySelector('.today-tag'));
  ok('deadline marker is documented',!!menu.querySelector('.dl-flag'));
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Escape closes the legend',menu.classList.contains('hidden'));

  done();
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
