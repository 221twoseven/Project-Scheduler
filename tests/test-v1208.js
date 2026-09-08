/* v1.20.8 — Project Manager is required on Create (owner request, 2026-09-08; replaced the
   short-lived "creator is the default PM" idea the same day). A new-project draft opens
   with NO Project Manager; Create refuses until one is checked under Team, marking the
   box the way a missing name or install date is marked. Also: My Dashboard lists every
   row (no "+N more" cap) and an untouched draft does not read dirty.
   Run: node tests/test-v1208.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("!pm&&'a Project Manager'")<0){
  console.log('test-v1208: skipped — pre-v1.20.8 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const staff=[
  {appId:'s1',Title:'Sam Ortiz',depts:JSON.stringify(['td']),ooo:'[]',email:'user@example.com',role:'Drafter'},
  {appId:'s2',Title:'Caroline Bondi',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'},
  {appId:'s3',Title:'Stan Kim',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'}];
const projects=[{appId:'p1',Title:'Saved Job',client:'C',jobCode:'J1',deadline:D(40),
  status:'in-fabrication',projectManager:'Caroline Bondi',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Stan Kim',startDate:D(0),endDate:D(4),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p1',department:'td',assignee:'Sam Ortiz',startDate:D(0),endDate:D(4),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
/* 12 dated milestones on Sam's project — more than the old 8-row dashboard cap. */
const events=Array.from({length:12},(_,i)=>({appId:'e'+i,projectId:'p1',department:'',Title:'Ship '+i,date:D(5+i),notes:''}));

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[],events},eventsList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const qa=s=>[...doc.querySelectorAll(s)];
const go=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};

setTimeout(()=>{go('#/project/new');setTimeout(draftPart,800);},1300);

function draftPart(){
  sec('new-project draft: no Project Manager pre-checked');
  ok('the draft opens with an empty PM', E('PP_FORM.projectManager')==='', E('PP_FORM.projectManager'));
  ok('no PM box is checked', qa('#pp-r-pm input:checked').length===0);
  ok('the PM roster lists the real PMs', qa('#pp-r-pm input').map(i=>i.value).includes('Caroline Bondi'));
  ok('an untouched draft is not dirty', E('ppDraftDirty()')===false, E('PP_SNAP')+' vs '+E('JSON.stringify(PP_FORM)'));

  sec('Create refuses without a Project Manager');
  const n0=E('ST.projects.length');
  doc.getElementById('pp-name').value='Needs a PM';
  doc.getElementById('pp-save').click();
  ok('no project was created', E('ST.projects.length')===n0, E('ST.projects.length'));
  ok('still on the draft page', E('ROUTE.creating')===true);
  ok('the PM box is marked in error', !!doc.querySelector('#pp-r-pm.err'));
  const tt=qa('.toast').map(t=>t.textContent).join('|');
  ok('the toast names the missing PM', /Project Manager/.test(tt), tt);

  sec('checking a PM lets Create through');
  const car=qa('#pp-r-pm input').find(i=>i.value==='Caroline Bondi');
  car.click();
  doc.getElementById('pp-save').click();
  setTimeout(()=>{
    ok('the project was created', E('ST.projects.length')===n0+1, E('ST.projects.length'));
    ok('with the checked PM', E("ST.projects.some(p=>p.name==='Needs a PM'&&p.projectManager==='Caroline Bondi')"));
    go('#/project/p1');
    setTimeout(savedPart,800);
  },400);
}

function savedPart(){
  sec('saved project page is untouched');
  const checked=qa('#pp-r-pm input:checked').map(i=>i.value);
  ok('the saved project keeps its own PM', checked.join('|')==='Caroline Bondi', checked.join('|'));
  ok('the stored record never changed', E("projById('p1').projectManager")==='Caroline Bondi');

  sec('My Dashboard: every milestone listed, nothing folded behind +N more');
  go('#/');
  E("enterDash('Sam Ortiz')");
  const ms=qa('#me-dock .ins-body>.ins-sec').find(s=>/Milestones/.test(s.querySelector('h4').textContent));
  ok('the Milestones column renders', !!ms);
  ok('all 12 milestones are rows', ms&&ms.querySelectorAll('.md-row').length===12, ms&&ms.querySelectorAll('.md-row').length);
  ok('no +N more stub anywhere in the dock', !doc.querySelector('#me-dock .md-more'));
  ok('the column body scrolls (stylesheet rule)', src.includes('.ins-sec .in{padding:8px 15px 14px;flex:1;min-height:0;overflow-y:auto}'));

  console.log('\n'+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
