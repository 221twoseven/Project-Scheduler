/* v1.6.5 — legacy person strings resolve to roster people (owner report, 2026-09-01).
   Old project records store abbreviated names ("Caroline B.", bare "Stan") in the
   projectManager/drafter/leadFab fields while the staff picker writes full display
   names. canonName() resolves any crew/role string to its roster person when the
   match is unambiguous; barCrew() routes through it, so:
   - dept-lens roster lanes merge (no empty full-name lane next to a working
     abbreviated lane);
   - the person filter / Summary / My Dashboard finds legacy-named work;
   - the overbooking check no longer skips unresolvable legacy crews;
   - assigneeText displays the roster name.
   Ambiguous ("Davis S." with Davis Smith AND Davis Stone on staff) or unknown
   strings pass through untouched and keep their own lane. Stored values are never
   rewritten. Run: node tests/test-v165.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('canonName')<0){
  console.log('test-v165: skipped — pre-v1.6.5 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const mkProj=(id,name,pm,i)=>({appId:id,Title:name,client:'C',jobCode:'J'+i,deadline:D(40+i),
  status:'in-fabrication',projectManager:pm,drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:i});
const projects=[
  mkProj('p1','Legacy Caroline','Caroline B.',0),   /* abbreviated → resolves */
  mkProj('p2','Bare Stan','Stan',1),                /* bare first name → resolves */
  mkProj('p3','Ambiguous Davis','Davis S.',2),      /* two Davises → stays raw */
  mkProj('p4','Canonical Caroline','Caroline Bondi',3),
  {...mkProj('p5','Late Legacy','Caroline B.',4),deadline:D(-3)}]; /* past deadline, legacy PM */
/* pm umbrella bars: no crew of their own, so barCrew falls back to the project team.
   p1 and p4 overlap → same resolved person on two projects → a conflict the raw
   compare used to miss entirely. */
const mkTask=(id,pid,dept,who,s,e)=>({appId:id,projectId:pid,department:dept,assignee:who,
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[
  mkTask('t1','p1','pm','',D(-2),D(6)),
  mkTask('t2','p2','pm','',D(-2),D(6)),
  mkTask('t3','p3','pm','',D(-2),D(6)),
  mkTask('t4','p4','pm','',D(2),D(9)),
  mkTask('t5','p1','fab','Caroline B.',D(0),D(4))]; /* explicit legacy crew */
const staff=[
  {appId:'s1',Title:'Caroline Bondi',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'},
  {appId:'s2',Title:'Stan Kim',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'},
  {appId:'s3',Title:'Davis Smith',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'},
  {appId:'s4',Title:'Davis Stone',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:'PM'},
  {appId:'s5',Title:'Nick Reyes',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const qa=s=>[...doc.querySelectorAll(s)];

setTimeout(main,1300);

function main(){
  sec('canonName resolves the observed legacy forms');
  ok('"Caroline B." → Caroline Bondi', E("canonName('Caroline B.')")==='Caroline Bondi');
  ok('initial without the dot works too', E("canonName('Caroline B')")==='Caroline Bondi');
  ok('bare first name resolves when unique', E("canonName('Stan')")==='Stan Kim');
  ok('case differences heal', E("canonName('CAROLINE BONDI')")==='Caroline Bondi');
  ok('an ambiguous initial stays raw (two Davises)', E("canonName('Davis S.')")==='Davis S.');
  ok('an unknown name stays raw', E("canonName('Zed Q.')")==='Zed Q.');

  sec('dept lens: one lane per human, legacy work merged in');
  E("LENS='dept';PERSON=null;render()");
  const lanes=E("ROWS.filter(r=>r.kind==='deptLane'&&r.dept==='pm').map(r=>r.assignee).join('|')");
  ok('no abbreviated Caroline lane survives', lanes.indexOf('Caroline B.')<0, lanes);
  ok('exactly one Caroline Bondi lane', lanes.split('|').filter(n=>n==='Caroline Bondi').length===1, lanes);
  ok('…holding BOTH her projects (legacy + canonical)',
     E("ROWS.find(r=>r.kind==='deptLane'&&r.dept==='pm'&&r.assignee==='Caroline Bondi').tasks.length")===2);
  ok('bare-first-name work lands in the Stan Kim lane',
     E("ROWS.find(r=>r.kind==='deptLane'&&r.dept==='pm'&&r.assignee==='Stan Kim').tasks.length")===1);
  ok('the ambiguous string keeps its own lane', lanes.split('|').indexOf('Davis S.')>=0, lanes);

  sec('the person filter finds legacy-named work (the empty-dashboard bug)');
  E("PERSON='Caroline Bondi';render()");
  ok('her plate includes the legacy-managed project',
     E("visTasks().filter(personHit).some(t=>t.id==='t1')"));
  ok('…and the explicitly legacy-crewed bar', E("visTasks().filter(personHit).some(t=>t.id==='t5')"));
  E("PERSON=null;LENS='project';render()");

  sec('overbooking sees through legacy strings');
  E('computeConflicts()');
  ok('the p1/p4 overlap is flagged on both bars',
     E("CONFLICTS.has('t1')&&CONFLICTS.has('t4')"));
  ok('the tooltip counts the other job', E("conflictCount(taskById('t1'))")===1,
     E("conflictCount(taskById('t1'))"));
  ok('the lone Stan bar stays clean', !E("CONFLICTS.has('t2')"));

  sec('display follows the roster name, storage stays untouched');
  ok('assigneeText shows the resolved name', E("assigneeText(taskById('t5'))")==='Caroline Bondi');
  ok('the stored assignee string is NOT rewritten', E("taskById('t5').assignee")==='Caroline B.');
  ok('the stored projectManager field is NOT rewritten', E("projById('p1').projectManager")==='Caroline B.');

  sec('grouping, sorting and the PM late prompt see one identity');
  ok('PM group keys match across legacy and canonical records',
     E("GROUP_BY='pm';groupKeyOf(projById('p1'))===groupKeyOf(projById('p4'))&&groupKeyOf(projById('p1'))")==='Caroline Bondi');
  E("GROUP_BY=null");
  ok('the late prompt reaches a legacy-recorded PM',
     E("PEOPLE.find(p=>p.name==='Caroline Bondi').email='user@example.com';pmLateList().some(p=>p.id==='p5')"));

  /* the project editor face: the roster person's box checks, no phantom box */
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(editorPart,800);
}

function editorPart(){
  sec('project editor: the roster person is checked, no phantom legacy box');
  const vals=qa('#pp-r-pm input').map(i=>i.value);
  const checked=qa('#pp-r-pm input:checked').map(i=>i.value);
  ok('no phantom abbreviated checkbox renders', vals.indexOf('Caroline B.')<0, vals.join('|'));
  ok('Caroline Bondi arrives pre-checked', checked.join('|')==='Caroline Bondi', checked.join('|'));

  sec('project-page gutter names the roster person');
  const guts=qa('.npv-gut').map(g=>g.textContent).join('|');
  ok('the fab row gutter shows the resolved crew', guts.indexOf('Caroline Bondi')>=0, guts);
  ok('…never the abbreviation', guts.indexOf('Caroline B.')<0, guts);

  console.log('\ntest-v165: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
