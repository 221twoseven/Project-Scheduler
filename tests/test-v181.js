/* v1.8.1 — the 2026-09-01 sidebar feedback (global Gantt):
   - ⇕ All walks the view's expansion levels in series instead of a blunt
     all-or-none. Projects lens + sort grouping = three levels: all collapsed →
     groups open / projects closed → everything open → back. Ungrouped Projects
     and the Departments lens have two levels, so the walk is a toggle — and
     "expanded" is judged against the whole board, so one hand-opened row no
     longer flips the button's direction (the old inconsistency).
   - Style parity: the Projects-lens sort-group headers take the Departments-lens
     section-header look (same bar color, hover, typography, count chip).
   Run: node tests/test-v181.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('.sb-row.grp-head{background:#D6DFEB')<0){
  console.log('test-v181: skipped — pre-v1.8.1 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const mkProj=(id,name,client,i)=>({appId:id,Title:name,client:client,jobCode:'J'+i,deadline:D(30+i),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:i});
const mkTask=(id,pid,dept,s,e)=>({appId:id,projectId:pid,department:dept,assignee:'Sam',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[mkProj('p1','Alpha','Acme',0),mkProj('p2','Bravo','Acme',1),mkProj('p3','Cover','Zenith',2)];
const tasks=[mkTask('t1','p1','fab',D(0),D(4)),mkTask('t2','p2','fab',D(1),D(5)),mkTask('t3','p3','td',D(0),D(3))];
const staff=[{appId:'s1',Title:'Sam',depts:JSON.stringify(['pm','fab']),ooo:'[]',email:'user@example.com',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,E=s=>win.eval(s);
const kinds=()=>E("ROWS.map(r=>r.kind).join('|')");
const press=()=>E("document.getElementById('sb-all').click()");

setTimeout(main,1300);

function main(){
  sec('style parity: group headers wear the dept-header look');
  ok('same bar color', src.indexOf('.sb-row.grp-head{background:#D6DFEB;border-bottom:1px solid #C2CFDF')>=0);
  ok('same hover', src.indexOf('.sb-row.grp-head:hover{background:#CCD8E7}')>=0);
  ok('same label ink', /\.sb-row\.grp-head \.sb-name\{[^}]*color:#57687F\}/.test(src));
  ok('the count chip stops being paler than the dept one', src.indexOf('.sb-row.grp-head .sb-count{color:#94A3B8}')<0);

  sec('ungrouped Projects lens: a two-level toggle judged against the whole board');
  ok('starts collapsed (no phase rows)', !/projTask/.test(kinds()));
  press();
  ok('one press expands every project', E("ROWS.filter(r=>r.kind==='projTask').length")===3);
  press();
  ok('next press collapses every project', !/projTask/.test(kinds()));
  E("EXPANDED.add('p1');render()"); /* one hand-opened row */
  press();
  ok('a mixed board expands the REST (no collapse flip)', E("ROWS.filter(r=>r.kind==='projTask').length")===3);
  press();
  ok('…and the follow-up collapses all', E('EXPANDED.size')===0);

  sec('grouped Projects lens: the three-level series');
  E("GROUP_BY='client';render()");
  ok('grouping renders headers, projects visible (level 1)',
     /groupHead/.test(kinds())&&E("ROWS.filter(r=>r.kind==='projHead').length")===3);
  press(); /* level 1 → level 2 */
  ok('press 1: everything open (projects expanded)', E("ROWS.filter(r=>r.kind==='projTask').length")===3);
  press(); /* level 2 → all collapsed */
  ok('press 2: all collapsed — only group headers remain', kinds()==='groupHead|groupHead'
     &&E('EXPANDED.size')===0, kinds());
  press(); /* all collapsed → level 1 */
  ok('press 3: groups open, projects closed', E("ROWS.filter(r=>r.kind==='projHead').length")===3
     &&!/projTask/.test(kinds()));
  /* a hand-collapsed group counts as "not all open" — the next press opens groups first */
  press(); /* → level 2 */
  E("grpSet().add('Acme');render()");
  press();
  ok('a mixed grouped board goes to level 1 first', !E("grpSet().has('Acme')")&&!/projTask/.test(kinds()));

  sec('Departments lens keeps its two-level toggle');
  E("GROUP_BY=null;document.getElementById('btn-lens-dept').click()");
  const heads=E("ROWS.filter(r=>r.kind==='deptHead').length");
  press();
  ok('press collapses every section', E("ROWS.filter(r=>r.kind==='deptHead').length")===heads
     &&E("ROWS.filter(r=>r.kind==='deptLane').length")===0);
  press();
  ok('press expands them again', E("ROWS.filter(r=>r.kind==='deptLane').length")>0);

  sec('My Dashboard dock is drag-resizable (project-dock pattern)');
  E('PERSON=meName();render()');
  ok('the dashboard dock is on', win.document.body.classList.contains('me-dock-on'));
  ok('the dock renders the resize grip', !!win.document.getElementById('md-resize'));
  E('setMeDockH(300)');
  ok('setMeDockH drives the shared CSS variable (dock + #main together)',
     E("document.documentElement.style.getPropertyValue('--medock-h')")==='300px');
  E('setMeDockH(50)');
  ok('height clamps to the 140px floor', E('ME_DOCK_H')===140);
  ok('a stored height restores through the loader guard',
     src.indexOf("localStorage.getItem('shopTimelineMeDockH')")>=0);

  console.log('\ntest-v181: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
