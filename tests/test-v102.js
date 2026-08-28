/* v1.0.2 quick-wins batch — four owner objectives + a copy fix.
   1) (obj 5)  Window resize keeps the selection: the phase/subtask dock form and
      breadcrumb survive a PP_KEEP repaint instead of dropping to the project pane.
   2) (obj 8)  A blank calendar click that dismisses the edit popover keeps the
      selection (and so the expanded phase); the NEXT blank click deselects/collapses.
   3) (obj 13) Vivid months paints no grey weekend strips: calendar weekend cells take
      the month tint inline when TINT is on, and the overlay CSS hides in vivid.
   4) (obj 12) The toolbar is the mellowed slate bar, not the ink-black gradient.
   5) Stale "Settings" strings are gone (the menu retired in REV95 — it's Resources).
   Run: node tests/test-v102.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* Pre-v1.0.2 builds (and the frozen reference) lack the vivid weekend rule. */
if(src.indexOf('body.vivid .wknd-col{display:none}')<0){
  console.log('test-v102: skipped — pre-v1.0.2 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'approved',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'t0',projectId:'p1',department:'pm',assignee:'Stan',startDate:'2026-08-03',
  endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-14',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t1b',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-05',
  endDate:'2026-08-10',estimatedDays:4,ticketNodes:'[]',notes:'',pinned:false,label:'Panels'}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const mdown=el=>el.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:50,clientY:50,button:0}));
/* a real single click on a task's calendar band: mousedown (≤4px) then click, detail 1 */
const clickBand=id=>{
  const i=E("NPV_TASKS.findIndex(t=>t.id==='"+id+"')");
  const b=q('#npv-body .cal-band.ph[data-i="'+i+'"]');
  mdown(b);
  b.dispatchEvent(new win.MouseEvent('click',{bubbles:true,clientX:50,clientY:50,button:0,detail:1}));
};

sec('source-level checks');
ok('stale "add people in Settings" strings are gone', src.indexOf('in Settings')<0&&src.indexOf('under Settings')<0);
ok('client comment points at Resources, not Settings', src.indexOf('Settings → Clients')<0);
ok('toolbar no longer paints the ink-black gradient',
   !/#toolbar\{[^}]*var\(--ink-2\),var\(--ink\)/.test(src));
ok('toolbar paints the mellowed slate pair', src.indexOf('#2A3850')>=0&&src.indexOf('#202C41')>=0);
ok('project-gantt weekend overlays hide in vivid',
   src.indexOf('body.vivid .npv-we{display:none}')>=0&&src.indexOf('body.vivid .npv-web{display:none}')>=0);
ok('no vivid hatch rule remains for calendar weekends', !/body\.vivid \.cal-col\.we\{/.test(src));

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(resizeKeepsSelection,800);
},1300);

function resizeKeepsSelection(){
  sec('obj 5 — window resize keeps the selection (gantt)');
  E("NPV_OPEN.add('td');npvRebuild()");
  E("ppSelect('t1b')");
  ok('subtask selected, dock on the phase pane', E('PP_SEL')==='t1b'&&E('PP_INSP')==='phase');
  win.dispatchEvent(new win.Event('resize'));
  setTimeout(()=>{
    ok('selection survives the resize', E('PP_SEL')==='t1b', 'PP_SEL='+E('PP_SEL'));
    ok('dock still shows the phase pane', E('PP_INSP')==='phase');
    ok('breadcrumb keeps the phase tail', (q('#pp-bc')||{}).textContent==='Panels');
    ok('the bar keeps its selection ring', !!q('#npv-body .npv-bar.pick'));

    sec('obj 5 — and on the calendar');
    E("NPV_MODE='calendar';npvRender()");
    E("ppSelect('t1b')");
    win.dispatchEvent(new win.Event('resize'));
    setTimeout(calendarPopoverClick,120);
  },120);
}

function calendarPopoverClick(){
  ok('calendar selection survives the resize', E('PP_SEL')==='t1b', 'PP_SEL='+E('PP_SEL'));

  sec('obj 8 (revised) — blank space never collapses; the parent band toggles');
  E("ppSelect('t1')");
  const expanded=qa('#npv-body .cal-band').length;
  E("npvEditPop('phase',ppSelected(),100,100)");
  ok('popover open on the selected phase', !!q('#npv-pop'));
  ok('selection expands the subtasks', expanded>2, expanded+' bands');
  mdown(q('#npv-body .cal-col'));
  ok('blank click closes the popover', !q('#npv-pop'));
  ok('…but keeps the selection', E('PP_SEL')==='t1', 'PP_SEL='+E('PP_SEL'));
  ok('…and the phase stays expanded', qa('#npv-body .cal-band').length===expanded);
  mdown(q('#npv-body .cal-col'));
  ok('a second blank click still keeps the selection', E('PP_SEL')==='t1', 'PP_SEL='+E('PP_SEL'));
  ok('…and the phase stays expanded', qa('#npv-body .cal-band').length===expanded);
  /* re-clicking a selected SUBTASK band reopens its editor, no collapse */
  E("ppSelect('t1b')");
  clickBand('t1b');
  ok('re-clicked subtask band reopens the popover', !!q('#npv-pop'));
  ok('…subtask stays selected, phase expanded', E('PP_SEL')==='t1b'&&qa('#npv-body .cal-band').length===expanded);
  E('npvPopClose()');
  /* the second click on the PARENT band is what collapses */
  E("ppSelect('t1')");E('npvPopClose()');
  clickBand('t1');
  ok('second click on the parent band deselects', E('PP_SEL')===null, 'PP_SEL='+E('PP_SEL'));
  ok('…and collapses the phase', qa('#npv-body .cal-band').length<expanded);
  clickBand('t1');
  ok('clicking the collapsed parent selects and expands again', E('PP_SEL')==='t1'&&qa('#npv-body .cal-band').length===expanded);
  ok('…and reopens the editor popover', !!q('#npv-pop'));
  E("ppSelect(null,true)");E('npvPopClose()');

  sec('obj 13 — vivid tints weekends on the calendar');
  E('TINT=true;syncVivid();npvRender()');
  const weV=q('#npv-body .cal-col.we');
  ok('vivid weekend cell carries the inline month tint', !!weV&&/background/.test(weV.getAttribute('style')||''));
  E('TINT=false;syncVivid();npvRender()');
  const weQ=q('#npv-body .cal-col.we');
  ok('quiet weekend cell has no inline tint (CSS hatch shows)', !!weQ&&!/background/.test(weQ.getAttribute('style')||''));

  console.log('\n'+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
