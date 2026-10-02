/* v1.32.0 — tracker #16: separate work periods ("ranges") in every department.
   R1 a department holds several independent date ranges on one project; the Project Schedule
   row lists every range with its own dates and day count; + adds one after the last, at the
   department's day count · R2 the Gantt draws each range as its own bar on the department's
   row, gaps empty · R3 ranges are independent — never clamped to the primary's window, never
   carried by Link · R4 + on the row and right-click → "Add another range here"; × removes an
   extra range · R5 the calendar draws each range as its own band · plan 6 totals count every
   range · D1 the flag `range` is written only when set (tristate) · D4 a new range starts the
   workday after the department's last range.
   Both pages: a saved project and the New Project draft. Fixed 2026 dates (Aug 3 is a Monday).
   Run: node tests/test-v1320.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function npvCreateRange')<0){
  console.log('  SKIP  test-v1320: pre-v1.32.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:'2026-09-15',status:'in-fabrication',
  projectManager:'Sam',drafter:'Peter',leadFab:'Nick',fabricators:'',activeDepartments:JSON.stringify(['pm','td','finish','install']),createdAt:'2026-07-01',sortIndex:0}];
const T=(id,dept,who,s,e,d,extra)=>Object.assign({appId:id,projectId:'p1',department:dept,assignee:who,startDate:s,endDate:e,estimatedDays:d,ticketNodes:'[]',notes:'',pinned:false,label:''},extra||{});
const tasks=[T('t0','pm','Sam','2026-08-03','2026-09-15',30),T('td1','td','Peter','2026-08-03','2026-08-07',5),
  T('f1','finish','Nick','2026-08-10','2026-08-14',5),T('i1','install','[]','2026-09-14','2026-09-15',2)];
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''},
  {appId:'s2',Title:'Peter',email:'',depts:JSON.stringify(['td']),ooo:'[]',role:''},
  {appId:'s3',Title:'Nick',email:'',depts:JSON.stringify(['finish']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const mouse=(el,t,x,y,extra)=>el.dispatchEvent(new win.MouseEvent(t,Object.assign({bubbles:true,cancelable:true,clientX:x,clientY:y,button:0},extra||{})));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const drag=(el,px)=>{mouse(el,'mousedown',100,10);dmouse('mousemove',100+px,10);dmouse('mouseup',100+px,10);};
const fin=()=>JSON.parse(E("JSON.stringify(ST.tasks.filter(t=>t.department==='finish').sort((a,b)=>a.startDate.localeCompare(b.startDate)))"));
const finRow=()=>qa('#npv-body > .npv-row:not(.extra)').find(r=>r.querySelector('.npv-gut[data-dept="finish"]'));
const barsOf=row=>row?[...row.querySelectorAll('.npv-bar')].map(b=>({el:b,left:parseFloat(b.style.left),width:parseFloat(b.style.width),i:+b.dataset.i})).sort((a,b)=>a.left-b.left):[];
const idr=d=>q('#pp-depts input[data-dept="'+d+'"]').closest('.idr');
const lines=d=>[...idr(d).querySelectorAll('.ddates')];
const taskPosts=()=>win.__spCalls.filter(c=>c.method==='POST'&&/ShopTimeline_Tasks(?!2)/.test(c.url));
const taskPatches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&/ShopTimeline_Tasks(?!2)/.test(c.url));
const gapsEmpty=bs=>bs.every((b,k)=>k===0||b.left>bs[k-1].left+bs[k-1].width);
const rowIndexOf=row=>qa('#npv-body > .npv-row:not(.extra)').indexOf(row);
const dayX=iso=>E("NPV_GUT+diffDays(NPV_GEO.lo,parseDate('"+iso+"'))*NPV_GEO.dw+1");
const rowY=row=>E("(NPV_TOP+"+rowIndexOf(row)+")*NPV_ROWH+5");

setTimeout(()=>{E("NPV_OPEN=new Set();LINK_SUBS=true;location.hash='#/project/p1';applyRoute()");setTimeout(saved1,900);},1300);

function saved1(){
  sec('Saved project — R1/R4: + beside the department adds a range after the last one, at the row\'s day count');
  const plus=idr('finish').querySelector('.radd');
  ok('R4: Painting has a + button', !!plus&&plus.dataset.dept==='finish');
  ok('the PM row has none', !idr('pm').querySelector('.radd'));
  const n0=taskPosts().length;
  click(plus);click(idr('finish').querySelector('.radd')); /* the list repaints after each add — re-query the + */
  setTimeout(()=>{
    const f=fin();
    ok('R1: Painting now has three rows', f.length===3, f.length);
    ok('the two new rows are ranges with no label', f.slice(1).every(t=>t.range===true&&t.label===''), JSON.stringify(f.map(t=>[t.range,t.label])));
    ok('D4: the second starts the workday after the first ends (Aug 14 → Mon Aug 17), D3: five days', f[1].startDate==='2026-08-17'&&f[1].endDate==='2026-08-21'&&f[1].estimatedDays===5, f[1].startDate+'–'+f[1].endDate+' '+f[1].estimatedDays);
    ok('D4: the third follows the second (Mon Aug 24 – Fri Aug 28)', f[2].startDate==='2026-08-24'&&f[2].endDate==='2026-08-28', f[2].startDate+'–'+f[2].endDate);
    const posts=taskPosts().slice(n0);
    ok('D1: both POSTs carry range:true', posts.length===2&&posts.every(c=>c.body&&c.body.fields&&c.body.fields.range===true), posts.length+' '+JSON.stringify(posts.map(c=>c.body&&c.body.fields&&c.body.fields.range)));
    ok('D1: no other task write carries a range key (tristate)', win.__spCalls.filter(c=>/ShopTimeline_Tasks(?!2)/.test(c.url)&&(c.method==='PATCH'||c.method==='POST')).every(c=>{const b=c.method==='POST'?c.body.fields:c.body;return !b||b.range===true||!('range' in b);}));
    ok('the primary kept its dates', f[0].startDate==='2026-08-10'&&f[0].endDate==='2026-08-14'&&!f[0].range);

    sec('R2 — one Painting row, three bars, empty gaps, no subtask chrome');
    const row=finRow(),bs=barsOf(row);
    ok('exactly one Painting row', qa('#npv-body > .npv-row:not(.extra) .npv-gut[data-dept="finish"]').length===1);
    ok('R2: it carries three bars', bs.length===3, bs.length);
    ok('R2: the gaps between them are empty', gapsEmpty(bs));
    ok('none is drawn as a subtask (no kid shade, no envelope, no triangle)', bs.every(b=>!b.el.classList.contains('kid'))&&!row.querySelector('.npv-env')&&!row.querySelector('.npv-tri'));
    ok('the chart row is a leaf, not a parent', E("NPV_PLAN.find(r=>r.dept==='finish').kind")==='leaf');

    sec('R1 — the Project Schedule row lists every range');
    const ls=lines('finish');
    ok('three date lines: the primary first, then two ranges', ls.length===3&&!ls[0].classList.contains('rng')&&ls[1].classList.contains('rng')&&ls[2].classList.contains('rng'), ls.map(l=>l.className).join('|'));
    ok('the first .dstart[data-dept="finish"] is still the primary\'s (test57 / test-v1252 contract)', q('#pp-depts .dstart[data-dept="finish"]').value==='2026-08-10');
    ok('each range line has its own day count and a ×, keyed by its row', ls.slice(1).every((l,k)=>l.querySelector('.rdays')&&l.querySelector('.rx')&&l.dataset.key===f[k+1].id&&l.querySelector('.rdays').value==='5'));
    ok('the row\'s own day count is not a range\'s (.rdays is not .ddays)', idr('finish').querySelectorAll('.ddays').length===1&&!ls[1].querySelector('.ddays'));
    saved2(f);
  },700);
}

function saved2(f){
  sec('R1 — editing a range\'s line moves that range only');
  const mid=lines('finish')[1];
  const nP=taskPatches().length;
  const ds=mid.querySelector('.dstart');ds.value='2026-08-18';change(ds);
  setTimeout(()=>{
    const g=fin();
    ok('the middle range starts Aug 18', g[1].startDate==='2026-08-18', g[1].startDate);
    ok('the primary is untouched', g[0].startDate==='2026-08-10'&&g[0].endDate==='2026-08-14');
    const p=taskPatches().slice(nP);
    ok('one PATCH, to that range\'s row', p.length===1&&p[0].body.appId===f[1].id&&p[0].body.startDate==='2026-08-18', p.length+' '+JSON.stringify(p.map(c=>[c.body.appId,c.body.startDate])));
    const rd=lines('finish')[1].querySelector('.rdays');rd.value='3';change(rd);
    setTimeout(()=>{
      const h=fin();
      ok('its day count moves its own end (Aug 18 + 3 workdays → Aug 20)', h[1].endDate==='2026-08-20'&&h[1].estimatedDays===3, h[1].endDate+' '+h[1].estimatedDays);
      ok('the third range did not move', h[2].startDate==='2026-08-24'&&h[2].endDate==='2026-08-28');
      /* a typed Saturday is snapped and explained under THAT line */
      const ds2=lines('finish')[1].querySelector('.dstart');ds2.value='2026-08-22';change(ds2);
      setTimeout(()=>{
        const notes=[...idr('finish').querySelectorAll('.dnote')];
        ok('the note appears under the edited range\'s line, not the primary\'s', notes.length===3&&notes[0].classList.contains('hidden')&&!notes[1].classList.contains('hidden')&&notes[1].textContent.length>0, notes.map(n=>n.classList.contains('hidden')?'-':n.textContent.slice(0,30)).join('|'));
        saved3();
      },400);
    },400);
  },400);
}

function saved3(){
  sec('R3 — ranges are independent: not clamped, not carried by Link; a nested subtask still clamps');
  const f=fin();
  const row=finRow(),bs=barsOf(row);
  const midBar=bs.find(b=>E("NPV_TASKS["+b.i+"].id")===f[1].id);
  const before=f[1].startDate;
  drag(midBar.el,-E('NPV_GEO.dw')*12);
  setTimeout(()=>{
    const g=fin();const moved=g.find(t=>t.id===f[1].id);
    ok('R3: a range drags freely past the primary\'s window (no clamp)', moved.startDate<before&&moved.startDate<g[0].endDate, before+' → '+moved.startDate);
    /* a nested subtask (born inside the primary) still clamps — regression guard from test56 */
    E("npvCreateSubtask('finish','2026-08-11')");
    setTimeout(()=>{
      const sub=fin().find(t=>t.label&&t.label.indexOf('Subtask')===0);
      ok('a subtask is still a subtask (parent row, envelope, triangle)', !!sub&&!!finRow().querySelector('.npv-env')&&!!finRow().querySelector('.npv-tri'));
      ok('the subtask count on the row excludes the ranges', finRow().querySelector('.npv-n')&&finRow().querySelector('.npv-n').textContent==='1', finRow().querySelector('.npv-n')&&finRow().querySelector('.npv-n').textContent);
      E("NPV_OPEN.add('finish');npvRebuild()");
      const subRow=qa('#npv-body > .npv-row.child').find(r=>r.querySelector('.npv-gut[data-dept="finish"]'));
      const subBar=subRow&&subRow.querySelector('.npv-bar');
      if(subBar){drag(subBar,E('NPV_GEO.dw')*20);}
      setTimeout(()=>{
        const h=fin();const s2=h.find(t=>t.id===sub.id),prim=h.find(t=>t.id==='f1');
        ok('the nested subtask stays inside the primary\'s window (clamp intact)', !!s2&&s2.endDate<=prim.endDate, s2&&(s2.startDate+'–'+s2.endDate+' vs '+prim.endDate));
        /* Link: dragging the primary moves its subtask, never a range */
        const r3=h[h.length-1]; const r3s=r3.startDate;
        const primBar=barsOf(finRow()).find(b=>E("NPV_TASKS["+b.i+"].id")==='f1');
        drag(primBar.el,E('NPV_GEO.dw')*2);
        setTimeout(()=>{
          const k=fin();const p2=k.find(t=>t.id==='f1'),r3b=k.find(t=>t.id===r3.id),s3=k.find(t=>t.id===sub.id);
          ok('Link moves the primary and its subtask', p2.startDate>prim.startDate&&s3.startDate>s2.startDate, prim.startDate+'→'+p2.startDate+' sub '+s2.startDate+'→'+s3.startDate);
          ok('R3: the range stayed put', r3b.startDate===r3s, r3s+' → '+r3b.startDate);
          E("ppDeletePhase('"+sub.id+"')");
          setTimeout(saved4,400);
        },400);
      },400);
    },500);
  },400);
}

function saved4(){
  sec('Plan 2 — × removes that range; plan 6 — totals count every range');
  const f=fin();
  const nBefore=f.length;
  const midLine=lines('finish').find(l=>l.classList.contains('rng'));
  const midId=midLine.dataset.key;
  click(midLine.querySelector('.rx'));
  setTimeout(()=>{
    const g=fin();
    ok('× removed exactly that range', g.length===nBefore-1&&!g.some(t=>t.id===midId), g.length+' '+g.map(t=>t.id).join());
    ok('the list repainted with one range line', lines('finish').length===2&&lines('finish').filter(l=>l.classList.contains('rng')).length===1, lines('finish').length);
    const meta=(q('#pp-meta')||{textContent:''}).textContent;
    ok('plan 6: Phases counts every non-PM row, ranges included', meta.indexOf('Phases')>=0&&meta.indexOf(String(E("ST.tasks.filter(t=>t.projectId==='p1'&&t.department!=='pm').length")))>=0, meta.replace(/\s+/g,' ').slice(0,160));
    ok('plan 6: Shop starts is the earliest row', /Shop starts\s*Aug 3/.test(meta.replace(/\s+/g,' ')), meta.replace(/\s+/g,' ').slice(0,160));
    saved5();
  },500);
}

function saved5(){
  sec('R4 — right-click on the department\'s row offers "Add another range here"');
  const host=q('#npv-body');const row=finRow();
  const n0=fin().length;
  mouse(host,'contextmenu',dayX('2026-09-02'),rowY(row),{button:2});
  const btn=q('#npv-menu button[data-act="rng"]');
  ok('the row menu offers the range', !!btn&&/Add another range/.test(btn.textContent), btn&&btn.textContent);
  click(btn);
  setTimeout(()=>{
    const f=fin();
    ok('R4: a range starts on the clicked day (Wed Sep 2)', f.length===n0+1&&f.some(t=>t.range&&t.startDate==='2026-09-02'), f.map(t=>t.startDate).join());
    /* a day inside the primary lands after it instead */
    mouse(host,'contextmenu',dayX('2026-08-13'),rowY(finRow()),{button:2});
    click(q('#npv-menu button[data-act="rng"]'));
    setTimeout(()=>{
      const g=fin();const prim=g.find(t=>t.id==='f1');
      const after=E("(function(){const d=fmtDate(addDays(parseDate('"+prim.endDate+"'),1));return wdSnap(d);})()");
      ok('a day inside the primary lands the workday after it ends', g.length===n0+2&&g.some(t=>t.range&&t.startDate===after), after+' | '+g.map(t=>t.startDate).join());
      /* the gutter menu appends after the last */
      const gut=finRow().querySelector('.npv-gut');
      mouse(gut,'contextmenu',10,rowY(finRow()),{button:2});
      const gb=[...doc.querySelectorAll('.npv-menu button[data-act="rng"]')].pop();
      ok('the gutter menu offers it too', !!gb);
      click(gb);
      setTimeout(()=>{
        const h=fin();const last=h[h.length-1];
        const expect=E("(function(){const d=fmtDate(addDays(parseDate('"+g[g.length-1].endDate+"'),1));return wdSnap(d);})()");
        ok('and appends after the last range', h.length===n0+3&&last.startDate===expect, expect+' | '+last.startDate);
        saved6();
      },400);
    },400);
  },400);
}

function saved6(){
  sec('R5 — the calendar draws each range as its own band; undo removes the last +');
  E("NPV_CAL_OPEN.delete('finish');ppSelect(null,true);NPV_MODE='calendar';npvRender()"); /* the earlier subtask opened the department to level 2 */
  const bands=qa('#npv-body .cal-band.ph').filter(b=>(b.textContent||'').trim()==='Painting'||b.title&&b.title.indexOf('Painting')>=0);
  const nFin=fin().length;
  const kid=E("kidShade(DEPT_COLORS.finish)");
  ok('R5: at least one band per Painting row', bands.length>=nFin, bands.length+' bands for '+nFin+' rows');
  ok('R5: none is drawn in the subtask shade', bands.every(b=>(b.style.background||b.style.backgroundColor||'').toLowerCase().indexOf(String(kid).toLowerCase())<0));
  ok('R5: all slim at level 0', bands.every(b=>b.classList.contains('slim')));
  E("NPV_MODE='gantt';npvRender()");
  const before=fin().length;
  click(idr('finish').querySelector('.radd'));
  setTimeout(()=>{
    ok('a + adds one more', fin().length===before+1);
    E('undo()');
    setTimeout(()=>{
      ok('undo removes it again', fin().length===before, fin().length);
      E("location.hash='#/project/new';applyRoute()");
      setTimeout(draft1,900);
    },400);
  },400);
}

function draft1(){
  sec('New Project draft — the same + on the Project Schedule row, keyed placements, three bars');
  const dl=q('#pp-deadline');dl.value='2026-11-13';change(dl);
  const ck=q('#pp-depts input[data-dept="finish"]');if(!ck.checked){ck.checked=true;change(ck);}
  setTimeout(()=>{
    const plus=idr('finish').querySelector('.radd');
    ok('the draft row has a +', !!plus);
    click(plus);click(idr('finish').querySelector('.radd'));
    setTimeout(()=>{
      const all=JSON.parse(E("JSON.stringify(NPV_ALL.filter(t=>t.department==='finish'))"));
      ok('R1 draft: Painting has three bars', all.length===3, all.length);
      ok('D2: two range lines, each keyed by its line id', E("NPV_LINES.filter(l=>l.range).length")===2&&E("Object.keys(NPV_MANUAL).filter(k=>k.indexOf('finish::#')===0).length")===2, E("JSON.stringify(Object.keys(NPV_MANUAL))"));
      ok('D2: the two ranges have distinct dates', new Set(all.filter(t=>t.range).map(t=>t.startDate)).size===2, all.map(t=>t.startDate).join());
      const row=finRow(),bs=barsOf(row);
      ok('R2 draft: three bars on one row, gaps empty', bs.length===3&&gapsEmpty(bs)&&!row.querySelector('.npv-env'), bs.length);
      ok('R1 draft: three date lines', lines('finish').length===3);
      /* editing one range's line moves only it */
      const l2=lines('finish')[2];const ds=l2.querySelector('.dstart');const before=all.map(t=>t.startDate);
      ds.value='2026-11-02';change(ds);
      setTimeout(()=>{
        const after=JSON.parse(E("JSON.stringify(NPV_ALL.filter(t=>t.department==='finish').map(t=>t.startDate))"));
        ok('a range\'s typed start moves that range only', after.filter((d,k)=>d!==before[k]).length===1, before.join()+' → '+after.join());
        /* ⌘Z after a + removes the last range and its placement */
        click(idr('finish').querySelector('.radd'));
        const n3=E("NPV_LINES.filter(l=>l.range).length");
        E('appUndo()');
        setTimeout(()=>{
          ok('undo (⌘Z) after a + removes that range and its placement', E("NPV_LINES.filter(l=>l.range).length")===n3-1&&E("Object.keys(NPV_MANUAL).filter(k=>k.indexOf('finish::#')===0).length")===2);
          /* × on the draft removes only that line */
          const midLine=lines('finish').filter(l=>l.classList.contains('rng'))[0];
          click(midLine.querySelector('.rx'));
          setTimeout(()=>{
            ok('× on a draft range removes only that line', E("NPV_ALL.filter(t=>t.department==='finish').length")===2&&E("NPV_LINES.filter(l=>l.range).length")===1);
            E("NPV_MODE='calendar';npvRender()");
            const bands=qa('#npv-body .cal-band.ph').filter(b=>(b.textContent||'').trim()==='Painting');
            ok('R5 draft: a band per Painting bar, none in the subtask shade', bands.length>=2&&bands.every(b=>!b.classList.contains('kid')));
            E("NPV_MODE='gantt';npvRender()");
            draft2();
          },400);
        },400);
      },400);
    },500);
  },500);
}

function draft2(){
  sec('Save — the ranges arrive in ST with the flag, dates as previewed');
  const prev=JSON.parse(E("JSON.stringify(NPV_ALL.filter(t=>t.department==='finish').map(t=>[t.startDate,t.endDate,!!t.range]))"));
  q('#pp-name').value='Soho Holiday';change(q('#pp-name'));
  const pm=qa('#pp-r-pm input').find(i=>i.value==='Sam');if(pm){pm.checked=true;change(pm);}
  const n0=taskPosts().length;
  q('#pp-save').click();
  setTimeout(()=>{
    const rows=JSON.parse(E("JSON.stringify(ST.tasks.filter(t=>t.department==='finish'&&t.projectId===(ST.projects.find(p=>p.name==='Soho Holiday')||{}).id).sort((a,b)=>a.startDate.localeCompare(b.startDate)))"));
    ok('two Painting rows saved, one of them a range', rows.length===2&&rows.filter(t=>t.range).length===1, JSON.stringify(rows.map(t=>[t.startDate,t.range])));
    ok('dates exactly as previewed', JSON.stringify(rows.map(t=>[t.startDate,t.endDate,!!t.range]).sort())===JSON.stringify(prev.sort()), JSON.stringify(rows.map(t=>[t.startDate,t.endDate]))+' vs '+JSON.stringify(prev));
    const posts=taskPosts().slice(n0).filter(c=>c.body.fields.department==='finish');
    ok('D1: the range row POSTs range:true and the primary carries no range key', posts.length===2&&posts.filter(c=>c.body.fields.range===true).length===1&&posts.filter(c=>!('range' in c.body.fields)).length===1, JSON.stringify(posts.map(c=>c.body.fields.range)));
    done();
  },900);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
