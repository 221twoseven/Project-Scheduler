/* B5 / Design-Language §4: density levels + group collapse.
   - The View ▾ menu sets Comfortable 56 → Snug 44 → Compact 32 (--row-h); the
     JS lane math follows; every hit target stays ≥24px; the choice persists in UI_KEY.
   - 30 projects fit one screen at Compact (the acceptance bar).
   - Clicking a grp-head collapses its group; collapsed sets persist in UI_KEY keyed
     by group mode and survive a reload.
   Run: node tests/test-b5.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';

/* The frozen REV50 reference predates B5 — same convention as test-b3-zoom.js. */
if(fs.readFileSync(FILE,'utf8').indexOf('applyDensity')<0){
  console.log('test-b5: skipped — no applyDensity in '+FILE+' (pre-B5 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* 30 projects — 8 for Caroline, 22 for Stan — each with one fab bar. sortIndex keeps
   each PM's block contiguous so grouping draws one header per PM. */
const projects=[],tasks=[];
for(let i=0;i<30;i++){
  const pm=i<8?'Caroline':'Stan';
  const id='p'+i;
  projects.push({appId:id,Title:'Job '+i,client:'Client '+(i%5),jobCode:'J'+i,
    deadline:'2026-10-'+String((i%28)+1).padStart(2,'0'),status:'in-fabrication',
    projectManager:pm,drafter:'Peter',leadFab:'Nick',
    activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01',sortIndex:i});
  tasks.push({appId:'t'+i,projectId:id,department:'fab',assignee:'Nick',
    startDate:'2026-08-24',endDate:'2026-09-04',estimatedDays:10,
    ticketNodes:'[]',notes:'',pinned:false,label:''});
}

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
/* Phase 2: density moved into the View ▾ menu. Rebuild it and fire the radio's change. */
function pickDensity(val){
  E('buildViewMenu()');
  const r=[...doc.querySelectorAll('#view-menu input[name=density-pick]')];
  const idx={comfortable:0,snug:1,compact:2}[val];
  r[idx].checked=true;r[idx].dispatchEvent(new win.Event('change',{bubbles:true}));
}

setTimeout(()=>{
  sec('density — Comfortable boot is the pre-B5 default');
  ok('boot is Comfortable',E('DENSITY')==='comfortable');
  ok('rowH(1) is 56 (the --row-h token)',E('rowH(1)')===56,'rowH(1)='+E('rowH(1)'));
  ok('body has no density class',!doc.body.classList.contains('compact')&&!doc.body.classList.contains('snug'));

  sec('the View ▾ menu sets Comfortable → Snug → Compact');
  pickDensity('snug');
  ok('picking Snug lands on Snug',E('DENSITY')==='snug');
  ok('rowH(1) is 44',E('rowH(1)')===44,'rowH(1)='+E('rowH(1)'));
  ok('body carries .snug (CSS --row-h override)',doc.body.classList.contains('snug')&&!doc.body.classList.contains('compact'));
  ok('Snug bars stay 32px',E('BAR_H')===32,'BAR_H='+E('BAR_H'));
  pickDensity('compact');
  ok('picking Compact lands on Compact',E('DENSITY')==='compact');
  ok('rowH(1) is 32',E('rowH(1)')===32,'rowH(1)='+E('rowH(1)'));
  ok('body swaps .snug for .compact',doc.body.classList.contains('compact')&&!doc.body.classList.contains('snug'));
  ok('the View menu marks Compact as current',
     (function(){E('buildViewMenu()');const r=[...doc.querySelectorAll('#view-menu input[name=density-pick]')];return r[2].checked&&!r[0].checked;})());
  ok('bars keep a ≥24px hit target (§4)',E('BAR_H')>=24,'BAR_H='+E('BAR_H'));
  const bar=doc.querySelector('.job-bar.summary');
  ok('a drawn bar is BAR_H tall',bar&&bar.style.height===E('BAR_H')+'px',bar&&bar.style.height);
  ok('edge grab zones keep their §6 width',E('edgeZone(100,9)')===9&&E('edgeZone(40,9)')>=8);
  const sbRow=doc.querySelector('#side-rows .sb-row.proj-head');
  ok('sidebar rows are 32px',sbRow&&sbRow.style.height==='32px',sbRow&&sbRow.style.height);
  ok('the two-line row keeps name and code·date',
     sbRow&&!!sbRow.querySelector('.sb-name')&&!!sbRow.querySelector('.sb-sub'));

  sec('acceptance — 30 projects fit one screen at Compact + Month');
  E("setView('month')");
  ok('30 rows total ≤960px',E('TOTAL_H')<=960,E('TOTAL_H')+'px');

  sec('density persists in UI_KEY');
  let ui=JSON.parse(win.localStorage.getItem('shopTimelineUI_v1')||'{}');
  ok('saveUI recorded compact',ui.density==='compact',ui.density);
  E("applyDensity('comfortable');loadLocalPrefs();");
  ok('loadLocalPrefs restores it',E('DENSITY')==='compact');

  sec('group collapse — grp-head hides its rows');
  E("GROUP_BY='pm';render();");
  const heads=[...doc.querySelectorAll('#side-rows .sb-row.grp-head')];
  ok('two group headers render',heads.length===2,heads.length+' heads');
  const car=heads.find(h=>h.textContent.indexOf('Caroline')>=0);
  ok('Caroline’s header shows her count of 8',car&&car.querySelector('.sb-count').textContent==='8');
  ok('headers carry a chevron, open',car&&!!car.querySelector('.sb-chev.open'));
  const rowsBefore=E('ROWS.length');
  click(car);
  ok('clicking collapses — her 8 project rows drop',E('ROWS.length')===rowsBefore-8,
     rowsBefore+' -> '+E('ROWS.length'));
  const car2=[...doc.querySelectorAll('#side-rows .sb-row.grp-head')].find(h=>h.textContent.indexOf('Caroline')>=0);
  ok('the header itself stays, chevron closed, count intact',
     car2&&!car2.querySelector('.sb-chev.open')&&car2.querySelector('.sb-count').textContent==='8');
  ok('no bar of a collapsed project remains',
     ![...doc.querySelectorAll('.job-bar.summary')].some(b=>{
       const p=E("projById('"+b.dataset.pid+"')");return p&&p.projectManager==='Caroline';}));

  sec('collapse persists in UI_KEY, keyed by group mode');
  ui=JSON.parse(win.localStorage.getItem('shopTimelineUI_v1')||'{}');
  ok('collapsedGroups.pm holds Caroline',(ui.collapsedGroups&&ui.collapsedGroups.pm||[]).indexOf('Caroline')>=0,
     JSON.stringify(ui.collapsedGroups));
  E("GRP_COLLAPSED={};loadLocalPrefs();render();");
  ok('a reload keeps her collapsed',E('ROWS.length')===rowsBefore-8);
  E("GROUP_BY='client';render();");
  ok('the client mode is untouched (sets are per mode)',
     E("ROWS.filter(r=>r.kind==='projHead').length")===30);
  E("GROUP_BY='pm';render();");
  click([...doc.querySelectorAll('#side-rows .sb-row.grp-head')].find(h=>h.textContent.indexOf('Caroline')>=0));
  ok('clicking again expands',E('ROWS.length')===rowsBefore);

  done();
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
