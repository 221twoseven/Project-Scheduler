/* v1.21.0 — calendar detail levels (owner ask, 2026-09-09). A fully stacked job made the
   calendar unreadable: one titled row per phase per week plus one row per marker. Now every
   phase starts as a slim colour strip and markers as bare glyphs; the legend chips are
   buttons that step a phase 0 → 1 (titled) → 2 (subtasks) → 0, Milestone/Note toggle the
   marker text, and markers pack into shared rows. Collapse all resets everything.
   Run: node tests/test-v1210.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('npvCalLvl')<0){
  console.log('test-v1210: skipped — pre-v1.21.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
/* Dates hang off the next Monday so the two markers land in one calendar week. */
const mon=new Date();mon.setHours(0,0,0,0);mon.setDate(mon.getDate()+(((8-mon.getDay())%7)||7));
const D=n=>{const d=new Date(mon);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const staff=[
  {appId:'s1',Title:'Sam Ortiz',depts:JSON.stringify(['td']),ooo:'[]',email:'user@example.com',role:'Drafter'},
  {appId:'s2',Title:'Caroline Bondi',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'}];
const projects=[{appId:'p1',Title:'Stacked Job',client:'C',jobCode:'J1',deadline:D(20),
  status:'in-fabrication',projectManager:'Caroline Bondi',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'',startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p1',department:'fab',assignee:'',startDate:D(1),endDate:D(2),estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:'Door Frames'},
  {appId:'t3',projectId:'p1',department:'td',assignee:'Sam Ortiz',startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const events=[{appId:'e1',projectId:'p1',department:'',Title:'Sign-off',date:D(1),notes:''},
              {appId:'e2',projectId:'p1',department:'',Title:'Ship',date:D(2),notes:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[],events},eventsList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const go=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const bands=()=>qa('#npv-body .cal-band.ph');
const band=t=>bands().filter(b=>b.textContent.indexOf(t)===0)[0];
const chip=d=>q('#npv-leg button[data-dept="'+d+'"]');

setTimeout(()=>{go('#/project/p1');setTimeout(savedPage,900);},1300);

function savedPage(){
  E("NPV_MODE='calendar';ppSelect(null,true);npvRender()");
  sec('saved project · level 0 by default');
  ok('every parent band is a slim strip', bands().length>0&&bands().every(b=>b.classList.contains('slim')), bands().length+' bands');
  ok('the label stays in the DOM under the strip (tooltips, tests)', !!band('Fab')||bands().some(b=>b.textContent.trim().length>0));
  ok('the subtask band is hidden', !band('Door Frames'));
  ok('the .cal root carries mk0 (glyph-only markers)', !!q('#npv-body .cal.mk0'));
  const mks=qa('#npv-body .cal-band.ev');
  ok('two milestones in the week', mks.length===2, mks.length);
  ok('…on different days share one row', mks.length===2&&mks[0].style.gridRow===mks[1].style.gridRow,
     mks.map(m=>m.style.gridRow).join(' vs '));
  ok('the slim strip CSS hides the text', /\.cal-band\.ph\.slim \.cal-txt\{display:none\}/.test(src));
  ok('glyph-only CSS hides marker text under .mk0', /\.cal\.mk0 \.cal-band\.ev \.cal-txt[^{]*\{display:none\}/.test(src));

  sec('legend chips are buttons that step the level');
  const fab=chip('fab');
  ok('the fab chip is a button', !!fab&&fab.tagName==='BUTTON');
  ok('…reading level 0', fab&&fab.classList.contains('lv0'));
  click(fab);
  ok('one click → level 1', E("npvCalLvl('fab')")===1);
  const full=bands().filter(b=>!b.classList.contains('slim'));
  ok('…the fab parent band is titled (not slim), td still a strip',
     full.length===1&&E('NPV_TASKS['+full[0].dataset.i+'].department')==='fab', bands().map(b=>b.className).join(' | '));
  ok('…subtasks still hidden', !band('Door Frames'));
  ok('…the td strip is untouched', !!chip('td')&&chip('td').classList.contains('lv0'));
  click(chip('fab'));
  ok('second click → level 2', E("npvCalLvl('fab')")===2&&chip('fab').classList.contains('lv2'));
  ok('…the subtask band shows', !!band('Door Frames'), bands().map(b=>b.textContent).join(' | '));
  click(chip('fab'));
  ok('third click → back to a strip', E("npvCalLvl('fab')")===0&&!band('Door Frames')&&bands().every(b=>b.classList.contains('slim')));

  sec('marker text toggle + Collapse all');
  const mk=q('#npv-leg button[data-mk]');
  ok('the Milestone chip is a button', !!mk);
  click(mk);
  ok('marker text on: mk0 gone', E('NPV_CAL_MK')===true&&!q('#npv-body .cal.mk0'));
  click(chip('td'));click(chip('td'));
  ok('td at level 2', E("npvCalLvl('td')")===2);
  click(q('#npv-collapse-all'));
  ok('Collapse all: levels cleared, marker text off', E('NPV_CAL_OPEN.size')===0&&E('NPV_CAL_MK')===false&&!!q('#npv-body .cal.mk0'));

  sec('the selected phase always reads at full size');
  E("ppSelect('t3',true)");
  ok('selecting td lifts its band out of slim', !!band('Tech')||bands().some(b=>b.classList.contains('pick')&&!b.classList.contains('slim')),
     bands().map(b=>b.className).join(' | '));
  E("ppSelect(null,true)");

  sec('the tour teaches the levels (v1.21.1)');
  E("NPV_MODE='gantt';npvRender()");
  const st=JSON.parse(E("JSON.stringify(COACH_PP_STEPS.map(s=>s.sel))"));
  ok('the project tour has a legend step after the view toggle', st.indexOf('#npv-leg')===st.indexOf('.npv-modes')+1, st.join(' | '));
  E("coachStart(COACH_PP_STEPS);COACH.i=COACH.steps.findIndex(s=>s.sel==='#npv-leg');coachShow()");
  ok('showing it switches the chart to the calendar', E('NPV_MODE')==='calendar');
  ok('…so the spotlit legend holds the chip buttons', qa('#npv-leg button[data-dept]').length>0);
  ok('the card names the legend click', /Click a phase in this legend/.test(q('#coach-body').textContent), q('#coach-body').textContent);
  E('coachEnd()');

  sec('changelog never echoes note text (v1.21.2)');
  const dOld=E("clogDiff({projects:[],tasks:[{id:'x',projectId:'p1',department:'fab',notes:'',assignee:'A'}]},{projects:[],tasks:[{id:'x',projectId:'p1',department:'fab',notes:'Iceberg:\\n- Buck\\nTesting: seams',assignee:'B'}]})[0].detail");
  ok('a filled note logs as added, other fields keep old → new', dOld==='notes: added\nassignee: A → B', JSON.stringify(dOld));
  const dEd=E("clogDiff({tasks:[{id:'x',notes:'a'}]},{tasks:[{id:'x',notes:'b'}]})[0].detail");
  ok('a changed note logs as edited', dEd==='notes: edited', JSON.stringify(dEd));
  const dCl=E("clogDiff({tasks:[{id:'x',notes:'a'}]},{tasks:[{id:'x',notes:''}]})[0].detail");
  ok('an emptied note logs as cleared', dCl==='notes: cleared', JSON.stringify(dCl));
  const legacy=E("clogDetail({field:'notes, assignee',detail:'notes: — → Iceberg:\\n- Buck\\nTesting: seams → x\\nassignee: A → B'})");
  ok('a pre-v1.21.2 row folds its note text at render, keeping the other fields', legacy==='notes: added\nassignee: A → B', JSON.stringify(legacy));
  const legacy2=E("clogDetail({field:'notes',detail:'notes: old text\\nmore → new text'})");
  ok('…and an edited legacy note reads as edited', legacy2==='notes: edited', JSON.stringify(legacy2));

  sec('the Gantt legend stays plain');
  E("NPV_MODE='gantt';npvRender()");
  ok('no legend buttons in Gantt mode', qa('#npv-leg button').length===0);
  E("NPV_MODE='calendar';npvRender()");
  go('#/project/new');setTimeout(draftPage,800);
}

function draftPage(){
  const nm=doc.getElementById('pp-name');
  nm.value='Draft Job';nm.dispatchEvent(new win.Event('input',{bubbles:true}));
  E("ppFormSync();npvRebuild();NPV_MODE='calendar';npvRender();");
  setTimeout(()=>{
    sec('draft page · same defaults, same chips');
    ok('the draft opens at level 0 everywhere', bands().length>0&&bands().every(b=>b.classList.contains('slim')), bands().length+' bands');
    const c=q('#npv-leg button[data-dept]');
    ok('legend chips are buttons on the draft too', !!c);
    if(c){click(c);ok('a click lifts that phase to a titled bar', E("npvCalLvl('"+c.dataset.dept+"')")===1&&bands().some(b=>!b.classList.contains('slim')));}
    done();
  },400);
}

function done(){
  console.log('\ntest-v1210: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
