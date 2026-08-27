/* B3 (navigation half) / Design-Language §6–7: Go to date. G, a month-name click in the
   header, or the ? legend open one popover (native date input + quick picks); choosing a
   date centers it in the viewport; the Today button centers instead of parking left.
   Run: node tests/test-goto.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';

/* The frozen REV50 reference predates B3b — same convention as test-b3-zoom.js. */
if(fs.readFileSync(FILE,'utf8').indexOf('goto-menu')<0){
  console.log('test-goto: skipped — no goto-menu in '+FILE+' (pre-B3b build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Seed dates relative to the run date so "today", "+3 months" and "next install" stay
   meaningful whenever this suite runs (the app's today() is the real clock). */
const D0=new Date();D0.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const rel=(days,months)=>{const d=new Date(D0);if(months)d.setMonth(d.getMonth()+months);if(days)d.setDate(d.getDate()+days);return iso(d);};
const INSTALL_ISO=rel(0,2); /* the only install task — deterministic "next install" */

const proj=(id,name,dl)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:dl,status:'in-fabrication',projectManager:'Stan',drafter:'Dana',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab','install']),createdAt:rel(-40)});
const task=(id,pid,dept,s,e)=>({appId:id,projectId:pid,department:dept,assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[proj('p1','Long Haul',rel(3,2)),proj('p2','Near Term',rel(15))];
const tasks=[task('t1','p1','fab',rel(-30),rel(0,4)),
             task('t2','p1','install',INSTALL_ISO,rel(3,2)),
             task('t3','p2','fab',rel(5),rel(15))];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);

setTimeout(()=>{
  /* Reduced motion forces the instant path (same rule as T6), so scrollLeft is assertable. */
  win.matchMedia=()=>({matches:true});
  const sc=doc.getElementById('gantt-scroll');
  Object.defineProperty(sc,'clientWidth',{get:()=>100,configurable:true});
  const menu=doc.getElementById('goto-menu'),inp=doc.getElementById('goto-date');
  const open=()=>!menu.classList.contains('hidden');
  const press=(k,tgt)=>(tgt||doc).dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true}));
  const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  const center=s=>E("Math.max(0,d2x(parseDate('"+s+"'))+dw()/2-50)");

  sec('G opens the popover');
  press('g');
  ok('the popover opens',open());
  ok('the date input is prefilled with today',inp.value===iso(D0),inp.value);

  sec('type a date, Enter — lands centered (acceptance path)');
  const target=rel(40);
  inp.value=target;
  press('Enter',inp);
  ok('the popover closes after the jump',!open());
  ok('the date sits at viewport center',Math.abs(sc.scrollLeft-center(target))<1,
     sc.scrollLeft+' vs '+center(target));

  sec('Escape closes it');
  press('g');
  ok('the popover reopens',open());
  press('Escape',inp);
  ok('Escape closes it',!open());

  sec('month names in the header are the pointer path');
  const mc=doc.querySelector('#gantt-hdr .hdr-m-cell');
  ok('a month cell advertises the jump on hover',!!mc&&(mc.title||'').indexOf('G')>=0,mc&&mc.title);
  click(mc);
  ok('clicking a month name opens the popover',open());
  ok('prefilled with that month\'s first visible day',inp.value===E('fmtDate(TL_S)'),inp.value);

  sec('one overlay at a time (§6)');
  click(doc.getElementById('btn-filters'));
  ok('the filters menu is open',!doc.getElementById('filters-menu').classList.contains('hidden'));
  press('g');
  ok('G swaps it for the go-to-date popover',
     open()&&doc.getElementById('filters-menu').classList.contains('hidden'));

  sec('quick picks');
  menu.querySelector('[data-goto="m3"]').dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  ok('+3 months centers three months out',Math.abs(sc.scrollLeft-center(rel(0,3)))<1,
     sc.scrollLeft+' vs '+center(rel(0,3)));
  ok('and closes the popover',!open());
  press('g');
  menu.querySelector('[data-goto="install"]').dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  ok('Next install centers the upcoming install',Math.abs(sc.scrollLeft-center(INSTALL_ISO))<1,
     sc.scrollLeft+' vs '+center(INSTALL_ISO));

  sec('Today centers (was: scrolls into view)');
  sc.scrollLeft=0;
  click(doc.getElementById('btn-today'));
  ok('the Today button centers today',Math.abs(sc.scrollLeft-center(iso(D0)))<1,
     sc.scrollLeft+' vs '+center(iso(D0)));
  sc.scrollLeft=0;
  press('t');
  ok('the T key does the same',Math.abs(sc.scrollLeft-center(iso(D0)))<1);

  sec('discoverable from the ? legend (three-path rule)');
  const lg=doc.getElementById('lg-goto');
  ok('the legend carries a Go to date entry',!!lg);
  click(lg);
  ok('it opens the popover',open());

  done();
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
