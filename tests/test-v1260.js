/* v1.26.0 — tracker #15 and #20: one due-date rule. A project's due date is the end of
   its Installation block (else its Shipping block, else none); the Setup install date no
   longer drives anything users see.
   #15 R1 the dashboard LATE tag follows the department dates, not the Setup date.
   #20 R1 the editable Install date leaves Setup · R2 a read-only Created on replaces it ·
   R3 Installation and Shipping are scheduled under Departments (the draft's one target
   date becomes the Installation block) · R4 header, Days out and LATE follow the
   department dates · R5 Shipping scheduled and Installation unticked reads "Ships", never
   "Installs" · R6 neither scheduled: no date shown, never late.
   Run: node tests/test-v1260.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function dueOf')<0){
  console.log('  SKIP  test-v1260: pre-v1.26.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Dates relative to today, so the suite stays true next month. */
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const nice=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'});};
const P=(id,name,code,depts,extra)=>Object.assign({appId:id,Title:name,client:'Client '+id,jobCode:code,
  deadline:D(-60),status:'in-fabrication',projectManager:'Sam',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(depts),createdAt:'2026-07-01',sortIndex:0},extra||{});
const onSite=d=>d==='install'||d==='shipping';
const T=(id,pid,dept,s,e)=>({appId:id,projectId:pid,department:dept,assignee:onSite(dept)?'[]':'Peter',
  startDate:s,endDate:e,estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''});
/* Every Setup date is 60 days back. Only the blocks decide. */
const projects=[
 P('p1','Setup Past Install Ahead','P1',['pm','td','install']),            /* install in 3 weeks */
 P('p2','Shipping Only','P2',['pm','td','shipping']),                      /* Installation unticked, Shipping in 3 days */
 P('p3','Neither Scheduled','P3',['pm','td']),                             /* no on-site block at all */
 P('p4','Done And Dusted','P4',['pm','td','install'],{status:'complete'}), /* complete, install 20 days ago */
 P('p5','Late Install','P5',['pm','td','install'])];                      /* install ended 10 days ago */
const tasks=[
 T('a1','p1','td',D(-30),D(-25)),T('a2','p1','install',D(20),D(22)),
 T('b1','p2','td',D(-30),D(-25)),T('b2','p2','shipping',D(1),D(3)),
 T('c1','p3','td',D(-10),D(-3)),
 T('d1','p4','td',D(-40),D(-30)),T('d2','p4','install',D(-21),D(-20)),
 T('e1','p5','td',D(-30),D(-25)),T('e2','p5','install',D(-12),D(-10))];
/* meName() resolves through the staff list: Sam is the harness's stubbed sign-in. */
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const rowOf=name=>qa('#side-rows .sb-row.proj-head').find(r=>r.querySelector('.sb-name')&&r.querySelector('.sb-name').textContent===name);
const sub=name=>{const r=rowOf(name);return r?r.querySelector('.sb-sub').textContent:'(no row)';};
const chip=name=>{const r=rowOf(name);const c=r&&r.querySelector('.sb-chip');return c?c.textContent:'';};
const meta=()=>(q('#pp-meta')||{textContent:''}).textContent;

setTimeout(stage1,1500);

function stage1(){
  sec('dashboard — the date and the LATE tag follow the Installation / Shipping block (#15 R1, #20 R4, R6)');
  ok('p1: Setup date 60 days back but install in 3 weeks → no LATE tag', !!rowOf('Setup Past Install Ahead')&&chip('Setup Past Install Ahead')==='', chip('Setup Past Install Ahead'));
  ok('p1: the sidebar date is the install end', sub('Setup Past Install Ahead')==='P1 · '+nice(D(22)), sub('Setup Past Install Ahead'));
  ok('p2: Shipping only → the shipping end, with a soon chip counting to it', sub('Shipping Only')==='P2 · '+nice(D(3))&&chip('Shipping Only')==='3d', sub('Shipping Only')+' / '+chip('Shipping Only'));
  ok('p3: neither scheduled → the code alone, no date, no tag (R6)', sub('Neither Scheduled')==='P3'&&chip('Neither Scheduled')==='', sub('Neither Scheduled')+' / '+chip('Neither Scheduled'));
  ok('p4: complete → never LATE', chip('Done And Dusted')==='', chip('Done And Dusted'));
  ok('p5: install ended 10 days ago → LATE 10d', chip('Late Install')==='LATE 10d', chip('Late Install'));

  sec('dashboard — the drop-line marks the due date');
  const names=qa('#side-rows .sb-row.proj-head').map(r=>r.querySelector('.sb-name').textContent);
  const flags=qa('#gantt-canvas .dl-flag');
  ok('one flag per listed project that has a due date', flags.length===names.filter(n=>n!=='Neither Scheduled').length, flags.length+' flags for '+names.join(', '));
  ok('flags are titled with the kind and the date', flags.some(f=>f.title==='Installs '+nice(D(22)))&&flags.some(f=>f.title==='Ships '+nice(D(3))), flags.map(f=>f.title).join(' | '));

  sec('tooltip and sort read the same rule');
  try{E("showTooltipProj(ST.projects.find(p=>p.id==='p1'),parseDate('"+D(-30)+"'),parseDate('"+D(22)+"'),{clientX:40,clientY:40})");}catch(e){}
  const tt=(q('#tooltip')||{textContent:''}).textContent;
  ok('the project tooltip says installs <date> (22d left)', tt.indexOf('installs '+nice(D(22))+' (22d left)')>=0, tt);
  try{E("showTooltipProj(ST.projects.find(p=>p.id==='p3'),parseDate('"+D(-10)+"'),parseDate('"+D(-3)+"'),{clientX:40,clientY:40})");}catch(e){}
  const tt3=(q('#tooltip')||{textContent:''}).textContent;
  ok('a project with neither block carries no date in its tooltip', !/installs|ships|deadline/i.test(tt3), tt3);
  ok('Due date sort: p4, p5, p2, p1, then p3 last (no due date)', E("ST.projects.slice().sort(byDue).map(p=>p.id).join()")==='p4,p5,p2,p1,p3', E("ST.projects.slice().sort(byDue).map(p=>p.id).join()"));

  sec('PM late prompt (#15 R1)');
  E('pmLateShow()');
  setTimeout(()=>{
    const ids=qa('#pmlate-list .pml-row').map(r=>r.dataset.id);
    ok('only the project whose install has passed is listed; an old Setup date alone is not late', ids.join()==='p5', ids.join());
    const txt=(q('#pmlate-list .pml-row')||{textContent:''}).textContent;
    ok('it reads installed <date> · 10d ago', txt.indexOf('installed '+nice(D(-10))+' · 10d ago')>=0, txt);

    sec('Meeting Sheet reads the same rule');
    try{E('openMeeting()');}catch(e){}
    try{E('buildMeetingSheet()');}catch(e){}
    const mrow=name=>qa('.meet-row').find(r=>r.querySelector('.mr-name')&&r.querySelector('.mr-name').textContent===name);
    const m1=mrow('Setup Past Install Ahead'),m3=mrow('Neither Scheduled');
    ok('p1 shows the install end in the Deadline column', !!m1&&m1.querySelector('.mr-dl').textContent===nice(D(22)), m1&&m1.querySelector('.mr-dl').textContent);
    ok('p3 shows TBD and no day count (R6)', !!m3&&m3.querySelector('.mr-dl').textContent==='TBD'&&m3.querySelector('.mr-days').textContent==='—', m3&&(m3.querySelector('.mr-dl').textContent+' / '+m3.querySelector('.mr-days').textContent));
    stage2();
  },300);
}

function stage2(){
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(()=>{
    sec('saved project — header and Setup (#20 R1, R2, R4)');
    ok('the header reads Installs <install end>', meta().indexOf('Installs'+nice(D(22)))>=0, meta());
    ok('Days out counts to the install end (22d)', meta().indexOf('Days out22d')>=0, meta());
    ok('no late warning', !/runs past/.test(meta()));
    ok('the editable Install date is gone from Setup (R1)', !q('#pp-deadline'));
    const cr=q('#pp-created');
    ok('a read-only Created on shows when the project was first saved (R2)', !!cr&&cr.readOnly&&cr.value==='Jul 1, 2026', cr&&cr.value);
    ok('the project-page chart marks the due date', !!q('#npv-body .npv-dl'));
    E("location.hash='#/project/p3';applyRoute()");
    setTimeout(()=>{
      sec('saved project with neither block (#20 R6)');
      ok('no Installs or Ships cell', !/Installs|Ships/.test(meta()), meta());
      ok('no Days out and no Overdue', !/Days out|Overdue/.test(meta()), meta());
      ok('no late warning', !/runs past/.test(meta()));
      E("location.hash='#/project/p2';applyRoute()");
      setTimeout(()=>{
        sec('saved project with Shipping only (#20 R5)');
        ok('the header reads Ships <date>, never Installs', meta().indexOf('Ships'+nice(D(3)))>=0&&!/Installs/.test(meta()), meta());
        E("location.hash='#/project/p5';applyRoute()");
        setTimeout(()=>{
          ok('a passed install reads Overdue by 10d', meta().indexOf('Overdue by10d')>=0, meta());
          stage3();
        },500);
      },500);
    },500);
  },600);
}

function stage3(){
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    sec('New Project draft — one target date lays out the schedule (#20 R3, R4, R5, R6)');
    const dl=q('#pp-deadline');
    ok('the draft asks for a Target install / ship date', !!dl&&/Target install \/ ship date/.test(dl.closest('.ins-f').textContent), dl&&dl.closest('.ins-f').textContent);
    ok('no Created on on a draft', !q('#pp-created'));
    if(!dl){done();return;}
    dl.value=D(40);change(dl);
    setTimeout(()=>{
      const inst=JSON.parse(E('JSON.stringify((NPV_ALL||[]).find(t=>t.department==="install")||null)'));
      ok('the Installation block ends on the target date (R3)', !!inst&&inst.endDate===D(40), inst&&inst.endDate);
      ok('the draft header reads Installs <target>', meta().indexOf('Installs'+nice(D(40)))>=0, meta());
      const ci=q('#pp-depts input[data-dept="install"]'),cs=q('#pp-depts input[data-dept="shipping"]');
      ci.checked=false;change(ci);cs.checked=true;change(cs);
      setTimeout(()=>{
        ok('Shipping scheduled and Installation unticked reads Ships, not Installs (R5)', meta().indexOf('Ships'+nice(D(40)))>=0&&!/Installs/.test(meta()), meta());
        cs.checked=false;change(cs);
        setTimeout(()=>{
          ok('neither on the draft: no Installs, Ships or Days out (R6)', !/Installs|Ships|Days out/.test(meta()), meta());
          done();
        },300);
      },400);
    },400);
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
