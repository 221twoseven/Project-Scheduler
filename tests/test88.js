/* Toolbar — native software direction (docs/Toolbar-Native-Direction.md).
   Phase 1 removed the Where/Style/Filter eyebrows and renamed "Protect dates"
   to "Lock dates". Phase 2 (REV93) moved the low-frequency view controls off the
   row: density and Vivid months live in a View ▾ menu, and the Project/Team color
   toggle became a Color by ▾ dropdown; the scale stays a visible segmented control.
   This suite asserts that end state.
   Run: node tests/test88.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* pre-Phase-2 builds (and the frozen REV50 reference) have no View menu */
if(src.indexOf('btn-view')<0){
  console.log('test88: skipped — no View menu in '+FILE+' (pre-Phase-2 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);

setTimeout(()=>{
  const row=doc.querySelector('.tb-row.tb-timeline');

  sec('1 · reading order: position · view · filter · — · Views/lock/?');
  const all=[...row.querySelectorAll('*')];
  const at=id=>all.indexOf(doc.getElementById(id));
  const seq=['btn-today','btn-days','btn-colorby','btn-view',
             't-search','btn-filters','btn-reset','btn-views','lock-ck','btn-legend'];
  let ordered=true,brk='';
  for(let i=1;i<seq.length;i++)if(at(seq[i])<at(seq[i-1])){ordered=false;brk=seq[i-1]+' → '+seq[i];}
  ok('the row controls sit in cluster order',ordered,brk);
  const spacer=all.indexOf(row.querySelector('.tb-spacer'));
  ok('Views sits past the spacer (right edge, the row\'s summary)',at('btn-views')>spacer);
  ok('Clear filters closes the filter cluster, left of the spacer',at('btn-reset')<spacer);

  sec('2 · Phase 1 — no taxonomy eyebrows; separators carry the grouping; Lock dates');
  ok('no eyebrow labels remain on the timeline row',row.querySelectorAll('.t-mini').length===0);
  ok('the cluster separators remain (grouping without labels)',row.querySelectorAll('.t-sep').length>=2,'seps='+row.querySelectorAll('.t-sep').length);
  ok('the lock toggle reads "Lock dates"',doc.querySelector('.lock-txt').textContent.trim()==='Lock dates');

  sec('3 · Phase 2 — density & Vivid live in View ▾; color-by is a dropdown');
  ok('the old toolbar density button is gone',!doc.getElementById('btn-density'));
  ok('the Settings → Density alias is retired',!doc.getElementById('mi-density'));
  ok('the old Project/Team color toggle is gone',!doc.getElementById('btn-col-proj')&&!doc.getElementById('btn-col-ent'));
  ok('scale stays a visible segmented control',!!doc.getElementById('tg-scale')&&!!doc.getElementById('btn-days'));
  E('buildViewMenu()');
  const vitems=[...doc.querySelectorAll('#view-menu .sm-item')].map(l=>l.textContent.trim());
  ok('View ▾ lists the three densities + Vivid months',
     ['Comfortable','Snug','Compact','Vivid months'].every(l=>vitems.includes(l)),vitems.join(','));
  E('buildColorbyMenu()');
  const citems=[...doc.querySelectorAll('#colorby-menu .sm-item')].map(l=>l.textContent.trim());
  ok('Color by ▾ offers Project and Team',citems.includes('Project')&&citems.includes('Team'),citems.join(','));

  sec('4 · picking from View ▾ drives density; Color by ▾ drives the lens (behaviour preserved)');
  const pickDensity=val=>{E('buildViewMenu()');
    const r=[...doc.querySelectorAll('#view-menu input[name=density-pick]')];
    r[{comfortable:0,snug:1,compact:2}[val]].checked=true;
    r[{comfortable:0,snug:1,compact:2}[val]].dispatchEvent(new win.Event('change',{bubbles:true}));};
  ok('boot is Comfortable',E('DENSITY')==='comfortable');
  pickDensity('snug');
  ok('picking Snug → snug (body class follows)',E('DENSITY')==='snug'&&doc.body.classList.contains('snug'));
  pickDensity('compact');
  ok('picking Compact → compact',E('DENSITY')==='compact'&&doc.body.classList.contains('compact'));

  const pickColor=val=>{E('buildColorbyMenu()');
    const r=[...doc.querySelectorAll('#colorby-menu input[name=colorby-pick]')];
    const i=val==='entity'?1:0;r[i].checked=true;r[i].dispatchEvent(new win.Event('change',{bubbles:true}));};
  ok('boot colors by Project',E('COLOR_MODE')==='project');
  pickColor('entity');
  ok('picking Team → COLOR_MODE entity',E('COLOR_MODE')==='entity');
  ok('the dropdown label follows',doc.getElementById('colorby-v').textContent==='Team');

  sec('5 · Phase 3 — Status + Person consolidated into one Filters ▾ (with Client)');
  ok('the separate Status/Person buttons are gone',!doc.getElementById('btn-status')&&!doc.getElementById('btn-person'));
  ok('a single Filters button is present',!!doc.getElementById('btn-filters'));
  E('buildFiltersMenu()');
  ok('the Filters menu holds Status, Client and Person sections',
     !!doc.getElementById('status-menu')&&!!doc.getElementById('client-menu')&&!!doc.getElementById('person-menu'));
  ok('Clear filters is hidden until something is active',doc.getElementById('btn-reset').classList.contains('hidden'));

  sec('6 · Phase 4 — application bar: Resources ▾ + Help ▾, Settings retired');
  ok('the Settings button is gone (People/Clients moved to Resources)',!doc.getElementById('btn-settings'));
  ok('a Resources menu holds People & Clients',
     !!doc.getElementById('btn-resources')&&!!doc.getElementById('mi-people')&&!!doc.getElementById('mi-clients'));
  ok('Help is a menu with a tour and keyboard shortcuts',
     !!doc.getElementById('btn-help')&&!!doc.getElementById('mi-tour')&&!!doc.getElementById('mi-shortcuts'));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
