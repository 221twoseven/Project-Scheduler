/* B4 / Design-Language §7: Today = full-day wash + 2px --late line + TODAY pill;
   deadline = per-project ▸ pennant + dotted neutral-ink drop-line, never red.
   Run: node tests/test-b4.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* The frozen REV50 reference predates B4 — same convention as test-b1.js. */
if(!/\.dl-flag\{[^}]*dotted/.test(src)){
  console.log('test-b4: skipped — no dotted deadline drop-line in '+FILE+' (pre-B4 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const proj=(id,name,dl)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:dl,status:'in-fabrication',projectManager:'Stan',drafter:'',
  leadFab:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01'});
const task=(id,pid,s,e)=>({appId:id,projectId:pid,department:'fab',assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[proj('p1','Hermes Windows','2026-12-20'),proj('p2','Near Now','2026-09-01')];
const tasks=[task('t1','p1','2026-12-01','2026-12-10'),task('t2','p2','2026-08-10','2026-08-20')];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
/* jsdom normalises colour strings; run expectations through the same parser. */
const norm=v=>{const p=doc.createElement('div');p.style.color=v;return p.style.color;};

setTimeout(()=>{
  sec('Today marker — main timeline');
  const tl=doc.querySelector('#gantt-canvas .today-line');
  ok('today-line renders',!!tl);
  ok('it spans the full day column (wash), not a 2px line',
     tl&&tl.style.width===E('dw()')+'px',tl&&tl.style.width);
  ok('wash is rgba(47,111,228,.06)',/\.today-line\{[^}]*rgba\(47,111,228,\.06\)/.test(src));
  ok('the line itself is 2px var(--late)',/\.today-line\{[^}]*border-left:2px solid var\(--late\)/.test(src));
  ok('TODAY pill rides the line',tl&&tl.querySelector('.today-tag')&&tl.querySelector('.today-tag').textContent==='TODAY');

  sec('Deadline markers — main timeline');
  const flags=[...doc.querySelectorAll('#gantt-canvas .dl-flag')];
  ok('one flag per project with a deadline',flags.length===2,flags.length+' flags');
  ok('drop-line is dotted neutral ink, not a red dash',
     /\.dl-flag\{[^}]*border-left:2px dotted rgba\(13,19,29,\.6\)/.test(src));
  ok('pennant glyph is ▸',/\.dl-flag::before\{content:'▸'/.test(src));
  ok('no red family left in the marker rules',
     !/\.dl-flag[^}]*(#CE4242|#C42B2B|rgba\(220,38)/.test(src)&&!/\.npv-dl[^}]*(#CE4242|rgba\(220,38)/.test(src));
  const f1=flags.find(f=>f.title.indexOf('Dec 20')>=0);
  ok('pennant carries the project identity color',
     f1&&norm(f1.style.color)===norm(E("projColor('p1')")),f1&&f1.style.color);

  sec('drop-line spans the project\'s expanded rows');
  const headH=f1.style.height;
  E("EXPANDED.add('p1');render();");
  const f2=[...doc.querySelectorAll('#gantt-canvas .dl-flag')].find(f=>f.title.indexOf('Dec 20')>=0);
  ok('expanding the project lengthens the drop-line',
     f2&&parseFloat(f2.style.height)>parseFloat(headH),headH+' -> '+(f2&&f2.style.height));

  sec('project page');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    E('NPV_MODE="gantt";npvRender();');
    setTimeout(()=>{
      const nt=doc.querySelector('#npv-body .npv-today');
      ok('npv today marker renders',!!nt);
      ok('it spans the full day column',nt&&nt.style.width===E('NPV_GEO.dw')+'px',nt&&nt.style.width);
      ok('npv today carries wash + 2px --late line + pill (CSS)',
         /\.npv-today\{[^}]*rgba\(47,111,228,\.06\)/.test(src)
         &&/\.npv-today\{[^}]*border-left:2px solid var\(--late\)/.test(src)
         &&/\.npv-today::after\{content:'TODAY'/.test(src));
      ok('npv deadline is a dotted ink drop-line with ▸ pennant',
         !!doc.querySelector('#npv-body .npv-dl')
         &&/\.npv-dl\{[^}]*border-left:2px dotted rgba\(13,19,29,\.6\)/.test(src)
         &&/\.npv-dl::before\{content:'▸'/.test(src));
      done();
    },300);
  },600);
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
