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
  endDate:'2026-08-10',estimatedDays:4,ticketNodes:'[]',notes:'',pinned:false,label:'Panels'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-17',
  endDate:'2026-08-21',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f2',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-18',
  endDate:'2026-08-20',estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:'Welds'}];

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

  sec('obj 8 (v1.0.4) — phases multi-expand; Collapse all resets');
  ok('deselecting did NOT collapse (expansion is its own state)',
     qa('#npv-body .cal-band').length===expanded, qa('#npv-body .cal-band').length+' bands');
  clickBand('f1');
  ok('clicking a second phase keeps the first expanded',
     E("NPV_CAL_OPEN.has('td')&&NPV_CAL_OPEN.has('fab')")===true,
     'open: '+E("[...NPV_CAL_OPEN].join(',')"));
  ok('both phases’ subtasks are on screen',
     qa('#npv-body .cal-band').length>expanded, qa('#npv-body .cal-band').length+' bands');
  E('npvPopClose()');
  const ca=q('#npv-collapse-all');
  ok('Collapse all sits in the legend bar (calendar mode)', !!ca);
  ok('…against the right margin', !!ca&&/margin-left:auto/.test(src.match(/#npv-collapse-all\{[^}]*\}/)[0]));
  if(ca)ca.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  ok('Collapse all clears every expansion and the selection',
     E('NPV_CAL_OPEN.size')===0&&E('PP_SEL')===null);
  ok('…and the calendar is back to one band per phase',
     qa('#npv-body .cal-band').length<expanded, qa('#npv-body .cal-band').length+' bands');
  E("NPV_MODE='gantt';npvRender()");
  ok('the button leaves the legend outside calendar mode', !q('#npv-collapse-all'));
  E("NPV_MODE='calendar';npvRender()");

  sec('obj 13 — vivid tints weekends on the calendar');
  E('TINT=true;syncVivid();npvRender()');
  const weV=q('#npv-body .cal-col.we');
  ok('vivid weekend cell carries the inline month tint', !!weV&&/background/.test(weV.getAttribute('style')||''));
  E('TINT=false;syncVivid();npvRender()');
  const weQ=q('#npv-body .cal-col.we');
  ok('quiet weekend cell has no inline tint (CSS hatch shows)', !!weQ&&!/background/.test(weQ.getAttribute('style')||''));

  if(src.indexOf('popAt')>=0)return v110(); /* obj 7/9 shipped in the same file era */
  console.log('\n'+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}

function v110(){
  sec('obj 7 — double-click blank calendar space creates a phase (saved page)');
  const cell=q('#npv-body .cal-col[data-d]');
  cell.dispatchEvent(new win.MouseEvent('dblclick',{bubbles:true,clientX:200,clientY:200}));
  const menu=q('#npv-menu');
  ok('the department picker opens at the pointer', !!menu&&/Add a phase/.test(menu.innerHTML));
  const pick=menu&&menu.querySelector('button[data-act="dept"]');
  ok('it lists the spare departments', !!pick);
  const dept=pick.dataset.dept, date=cell.dataset.d;
  pick.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  const made=E("ST.tasks.filter(t=>t.department==='"+dept+"').length");
  ok('picking one files a phase in that department', made===1, made+' tasks');
  ok('…starting on the double-clicked day',
     E("ST.tasks.find(t=>t.department==='"+dept+"').startDate")===date);
  ok('…which is selected', E('PP_SEL')===E("ST.tasks.find(t=>t.department==='"+dept+"').id"));
  ok('…with its edit popover open', !!q('#npv-pop'));
  E('npvPopClose()');E('ppSelect(null,true)');

  sec('obj 9 — the grabbed edge follows the pointer, snaps on release');
  E("ppSelect('t1')"); /* expand td so its parent band is on screen */
  const i=E("NPV_TASKS.findIndex(t=>t.id==='t1')");
  /* REV72: only the segment holding the phase's true end carries the right handle —
     a multi-week phase's first segment has none. */
  const seg=qa('#npv-body .cal-band.ph[data-i="'+i+'"]').find(b=>b.querySelector('.cal-hdl.r'));
  const hdl=seg&&seg.querySelector('.cal-hdl.r');
  ok('the selected band offers a right edge handle', !!hdl);
  hdl.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:100,clientY:50,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:140,clientY:50}));
  ok('mid-drag the band segment carries a live width', (seg.getAttribute('style')||'').indexOf('width')>=0,
     'style="'+seg.getAttribute('style')+'"');
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:140,clientY:50}));
  const seg2=q('#npv-body .cal-band.ph[data-i="'+i+'"]');
  ok('release drops the live geometry (day snap owns the result)',
     !seg2||(seg2.getAttribute('style')||'').indexOf('width')<0);
  E('npvPopClose()');

  sec('obj 7 — and on the New Project draft (the REV49 lesson)');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const nm=doc.getElementById('pp-name');
    nm.value='Draft Job';nm.dispatchEvent(new win.Event('input',{bubbles:true}));
    E("ppFormSync();npvRebuild();NPV_MODE='calendar';npvRender();");
    setTimeout(()=>{
      const c2=q('#npv-body .cal-col[data-d]');
      ok('the draft calendar paints', !!c2);
      c2.dispatchEvent(new win.MouseEvent('dblclick',{bubbles:true,clientX:200,clientY:200}));
      const m2=q('#npv-menu');
      const p2=m2&&m2.querySelector('button[data-act="dept"]');
      ok('the picker opens on the draft too', !!p2);
      const d2=p2.dataset.dept;
      p2.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
      setTimeout(()=>{
        ok('the department joins the draft', E("PP_FORM.activeDepartments.includes('"+d2+"')")===true);
        ok('the fresh phase is selected with its popover open',
           E('PP_SEL')!==null&&!!q('#npv-pop'), 'PP_SEL='+E('PP_SEL')+' pop='+!!q('#npv-pop'));
        console.log('\n'+pass+' passed, '+fail+' failed');
        process.exit(fail?1:0);
      },300);
    },300);
  },350);
}
