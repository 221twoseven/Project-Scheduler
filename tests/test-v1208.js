/* v1.20.8 — the creator is the default Project Manager (owner request, 2026-09-08).
   A new-project draft opens with the signed-in person checked under Team ▸ Project
   manager, even when they are not on the PM roster (their box is added, checked).
   Unchecking swaps the name like any other role; saved projects are untouched; with
   no resolvable sign-in the field stays blank as before.
   Run: node tests/test-v1208.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("projectManager:meName()||''")<0){
  console.log('test-v1208: skipped — pre-v1.20.8 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

/* The harness signs in as user@example.com. Sam Ortiz owns that email but is a
   drafter, not a PM — the non-PM-creates-a-project case. */
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

setTimeout(main,1300);

function main(){
  ok('the sign-in resolves to the drafter through the email chain', E('meName()')==='Sam Ortiz', E('meName()'));
  go('#/project/new');
  setTimeout(draftPart,800);
}

function draftPart(){
  sec('new-project draft: the creator is the Project Manager');
  ok('the draft carries the creator as PM', E('PP_FORM.projectManager')==='Sam Ortiz', E('PP_FORM.projectManager'));
  const checked=qa('#pp-r-pm input:checked').map(i=>i.value);
  ok('their box renders checked even though they are not on the PM roster', checked.join('|')==='Sam Ortiz', checked.join('|'));
  ok('the PM roster still lists the real PMs', qa('#pp-r-pm input').map(i=>i.value).includes('Caroline Bondi'));
  ok('an untouched draft is not dirty', E('ppDraftDirty()')===false, E('PP_SNAP')+' vs '+E('JSON.stringify(PP_FORM)'));

  sec('the name can be swapped like any other role');
  const mine=qa('#pp-r-pm input').find(i=>i.value==='Sam Ortiz');
  const car=qa('#pp-r-pm input').find(i=>i.value==='Caroline Bondi');
  mine.click();car.click();
  E('ppFormSync()');
  ok('unchecking yourself and checking a PM moves the field', E('PP_FORM.projectManager')==='Caroline Bondi', E('PP_FORM.projectManager'));

  sec('saved project page is untouched');
  go('#/project/p1');
  setTimeout(savedPart,800);
}

function savedPart(){
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

  sec('no resolvable sign-in: blank as before');
  E('ACCOUNT=null;ppFormInit()');
  ok('an unresolved account leaves the PM empty', E('PP_FORM.projectManager')==='');

  console.log('\n'+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
