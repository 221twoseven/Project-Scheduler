/* B1 / Design-Language §6: a main-timeline row whose bars all sit outside the
   horizontal viewport gets an edge chip naming the bar's near edge; clicking it
   scrolls the bar into view (centred). Run: node tests/test-b1.js index.html */
const {boot}=require('./harness');
const FILE=process.argv[2]||'index.html';

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const proj=(id,name,dl)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:dl,status:'in-fabrication',projectManager:'Stan',drafter:'',
  leadFab:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01'});
const task=(id,pid,s,e)=>({appId:id,projectId:pid,department:'fab',assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[proj('p1','Far Future','2026-12-20'),proj('p2','Near Now','2026-09-01')];
const tasks=[task('t1','p1','2026-12-01','2026-12-10'),task('t2','p2','2026-08-10','2026-08-20')];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));

setTimeout(()=>{
  const sc=doc.getElementById('gantt-scroll');
  /* jsdom has no layout: give the viewport a width and force the reduced-motion
     branch so the click assigns scrollLeft synchronously */
  Object.defineProperty(sc,'clientWidth',{get:()=>800,configurable:true});
  win.matchMedia=()=>({matches:true});
  const bars=k=>E("ROWS.find(r=>r.key==='"+k+"')._bars[0]");
  const upd=()=>E('updateEdgeIndicators()');
  const chips=()=>[...doc.querySelectorAll('.edge-ind')];
  const chip=k=>doc.querySelector('.edge-ind[data-key="'+k+'"]');
  const b1=bars('Pp1'),b2=bars('Pp2');

  sec('both bars off to the right of the viewport');
  sc.scrollLeft=0;upd();
  ok('both rows are flagged',chips().length===2,chips().length+' chips');
  ok('chips hug the right edge',chips().every(c=>c.dataset.side==='r'));
  ok('chips pin to the viewport edge',chip('Pp1').style.left==='794px',chip('Pp1').style.left);
  ok('date is the bar\'s near (start) edge',chip('Pp1').textContent==='Dec 1',chip('Pp1').textContent);
  ok('chevron carries the row\'s project color',
     chip('Pp1').querySelector('svg').getAttribute('stroke')
       ===doc.querySelector('.job-bar.summary[data-pid="p1"]').style.background);
  ok('chip text uses the label function on the chip fill',
     chip('Pp1').style.color===E("labelColor('#FFFFFF')"),chip('Pp1').style.color);

  sec('a row with a visible bar gets no chip');
  sc.scrollLeft=b2.x1-100;upd();
  ok('near row\'s chip is gone',!chip('Pp2'));
  ok('far row is still flagged right',chip('Pp1')&&chip('Pp1').dataset.side==='r');

  sec('bars off to the left of the viewport');
  sc.scrollLeft=b1.x2+200;upd();
  ok('chip flips to the left edge',chip('Pp1')&&chip('Pp1').dataset.side==='l');
  ok('date is now the bar\'s end edge',chip('Pp1').textContent==='Dec 10',chip('Pp1').textContent);
  ok('chip pins to the left viewport edge',chip('Pp1').style.left===(b1.x2+200+6)+'px',chip('Pp1').style.left);

  sec('clicking the chip centres the bar');
  click(chip('Pp1'));
  const want=Math.max(0,(b1.x1+b1.x2)/2-400);
  ok('scrollLeft lands on the bar\'s centre',Math.abs(sc.scrollLeft-want)<1,sc.scrollLeft+' vs '+want);
  upd();
  ok('chip disappears once the bar is in view',!chip('Pp1'));

  sec('the scroll handler repositions chips');
  sc.scrollLeft=0;
  sc.dispatchEvent(new win.Event('scroll'));
  setTimeout(()=>{ /* rAF is stubbed to setTimeout in the harness */
    ok('chips re-pinned via the throttled scroll path',
       chip('Pp1')&&chip('Pp1').style.left==='794px',chip('Pp1')&&chip('Pp1').style.left);
    done();
  },80);
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
