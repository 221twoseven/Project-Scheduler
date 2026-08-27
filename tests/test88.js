/* Phase 3.5 (REV88) — toolbar regroup, Option A of docs/Toolbar-Grouping-Proposal.md.
   Row 2 clusters position (Today/goto) · view (scale, color, density, vivid) ·
   filter (search, status, person, clear), with Views · Lock dates · ? at the right
   edge. Density surfaces out of Settings as a cycle button; the Settings item stays
   as an alias. No control changes behavior — only position and the new button.

   Native direction, Phase 1 (docs/Toolbar-Native-Direction.md): the Where/Style/Filter
   eyebrow labels are removed (separators now carry the grouping) and "Protect dates"
   is relabelled "Lock dates". §2 below asserts that de-taxonomised state.
   Run: node tests/test88.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* pre-REV88 builds (and the frozen REV50 reference) have no density button */
if(src.indexOf('btn-density')<0){
  console.log('test88: skipped — no toolbar density button in '+FILE+' (pre-REV88 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));

setTimeout(()=>{
  const row=doc.querySelector('.tb-row.tb-timeline');

  sec('1 · reading order: position · view · filter · — · Views/lock/?');
  const all=[...row.querySelectorAll('*')];
  const at=id=>all.indexOf(doc.getElementById(id));
  const seq=['btn-today','btn-days','btn-col-proj','btn-density','t-tint',
             't-search','btn-status','btn-person','btn-reset','btn-views','lock-ck','btn-legend'];
  let ordered=true,brk='';
  for(let i=1;i<seq.length;i++)if(at(seq[i])<at(seq[i-1])){ordered=false;brk=seq[i-1]+' → '+seq[i];}
  ok('the twelve controls sit in cluster order',ordered,brk);
  const spacer=all.indexOf(row.querySelector('.tb-spacer'));
  ok('Views sits past the spacer (right edge, the row\'s summary)',at('btn-views')>spacer);
  ok('Clear filters closes the filter cluster, left of the spacer',at('btn-reset')<spacer);
  ok('Vivid months moved into the style cluster',at('t-tint')<at('t-search'));

  sec('2 · Phase 1 — the taxonomy eyebrows are gone, separators carry the grouping');
  const minis=[...row.querySelectorAll('.t-mini')];
  ok('no eyebrow labels remain on the timeline row',minis.length===0,minis.map(e=>e.textContent.trim()).join(','));
  ok('the cluster separators remain (grouping without labels)',row.querySelectorAll('.t-sep').length>=2,'seps='+row.querySelectorAll('.t-sep').length);
  const locktxt=doc.querySelector('.lock-txt').textContent.trim();
  ok('the lock toggle reads "Lock dates" (relabelled from "Protect dates")',locktxt==='Lock dates',locktxt);

  sec('3 · density cycles from the toolbar button');
  const btn=doc.getElementById('btn-density'),miv=doc.getElementById('mi-density-v');
  ok('starts at Comfortable',btn.textContent==='Comfortable');
  click(btn);
  ok('one click → Snug (body class follows)',btn.textContent==='Snug'&&doc.body.classList.contains('snug'));
  ok('the Settings alias label follows',miv.textContent==='Snug');
  click(btn);
  ok('two → Compact',btn.textContent==='Compact'&&doc.body.classList.contains('compact'));
  click(btn);
  ok('three → back to Comfortable',btn.textContent==='Comfortable'&&!doc.body.classList.contains('compact'));

  sec('4 · the Settings item still cycles (alias for a release)');
  click(doc.getElementById('mi-density'));
  ok('Settings click → Snug on both labels',btn.textContent==='Snug'&&miv.textContent==='Snug');
  click(doc.getElementById('mi-density'));click(doc.getElementById('mi-density'));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
