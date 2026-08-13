/* E3 — both-edge resize on project-page bars (Design-Language §6).
   Saved page: right edge writes endDate to ST, snaps to workdays, Undo reverses.
   Draft page: resize lands in NPV_MANUAL (never ST), Undo reverses.
   Run: node tests/test-e3-resize.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'approved',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
/* td runs Mon Aug 3 → Fri Aug 14; fab is pinned. */
const tasks=[
 {appId:'t0',projectId:'p1',department:'pm',assignee:'Stan',startDate:'2026-08-03',
  endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-14',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-17',
  endDate:'2026-08-28',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:true,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const barOf=dept=>q('#npv-body .npv-bar[data-i="'+E("NPV_TASKS.findIndex(t=>t.department==='"+dept+"')")+'"]');
const drag=(el,days)=>{const dw=E('NPV_GEO.dw');
  mouse(el,'mousedown',100,20);dmouse('mousemove',100+dw*days,20);dmouse('mouseup',100+dw*days,20);};
const st=dept=>JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='"+dept+"'))"));
const working=d=>E("isWorking(parseDate('"+d+"'))")===true;

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(saved1,800);
},1300);

function saved1(){
  sec('saved page — handles');
  ok('NPV_LIVE on a saved project', E('NPV_LIVE')===true);
  const bar=barOf('td');
  ok('bar carries a left handle', !!bar.querySelector('.npv-hdl:not(.r)'));
  ok('bar carries a right handle', !!bar.querySelector('.npv-hdl.r'));
  ok('every drawn bar has both handles',
     qa('#npv-body .npv-bar:not(.sum)').every(b=>b.querySelector('.npv-hdl.r')));

  sec('saved page — right edge writes endDate');
  const b4=st('td');
  drag(bar.querySelector('.npv-hdl.r'),3); /* Fri Aug 14 +3 = Mon Aug 17 */
  setTimeout(()=>{
    const a=st('td');
    ok('endDate moved', a.endDate==='2026-08-17', b4.endDate+' -> '+a.endDate);
    ok('startDate untouched', a.startDate===b4.startDate, a.startDate);
    ok('estimatedDays recomputed', a.estimatedDays===11, 'days '+a.estimatedDays);
    ok('new end is a workday', working(a.endDate));

    sec('saved page — Undo toast reverses it');
    const u=qa('#toasts .toast .undo').pop();
    ok('the toast carries an Undo button', !!u);
    click(u);
    setTimeout(()=>{
      ok('Undo restores the end date', st('td').endDate===b4.endDate, st('td').endDate);
      saved2();
    },300);
  },300);
}

function saved2(){
  sec('saved page — workday snap');
  const b4=st('td');
  drag(barOf('td').querySelector('.npv-hdl.r'),1); /* Fri +1 = Sat, snaps back to Fri */
  setTimeout(()=>{
    ok('an end dropped on Saturday snaps back to Friday (no-op)',
       st('td').endDate===b4.endDate, st('td').endDate);
    drag(barOf('td').querySelector('.npv-hdl:not(.r)'),5); /* Mon Aug 3 +5 = Sat 8 -> Mon 10 */
    setTimeout(()=>{
      const a=st('td');
      ok('a start dropped on Saturday snaps forward to Monday',
         a.startDate==='2026-08-10', b4.startDate+' -> '+a.startDate);
      ok('snapped start is a workday', working(a.startDate));
      E('undo();'); /* put td back for the lock tests */
      setTimeout(saved3,300);
    },300);
  },300);
}

function saved3(){
  sec('saved page — pins and Protect dates block resize');
  ok('fab is seeded pinned', st('fab').pinned===true);
  const p4=st('fab');
  drag(barOf('fab').querySelector('.npv-hdl.r'),3);
  setTimeout(()=>{
    ok('a pinned bar ignores an edge drag',
       st('fab').endDate===p4.endDate&&st('fab').startDate===p4.startDate);
    E('DATE_LOCK=true;');
    const t4=st('td');
    drag(barOf('td').querySelector('.npv-hdl.r'),3);
    setTimeout(()=>{
      ok('Protect dates ignores an edge drag', st('td').endDate===t4.endDate, st('td').endDate);
      E('DATE_LOCK=false;');
      win.location.hash='#/project/new';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(draft1,800);
    },300);
  },300);
}

function draft1(){
  sec('draft page — resize stays out of ST');
  ok('NPV_LIVE off on a draft', E('NPV_LIVE')===false);
  const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;
    e.dispatchEvent(new win.Event('input',{bubbles:true}));
    e.dispatchEvent(new win.Event('change',{bubbles:true}));};
  set('pp-name','Cartier Vitrine'); set('pp-deadline','2026-10-14');
  setTimeout(()=>{
    const bar=q('#npv-body .npv-bar:not(.sum)');
    ok('the preview drew bars', !!bar);
    ok('draft bars carry both handles', !!bar.querySelector('.npv-hdl.r'));
    const i=+bar.dataset.i;
    const b4=JSON.parse(E('JSON.stringify(NPV_TASKS['+i+'])'));
    const stBefore=E('JSON.stringify(ST.tasks)');
    drag(bar.querySelector('.npv-hdl.r'),3);
    setTimeout(()=>{
      const a=JSON.parse(E('JSON.stringify(NPV_TASKS['+i+'])'));
      ok('right edge moved the draft end date', a.endDate>b4.endDate, b4.endDate+' -> '+a.endDate);
      ok('the new end is a workday', working(a.endDate));
      ok('the placement landed in NPV_MANUAL', E('Object.keys(NPV_MANUAL).length')===1);
      ok('nothing filed into ST', E('JSON.stringify(ST.tasks)')===stBefore);

      sec('draft page — Undo reverses the manual placement');
      const u=qa('#toasts .toast .undo').pop();
      ok('the draft toast carries an Undo button', !!u);
      click(u);
      setTimeout(()=>{
        const z=JSON.parse(E('JSON.stringify(NPV_TASKS['+i+'])'));
        ok('Undo clears the manual entry', E('Object.keys(NPV_MANUAL).length')===0);
        ok('Undo restores the draft end date', z.endDate===b4.endDate, z.endDate);
        done();
      },300);
    },300);
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
