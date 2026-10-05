/* v1.25.2 — tracker #26: typed department dates. On-site work (Installation, Shipping)
   keeps the dates exactly as typed, weekends and holidays included, and counts calendar
   days. Shop departments still snap to a workday (start forward, end back) but a note
   under the field says what moved and why. The start can never end up after the end.
   Asserted on a saved project AND the New Project draft, through the Departments rows
   and the phase panel.
   R1 picking an end date never changes the start · R2 Installation dates kept as typed,
   weekends and holidays included · R3 start never after end · R4 a restricted date is
   explained, not silently moved · R5 the report's exact case (Setup Jan 2 2027,
   Installation Jan 1 → Jan 2).
   Run: node tests/test-v1252.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function typedDates')<0){
  console.log('  SKIP  test-v1252: pre-v1.25.2 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Hermes: td Aug 3–7 (shop), install Sep 14–15 (on-site), deadline Tue Sep 15 2026. */
const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const T=id=>JSON.parse(E('JSON.stringify(ST.tasks.find(t=>t.id==="'+id+'")||null)'));
const draftBar=dept=>JSON.parse(E('JSON.stringify((NPV_ALL||[]).find(t=>t.department==="'+dept+'")||null)'));
const row=d=>q('#pp-depts input[data-dept="'+d+'"]').closest('.idr');
const fld=(d,c)=>row(d).querySelector(c);
const note=d=>fld(d,'.dnote');
const panelNote=()=>(q('#pp-insp .ins-note.dnote')||{textContent:''}).textContent;
const span=t=>t?(t.startDate+'..'+t.endDate):'none';

setTimeout(()=>{
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(stageA,600);
},1300);

function stageA(){
  sec('saved project — Installation keeps typed dates (R2), the start never ends after the end (R3)');
  ok('the project page shows the Departments date rows', !!q('#pp-depts .dstart[data-dept="install"]'));
  const ds=fld('install','.dstart'); ds.value='2026-09-12'; change(ds);        /* a Saturday */
  setTimeout(()=>{
    const i=T('i1');
    ok('R2: a Saturday Installation start is kept as typed', i&&i.startDate==='2026-09-12', i&&i.startDate);
    ok('R1: editing the start left the end alone', i&&i.endDate==='2026-09-15', i&&i.endDate);
    ok('the day count is calendar days for on-site work (Sep 12–15 = 4)', fld('install','.ddays').value==='4', fld('install','.ddays').value);
    ok('no note when nothing moved', note('install').classList.contains('hidden')&&note('install').textContent==='');
    ok('the saved request carries the Saturday date', win.__spCalls.some(c=>c.method==='PATCH'&&c.url.indexOf('ShopTimeline_Tasks/')>=0&&c.body&&c.body.startDate==='2026-09-12'));
    const de=fld('install','.dend'); de.value='2026-09-10'; change(de);        /* before the start */
    setTimeout(()=>{
      const i2=T('i1');
      ok('R3: an end typed before the start pulls the start to it, never start > end', i2&&i2.startDate==='2026-09-10'&&i2.endDate==='2026-09-10', span(i2));
      ok('R4: the note explains the move', /start cannot be after the end/.test(note('install').textContent), note('install').textContent);
      ok('the fields show where the dates landed', fld('install','.dstart').value==='2026-09-10'&&fld('install','.dend').value==='2026-09-10');
      stageA2();
    },400);
  },600);
}

function stageA2(){
  sec('saved project — shop departments still snap to a workday, but say why (R4)');
  const ds=fld('td','.dstart'); ds.value='2026-09-07'; change(ds);             /* Labor Day */
  setTimeout(()=>{
    const t=T('td1');
    ok('a shop start typed on Labor Day moves to the next workday', t&&t.startDate==='2026-09-08', t&&t.startDate);
    ok('the note names the holiday and the new date', /Labor Day/.test(note('td').textContent)&&/Sep 8/.test(note('td').textContent), note('td').textContent);
    ok('the end followed, because it was before the new start, and the note says so', t&&t.endDate==='2026-09-08'&&/end cannot be before/.test(note('td').textContent), span(t));
    const de=fld('td','.dend'); de.value='2026-09-13'; change(de);             /* a Sunday */
    setTimeout(()=>{
      const t2=T('td1');
      ok('a shop end typed on a Sunday moves BACK to the Friday before', t2&&t2.endDate==='2026-09-11', t2&&t2.endDate);
      ok('the note says it was a weekend', /weekend/.test(note('td').textContent)&&/Sep 11/.test(note('td').textContent), note('td').textContent);
      ok('the day count is workdays for shop work (Tue Sep 8 – Fri Sep 11 = 4)', fld('td','.ddays').value==='4', fld('td','.ddays').value);
      const de2=fld('td','.dend'); de2.value='2026-09-06'; change(de2);        /* Sunday before Labor Day; start is Tue Sep 8 */
      setTimeout(()=>{
        const t3=T('td1');
        ok('R3: when no workday fits before the start, the end goes forward instead', t3&&t3.startDate==='2026-09-08'&&t3.endDate==='2026-09-08', span(t3));
        stageA3();
      },400);
    },400);
  },400);
}

function stageA3(){
  sec('saved project — the days field and the phase panel follow the same rule');
  const dd=fld('install','.ddays'); dd.value='3'; change(dd);
  setTimeout(()=>{
    const i=T('i1');
    ok('3 Installation days from Thu Sep 10 end on Sat Sep 12 (calendar days)', i&&i.endDate==='2026-09-12', i&&i.endDate);
    E("ppSelect('i1')");
    setTimeout(()=>{
      const st=q('#pp-insp [data-f="startDate"]');
      ok('the phase panel opened on Installation', !!st&&st.value==='2026-09-10', st&&st.value);
      st.value='2026-09-13'; change(st);                                        /* a Sunday */
      setTimeout(()=>{
        const i2=T('i1');
        ok('R2: a Sunday Installation start typed in the panel is kept', i2&&i2.startDate==='2026-09-13', i2&&i2.startDate);
        ok('R3: the end followed (it was Sep 12, before the new start)', i2&&i2.endDate==='2026-09-13', i2&&i2.endDate);
        ok('the panel note only says what moved, not that Sunday is off', /end cannot be before/.test(panelNote())&&!/weekend/.test(panelNote()), panelNote());
        E("ppSelect('td1')");
        setTimeout(()=>{
          const st2=q('#pp-insp [data-f="startDate"]');
          st2.value='2026-12-25'; change(st2);                                  /* Christmas, a Friday */
          setTimeout(()=>{
            const t=T('td1');
            ok('a shop start typed on Christmas in the panel moves to Mon Dec 28', t&&t.startDate==='2026-12-28', t&&t.startDate);
            ok('the panel shows the note', /Christmas/.test(panelNote())&&/Dec 28/.test(panelNote()), panelNote());
            stageB();
          },400);
        },300);
      },400);
    },300);
  },400);
}

function stageB(){
  sec('New Project draft — the report\'s exact case (R5): Setup Jan 2 2027, Installation Jan 1 → Jan 2');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const dl=q('#pp-deadline'); ok('the draft page opened', !!dl);
    dl.value='2027-01-02'; change(dl);
    setTimeout(()=>{
      const ck=q('#pp-depts input[data-dept="install"]');
      if(ck&&!ck.checked){ck.checked=true;change(ck);}
      setTimeout(()=>{
        const ds=fld('install','.dstart'); ds.value='2027-01-01'; change(ds);  /* New Year's Day, a Friday */
        setTimeout(()=>{
          const de=fld('install','.dend'); de.value='2027-01-02'; change(de);  /* a Saturday */
          setTimeout(()=>{
            const bar=draftBar('install');
            ok('R5/R2: Installation reads Jan 1 → Jan 2, exactly as typed', bar&&bar.startDate==='2027-01-01'&&bar.endDate==='2027-01-02', span(bar));
            ok('R1: picking the end date left the start alone', fld('install','.dstart').value==='2027-01-01', fld('install','.dstart').value);
            ok('the Setup install date is untouched', q('#pp-deadline').value==='2027-01-02');
            ok('two calendar days', fld('install','.ddays').value==='2'&&bar&&bar.estimatedDays===2, fld('install','.ddays').value);
            ok('no note: nothing was moved', note('install').classList.contains('hidden'));
            stageB2();
          },400);
        },400);
      },300);
    },300);
  },600);
}

function stageB2(){
  sec('New Project draft — shop departments still snap, with the note');
  const ds=fld('td','.dstart'); ds.value='2026-12-25'; change(ds);             /* Christmas */
  setTimeout(()=>{
    const bar=draftBar('td');
    ok('a shop start typed on Christmas moves to Mon Dec 28', bar&&bar.startDate==='2026-12-28', bar&&bar.startDate);
    ok('the note under the row says why', /Christmas/.test(note('td').textContent)&&/Dec 28/.test(note('td').textContent), note('td').textContent);
    ok('R3: the start is not after the end', bar&&bar.startDate<=bar.endDate, span(bar));
    /* the draft's phase panel goes through the same rule and shows the same note */
    E("ppSelect(NPV_TASKS.find(t=>t.department==='install').id)");
    setTimeout(()=>{
      const st=q('#pp-insp [data-f="startDate"]');
      ok('the draft phase panel opened on Installation', !!st, st&&st.value);
      if(st){st.value='2027-01-01'; change(st);}                              /* New Year's Day: kept for on-site work */
      setTimeout(()=>{
        const ib=draftBar('install');
        ok('R2: a holiday Installation start typed in the draft panel is kept', ib&&ib.startDate==='2027-01-01', ib&&ib.startDate);
        E("ppSelect(NPV_TASKS.find(t=>t.department==='td').id)");
        setTimeout(()=>{
          const st2=q('#pp-insp [data-f="startDate"]');
          if(st2){st2.value='2027-01-01'; change(st2);}                        /* a shop start on the holiday snaps and explains */
          setTimeout(()=>{
            const tb=draftBar('td');
            ok('a shop start typed on the holiday in the draft panel moves to Mon Jan 4', tb&&tb.startDate==='2027-01-04', tb&&tb.startDate);
            ok('the draft panel shows the note', /New Year/.test(panelNote())&&/Jan 4/.test(panelNote()), panelNote());
            done();
          },400);
        },300);
      },400);
    },300);
  },400);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
