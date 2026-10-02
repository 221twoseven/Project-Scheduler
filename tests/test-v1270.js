/* v1.27.0 — tracker #2: Today puts Monday of the current week at the left edge.
   R1 pressing Today puts the first day of the current week at the left edge (this replaced
   centring today; the other jumps still centre) · R2 the T key does the same · R3 in every
   zoom (Week, Month, 3 Mo, a drag-set fit) · R4 start-up and every routed arrival land on
   the same alignment · R5 the week starts on Monday; a Sunday belongs to the week that
   began the Monday before · R6 (owner, in the Proceed comment) a light grey transparent
   wash over every day before today.
   Timeline page only (the Today button, T and the canvas live there); a guard checks the
   project page leaves the timeline's scroll alone.
   Run: node tests/test-v1270.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function weekLeftX')<0){
  console.log('  SKIP  test-v1270: pre-v1.27.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Dates relative to the run date. One task starts 75 days back so the tasks, not the
   default 40-day pad, bound the range start, and one ends four months out. */
const D0=new Date();D0.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const rel=(days,months)=>{const d=new Date(D0);if(months)d.setMonth(d.getMonth()+months);if(days)d.setDate(d.getDate()+days);return iso(d);};
const projects=[{appId:'p1',Title:'Long Haul',client:'',jobCode:'P1',deadline:rel(3,2),status:'in-fabrication',
  projectManager:'Stan',drafter:'Dana',leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab','install']),createdAt:rel(-40)}];
const task=(id,dept,s,e)=>({appId:id,projectId:'p1',department:dept,assignee:'Nick',startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[task('t1','fab',rel(-75),rel(0,4)),task('t2','install',rel(0,2),rel(3,2))];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const press=(k,tgt)=>(tgt||doc).dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true}));
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const want=()=>E('weekLeftX()');
const centre=s=>E("Math.max(0,d2x(parseDate('"+s+"'))+dw()/2-50)");
const near=(a,b)=>Math.abs(a-b)<1;

setTimeout(()=>{
  win.matchMedia=()=>({matches:true}); /* reduced motion: the instant path, so scrollLeft is assertable */
  const sc=doc.getElementById('gantt-scroll');
  Object.defineProperty(sc,'clientWidth',{get:()=>100,configurable:true});

  sec('R4 — the timeline opens with Monday of this week at the left edge');
  ok('weekLeftX is a positive x (Monday sits inside the range)', want()>0, String(want()));
  ok('R4: first load lands on it', near(sc.scrollLeft,want()), sc.scrollLeft+' vs '+want());

  sec('R1 — Today puts Monday at the left edge, and it replaced centring');
  sc.scrollLeft=0;click(doc.getElementById('btn-today'));
  ok('R1: the Today button puts Monday at the left edge', near(sc.scrollLeft,want()), sc.scrollLeft+' vs '+want());
  if(!near(want(),centre(iso(D0))))ok('R1 (Q1 default): that is not the old centring', !near(sc.scrollLeft,centre(iso(D0))));
  sc.scrollLeft=0;press('g');
  const menu=doc.getElementById('goto-menu');
  ok('the Go to date popover opened', !menu.classList.contains('hidden'));
  click(doc.querySelector('#goto-menu [data-goto="today"]'));
  ok('R1: the popover\'s Today pick lands on the same x', near(sc.scrollLeft,want()), sc.scrollLeft+' vs '+want());
  ok('and closes the popover', menu.classList.contains('hidden'));
  press('g');
  const inp=doc.getElementById('goto-date');inp.value=rel(40);press('Enter',inp);
  ok('unchanged: a chosen date still centres', near(sc.scrollLeft,centre(rel(40))), sc.scrollLeft+' vs '+centre(rel(40)));

  sec('R2 — the T key does the same');
  sc.scrollLeft=0;press('t');
  ok('R2: T puts Monday at the left edge', near(sc.scrollLeft,want()), sc.scrollLeft+' vs '+want());

  sec('strings');
  ok('the button tooltip no longer says Center', !/Center/.test(doc.getElementById('btn-today').title), doc.getElementById('btn-today').title);
  ok('the keyboard sheet names the new behaviour', E("KBD_TL.some(k=>k[0]==='T'&&k[1]==='This week from Monday')"));

  zooms(['week','month','month3'],()=>{
    E("setFit(45);zoomSettle()");
    setTimeout(()=>{
      sc.scrollLeft=0;press('t');
      ok('R3: a drag-set fit (45 days) puts Monday at the left edge too', near(sc.scrollLeft,want()), sc.scrollLeft+' vs '+want());
      stageWash();
    },120);
  });
},1300);

function zooms(list,then){
  if(!list.length){then();return;}
  const v=list.shift();
  E("setView('"+v+"');zoomSettle()");
  setTimeout(()=>{
    const sc=document_sc();sc.scrollLeft=0;press('t');
    ok('R3: '+v+' zoom puts Monday at the left edge', near(sc.scrollLeft,want()), sc.scrollLeft+' vs '+want());
    zooms(list,then);
  },120);
}
function document_sc(){return doc.getElementById('gantt-scroll');}

function stageWash(){
  sec('R6 — a light grey wash over every day before today (owner)');
  E('render()');
  const pc=q('#gantt-canvas .past-col');
  ok('R6: the canvas carries the past wash', !!pc);
  ok('R6: it spans from the left edge to today', !!pc&&pc.style.width===E("d2x(today())")+'px', pc&&pc.style.width+' vs '+E("d2x(today())"));
  ok('R6: full height', !!pc&&pc.style.height===E('TOTAL_H')+'px');
  ok('R6: it never takes the pointer', /\.past-col\{[^}]*pointer-events:none/.test(src));
  ok('R6: it sits under rows and bars (z1), so bar text keeps its contrast', /\.past-col\{[^}]*z-index:1\b/.test(src));
  ok('R6: the colour is the weekend grey at .06', /\.past-col\{[^}]*rgba\(148,163,184,\.06\)/.test(src));
  E("setView('week');zoomSettle()");
  setTimeout(()=>{
    E('render()');
    const pc2=q('#gantt-canvas .past-col');
    ok('R6: the wash tracks the zoom', !!pc2&&pc2.style.width===E("d2x(today())")+'px', pc2&&pc2.style.width);
    stageRoute();
  },120);
}

function stageRoute(){
  sec('R4 — a routed arrival lands on the same alignment; the project page leaves it alone');
  win.location.hash='#/project/p1';win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const sc=document_sc();const before=sc.scrollLeft;
    press('t');
    ok('guard: T on the project page does not move the timeline', sc.scrollLeft===before);
    win.location.hash='#/';win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(()=>{
      const sc2=document_sc();
      ok('R4: coming back from a project lands on Monday at the left edge', near(sc2.scrollLeft,want()), sc2.scrollLeft+' vs '+want());
      stageSunday();
    },160);
  },160);
}

function stageSunday(){
  sec('R5 — Monday starts the week; a Sunday belongs to the week before');
  const d=new Date(D0);d.setDate(d.getDate()+((7-d.getDay())%7));          /* the next Sunday (today if Sunday) */
  const sun=iso(d);const mon=new Date(d);mon.setDate(mon.getDate()-6);
  E("today=()=>parseDate('"+sun+"')");
  const sc=document_sc();sc.scrollLeft=0;press('t');
  ok('R5: on a Sunday, Today goes six days back to that week\'s Monday', near(sc.scrollLeft,E("d2x(parseDate('"+iso(mon)+"'))")), sc.scrollLeft+' vs '+E("d2x(parseDate('"+iso(mon)+"'))"));
  const wed=new Date(mon);wed.setDate(wed.getDate()+2);
  E("today=()=>parseDate('"+iso(wed)+"')");
  sc.scrollLeft=0;press('t');
  ok('R1: on a Wednesday, Today goes two days back to Monday', near(sc.scrollLeft,E("d2x(parseDate('"+iso(mon)+"'))")), sc.scrollLeft);
  done();
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
