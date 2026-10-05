/* v1.34.1 — tracker #32: changing a department's days moves its end date. One rule for
   every days field (the Departments row, the bottom panel, the bar's edit popover), on the
   New Project draft and the saved page: the start stays where it was typed, the end is the
   start plus N days (workdays for shop departments, calendar days for Installation and
   Shipping — #26), and the count and the date range always agree.
   R1 changing the days moves that department's end · R2 a typed start stays put · R3 the
   days count and the date range agree · Q1 default: an untouched draft bar still follows the
   scheduler (no manual placement) · Q2 default: the panel's and the popover's Days field on a
   saved project move the end too.
   Run: node tests/test-v1341.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function ppDeptDays')<0){
  console.log('  SKIP  test-v1341: pre-v1.34.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const CAL=src.indexOf('function typedDates')>=0; /* #26 in: Installation counts calendar days */
const DUE=src.indexOf('function dueOf')>=0;      /* #15/#20 in: the header follows the Installation end */

/* Atlas: Technical Design Thu Oct 1 – Fri Oct 2, Fab Oct 5–16, Installation Saturday Oct 10 (one day),
   target Monday Oct 26 2026. */
const projects=[{appId:'p1',Title:'Atlas Lobby',client:'Atlas',jobCode:'A1',
  deadline:'2026-10-26',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-09-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-10-01',
  endDate:'2026-10-02',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-10-05',
  endDate:'2026-10-16',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-10-10',
  endDate:'2026-10-10',estimatedDays:1,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const T=id=>JSON.parse(E('JSON.stringify(ST.tasks.find(t=>t.id==="'+id+'")||null)'));
const draftBar=dept=>JSON.parse(E('JSON.stringify((NPV_ALL||[]).find(t=>t.department==="'+dept+'")||null)'));
const row=d=>q('#pp-depts input[data-dept="'+d+'"]').closest('.idr');
const fld=(d,c)=>row(d).querySelector(c);
const span=t=>t?(t.startDate+'..'+t.endDate+' '+t.estimatedDays+'d'):'none';
const meta=()=>(q('#pp-meta')||{textContent:''}).textContent;
const nice=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'});};
const panel=f=>q('#pp-insp [data-f="'+f+'"]');
const pop=f=>q('#npv-pop [data-f="'+f+'"]');
/* the chart bar for a department: its drawn width in days */
const barDays=dept=>{const i=E("NPV_TASKS.findIndex(t=>t.department==='"+dept+"')");
  const el=q('#npv-body .npv-bar[data-i="'+i+'"]');if(!el)return -1;
  const dw=E('NPV_GEO.dw'),padR=E('NPV_PADR');return Math.round((parseFloat(el.style.width)+padR)/dw);};
const lastPatch=id=>[...win.__spCalls].reverse().find(c=>c.method==='PATCH'&&c.url.indexOf('ShopTimeline_Tasks/')>=0&&c.body&&c.body.startDate);
const taskPosts=()=>win.__spCalls.filter(c=>c.method==='POST'&&/ShopTimeline_Tasks(?!2)/.test(c.url));
const manualKeys=()=>JSON.parse(E('JSON.stringify(Object.keys(NPV_MANUAL))'));

setTimeout(()=>{
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(stageA,600);
},1300);

function stageA(){
  sec('saved project — the Departments row (R1, R2, R3)');
  ok('the project page shows the Departments date rows', !!q('#pp-depts .dstart[data-dept="td"]'));
  const ds=fld('td','.dstart'); ds.value='2026-10-05'; change(ds);
  setTimeout(()=>{
    const t=T('td1');
    ok('as today: a start typed past the end pulls the end to it, one day', t&&t.startDate==='2026-10-05'&&t.endDate==='2026-10-05'&&fld('td','.ddays').value==='1', span(t));
    const dd=fld('td','.ddays'); dd.value='5'; change(dd);
    setTimeout(()=>{
      const t2=T('td1');
      ok('R1: 5 days moves the end to Fri Oct 9', t2&&t2.endDate==='2026-10-09', span(t2));
      ok('R2: the typed start stays Oct 5', t2&&t2.startDate==='2026-10-05', span(t2));
      ok('R3: the count and the range agree (5 workdays)', t2&&t2.estimatedDays===5, span(t2));
      const pc=lastPatch('td1');
      ok('the SharePoint save carries Oct 5, Oct 9 and 5', !!pc&&pc.body.startDate==='2026-10-05'&&pc.body.endDate==='2026-10-09'&&pc.body.estimatedDays===5, pc&&JSON.stringify(pc.body));
      ok('the end field reads Oct 9, the days field still 5', fld('td','.dend').value==='2026-10-09'&&fld('td','.ddays').value==='5', fld('td','.dend').value+' / '+fld('td','.ddays').value);
      ok('the bar is five days wide', barDays('td')===5, barDays('td'));
      E("ppSelect('td1')");
      setTimeout(()=>{
        ok('the bottom panel reads Oct 5 → Oct 9, 5 days', panel('startDate')&&panel('startDate').value==='2026-10-05'&&panel('endDate').value==='2026-10-09'&&panel('estimatedDays').value==='5', panel('endDate')&&panel('endDate').value);
        stageA2();
      },300);
    },400);
  },400);
}

function stageA2(){
  sec('saved project — the bottom panel and the popover follow the same rule (Q2)');
  const pd=panel('estimatedDays'); pd.value='3'; change(pd);
  setTimeout(()=>{
    const t=T('td1');
    ok('Q2: 3 days in the panel moves the end to Wed Oct 7, start kept', t&&t.startDate==='2026-10-05'&&t.endDate==='2026-10-07'&&t.estimatedDays===3, span(t));
    ok('the panel\'s end field agrees', panel('endDate')&&panel('endDate').value==='2026-10-07', panel('endDate')&&panel('endDate').value);
    ok('the bar is three days wide', barDays('td')===3, barDays('td'));
    E("npvEditPop('phase',ppSelected(),100,100)");
    ok('the popover opened on Technical Design', !!pop('estimatedDays')&&pop('estimatedDays').value==='3', pop('estimatedDays')&&pop('estimatedDays').value);
    const pp=pop('estimatedDays'); pp.value='4'; change(pp);
    setTimeout(()=>{
      const t2=T('td1');
      ok('Q2: 4 days in the popover moves the end to Thu Oct 8, start kept', t2&&t2.startDate==='2026-10-05'&&t2.endDate==='2026-10-08'&&t2.estimatedDays===4, span(t2));
      ok('the panel and the bar agree', panel('endDate').value==='2026-10-08'&&barDays('td')===4, panel('endDate').value+' / '+barDays('td'));
      E('npvPopClose();ppSelect(null)'); /* the Departments list shows while no phase is selected */
      ok('the Departments row reads Oct 5 → Oct 8, 4 days', fld('td','.dstart').value==='2026-10-05'&&fld('td','.dend').value==='2026-10-08'&&fld('td','.ddays').value==='4', fld('td','.dend').value+' / '+fld('td','.ddays').value);
      stageA3();
    },400);
  },400);
}

function stageA3(){
  sec('saved project — Installation counts calendar days (#26), the header follows (#15/#20)');
  const dd=fld('install','.ddays'); dd.value='2'; change(dd);
  setTimeout(()=>{
    const i=T('i1'),want=CAL?'2026-10-11':'2026-10-12';
    ok('2 Installation days from Saturday Oct 10 end on '+(CAL?'Sunday Oct 11 (calendar days)':'Monday Oct 12 (workdays)'), i&&i.startDate==='2026-10-10'&&i.endDate===want&&i.estimatedDays===2, span(i));
    if(DUE)ok('the header Installs date reads the new end', meta().indexOf('Installs'+nice(want))>=0, meta());
    else console.log('  SKIP  header check: pre-#15/#20 build');
    stageB();
  },400);
}

function stageB(){
  sec('New Project draft — the report\'s own case (R1, R2, R3)');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const dl=q('#pp-deadline'); ok('the draft page opened', !!dl);
    dl.value='2026-10-26'; change(dl);
    setTimeout(()=>{
      const ck=q('#pp-depts input[data-dept="td"]');
      if(ck&&!ck.checked){ck.checked=true;change(ck);}
      setTimeout(()=>{
        const ds=fld('td','.dstart'); ds.value='2026-10-05'; change(ds);
        setTimeout(()=>{
          const b=draftBar('td');
          ok('as today: Oct 5 typed gives Oct 5 → Oct 5, 1 day', b&&b.startDate==='2026-10-05'&&b.endDate==='2026-10-05'&&fld('td','.ddays').value==='1', span(b));
          const dd=fld('td','.ddays'); dd.value='5'; change(dd);
          setTimeout(()=>{
            const b2=draftBar('td');
            ok('R1: 5 days moves the draft bar\'s end to Oct 9', b2&&b2.endDate==='2026-10-09', span(b2));
            ok('R2: the typed start stays Oct 5', b2&&b2.startDate==='2026-10-05', span(b2));
            ok('R3: the bar reads 5 days, the end field Oct 9, the days field 5', b2&&b2.estimatedDays===5&&fld('td','.dend').value==='2026-10-09'&&fld('td','.ddays').value==='5', fld('td','.dend').value+' / '+fld('td','.ddays').value);
            ok('the bar is five days wide', barDays('td')===5, barDays('td'));
            ok('Main Shop Fab was not touched by the edit', !manualKeys().some(k=>k.startsWith('fab::')), manualKeys().join(','));
            E("ppSelect(NPV_TASKS.find(t=>t.department==='td').id)");
            setTimeout(()=>{
              ok('the bottom panel reads Oct 5 → Oct 9', panel('startDate')&&panel('startDate').value==='2026-10-05'&&panel('endDate').value==='2026-10-09', panel('endDate')&&panel('endDate').value);
              E('ppSelect(null)');
              stageB2();
            },300);
          },400);
        },400);
      },300);
    },300);
  },600);
}

function stageB2(){
  sec('New Project draft — untouched dates follow the scheduler (Q1), the popover (Q2)');
  const fab0=draftBar('fab');
  const fd=fld('fab','.ddays'); fd.value='7'; change(fd);
  setTimeout(()=>{
    const fb=draftBar('fab');
    ok('Q1: a days change with no date typed creates no manual placement', !manualKeys().some(k=>k.startsWith('fab::')), manualKeys().join(','));
    ok('the scheduler\'s bar carries the new estimate', fb&&fb.estimatedDays===7&&!fb.__manual, span(fb));
    ok('the Technical Design placement survived the redraw', draftBar('td').endDate==='2026-10-09', span(draftBar('td')));
    E("ppSelect(NPV_TASKS.find(t=>t.department==='td').id);npvEditPop('phase',ppSelected(),100,100)");
    ok('the draft popover opened on Technical Design', !!pop('estimatedDays'), pop('estimatedDays')&&pop('estimatedDays').value);
    const pp=pop('estimatedDays'); pp.value='3'; change(pp);
    setTimeout(()=>{
      const b=draftBar('td');
      ok('Q2: 3 days in the draft popover gives Oct 5 → Oct 7', b&&b.startDate==='2026-10-05'&&b.endDate==='2026-10-07'&&b.estimatedDays===3, span(b));
      E('npvPopClose();ppSelect(null)');
      ok('R3: the Departments row reads back the popover\'s edit, Oct 5 → Oct 7, 3 days', fld('td','.dend').value==='2026-10-07'&&fld('td','.ddays').value==='3', fld('td','.dend').value+' / '+fld('td','.ddays').value);
      const dd=fld('td','.ddays'); dd.value='5'; change(dd);
      setTimeout(()=>{
        const b2=draftBar('td');
        ok('back to 5 days in the row: Oct 5 → Oct 9 again', b2&&b2.endDate==='2026-10-09'&&b2.estimatedDays===5&&fld('td','.dend').value==='2026-10-09', span(b2));
        stageB3();
      },400);
    },400);
  },400);
}

function stageB3(){
  if(!CAL){console.log('  SKIP  draft Installation calendar-day check: pre-#26 build');return stageC();}
  sec('New Project draft — Installation: a Saturday start kept as typed, 2 days = Saturday → Sunday (#26)');
  const ck=q('#pp-depts input[data-dept="install"]');
  if(ck&&!ck.checked){ck.checked=true;change(ck);}
  setTimeout(()=>{
    const ds=fld('install','.dstart'); ds.value='2026-10-10'; change(ds);
    setTimeout(()=>{
      ok('the Saturday start is kept as typed', draftBar('install').startDate==='2026-10-10', span(draftBar('install')));
      const dd=fld('install','.ddays'); dd.value='2'; change(dd);
      setTimeout(()=>{
        const b=draftBar('install');
        ok('2 days: Saturday Oct 10 → Sunday Oct 11', b&&b.startDate==='2026-10-10'&&b.endDate==='2026-10-11'&&b.estimatedDays===2, span(b));
        ok('the end field reads Oct 11', fld('install','.dend').value==='2026-10-11', fld('install','.dend').value);
        stageC();
      },400);
    },400);
  },300);
}

function stageC(){
  sec('New Project draft — Create saves the bar as shown (R3)');
  q('#pp-name').value='Atlas Draft'; change(q('#pp-name'));
  const n0=taskPosts().length;
  q('#pp-save').click();
  setTimeout(()=>{
    const td=taskPosts().slice(n0).find(c=>c.body.fields.department==='td');
    ok('Create sends Oct 5, Oct 9 and 5 for Technical Design', !!td&&td.body.fields.startDate==='2026-10-05'&&td.body.fields.endDate==='2026-10-09'&&td.body.fields.estimatedDays===5, td&&JSON.stringify([td.body.fields.startDate,td.body.fields.endDate,td.body.fields.estimatedDays]));
    const saved=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='td'&&t.projectId===(ST.projects.find(p=>p.name==='Atlas Draft')||{}).id)||null)"));
    ok('the saved project carries the five-day bar', saved&&saved.startDate==='2026-10-05'&&saved.endDate==='2026-10-09'&&saved.estimatedDays===5, span(saved));
    done();
  },900);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},60000);
