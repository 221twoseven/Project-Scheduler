/* Phase 3.5 (REV87) — the completion flow (owner green-light 2026-08-27, both
   halves). A) The saved project page's footer gains "Mark complete": writes the
   shared status column's existing 'complete' value (verified against the
   colleague app — no schema change), which clears the meta strip's late shouts
   and disables the button; the draft deliberately has no such button.
   B) The PM late-project prompt: on load, projects whose install date has
   passed, not complete, with the signed-in user as PM, prompt once a day —
   Mark complete files right there, Later dismisses, the key stops a same-day
   re-ask. Run: node tests/test87.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('pmlate-overlay')<0){
  console.log('test87: skipped — no completion flow in '+FILE+' (pre-REV87 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Sam (the harness's stubbed sign-in) PMs both projects; both installs passed.
   p2 is the prompt's subject; p1 exercises the page button. */
const projects=[
 {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-08-20',status:'in-fabrication',projectManager:'Sam',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','install']),
  createdAt:'2026-07-01',sortIndex:0},
 {appId:'p2',Title:'Aster Lobby',client:'Aster',jobCode:'A2',
  deadline:'2026-08-14',status:'in-fabrication',projectManager:'Sam',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','install']),
  createdAt:'2026-07-01',sortIndex:1}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-21',estimatedDays:14,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'td2',projectId:'p2',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-10',estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''}];

/* meName() resolves through the shared staff list — seed Sam with the stubbed
   sign-in's email so the identity chain lands. */
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',
  depts:JSON.stringify(['pm']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
const ovOn=()=>!doc.getElementById('pmlate-overlay').classList.contains('hidden');

setTimeout(prompt1,2600); /* the init hook fires pmLateShow 1200ms after boot */

function prompt1(){
  sec('the PM prompt · late projects list the signed-in PM');
  ok('the identity chain resolved the account', E('meName()')==='Sam', String(E('meName()')));
  ok('the prompt opened on load', ovOn());
  const rows=[...doc.querySelectorAll('#pmlate-list .pml-row')];
  ok('both late projects are listed', rows.length===2, rows.length+' rows');
  ok('a row names the job and how late it is',
     /Hermes Windows/.test(rows[0].textContent)&&/ago/.test(rows[0].textContent),
     rows[0].textContent);

  const done=doc.querySelector('#pmlate-list button[data-act="done"][data-id="p2"]');
  click(done);
  setTimeout(()=>{
    ok('Mark complete filed the shared status value',
       E("ST.projects.find(p=>p.id==='p2').status")==='complete');
    ok('its row left the list', doc.querySelectorAll('#pmlate-list .pml-row').length===1);
    click(doc.getElementById('pmlate-later'));
    ok('Later dismisses the prompt', !ovOn());
    E('pmLateShow();');
    ok('same-day re-ask is suppressed (the once-a-day key)', !ovOn());
    setTimeout(pageButton,300);
  },350);
}

function pageButton(){
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('saved page · Mark complete clears the late shouts');
    const meta=()=>doc.getElementById('pp-meta').textContent;
    ok('the late project shouts before (Overdue + warning)',
       /Overdue by/.test(meta())&&/runs past the install/.test(meta()), meta().slice(0,120));
    const cmp=doc.getElementById('pp-complete');
    ok('the footer has the button', !!cmp&&cmp.textContent==='Mark complete',
       cmp&&cmp.textContent);
    click(cmp);
    setTimeout(()=>{
      ok('the status filed', E("ST.projects.find(p=>p.id==='p1').status")==='complete');
      ok('the overdue cell cleared', !/Overdue by/.test(meta()), meta().slice(0,120));
      ok('the late warning cleared', !/runs past the install/.test(meta()));
      const cmp2=doc.getElementById('pp-complete');
      ok('the button now reads complete and disables',
         !!cmp2&&cmp2.disabled&&/Complete/.test(cmp2.textContent), cmp2&&cmp2.textContent);
      setTimeout(draftPage,300);
    },400);
  },700);
}

function draftPage(){
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('draft page · no complete button (nothing exists to complete)');
    ok('the draft footer has no Mark complete', !doc.getElementById('pp-complete'));
    done();
  },700);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
