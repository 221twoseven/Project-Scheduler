/* v1.3.0 — Department view (08-31 brief objs 5 and 9).
   1) (obj 5) In the Departments lens a phase click navigates to the project edit
      page; the Projects lens keeps its edit-details modal (§6 exception).
   2) (obj 9) Lane rows read name-over-department on the left (.sb-2l), and the
      right side lists that lane's assignments with dates, current work first.
   Run: node tests/test-v130.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* Pre-v1.3.0 builds (and the frozen reference) lack the lane assignment column. */
if(src.indexOf('sb-asns')<0){
  console.log('test-v130: skipped — pre-v1.3.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D=n=>{const d=new Date();d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[
  {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:D(30),
   status:'in-fabrication',projectManager:'Stan',drafter:'Peter',leadFab:'Nick',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0},
  {appId:'p2',Title:'Tiffany Vitrines',client:'Tiffany',jobCode:'T2',deadline:D(40),
   status:'in-fabrication',projectManager:'Stan',drafter:'Peter',leadFab:'Kate',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:1}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-2),endDate:D(5),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p2',department:'fab',assignee:'Nick',startDate:D(8),endDate:D(12),
   estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const staff=[
  {appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s2',Title:'Kate',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));

setTimeout(()=>{
  sec('obj 9 — lane rows: name over department, assignments on the right');
  E("LENS='dept';render()");
  const lane=qa('.sb-row.lane-row').find(r=>{
    const n=r.querySelector('.sb-2l .sb-name');return n&&n.textContent==='Nick';});
  ok('Nick has a lane row with a two-line identity column', !!lane);
  ok('the department reads as a subheading under the name',
     lane&&lane.querySelector('.sb-2l .sb-sub')&&lane.querySelector('.sb-2l .sb-sub').textContent.length>0,
     lane&&(lane.querySelector('.sb-2l .sb-sub')||{textContent:'(none)'}).textContent);
  const asns=lane?[...lane.querySelectorAll('.sb-asns .sb-asn')]:[];
  ok('the right side lists his assignments', asns.length>=1, asns.length+' lines');
  ok('an assignment names its project', asns.some(a=>/Hermes|Tiffany/.test(a.textContent)),
     asns.map(a=>a.textContent).join(' | '));
  ok('…with its dates', asns.some(a=>/[A-Z][a-z]{2} \d+–[A-Z][a-z]{2} \d+/.test(a.textContent)),
     asns.map(a=>a.textContent).join(' | '));
  ok('current work sorts before upcoming',
     asns.length>=2?/Hermes/.test(asns[0].textContent):true,
     asns.map(a=>a.textContent).join(' | '));

  sec('obj 5 — dept-lens phase click navigates to the project page');
  const bar=q('#gantt-canvas .job-bar[data-tid="t1"]');
  ok('a phase bar renders in the dept lens', !!bar);
  click(bar);
  ok('the click routed to the project edit page', win.location.hash.indexOf('#/project/p1')===0,
     win.location.hash);
  ok('no task modal opened', q('#task-overlay').classList.contains('hidden'));

  setTimeout(()=>{
    sec('obj 5 — the Projects lens keeps the modal');
    win.location.hash='#/';
    win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      E("LENS='project';EXPANDED.add('p1');render()");
      const bar2=q('#gantt-canvas .job-bar[data-tid="t1"]');
      ok('a task bar renders on the Projects lens', !!bar2);
      click(bar2);
      ok('the modal opens as before', !q('#task-overlay').classList.contains('hidden'));
      ok('the route stayed on the timeline', win.location.hash.indexOf('/project/')<0, win.location.hash);
      console.log('\ntest-v130: '+pass+' passed, '+fail+' failed');
      process.exit(fail?1:0);
    },800);
  },800);
},1300);
