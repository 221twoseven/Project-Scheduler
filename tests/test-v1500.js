/* v1.50.0 — item 32, tracker #1: where milestones draw on the project Gantt. A Top / Both / Phase
   toggle at the chart's top right (default Top = the 09-03 behaviour: every milestone in the
   Milestones row). Both adds a copy on the milestone's phase row; Phase draws it only there.
   A milestone with no phase, or whose phase has no row on this job, stays in row 0 in every mode.
   Notes keep row 1. Asserted on the New Project draft and a saved project.
   Run: node tests/test-v1500.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Q4 Frozen In Time 2026',client:'Example Client',jobCode:'Q4',deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','cnc','install']),createdAt:D(-10),sortIndex:0}];
const T=(id,dept,s,e)=>({appId:id,projectId:'p1',department:dept,assignee:dept==='install'?'[]':'Sam',
  startDate:s,endDate:e,estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[T('t1','cnc',D(5),D(12)),T('t2','install',D(25),D(27))];
const EV=(id,name,dept,date)=>({appId:id,projectId:'p1',department:dept,Title:name,date:date,notes:''});
const events=[EV('e1','ALL CNC DONE','cnc',D(10)),EV('e2','Kickoff','',D(3)),EV('e3','Truck leaves','shipping',D(26))];
const todos=[{appId:'n1',Title:'Order sheet stock',projectId:'p1',department:'cnc',assignees:'[]',
  dueDate:D(4),startDate:null,progress:'notstarted',priority:'medium',notes:'',createdBy:'',
  completedOn:null,completedBy:'',sortIndex:0}];
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos,events},eventsList:true,todosList:true});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const go=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const pick=m=>q('#npv-msp button[data-msp="'+m+'"]').click();
/* the y every marker on row ri gets (npvRender's own formula) */
const RH=()=>E('NPV_ROWH');
const y0=()=>0*RH()+9.5;
const yDept=d=>(E('NPV_TOP')+E("NPV_PLAN.findIndex(r=>r.dept==='"+d+"')"))*RH()+9.5;
const tops=name=>qa('#npv-body .npv-ev').filter(m=>m.title.indexOf(name+' ·')===0)
  .map(m=>parseFloat(m.style.top)).sort((a,b)=>a-b);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* the three modes, on whichever page is open; cnc = the CNC milestone's name */
function modes(where,cnc){
  sec(where+': Top (the default) — every milestone in the Milestones row');
  ok(where+': Top is on', q('#npv-msp button[data-msp="top"]').classList.contains('on'));
  ok(where+': CNC milestone inside the CNC bar is at row 0 only', same(tops(cnc),[y0()]), JSON.stringify(tops(cnc)));
  ok(where+': no-phase milestone at row 0', same(tops('Kickoff'),[y0()]), JSON.stringify(tops('Kickoff')));
  ok(where+': Shipping milestone (no Shipping on this job) at row 0', same(tops('Truck leaves'),[y0()]), JSON.stringify(tops('Truck leaves')));

  pick('both');
  sec(where+': Both — row 0 plus a copy on the phase row');
  ok(where+': Both is on, Top is off (class and aria-pressed)', q('#npv-msp button[data-msp="both"]').classList.contains('on')
     &&!q('#npv-msp button[data-msp="top"]').classList.contains('on')
     &&q('#npv-msp button[data-msp="both"]').getAttribute('aria-pressed')==='true'
     &&q('#npv-msp button[data-msp="top"]').getAttribute('aria-pressed')==='false');
  ok(where+': CNC milestone at row 0 and at the CNC row\'s y', same(tops(cnc),[y0(),yDept('cnc')]), JSON.stringify(tops(cnc))+' want '+yDept('cnc'));
  ok(where+': no-phase milestone still row 0 only', same(tops('Kickoff'),[y0()]), JSON.stringify(tops('Kickoff')));
  ok(where+': Shipping milestone still row 0 only', same(tops('Truck leaves'),[y0()]), JSON.stringify(tops('Truck leaves')));
  const cp=qa('#npv-body .npv-ev').filter(m=>m.title.indexOf(cnc+' ·')===0);
  ok(where+': both copies are the same diamond (id, date, title, left)', cp.length===2&&cp[0].dataset.mkId===cp[1].dataset.mkId
     &&cp[0].dataset.mkDate===cp[1].dataset.mkDate&&cp[0].title===cp[1].title&&cp[0].style.left===cp[1].style.left);

  pick('phase');
  sec(where+': Phase — on the phase row only');
  ok(where+': CNC milestone on the CNC row only', same(tops(cnc),[yDept('cnc')]), JSON.stringify(tops(cnc)));
  ok(where+': no-phase milestone stays at row 0', same(tops('Kickoff'),[y0()]), JSON.stringify(tops('Kickoff')));
  ok(where+': Shipping milestone stays at row 0', same(tops('Truck leaves'),[y0()]), JSON.stringify(tops('Truck leaves')));
}

setTimeout(()=>{
  sec('the toggle');
  ok('defaults to Top with nothing stored', E('NPV_MSP')==='top'&&win.localStorage.getItem('shopTimelineMsPlace')===null);
  go('#/project/new');
  setTimeout(draft1,800);
},1300);

function draft1(){
  const btns=qa('#npv-msp button');
  ok('three buttons, labelled Top · Both · Phase', btns.map(b=>b.textContent).join('|')==='Top|Both|Phase');
  ok('hover titles as approved', btns.map(b=>b.title).join('|')===
     "All milestones in the Milestones row|Milestones row, plus a copy on each milestone's phase bar|Milestones with a phase sit on that phase's bar; the rest stay in the Milestones row");
  ok('styled like the Gantt/Calendar switch', q('#npv-msp').classList.contains('npv-modes'));
  ok('sits at the right end of the chart header', q('.npv-hd').lastElementChild===q('#npv-msp'));

  const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;
    e.dispatchEvent(new win.Event('input',{bubbles:true}));change(e);};
  set('pp-name','Q4 Frozen In Time 2026');set('pp-deadline',D(30));
  const ck=q('#pp-depts input[data-dept="cnc"]');if(!ck.checked){ck.click();if(!ck.checked){ck.checked=true;change(ck);}}
  setTimeout(()=>{
    const c=JSON.parse(E("JSON.stringify(NPV_TASKS.find(t=>t.department==='cnc')||null)"));
    ok('draft: a CNC bar is drawn', !!c);
    if(!c){done();return;}
    const mid=E("fmtDate(addDays(parseDate('"+c.startDate+"'),Math.floor(diffDays(parseDate('"+c.startDate+"'),parseDate('"+c.endDate+"'))/2)))");
    const shipOn=E("NPV_TASKS.some(t=>t.department==='shipping')");
    ok('draft: no Shipping bar on this job', !shipOn);
    E("NPV_EVENTS.push({id:'d1',name:'ALL CNC DONE',date:'"+mid+"',dept:'cnc'},{id:'d2',name:'Kickoff',date:'"+c.startDate+"',dept:''},"
     +"{id:'d3',name:'Truck leaves',date:'"+mid+"',dept:'shipping'});npvRebuild();");
    modes('draft','ALL CNC DONE');
    ok('the choice is stored per browser', win.localStorage.getItem('shopTimelineMsPlace')==='phase');

    sec('draft: Phase mode — a phase change in the popover moves the diamond');
    E("npvEditPop('ev','d2',10,10)");
    const sel=q('#npv-pop select[data-f="dept"]');
    ok('draft: the popover has the Phase select', !!sel);
    if(sel){sel.value='cnc';change(sel);}
    ok('draft: Kickoff now sits on the CNC row', same(tops('Kickoff'),[yDept('cnc')]), JSON.stringify(tops('Kickoff')));
    E('npvPopClose()');
    E("NPV_MODE='calendar';npvRender();");
    ok('the toggle hides in Calendar mode', q('#npv-msp').classList.contains('hidden'));
    E("NPV_MODE='gantt';npvRender();");
    ok('and returns in Gantt mode', !q('#npv-msp').classList.contains('hidden'));
    pick('top');
    E('ppDraftDirty=()=>false;');
    go('#/project/p1');
    setTimeout(saved1,900);
  },400);
}

function saved1(){
  ok('saved: the page opened', E('NPV_LIVE')===true&&!!q('#npv-msp'));
  ok('saved: the toggle kept Top', q('#npv-msp button[data-msp="top"]').classList.contains('on'));
  modes('saved','ALL CNC DONE');
  ok('saved: the note stays on row 1 in Phase mode', qa('#npv-body .npv-tk').every(m=>parseFloat(m.style.top)===RH()+9)
     &&qa('#npv-body .npv-tk').length===1, qa('#npv-body .npv-tk').map(m=>m.style.top).join(','));

  sec('saved: Phase mode — a phase change in the popover moves the diamond');
  E("npvEditPop('ev','e2',10,10)");
  const sel=q('#npv-pop select[data-f="dept"]');
  ok('saved: the popover has the Phase select', !!sel);
  if(sel){sel.value='cnc';change(sel);}
  setTimeout(()=>{
    ok('saved: the change was saved', E("ST.events.find(e=>e.id==='e2').dept")==='cnc');
    ok('saved: Kickoff now sits on the CNC row', same(tops('Kickoff'),[yDept('cnc')]), JSON.stringify(tops('Kickoff')));
    E('npvPopClose()');

    sec('saved: dragging the phase-row copy (Both mode) changes only the date');
    pick('both');
    const cp=qa('#npv-body .npv-ev').filter(m=>m.title.indexOf('ALL CNC DONE ·')===0)
      .sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));
    const mk=cp[1],l0=mk.style.left;
    const dw=E('NPV_GEO.dw');
    mk.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
    doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:100+2*dw,clientY:160}));
    ok('saved: the Milestones-row twin follows the drag', cp[0].style.left===mk.style.left&&mk.style.left!==l0, cp[0].style.left+' vs '+mk.style.left);
    doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:100+2*dw,clientY:160}));
    pick('phase');
    setTimeout(()=>{
      const e1=JSON.parse(E("JSON.stringify(ST.events.find(e=>e.id==='e1'))"));
      ok('saved: the date moved two days', e1.date===D(12), e1.date);
      ok('saved: the phase did not change', e1.dept==='cnc', e1.dept);
      ok('saved: still on the CNC row', same(tops('ALL CNC DONE'),[yDept('cnc')]), JSON.stringify(tops('ALL CNC DONE')));
      reload();
    },300);
  },300);
}

/* a reload picks up the stored choice; anything unknown falls back to Top */
function reload(){
  sec('the choice survives a reload');
  const a=boot(FILE,{data:{projects,tasks,staff,todos:[],events:[]},localStorage:{shopTimelineMsPlace:'both'}});
  const b=boot(FILE,{data:{projects,tasks,staff,todos:[],events:[]},localStorage:{shopTimelineMsPlace:'sideways'}});
  setTimeout(()=>{
    ok('a stored Both comes back as Both', a.window.eval('NPV_MSP')==='both');
    ok('an unknown stored value falls back to Top', b.window.eval('NPV_MSP')==='top');
    done();
  },1300);
}
