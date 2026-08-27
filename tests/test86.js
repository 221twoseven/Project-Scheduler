/* Phase 3.5 (REV86) — coach marks on the project pages (owner decision
   2026-08-27: ONE shared tour). Help on a project page starts a project-page
   tour in place (it used to bounce to the timeline); the step list is shared
   between the saved page and the New Project draft, with the existing
   missing-target filter supplying the branch: the draft sees the Create step
   (#pp-save), the saved page sees the autosave step (.pg-auto). The timeline's
   own tour is untouched.
   Run: node tests/test86.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('COACH_PP_STEPS')<0){
  console.log('test86: skipped — no project-page tour in '+FILE+' (pre-REV86 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
const coachOn=()=>!doc.getElementById('coach').classList.contains('hidden');
const targets=()=>JSON.parse(E('JSON.stringify(COACH?COACH.steps.map(s=>s.sel):[])'));

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(savedPage,700);
},1300);

function savedPage(){
  sec('saved page · Help starts the project tour in place');
  click(doc.getElementById('btn-help'));
  setTimeout(()=>{
    ok('the tour opened', coachOn());
    ok('it stayed on the project page', E("ROUTE.view")==='project', E("ROUTE.view"));
    const t=targets();
    ok('it walks the project surfaces (trail, meta, chart, views, editor)',
       t.includes('.pg-trail')&&t.includes('#pp-meta')&&t.includes('#pp-insp'),
       t.join(' | '));
    ok('the saved page gets the autosave step', t.includes('.pg-auto'), t.join(' | '));
    ok('…and not the draft Create step', !t.includes('#pp-save'), t.join(' | '));
    /* Enter walks forward; the tour ends cleanly */
    E('coachEnd();');
    ok('the tour closes', !coachOn());
    setTimeout(draftPage,300);
  },250);
}

function draftPage(){
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('draft page · same tour, the branch flips');
    click(doc.getElementById('btn-help'));
    setTimeout(()=>{
      ok('the tour opened on the draft', coachOn());
      const t=targets();
      ok('the draft gets the Create step', t.includes('#pp-save'), t.join(' | '));
      ok('…and not the autosave step', !t.includes('.pg-auto'), t.join(' | '));
      E('coachEnd();');
      setTimeout(timelinePage,300);
    },250);
  },700);
}

function timelinePage(){
  E('goTimeline();');
  setTimeout(()=>{
    sec('timeline · the original tour is untouched');
    click(doc.getElementById('btn-help'));
    setTimeout(()=>{
      ok('the tour opened', coachOn());
      const t=targets();
      ok('it is the timeline tour (starts at the sidebar)', t[0]==='#sidebar', t.join(' | '));
      E('coachEnd();');
      done();
    },250);
  },400);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
