/* v1.7.2 — the 2026-09-01 handoff quick wins + the v1.6.5 legacy-name data scrub.
   - Wordmark: "TWOSEVEN" → "TWOSEVEN INC." (toolbar, print title, meeting sheet).
   - Coach copy: "Departments lens regroups everything by crew" → "Department lens
     regroups everything by department" (owner wording).
   - Sort controls (Due date / Client / PM / Status) hide in the Departments lens —
     they order projects; dept rows are people lanes.
   - Drag-zoom max extends 91 → 365 days (buttons still stop at 3-Mo).
   - scrubLegacyNames(): console-run one-time scrub that rewrites STORED legacy
     person strings (project roles, phase crews, note assignees) to roster names
     via canonName; dry-run by default, applies through saveState. Free-text
     departments and ambiguous/unknown strings are never touched.
   Run: node tests/test-v172.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('scrubLegacyNames')<0){
  console.log('test-v172: skipped — pre-v1.7.2 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

sec('source: copy + wordmark');
/* v1.10.0 made the wordmark a home-navigation button — accept either element */
ok('toolbar wordmark reads TWOSEVEN INC.', src.indexOf('<span class="tb-co">TWOSEVEN INC.</span>')>=0
   || /<button id="tb-home" class="tb-co"[^>]*>TWOSEVEN INC\.<\/button>/.test(src));
ok('print title carries the full wordmark', src.indexOf("'TWOSEVEN INC. — Shop Timeline · '")>=0);
ok('meeting sheet carries the full wordmark', src.indexOf('TWOSEVEN INC. — Shop Meeting Sheet')>=0);
/* v1.15.1 owner copy pass capitalized "by Department." — accept either case */
ok('coach step says department, not crew', /Department lens regroups everything by [Dd]epartment\./.test(src)
   && src.indexOf('regroups everything by crew')<0);
ok('sort footer hides in the dept lens (CSS)', /body\.lens-dept #sb-foot\{display:none\}/.test(src));

const mkProj=(id,name,pm,dr,i)=>({appId:id,Title:name,client:'C',jobCode:'J'+i,deadline:D(40+i),
  status:'in-fabrication',projectManager:pm,drafter:dr,leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:i});
const projects=[
  mkProj('p1','Legacy Roles','Caroline B.','Stan',0),      /* both resolve */
  mkProj('p2','Ambiguous Davis','Davis S.','',1),          /* two Davises → untouched */
  mkProj('p3','Already Canonical','Caroline Bondi','',2)];
const mkTask=(id,pid,dept,who,s,e)=>({appId:id,projectId:pid,department:dept,assignee:who,
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[
  mkTask('t1','p1','fab','Caroline B.',D(0),D(4)),              /* comma-string crew */
  mkTask('t2','p1','install',JSON.stringify(['Stan','Installation']),D(5),D(8)), /* JSON crew */
  mkTask('t3','p2','othshop','Stan',D(0),D(3)),                 /* free-text dept: label, not a person */
  mkTask('t4','p3','fab','Caroline Bondi',D(0),D(4))];          /* already canonical */
const todos=[{appId:'k1',Title:'Order acrylic',projectId:'p1',department:'',
  assignees:JSON.stringify(['Caroline B.']),dueDate:D(3),startDate:null,progress:'notstarted',
  priority:'medium',notes:'',labels:'[]',checklist:'[]',createdBy:'',completedOn:null,
  completedBy:'',sortIndex:0}];
const staff=[
  {appId:'s1',Title:'Caroline Bondi',depts:JSON.stringify(['pm','fab']),ooo:'[]',email:'',role:'PM'},
  {appId:'s2',Title:'Stan Kim',depts:JSON.stringify(['pm','fab']),ooo:'[]',email:'',role:''},
  {appId:'s3',Title:'Davis Smith',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:''},
  {appId:'s4',Title:'Davis Stone',depts:JSON.stringify(['pm']),ooo:'[]',email:'',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos},todosList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const calls=()=>win.__spCalls;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('sort controls hide in the Departments lens');
  ok('projects lens: no lens-dept class', !doc.body.classList.contains('lens-dept'));
  E("document.getElementById('btn-lens-dept').click()");
  ok('dept lens: body carries lens-dept', doc.body.classList.contains('lens-dept'));
  E("document.getElementById('btn-lens-proj').click()");
  ok('back to projects: class drops', !doc.body.classList.contains('lens-dept'));

  sec('drag-zoom range extends to a year');
  ok('FIT_MAX is 365', E('FIT_MAX')===365);
  ok('a 200-day fit sticks (no 91 clamp)', E('(setFit(200,true),FIT)')===200);
  ok('a stored 300-day fit restores', (E('(applyViewState({fit:300}),FIT)')===300));
  ok('the year view has no step-button name', E('VIEW')==='custom');
  E('setFit(30,true)');

  sec('scrubLegacyNames: dry run reports, writes nothing');
  const before=calls().length;
  const rep=JSON.parse(E('JSON.stringify(scrubLegacyNames())'));
  ok('reports the two project role fields', rep.filter(r=>r.kind==='project').length===2,
     JSON.stringify(rep.filter(r=>r.kind==='project')));
  ok('reports the comma-string crew', rep.some(r=>r.kind==='phase'&&r.before==='Caroline B.'&&r.after==='Caroline Bondi'));
  ok('reports the install crew array, Installation kept',
     rep.some(r=>r.kind==='phase'&&r.after==='Stan Kim, Installation'));
  ok('reports the note assignee', rep.some(r=>r.kind==='note'&&r.after==='Caroline Bondi'));
  ok('skips the ambiguous Davis', !rep.some(r=>String(r.before).indexOf('Davis')>=0));
  ok('skips the free-text department label', !rep.some(r=>r.record&&String(r.record).indexOf('Other (Shop)')>=0));
  ok('skips already-canonical values', !rep.some(r=>r.before==='Caroline Bondi'));
  ok('dry run made no Graph calls', calls().length===before);
  ok('stored value untouched on dry run', E("projById('p1').projectManager")==='Caroline B.');

  sec('scrubLegacyNames(true): applies through the normal save path');
  E('scrubLegacyNames(true)');
  await wait(150);
  ok('project role healed in state', E("projById('p1').projectManager")==='Caroline Bondi'
     && E("projById('p1').drafter")==='Stan Kim');
  ok('ambiguous Davis untouched in state', E("projById('p2').projectManager")==='Davis S.');
  ok('comma crew healed in state', E("taskById('t1').assignee")==='Caroline Bondi');
  ok('free-text label untouched in state', E("taskById('t3').assignee")==='Stan');
  ok('note assignee healed in state', E("ST.todos[0].who.join('|')")==='Caroline Bondi');
  const pat=calls().filter(c=>c.method==='PATCH');
  ok('the healed project PATCHes canonical names',
     pat.some(c=>c.url.includes('ShopTimeline_Projects')&&c.body&&c.body.projectManager==='Caroline Bondi'&&c.body.drafter==='Stan Kim'));
  ok('the healed crew PATCHes the roster name',
     pat.some(c=>c.url.includes('ShopTimeline_Tasks')&&c.body&&c.body.assignee==='Caroline Bondi'));
  ok('the install crew PATCHes as JSON with Installation kept',
     pat.some(c=>c.body&&c.body.assignee==='["Stan Kim","Installation"]'));
  ok('the untouched canonical task never syncs',
     !pat.some(c=>c.body&&c.body.appId==='t4'));
  ok('a second run finds nothing left', JSON.parse(E('JSON.stringify(scrubLegacyNames())')).length===0);

  console.log('\ntest-v172: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
