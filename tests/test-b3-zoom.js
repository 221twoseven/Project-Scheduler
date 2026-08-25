/* B3 / Design-Language §7: four zoom steps — Day 40 / 2-Day 20 / Week 14 / Month 5
   px per day. Day and Week keep the pre-B3 scales; +/− walk the steps, D/W jump;
   the step persists in UI_KEY; bar anatomy sheds label pieces as bars narrow.
   Run: node tests/test-b3-zoom.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';

/* The frozen REV50 reference predates B3 — same convention as test-b1.js. */
if(fs.readFileSync(FILE,'utf8').indexOf('ZOOM_STEPS')<0){
  console.log('test-b3-zoom: skipped — no ZOOM_STEPS in '+FILE+' (pre-B3 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const proj=(id,name,dl)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:dl,status:'in-fabrication',projectManager:'Stan',drafter:'Dana',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01'});
const task=(id,pid,s,e)=>({appId:id,projectId:pid,department:'fab',assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
/* p1 spans ~6 months, p2 is 3 days (tick-width at Month), p3 is 10 days (pill-only). */
const projects=[proj('p1','Long Haul','2026-12-20'),proj('p2','Quick Hit','2026-09-01'),
                proj('p3','Mid Range','2026-10-01')];
const tasks=[task('t1','p1','2026-07-01','2026-12-10'),task('t2','p2','2026-08-24','2026-08-26'),
             task('t3','p3','2026-09-14','2026-09-23')];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const press=k=>doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:k}));
const dCells=()=>[...doc.querySelectorAll('#gantt-hdr .hdr-row')[1].children];

setTimeout(()=>{
  sec('scale constants — two steps pixel-identical to pre-B3');
  ok('Day keeps 40px/day and Week keeps 14px/day',E('DW.days')===40&&E('DW.weeks')===14);
  ok('2-Day 20px and Month 5px steps exist',E('DW.day2')===20&&E('DW.month')===5);
  ok('the scale group has four buttons',doc.querySelectorAll('#tg-scale .t-btn').length===4);

  sec('keyboard walks the steps');
  ok('boot lands on Day',E('VIEW')==='days'&&E('dw()')===40);
  press('-');
  ok('− steps out to 2-Day',E('VIEW')==='day2'&&E('dw()')===20);
  press('-');press('-');
  ok('− twice more lands on Month',E('VIEW')==='month'&&E('dw()')===5);
  press('-');
  ok('− at Month is a no-op',E('VIEW')==='month');
  press('+');
  ok('+ steps back in to Week',E('VIEW')==='weeks'&&E('dw()')===14);
  press('d');
  ok('D jumps straight to Day',E('VIEW')==='days');
  press('w');
  ok('W jumps straight to Week',E('VIEW')==='weeks');

  sec('Month step — header, weekends, fit');
  press('-'); /* weeks -> month */
  ok('at Month',E('VIEW')==='month');
  ok('no day numbers in the axis header',dCells().length>0&&dCells().every(c=>!c.textContent));
  ok('month cells still name the months',/[A-Z][a-z]+ 20\d\d/.test(doc.querySelector('#gantt-hdr .hdr-m-cell').textContent));
  const wknds=[...doc.querySelectorAll('#gantt-canvas .wknd-col')];
  ok('weekend columns still render (compressed, never dropped)',wknds.length>0);
  ok('a plain weekend is 2 days × 5px',wknds.some(c=>c.style.width==='10px'),wknds[0]&&wknds[0].style.width);
  ok('six months span under one screen (≤ ~950px)',
     E("d2x(parseDate('2027-01-01'))-d2x(parseDate('2026-07-01'))")<=950,
     E("d2x(parseDate('2027-01-01'))-d2x(parseDate('2026-07-01'))")+'px');

  sec('§7 bar anatomy at Month');
  const lbl1=doc.querySelector('.job-bar.summary[data-pid="p1"] .bar-lbl');
  ok('the 6-month project keeps pill + name + code + chips',
     lbl1&&!!lbl1.querySelector('.sum-pill')&&lbl1.textContent.indexOf('Long Haul')>=0
     &&lbl1.textContent.indexOf('P1')>=0&&lbl1.querySelectorAll('.role-tag').length===3);
  const lbl3=doc.querySelector('.job-bar.summary[data-pid="p3"] .bar-lbl');
  ok('the 10-day project shows the status pill only',
     lbl3&&!!lbl3.querySelector('.sum-pill')&&lbl3.textContent.indexOf('Mid Range')<0
     &&!lbl3.querySelector('.role-tag'));
  const b2=doc.querySelector('.job-bar.summary[data-pid="p2"]');
  ok('the 3-day project is a bare identity tick — no label at all',b2&&!b2.querySelector('.bar-lbl'));
  ok('the tick is at least 4px wide',b2&&parseFloat(b2.style.width)>=4,b2&&b2.style.width);
  ok('the tick still carries the project identity color',b2&&!!b2.style.backgroundColor);

  sec('2-Day step — day numbers on Mondays only');
  press('+');press('+'); /* month -> weeks -> day2 */
  ok('at 2-Day',E('VIEW')==='day2');
  const labeled=dCells().filter(c=>c.textContent);
  ok('some day cells are numbered',labeled.length>0);
  ok('every numbered cell is a Monday',labeled.every(c=>{
    const x=parseFloat(c.style.left);
    return E("x2d("+x+").getDay()")===1;
  }));

  sec('the chosen step persists in UI_KEY');
  const ui=JSON.parse(win.localStorage.getItem('shopTimelineUI_v1')||'{}');
  ok('saveUI recorded the step',ui.view==='day2',ui.view);
  E("localStorage.setItem(UI_KEY,JSON.stringify({view:'month'}));loadLocalPrefs();");
  ok('loadLocalPrefs restores it',E('VIEW')==='month');
  ok('the segmented control follows',doc.getElementById('btn-month').classList.contains('active')
     &&!doc.getElementById('btn-day2').classList.contains('active'));
  E("localStorage.setItem(UI_KEY,JSON.stringify({view:'bogus'}));VIEW='days';loadLocalPrefs();");
  ok('an unknown stored step is ignored',E('VIEW')==='days');

  sec('edge indicators (T6) still point correctly at Month');
  E("setView('month')");E('render()');
  const sc=doc.getElementById('gantt-scroll');
  Object.defineProperty(sc,'clientWidth',{get:()=>100,configurable:true});
  win.matchMedia=()=>({matches:true});
  sc.scrollLeft=0;E('updateEdgeIndicators()');
  const chipR=doc.querySelector('.edge-ind[data-key="Pp2"]');
  ok('an off-right bar gets a right chip',chipR&&chipR.dataset.side==='r');
  ok('the chip names the bar\'s near (start) edge',chipR&&chipR.textContent==='Aug 24',chipR&&chipR.textContent);
  sc.scrollLeft=2000;E('updateEdgeIndicators()');
  const chipL=doc.querySelector('.edge-ind[data-key="Pp2"]');
  ok('scrolled past it, the chip flips to the left edge',chipL&&chipL.dataset.side==='l');
  ok('and names the end edge',chipL&&chipL.textContent==='Aug 26',chipL&&chipL.textContent);

  done();
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
