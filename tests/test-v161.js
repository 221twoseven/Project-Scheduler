/* v1.6.1 — the 2026-08-31 /preview/ polish batch (owner review, 10 items).
   1) Calendar markers: no fill box — glyph + plain text, phase-name prefix on
      milestones, bottom-justified rows (the 1fr spacer track).
   3) Projects with no current work sink to the bottom of the Projects lens.
   5) Step zooms scale about Today (anchor held) instead of re-render + scroll-back.
   6) Dept-lens lane summaries drop wrapped (past) assignments.
   2/4/7/8/10 carry source-level or suite-external coverage (test89, test-goto).
   Run: node tests/test-v161.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('zoomSettle')<0){
  console.log('test-v161: skipped — pre-v1.6.1 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D=n=>{const d=new Date();d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const P=(id,name,extra)=>({appId:id,Title:name,client:'C',jobCode:id.toUpperCase(),
  deadline:D(20),status:'auto',projectManager:'Stan',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-60),sortIndex:0,...extra});
const T=(id,pid,who,s,e,extra)=>({appId:id,projectId:pid,department:'fab',assignee:who,
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'',...extra});

/* p1 current, p2 fully wrapped (every bar before today), p3 upcoming.
   sortIndex puts p2 FIRST so only the v1.6.1 partition can sink it. */
const projects=[
  P('p2','Beta Wrapped',{deadline:D(-10),sortIndex:0}),
  P('p1','Alpha Active',{sortIndex:1}),
  P('p3','Gamma Coming',{deadline:D(40),sortIndex:2})];
const tasks=[
  T('t2','p2','Nick',D(-30),D(-10)),
  T('t1','p1','Nick',D(-2),D(6),
    {ticketNodes:'[{"id":"n1","date":"'+D(2)+'","target":"Client sign-off"}]'}),
  T('t3','p3','Nick',D(12),D(18))];
const staff=[{appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''}];
const todos=[{appId:'td1',projectId:'p1',department:'fab',Title:'Check hardware',
  assignees:'[]',dueDate:D(3),startDate:null,progress:'notstarted',priority:'medium',
  notes:'',createdBy:'',completedOn:null,completedBy:'',sortIndex:0}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos},todosList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];

sec('source-level checks (items 2, 4, 10)');
ok('the toolbar button says Saved Views', src.indexOf('>Saved Views <svg')>=0);
ok('the Saved Views menu anchors right (no off-screen crop)',
   /#views-menu\{left:auto;right:0\}/.test(src));
ok('the Gantt scroller pads by the sidebar footer height',
   src.indexOf("sc.style.paddingBottom=foot.offsetHeight+'px'")>=0);
ok('the bug-report Kind radios have their own layout rules', /#fb-kind\{display:flex/.test(src));
ok('…and the markup lost the inline margin hack', !/fb-kind" value="feature".*margin-left/.test(src)
   && src.indexOf('<label style="margin-left:14px"><input type="radio" name="fb-kind"')<0);

setTimeout(main,1300);

function main(){
  sec('item 3 — projects with no current work sink to the bottom');
  const order=()=>E('ROWS').filter(r=>r.kind==='projHead').map(r=>r.projectId);
  ok('the wrapped project renders last despite sortIndex 0',
     JSON.stringify(order())===JSON.stringify(['p1','p3','p2']), order().join(','));
  E("GROUP_BY='client';render()");
  ok('…and sinks inside its group when grouped',
     JSON.stringify(order())===JSON.stringify(['p1','p3','p2']), order().join(','));
  E("GROUP_BY=null;render()");

  sec('item 6 — lane summaries drop wrapped assignments');
  E("LENS='dept';render()");
  const lane=qa('.sb-row.lane-row').find(r=>{
    const n=r.querySelector('.sb-2l .sb-name');return n&&n.textContent==='Nick';});
  const asns=lane?[...lane.querySelectorAll('.sb-asns .sb-asn')].map(a=>a.textContent):[];
  ok('current and upcoming assignments still list',
     asns.some(a=>/Alpha/.test(a))&&asns.some(a=>/Gamma/.test(a)), asns.join(' | '));
  ok('the wrapped assignment is gone', !asns.some(a=>/Beta/.test(a)), asns.join(' | '));
  E("LENS='project';render()");

  sec('item 5 — step zoom holds Today in place (no scroll-back)');
  const sc=doc.getElementById('gantt-scroll');
  Object.defineProperty(sc,'clientWidth',{get:()=>1200,configurable:true});
  E("setView('month');zoomSettle()");
  const at=()=>E('d2x(today())+dw()/2')-sc.scrollLeft;
  sc.scrollLeft=E('d2x(today())+dw()/2')-200; /* today at screen x=200, well off-center */
  E("setView('week');zoomSettle()");
  ok('Week keeps today at the same screen x', Math.abs(at()-200)<1.5, 'x='+at());
  ok('…which is NOT the old center-on-today (600)', Math.abs(at()-600)>50);
  E("setView('month3');zoomSettle()");
  ok('3-Month holds the anchor too', Math.abs(at()-200)<1.5, 'x='+at());
  E("setView('month');zoomSettle()");

  /* item 1 — the project-page calendar markers */
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(calPart,800);
}

function calPart(){
  sec('item 1 — calendar markers: glyph + plain text, phase prefix, bottom rows');
  E("NPV_MODE='calendar';npvRender()");
  const ev=q('#npv-body .cal-band.ev'),tk=q('#npv-body .cal-band.tk');
  ok('a milestone band renders', !!ev);
  ok('it carries the indicator glyph', ev&&!!ev.querySelector('.cal-mki'));
  ok('no fill box — the band has no inline background', ev&&!ev.style.background);
  const dn=E("(deptById('fab')||{}).name")+': Client sign-off';
  ok('the phase name prefixes the milestone', ev&&ev.textContent.indexOf(dn)>=0,
     ev&&ev.textContent);
  ok('a note band renders with its glyph', tk&&!!tk.querySelector('.cal-mki'));
  ok('the note has no fill box either', tk&&!tk.style.background);
  const wk=ev&&ev.closest('.cal-wk');
  ok('the week row carries the 1fr spacer track (markers bottom-justified)',
     wk&&wk.style.gridTemplateRows.indexOf('1fr')>=0, wk&&wk.style.gridTemplateRows);
  const spacerRow=wk&&(wk.style.gridTemplateRows.split(' ').indexOf('1fr')+1);
  ok('the marker sits below the spacer row',
     ev&&spacerRow&&parseInt(ev.style.gridRow,10)>spacerRow,
     ev&&ev.style.gridRow+' vs spacer '+spacerRow);
  done();
}

function done(){
  console.log('\ntest-v161: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
