/* v1.50.0 — item 32, tracker #1: where milestones draw on the project Gantt. Owner ruling 2026-10-16:
   the choice lives on a personal page, Help ▸ My settings (every signed-in user, viewers too), not on
   the project page. "On their phase" (phase, the default) draws a phased milestone on its phase's
   row; "Both" keeps it in the Milestones row too; "Milestones row only" (top) is the 09-03 behaviour.
   A milestone with no phase, or whose phase has no row on this job, stays in row 0 in every mode.
   Notes keep row 1. The choice rides the Staff row's savedViews ({…,milestones}) like Protect dates;
   no Staff row = this browser only. Asserted on the New Project draft and a saved project.
   Run: node tests/test-v1500.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const MK='shopTimelineMsPlace',OWN='shopTimelineViewsOwner';
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
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''};
const PAT={appId:'s2',Title:'Pat',email:'pat@example.com',depts:'[]',ooo:'[]',role:'',admin:'1'};

const COPY={
  menu:'My settings',menuTitle:'Your own display choices. They follow you to any computer.',
  h2:'My settings',sub:'Only you see these. They follow your sign-in to any computer or browser.',
  h3:'Project page',label:'Milestones on the Gantt',
  opts:[['phase','On their phase','A milestone with a phase sits on that phase\'s bar. The rest stay in the Milestones row.'],
        ['both','Both','In the Milestones row, plus a copy on the phase\'s bar.'],
        ['top','Milestones row only','Every milestone in the Milestones row.']]};

const rowPatches=w=>w.__spCalls.filter(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&'savedViews' in c.body);
const lastRow=w=>{const p=rowPatches(w);return p.length?JSON.parse(p[p.length-1].body.savedViews):null;};
function start(staff,ls){
  return boot(FILE,{data:{projects,tasks,staff,todos,events},eventsList:true,todosList:true,localStorage:ls||{}}).window;
}
const goW=(w,h)=>{w.location.hash=h;w.dispatchEvent(new w.Event('hashchange'));};

/* the page, on any window: menu entry, route, exact copy, Esc */
function pageCopy(w,who){
  const q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];
  const mi=q('#mi-myset');
  ok(who+': Help ▸ My settings is offered', !!mi&&!mi.classList.contains('hidden')&&mi.textContent===COPY.menu&&mi.title===COPY.menuTitle);
  const ids=qa('#help-menu .sm-item').map(e=>e.id),i=ids.indexOf('mi-myset');
  ok(who+': between Release notes and Repository', ids[i-1]==='mi-relnotes'&&ids[i+1]==='mi-repo', ids.join(','));
  mi.click();
  ok(who+': the menu item opens #/mysettings', w.location.hash==='#/mysettings');
  w.dispatchEvent(new w.Event('hashchange'));
  ok(who+': the page renders', w.eval('ROUTE.view')==='mysettings'&&!!q('#page .as-body'));
  ok(who+': trail reads All Projects › My settings, with a close', q('#page .pg-trail .pg-cr').textContent==='All Projects'&&q('#page .pg-trail .cur').textContent==='My settings'&&!!q('#cd-x'));
  ok(who+': heading and sub line', q('.cd-head h2').textContent===COPY.h2&&q('.cd-head .cd-sub').textContent===COPY.sub);
  ok(who+': section and label', q('.as-body h3').textContent===COPY.h3&&q('#ms-msp-lbl').textContent===COPY.label);
  const rows=qa('.as-body .as-row');
  ok(who+': three options, in order, with the approved copy', rows.length===3&&rows.every((r,k)=>
    r.querySelector('input[type=radio]').value===COPY.opts[k][0]&&r.querySelector('b').textContent===COPY.opts[k][1]
    &&r.querySelector('.as-txt > span').textContent===COPY.opts[k][2]), rows.map(r=>r.textContent).join(' | '));
  ok(who+': the radios are grouped and labelled', !!q('[role=radiogroup][aria-labelledby="ms-msp-lbl"]'));
  ok(who+': the current choice is checked', q('input[name="ms-msp"]:checked').value===w.eval('NPV_MSP'));
  ok(who+': no text beyond the approved copy', q('.as-body').textContent===COPY.h3+COPY.label+COPY.opts.map(o=>o[1]+o[2]).join(''));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  w.dispatchEvent(new w.Event('hashchange'));
  ok(who+': Esc goes back to the timeline', w.eval('ROUTE.view')==='timeline', w.eval('ROUTE.view'));
}

(async()=>{
  const w=start([{...SAM,admin:'1'},PAT]);
  const doc=w.document,E=s=>w.eval(s);
  const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
  const go=h=>goW(w,h);
  const change=el=>el.dispatchEvent(new w.Event('change',{bubbles:true}));
  const RH=()=>E('NPV_ROWH');
  const y0=()=>9.5;
  const yDept=d=>(E('NPV_TOP')+E("NPV_PLAN.findIndex(r=>r.dept==='"+d+"')"))*RH()+9.5;
  const tops=name=>qa('#npv-body .npv-ev').filter(m=>m.title.indexOf(name+' ·')===0)
    .map(m=>parseFloat(m.style.top)).sort((a,b)=>a-b);
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  /* the draft can't leave its page, so it drives the setting's own handler */
  const set=m=>E("saveMsp('"+m+"')");

  function modes(where,cnc,drive){
    drive('top');
    sec(where+': Milestones row only — every milestone in the Milestones row');
    ok(where+': CNC milestone inside the CNC bar is at row 0 only', same(tops(cnc),[y0()]), JSON.stringify(tops(cnc)));
    ok(where+': no-phase milestone at row 0', same(tops('Kickoff'),[y0()]), JSON.stringify(tops('Kickoff')));
    ok(where+': Shipping milestone (no Shipping on this job) at row 0', same(tops('Truck leaves'),[y0()]), JSON.stringify(tops('Truck leaves')));

    drive('both');
    sec(where+': Both — row 0 plus a copy on the phase row');
    ok(where+': CNC milestone at row 0 and at the CNC row\'s y', same(tops(cnc),[y0(),yDept('cnc')]), JSON.stringify(tops(cnc))+' want '+yDept('cnc'));
    ok(where+': no-phase milestone still row 0 only', same(tops('Kickoff'),[y0()]), JSON.stringify(tops('Kickoff')));
    ok(where+': Shipping milestone still row 0 only', same(tops('Truck leaves'),[y0()]), JSON.stringify(tops('Truck leaves')));
    const cp=qa('#npv-body .npv-ev').filter(m=>m.title.indexOf(cnc+' ·')===0);
    ok(where+': both copies are the same diamond (id, date, title, left)', cp.length===2&&cp[0].dataset.mkId===cp[1].dataset.mkId
       &&cp[0].dataset.mkDate===cp[1].dataset.mkDate&&cp[0].title===cp[1].title&&cp[0].style.left===cp[1].style.left);

    drive('phase');
    sec(where+': On their phase — on the phase row only');
    ok(where+': CNC milestone on the CNC row only', same(tops(cnc),[yDept('cnc')]), JSON.stringify(tops(cnc)));
    ok(where+': no-phase milestone stays at row 0', same(tops('Kickoff'),[y0()]), JSON.stringify(tops('Kickoff')));
    ok(where+': Shipping milestone stays at row 0', same(tops('Truck leaves'),[y0()]), JSON.stringify(tops('Truck leaves')));
  }

  await wait(1500);
  sec('the default and the page (admin)');
  ok('defaults to On their phase with nothing stored', E('NPV_MSP')==='phase'&&w.localStorage.getItem(MK)===null);
  ok('admin: Sam is an admin', E('isAdmin()')===true);
  pageCopy(w,'admin');

  sec('draft page');
  go('#/project/new');await wait(800);
  ok('no placement buttons on the project page', !q('#npv-msp')&&!qa('.npv-hd button').some(b=>/^(Top|Both|Phase)$/.test(b.textContent)));
  const setF=(id,v)=>{const e=doc.getElementById(id);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));change(e);};
  setF('pp-name','Q4 Frozen In Time 2026');setF('pp-deadline',D(30));
  const ck=q('#pp-depts input[data-dept="cnc"]');if(!ck.checked){ck.click();if(!ck.checked){ck.checked=true;change(ck);}}
  await wait(400);
  const c=JSON.parse(E("JSON.stringify(NPV_TASKS.find(t=>t.department==='cnc')||null)"));
  ok('draft: a CNC bar is drawn', !!c);
  if(!c){done();return;}
  const mid=E("fmtDate(addDays(parseDate('"+c.startDate+"'),Math.floor(diffDays(parseDate('"+c.startDate+"'),parseDate('"+c.endDate+"'))/2)))");
  ok('draft: no Shipping bar on this job', !E("NPV_TASKS.some(t=>t.department==='shipping')"));
  E("NPV_EVENTS.push({id:'d1',name:'ALL CNC DONE',date:'"+mid+"',dept:'cnc'},{id:'d2',name:'Kickoff',date:'"+c.startDate+"',dept:''},"
   +"{id:'d3',name:'Truck leaves',date:'"+mid+"',dept:'shipping'});npvRebuild();");
  ok('draft: by default the CNC milestone sits on the CNC row', same(tops('ALL CNC DONE'),[yDept('cnc')]), JSON.stringify(tops('ALL CNC DONE')));
  modes('draft','ALL CNC DONE',set);

  sec('draft: a phase change in the popover moves the diamond');
  E("npvEditPop('ev','d2',10,10)");
  let sel=q('#npv-pop select[data-f="dept"]');
  ok('draft: the popover has the Phase select', !!sel);
  if(sel){sel.value='cnc';change(sel);}
  ok('draft: Kickoff now sits on the CNC row', same(tops('Kickoff'),[yDept('cnc')]), JSON.stringify(tops('Kickoff')));
  E('npvPopClose()');
  E('ppDraftDirty=()=>false;');

  sec('saved page — driven through Help ▸ My settings');
  const n0=rowPatches(w).length;
  /* pick on the page, then come back to the project */
  const viaPage=m=>{go('#/mysettings');const r=q('input[name="ms-msp"][value="'+m+'"]');r.checked=true;change(r);go('#/project/p1');};
  go('#/project/p1');await wait(900);
  ok('saved: the page opened', E('NPV_LIVE')===true);
  ok('saved: no placement buttons on the project page', !q('#npv-msp'));
  modes('saved','ALL CNC DONE',viaPage);
  ok('saved: the note stays on row 1', qa('#npv-body .npv-tk').length===1&&qa('#npv-body .npv-tk').every(m=>parseFloat(m.style.top)===RH()+9),
     qa('#npv-body .npv-tk').map(m=>m.style.top).join(','));
  ok('the choice is cached in this browser', w.localStorage.getItem(MK)==='phase');
  ok('and written into the Staff row\'s savedViews', (lastRow(w)||{}).milestones==='phase', JSON.stringify(lastRow(w)));
  ok('one row write per pick', rowPatches(w).length-n0===3, String(rowPatches(w).length-n0));

  sec('saved: a phase change in the popover moves the diamond');
  E("npvEditPop('ev','e2',10,10)");
  sel=q('#npv-pop select[data-f="dept"]');
  ok('saved: the popover has the Phase select', !!sel);
  if(sel){sel.value='cnc';change(sel);}
  await wait(300);
  ok('saved: the change was saved', E("ST.events.find(e=>e.id==='e2').dept")==='cnc');
  ok('saved: Kickoff now sits on the CNC row', same(tops('Kickoff'),[yDept('cnc')]), JSON.stringify(tops('Kickoff')));
  E('npvPopClose()');

  sec('saved: dragging the phase-row copy (Both) changes only the date');
  set('both');
  const cp=qa('#npv-body .npv-ev').filter(m=>m.title.indexOf('ALL CNC DONE ·')===0)
    .sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));
  const mk=cp[1],l0=mk.style.left,dw=E('NPV_GEO.dw');
  mk.dispatchEvent(new w.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100}));
  doc.dispatchEvent(new w.MouseEvent('mousemove',{bubbles:true,clientX:100+2*dw,clientY:160}));
  ok('saved: the Milestones-row twin follows the drag', cp[0].style.left===mk.style.left&&mk.style.left!==l0, cp[0].style.left+' vs '+mk.style.left);
  doc.dispatchEvent(new w.MouseEvent('mouseup',{bubbles:true,clientX:100+2*dw,clientY:160}));
  set('phase');
  await wait(300);
  const e1=JSON.parse(E("JSON.stringify(ST.events.find(e=>e.id==='e1'))"));
  ok('saved: the date moved two days', e1.date===D(12), e1.date);
  ok('saved: the phase did not change', e1.dept==='cnc', e1.dept);
  ok('saved: still on the CNC row', same(tops('ALL CNC DONE'),[yDept('cnc')]), JSON.stringify(tops('ALL CNC DONE')));

  sec('a viewer gets the page too');
  {const v=start([{...SAM,admin:''},PAT]);
    await wait(1500);
    ok('viewer: Sam is a viewer', v.eval('isViewer()')===true);
    pageCopy(v,'viewer');
    goW(v,'#/mysettings');
    const r=v.document.querySelector('input[name="ms-msp"][value="top"]');r.checked=true;r.dispatchEvent(new v.Event('change',{bubbles:true}));await wait(50);
    ok('viewer: picking an option saves it', v.eval('NPV_MSP')==='top'&&v.localStorage.getItem(MK)==='top'&&(lastRow(v)||{}).milestones==='top',
       JSON.stringify(lastRow(v)));
  }

  sec('it follows the person');
  {const a=start([{...SAM,savedViews:JSON.stringify({protectDates:true,milestones:'top'})}]);
    await wait(1500);
    ok('a seeded row is adopted', a.eval('NPV_MSP')==='top'&&a.localStorage.getItem(MK)==='top');
    ok('nothing written back', rowPatches(a).length===0);
    a.eval("saveMsp('both')");await wait(50);
    const r=lastRow(a);
    ok('a change keeps the row\'s other keys', !!r&&r.milestones==='both'&&r.protectDates===true, JSON.stringify(r));
  }
  {const b=start([{...SAM,savedViews:JSON.stringify({milestones:'sideways'})}],{[MK]:'both',[OWN]:'s1'});
    await wait(1500);
    ok('an unknown row value is ignored; this browser\'s choice moves up', b.eval('NPV_MSP')==='both'&&(lastRow(b)||{}).milestones==='both',
       JSON.stringify(lastRow(b)));
  }
  {const c2=start([SAM],{[MK]:'sideways'});
    await wait(1500);
    ok('an unknown stored value falls back to On their phase', c2.eval('NPV_MSP')==='phase');
  }

  sec('no Staff row: this browser only, quietly');
  {const n=start([]);
    await wait(1500);
    n.eval("saveMsp('both')");await wait(50);
    ok('stored in this browser', n.localStorage.getItem(MK)==='both'&&n.eval('NPV_MSP')==='both');
    ok('no row write', rowPatches(n).length===0);
    ok('no error toast', ![...n.document.querySelectorAll('.toast')].some(t=>/err/.test(t.className)));
  }
  done();
})();
