/* v1.44.0 — TODO item 4: time-off notes are private. An admin sees the note typed on an
   out-of-office range; everyone else sees only the dates, in all four places it showed:
   the People record, the dashboard's people lanes, a phase's hover tip and the person panel.
   Run: node tests/test-v1440.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function oooNote(')<0){
  console.log('  SKIP  test-v1440: pre-v1.44.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const NOTE='Doctor appointment';
const staff=[
  {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',phone:'',role:'PM',admin:'1'},
  {appId:'s2',Title:'Nick',depts:JSON.stringify(['fab']),email:'',phone:'',role:'Lead Fabricator',admin:'',
   ooo:JSON.stringify([{id:'o1',start:D(-1),end:D(3),note:NOTE}])}];
const projects=[{appId:'p1',Title:'Window Job',client:'C',jobCode:'AB123',deadline:D(40),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'Nick',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-20),sortIndex:0}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-5),endDate:D(10),estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p1',department:'pm',assignee:'Sam',startDate:D(-5),endDate:D(40),estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

/* Paint all four places and report what each shows. */
function look(){
  E("location.hash='#/people';applyRoute();CD_SEL=PEOPLE.find(p=>p.name==='Nick').id;cdPaintDetail()");
  const rec=(q('#cd-detail .cdd-ooo')||{}).textContent||'';
  E("location.hash='';applyRoute();LENS='dept';PERSON=null;render()");
  const bar=q('.ooo-bar');
  const lane={lbl:bar?bar.querySelector('.ooo-lbl').textContent:null,title:bar?bar.title:null};
  E("showTooltipTask(taskById('t1'),{clientX:40,clientY:40})");
  const tip=(q('#tooltip .tt-warn')||{}).textContent||'';
  E("LENS='project';enterDash('Nick')");
  const dock=[...doc.querySelectorAll('#me-dock .md-row .md-main')].map(e=>e.textContent);
  E("exitDash&&exitDash()");
  return {rec,lane,tip,dock};
}

async function main(){
  sec('admin — the note shows where it always did');
  ok('signed in as an admin', E('isAdmin()')===true);
  const a=look();
  ok('People record: the time-off line carries the note', a.rec.includes(NOTE), a.rec);
  ok('dashboard lane: the OUT bar reads "OUT · <note>"', a.lane.lbl==='OUT · '+NOTE, a.lane.lbl);
  ok('dashboard lane: the bar\'s hover title carries the note', !!a.lane.title&&a.lane.title.includes(NOTE), a.lane.title);
  ok('phase hover tip: "Nick is out … (<note>)"', a.tip.includes('('+NOTE+')'), a.tip);
  ok('person panel: Time off lists the note', a.dock.includes(NOTE), JSON.stringify(a.dock));

  sec('non-admin — dates only, no note anywhere');
  E("PEOPLE.find(p=>p.name==='Sam').admin=false");
  ok('signed in as a non-admin', E('isAdmin()')===false);
  const v=look();
  ok('People record: dates show, the note does not', !v.rec.includes(NOTE)&&/–/.test(v.rec), v.rec);
  ok('dashboard lane: the OUT bar reads just "OUT"', v.lane.lbl==='OUT', v.lane.lbl);
  ok('dashboard lane: the hover title has the dates and no note', !!v.lane.title&&!v.lane.title.includes(NOTE)&&/out of office/.test(v.lane.title), v.lane.title);
  ok('phase hover tip: still warns Nick is out, without the note', /Nick is out/.test(v.tip)&&!v.tip.includes(NOTE), v.tip);
  ok('person panel: the range reads "Out of office"', v.dock.includes('Out of office')&&!v.dock.includes(NOTE), JSON.stringify(v.dock));
  ok('the page text holds the note nowhere', !doc.body.textContent.includes(NOTE));

  sec('a developer previewing as a viewer sees what a viewer sees');
  E("PEOPLE.find(p=>p.name==='Sam').admin=true;PEOPLE.find(p=>p.name==='Sam').developer=true;VIEW_AS='viewer'");
  ok('viewer preview hides the note', E("oooNote(PEOPLE.find(p=>p.name==='Nick').ooo[0])")==='');
  E("VIEW_AS='dev'");
  ok('back in the developer view it shows', E("oooNote(PEOPLE.find(p=>p.name==='Nick').ooo[0])")===NOTE);

  sec('the note is kept, not dropped');
  ok('the stored row still carries the note (hiding is display only)',
     JSON.parse(E("personToFields(PEOPLE.find(p=>p.name==='Nick')).ooo"))[0].note===NOTE);

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
