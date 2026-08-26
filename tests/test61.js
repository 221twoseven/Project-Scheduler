/* REV61: the left-click editors slim down and stop fighting the mouse.
   - The +Subtask/+Event/+Task buttons leave both left-click surfaces (draft popover,
     saved-page inspector) — creation lives on right-click and the S/E/T keys.
   - "Who" moves to its own line above Start/End/Days, and is always a picker fed by
     the people list (free text is gone). Since the work-priority change, every
     department takes a crew checkbox list of any size, culled to the project team.
   - Draft popover Start/End are editable — they commit like a drag (workday-snapped,
     into the manual overlay).
   - A scroll INSIDE the popover (an input scrolling its own overflowing text while
     typing or drag-selecting) no longer closes it; page scrolls still do.
   Skips entirely on builds that predate REV61.
   Run: node test61.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/ppPopDate/.test(src)){
  console.log('  SKIP  build predates REV61 (draft popover dates not editable) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'["Nick"]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const route=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));

setTimeout(()=>{
  E("PEOPLE=[{name:'Alice A.'},{name:'Bob B.'},{name:'Nick'},{name:'Peter'}];");
  route('#/project/new');
  setTimeout(draftStage,900);
},1300);

const CONV=/ppDraftResolve/.test(src); /* REV82: the popover retired — the inspector serves drafts */
function draftStage(){
  sec(CONV?'Draft left-click selects into the shared inspector (REV82)'
          :'Draft popover (left-click on a draft bar)');
  const bar=qa('#npv-body .npv-bar:not(.sum)')[0];
  ok('a draft bar exists to click',!!bar);
  bar.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:20,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:300,clientY:20}));
  setTimeout(()=>{
    if(CONV){
      ok('the phase inspector opened',!!doc.getElementById('ins-name'));
      ok('no popover — retired in the convergence',!doc.getElementById('bar-pop'));
      const whoEl=doc.getElementById('ins-crew');
      ok('Who is a crew checkbox list, not free text',
         !!whoEl&&!!whoEl.querySelector('input[type="checkbox"]'));
      ok('the picker is fed by the people list',
         !!whoEl&&[...whoEl.querySelectorAll('input')].some(i=>i.value==='Alice A.'));
      const row3=q('#pp-insp .ins-row3');
      ok('Who sits on its own line above the dates row',
         !!whoEl&&!!row3&&!!(whoEl.compareDocumentPosition(row3)&win.Node.DOCUMENT_POSITION_FOLLOWING));

      sec('Draft dates are editable and commit like a drag');
      const s=q('#pp-insp [data-f="startDate"]');
      ok('Start is editable',!!s&&!s.readOnly&&!s.disabled);
      const key=E('npvKey(ppSelected())');
      s.value='2026-08-09'; /* a Sunday — must snap forward to Monday the 10th */
      change(s);
      setTimeout(()=>{
        const m=E('NPV_MANUAL['+JSON.stringify(key)+']');
        ok('the edit landed in the manual overlay',!!m,JSON.stringify(m));
        ok('the date snapped to a workday',m&&m.startDate==='2026-08-10',m&&m.startDate);
        ok('the bar stays selected after the commit (no popover to close)',
           !!E('ppSelected()'));
        savedStage(); /* the popover scroll rules died with the popover */
      },400);
      return;
    }
    const pop=doc.getElementById('bar-pop');
    ok('the popover opened',!!pop);
    ok('the add buttons are gone (right-click owns creation)',
       !doc.getElementById('bp-add-ph')&&!doc.getElementById('bp-add-ev')&&!doc.getElementById('bp-add-tk'));
    const whoEl=doc.getElementById('bp-who');
    ok('Who is a crew checkbox list, not free text',
       whoEl&&whoEl.classList.contains('crew-list')&&!!whoEl.querySelector('input[type="checkbox"]'));
    ok('the picker is fed by the people list',
       whoEl&&[...whoEl.querySelectorAll('input')].some(i=>i.value==='Alice A.'));
    ok('Who sits on its own line above the dates grid',
       whoEl&&!whoEl.closest('.bp-grid')&&!!doc.getElementById('bp-s').closest('.bp-grid'));

    sec('Draft dates are editable and commit like a drag');
    const s=doc.getElementById('bp-s');
    ok('Start is not read-only',!s.readOnly);
    const key=E('npvKey(NPV_TASKS.find(t=>t.id===BP_ID))');
    s.value='2026-08-09'; /* a Sunday — must snap forward to Monday the 10th */
    change(s);
    setTimeout(()=>{
      const m=E('NPV_MANUAL['+JSON.stringify(key)+']');
      ok('the edit landed in the manual overlay',!!m,JSON.stringify(m));
      ok('the date snapped to a workday',m&&m.startDate==='2026-08-10',m&&m.startDate);
      ok('the popover closed after the commit (matches name/days edits)',
         !doc.getElementById('bar-pop'));
      scrollStage();
    },400);
  },400);
}

function scrollStage(){
  sec('Scrolling inside the popover no longer closes it');
  const bar=qa('#npv-body .npv-bar:not(.sum)')[0];
  bar.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:20,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:300,clientY:20}));
  setTimeout(()=>{
    ok('the popover reopened',!!doc.getElementById('bar-pop'));
    /* An input scrolling its own text fires a scroll event targeted at the input —
       the old capture listener closed the popover on it. */
    doc.getElementById('bp-name').dispatchEvent(new win.Event('scroll'));
    ok('a scroll inside the popover leaves it open',!!doc.getElementById('bar-pop'));
    doc.body.dispatchEvent(new win.Event('scroll'));
    ok('a page scroll still closes it',!doc.getElementById('bar-pop'));
    savedStage();
  },400);
}

function savedStage(){
  sec('Saved-page inspector (REV49 lesson: assert the saved path too)');
  route('#/project/p1');
  setTimeout(()=>{
    E("ppSelect(ST.tasks.find(t=>t.department==='td').id);");
    setTimeout(()=>{
      ok('the add buttons are gone from the inspector',
         !doc.getElementById('ins-sub')&&!doc.getElementById('ins-ev')&&!doc.getElementById('ins-tk'));
      ok('Duplicate and Delete remain',
         !!doc.getElementById('ins-dup')&&!!doc.getElementById('ins-del'));
      const whoTd=doc.getElementById('ins-crew');
      ok('Crew is a checkbox list on a roster phase too',
         !!whoTd&&!!whoTd.querySelector('input[type="checkbox"]'));
      ok('the pool culls to the project team, not the whole staff',
         !!whoTd&&[...whoTd.querySelectorAll('input')].some(i=>i.value==='Stan')
         &&![...whoTd.querySelectorAll('input')].some(i=>i.value==='Alice A.'));
      ok('the current crew is pre-checked',
         !!whoTd&&[...whoTd.querySelectorAll('input:checked')].map(i=>i.value).join()==='Peter');
      const row3=q('#pp-insp .ins-row3');
      ok('Who renders above Start/End/Days',
         whoTd&&row3&&(whoTd.compareDocumentPosition(row3)&win.Node.DOCUMENT_POSITION_FOLLOWING));
      const stan=[...whoTd.querySelectorAll('input')].find(i=>i.value==='Stan');
      stan.checked=true;change(stan);
      setTimeout(()=>{
        const calls=win.__spCalls.filter(c=>c.method==='PATCH'&&c.body&&c.body.assignee);
        const last=calls[calls.length-1];
        ok('a second name saves as a plain comma list (colleague-app-readable)',
           !!last&&!/[\[\]"]/.test(last.body.assignee)
           &&/Peter/.test(last.body.assignee)&&/Stan/.test(last.body.assignee),
           last&&last.body.assignee);

      sec('Install crew is a multi-select people picker that persists');
      E("ppSelect(ST.tasks.find(t=>t.department==='install').id);");
      setTimeout(()=>{
        const crew=doc.getElementById('ins-crew');
        ok('the crew checkbox list exists',!!crew);
        ok('it is fed by the people list',
           !!crew&&qa('#ins-crew input').some(i=>i.value==='Alice A.'));
        ok('the current crew is pre-checked',
           !!crew&&qa('#ins-crew input:checked').map(i=>i.value).join()==='Nick');
        const alice=qa('#ins-crew input').find(i=>i.value==='Alice A.');
        alice.checked=true;change(alice);
        setTimeout(()=>{
          const calls=win.__spCalls.filter(c=>c.method==='PATCH'&&c.body&&c.body.assignee);
          const last=calls[calls.length-1];
          ok('checking a name saves the crew to SharePoint',
             !!last&&/Nick/.test(last.body.assignee)&&/Alice A\./.test(last.body.assignee),
             last&&last.body.assignee);
          done();
        },600);
      },400);
      },600);
    },400);
  },800);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
