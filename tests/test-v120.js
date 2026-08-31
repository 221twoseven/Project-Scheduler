/* v1.2.0 (owner objective 1) — My Dashboard reads as its own view.
   Mechanics stay the view filters (LENS='dept' + PERSON); presentation changes:
   - a project-page-style trail bar (#dash-bar) fixed under the toolbar: All Projects ›
     My Dashboard · name, with an × exit — both unwind like the project page's trail
   - the sidebar lens toggles and collapse affordances hide (no Projects/Departments
     view inside the dashboard; a "My Dashboard" label takes the lens toggle's place)
   - every assigned phase paints flat: collapsed department sections still show lanes
   - the summary dock keeps its info but gains the REV99 collapse control, persisted
     under its own key
   Run: node tests/test-v120.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('dash-bar')<0){
  console.log('test-v120: skipped — pre-v1.2.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[
 {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:D(45),
  status:'in-fabrication',projectManager:'Stan',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[
 {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-2),endDate:D(3),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'td',assignee:'Nick',startDate:D(-8),endDate:D(-4),
  estimatedDays:4,ticketNodes:'[]',notes:'',pinned:false,label:'Drawings'}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);

sec('source-level checks');
ok('the dashboard bar hides on the project route (CSS)',
   /body\.pp-route #dash-bar\{display:none/.test(src));
ok('lens toggles and ⇕ All hide in dashboard (CSS)',
   /body\.dash-on \.sb-lens\{display:none\}/.test(src)&&/body\.dash-on #sb-all\{display:none\}/.test(src));
ok('sidebar collapse carets hide in dashboard (CSS)',
   /body\.dash-on \.sb-chev\{visibility:hidden\}/.test(src));

setTimeout(()=>{
  E("PEOPLE=[{id:'a',name:'Nick',email:'',role:'Lead Fabricator',depts:['fab'],ooo:[]}];rebuildStaff();");
  E("localStorage.setItem(ME_KEY,'Nick');LENS='project';PERSON=null;render();");
  ok('outside the dashboard the bar is hidden',
     q('#dash-bar').classList.contains('hidden')&&!doc.body.classList.contains('dash-on'));

  sec('entering: the dashboard is its own place');
  E("document.getElementById('btn-dash').click();");
  ok('the trail bar shows', !q('#dash-bar').classList.contains('hidden'));
  ok('…named for the person', q('#db-name').textContent==='My Dashboard · Nick');
  ok('body carries dash-on (lens toggles/carets hidden by CSS)',
     doc.body.classList.contains('dash-on'));
  ok('the sidebar label swap is in place', !!q('#sb-head .sb-dash-lbl'));
  ok('#main sits below the bar',
     parseInt(q('#main').style.top,10)>=parseInt(q('#dash-bar').style.top||'0',10));

  sec('flat rows: collapsed sections still show every assigned phase');
  E("COLLAPSED.add('fab');COLLAPSED.add('td');render();");
  ok('lanes render despite collapsed sections',
     E("ROWS.filter(r=>r.kind!=='deptHead'&&r.kind!=='groupHead').length")>=2,
     E("JSON.stringify(ROWS.map(r=>r.kind))"));
  E("COLLAPSED.clear();render();");

  sec('the summary dock collapses like every other dock');
  ok('the dock is on with the collapse control', doc.body.classList.contains('me-dock-on')&&!!q('#md-collapse'));
  ok('…and no legacy trail in its header', !q('#md-home')&&!q('#md-close'));
  E("document.getElementById('md-collapse').click();");
  ok('one click collapses it', doc.body.classList.contains('me-dock-col'));
  ok('…persisted under its own key', E("localStorage.getItem('shopTimelineMeDockCollapsed')")==='1');
  E('render();');
  ok('a re-render keeps it collapsed', doc.body.classList.contains('me-dock-col'));
  E("document.getElementById('md-collapse').click();");
  ok('a second click expands it', !doc.body.classList.contains('me-dock-col')
     &&E("localStorage.getItem('shopTimelineMeDockCollapsed')")==='0');

  sec('exits mirror the project page');
  E("document.getElementById('db-x').click();");
  ok('× leaves the dashboard', E('PERSON===null')&&!doc.body.classList.contains('dash-on'));
  ok('…and the bar hides', q('#dash-bar').classList.contains('hidden'));
  E("document.getElementById('btn-dash').click();");
  E("document.getElementById('db-all').click();");
  ok('the All Projects crumb exits the same way', E('PERSON===null')&&q('#dash-bar').classList.contains('hidden'));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
