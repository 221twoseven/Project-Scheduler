/* Phase 4 (REV89) — the learnability layer (UX audit A2 + A5):
     1. the main timeline gets its own ? shortcuts sheet (key, legend entry, Esc);
     2. "Add a sample project" on the empty state — seed() through the normal create
        path, browser-local only (never synced), clearly marked, deletable;
     3. a faint ⋯ hover cue on bars advertises the right-click menu;
     4. drive-by data-loss fix: undo() no longer drops ST.events (it used to diff
        events → undefined, deleting every ShopTimeline_Events row).
   Run: node tests/test89.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('es-sample')<0){
  console.log('test89: skipped — no sample-project button in '+FILE+' (pre-REV89 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const key=(k)=>doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));

setTimeout(()=>{
  sec('1 · the timeline shortcut sheet');
  const ks=doc.getElementById('tl-ks');
  ok('the sheet exists and starts hidden',!!ks&&ks.classList.contains('hidden'));
  key('?');
  ok('? opens it',!ks.classList.contains('hidden'));
  key('Escape');
  ok('Esc closes it',ks.classList.contains('hidden'));
  const lk=doc.getElementById('lg-keys');
  ok('the ? legend carries a "Keyboard shortcuts…" entry',!!lk);
  click(lk);
  ok('…which opens the sheet',!ks.classList.contains('hidden'));
  click(ks);
  ok('a click anywhere closes it',ks.classList.contains('hidden'));

  sec('2 · the empty state offers the sample project');
  const es=doc.getElementById('empty-state');
  ok('the "Nothing scheduled yet" card renders',!!es&&/Nothing scheduled yet/.test(es.textContent));
  const sm=es&&es.querySelector('#es-sample');
  ok('with the Add a sample project button',!!sm);

  sec('3 · the sample seeds locally and never syncs');
  const posts0=win.__spCalls.filter(c=>c.method==='POST').length;
  click(sm);
  setTimeout(()=>{
    ok('two sample projects appear',E('ST.projects.length')===2,E('ST.projects.length'));
    ok('every one is flagged sample',E('ST.projects.every(p=>p.sample)'));
    ok('…and clearly marked in the name',E('ST.projects.every(p=>p.name.indexOf("Sample · ")===0)'));
    ok('their phases came along',E('ST.tasks.length')>5,E('ST.tasks.length'));
    const posts=win.__spCalls.filter(c=>c.method==='POST').length;
    ok('not one record was POSTed to SharePoint',posts===posts0,posts-posts0+' posts');
    ok('the slice is stashed in this browser',!!win.localStorage.getItem('shopTimelineSample'));
    ok('the shared staff roster was NOT overwritten by seed()',E('PEOPLE.length')===0,E('PEOPLE.length'));
    ok('the empty-state card is gone (the timeline is populated)',!doc.getElementById('empty-state'));

    sec('4 · a fresh load re-attaches the sample');
    const merged=E('mergeSample({projects:[],tasks:[],todos:[],events:[]})');
    ok('mergeSample restores both projects from the stash',merged.projects.length===2);
    ok('…tasks included',merged.tasks.length>5);

    sec('5 · deleting the sample clears the stash');
    E('saveState({projects:ST.projects.filter(p=>!p.sample),tasks:ST.tasks.filter(t=>!ST.projects.some(p=>p.sample&&p.id===t.projectId))})');
    setTimeout(()=>{
      ok('the timeline is empty again',E('ST.projects.length')===0);
      ok('the localStorage slice is removed',!win.localStorage.getItem('shopTimelineSample'));

      sec('6 · undo keeps ST.events (the data-loss fix)');
      E('ST={...ST,events:[{id:"e1",projectId:"px",name:"Kickoff",date:"2026-09-01",dept:"",notes:""}]}');
      E('saveState({projects:ST.projects,tasks:ST.tasks})');
      E('undo()');
      ok('after an undo, events is still an array',Array.isArray(E('ST.events')));
      ok('…with the event intact',E('(ST.events||[]).length')===1,JSON.stringify(E('ST.events')));

      sec('7 · the hover cue ships in the stylesheet');
      ok('bars advertise the context menu on hover (⋯ ::after)',
         src.indexOf('.job-bar:not(.lg-bar):hover::after')>=0);

      console.log('\n'+'-'.repeat(46));
      console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
      process.exit(fail?1:0);
    },250);
  },250);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
