/* v1.32.0 — tracker #16: separate work periods ("ranges") in every department.
   R1 a department holds several independent date ranges on one project; the Project Schedule
   row lists every range with its own dates and day count; + adds one after the last, at the
   department's day count · R2 the Gantt draws each range as its own bar on the department's
   row, gaps empty · R3 ranges are independent — never clamped to the primary's window, never
   carried by Link · R4 + on the row and right-click → "Add another range here"; × removes an
   extra range · R5 the calendar draws each range as its own band · plan 6 totals count every
   range · D1 the flag `range` is written only when set (tristate, both directions) · D4 a new
   range starts the workday after the department's last range and hops past every range a
   right-click day lands in · the primary is the first bar that is NOT a range, so a range that
   sorts first never takes the row's day count, a subtask's nesting or the draft's selection.
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
const nice=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'});};
const rgb=h=>{const n=parseInt(String(h).replace('#',''),16);return 'rgb('+(n>>16&255)+', '+(n>>8&255)+', '+(n&255)+')';}; /* jsdom reports inline colours as rgb() */
const bandCol=b=>(b.style.backgroundColor||'').replace(/\s+/g,' ').trim();
const fin=()=>JSON.parse(E("JSON.stringify(ST.tasks.filter(t=>t.department==='finish').sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.id.localeCompare(b.id)))"));
const finRow=()=>qa('#npv-body > .npv-row:not(.extra)').find(r=>r.querySelector('.npv-gut[data-dept="finish"]'));
const barsOf=row=>row?[...row.querySelectorAll('.npv-bar')].map(b=>({el:b,left:parseFloat(b.style.left),width:parseFloat(b.style.width),i:+b.dataset.i})).sort((a,b)=>a.left-b.left):[];
const barOf=id=>barsOf(finRow()).find(b=>E("NPV_TASKS["+b.i+"].id")===id);
const idr=d=>q('#pp-depts input[data-dept="'+d+'"]').closest('.idr');
const lines=d=>[...idr(d).querySelectorAll('.ddates')];
const lineOf=id=>lines('finish').find(l=>l.dataset.key===id);
const taskPosts=()=>win.__spCalls.filter(c=>c.method==='POST'&&/ShopTimeline_Tasks(?!2)/.test(c.url));
const taskPatches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&/ShopTimeline_Tasks(?!2)/.test(c.url));
const gapsEmpty=bs=>bs.every((b,k)=>k===0||b.left>bs[k-1].left+bs[k-1].width);
const rowIndexOf=row=>qa('#npv-body > .npv-row:not(.extra)').indexOf(row);
const dayX=iso=>E("NPV_GUT+diffDays(NPV_GEO.lo,parseDate('"+iso+"'))*NPV_GEO.dw+1");
const rowY=row=>E("(NPV_TOP+"+rowIndexOf(row)+")*NPV_ROWH+5");
const metaCell=k=>{const m=qa('#pp-meta .m').find(x=>x.querySelector('.k')&&x.querySelector('.k').textContent===k);return m?m.querySelector('.v').textContent:'(none)';};
const rightClickRange=(iso)=>{mouse(q('#npv-body'),'contextmenu',dayX(iso),rowY(finRow()),{button:2});const b=q('#npv-menu button[data-act="rng"]');click(b);return !!b;};
const finBands=()=>qa('#npv-body .cal-band.ph[data-i]').filter(b=>E("(NPV_TASKS["+b.dataset.i+"]||{}).department")==='finish');

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
    ok('D1 (read side): a loaded non-range row carries no range key at all, a range row carries true', !('range' in f[0])&&f[1].range===true&&E("!('range' in ST.tasks.find(t=>t.id==='td1'))"));
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

    sec('D4 — a right-click inside the primary hops past every back-to-back range');
    const n4=f.length;
    ok('the row menu offers the range', rightClickRange('2026-08-12'));
    setTimeout(()=>{
      const g=fin();
      ok('it lands after the LAST back-to-back range (Mon Aug 31), never on top of one', g.length===n4+1&&g.some(t=>t.range&&t.startDate==='2026-08-31')&&new Set(g.map(t=>t.startDate)).size===g.length, g.map(t=>t.startDate).join());
      saved2(g);
    },500);
  },700);
}

function saved2(f){
  sec('R1 — editing a range\'s line moves that range only');
  const mid=lineOf(f[1].id);
  const nP=taskPatches().length;
  const ds=mid.querySelector('.dstart');ds.value='2026-08-18';change(ds);
  setTimeout(()=>{
    const g=fin();const r=g.find(t=>t.id===f[1].id);
    ok('the middle range starts Aug 18', r.startDate==='2026-08-18', r.startDate);
    ok('the primary is untouched', g[0].startDate==='2026-08-10'&&g[0].endDate==='2026-08-14');
    const p=taskPatches().slice(nP);
    ok('one PATCH, to that range\'s row, carrying range:true', p.length===1&&p[0].body.appId===f[1].id&&p[0].body.startDate==='2026-08-18'&&p[0].body.range===true, p.length+' '+JSON.stringify(p.map(c=>[c.body.appId,c.body.startDate,c.body.range])));
    const rd=lineOf(f[1].id).querySelector('.rdays');rd.value='3';change(rd);
    setTimeout(()=>{
      const h=fin();const r2=h.find(t=>t.id===f[1].id),r3=h.find(t=>t.id===f[2].id);
      ok('its day count moves its own end (Aug 18 + 3 workdays → Aug 20)', r2.endDate==='2026-08-20'&&r2.estimatedDays===3, r2.endDate+' '+r2.estimatedDays);
      ok('the third range did not move', r3.startDate==='2026-08-24'&&r3.endDate==='2026-08-28');
      /* a typed Saturday is snapped and explained under THAT line */
      const ds2=lineOf(f[1].id).querySelector('.dstart');ds2.value='2026-08-22';change(ds2);
      setTimeout(()=>{
        const notes=[...idr('finish').querySelectorAll('.dnote')],ln=lines('finish'),k=ln.findIndex(l=>l.dataset.key===f[1].id);
        ok('the note appears under the edited range\'s line, not the primary\'s', notes.length===ln.length&&notes[0].classList.contains('hidden')&&k>0&&!notes[k].classList.contains('hidden')&&notes[k].textContent.length>0, notes.map(n=>n.classList.contains('hidden')?'-':n.textContent.slice(0,30)).join('|'));
        saved3(f);
      },400);
    },400);
  },400);
}

function saved3(f){
  sec('R3 — ranges are independent: a range inside the primary\'s window drags out of it; a nested subtask still clamps; Link never carries a range');
  const rid=f[1].id;
  const ds=lineOf(rid).querySelector('.dstart');ds.value='2026-08-11';change(ds);
  setTimeout(()=>{
    const de=lineOf(rid).querySelector('.dend');de.value='2026-08-12';change(de);
    setTimeout(()=>{
      const g0=fin();const r=g0.find(t=>t.id===rid),prim=g0.find(t=>t.id==='f1');
      ok('setup: the middle range now sits inside the primary\'s window (Aug 11–12 in Aug 10–14)', r.startDate>=prim.startDate&&r.endDate<=prim.endDate, r.startDate+'–'+r.endDate);
      drag(barOf(rid).el,E('NPV_GEO.dw')*10);
      setTimeout(()=>{
        const g=fin();const moved=g.find(t=>t.id===rid);
        ok('R3: dragged 10 days, it leaves the primary\'s window (a subtask there would be clamped to Aug 14)', moved.endDate>prim.endDate&&moved.startDate>r.startDate, moved.startDate+'–'+moved.endDate+' vs '+prim.endDate);
        /* a nested subtask (born inside the primary) still clamps — regression guard from test56 — and nests under the PRIMARY even though a range sorts earlier */
        E("npvCreateSubtask('finish','2026-08-11')");
        setTimeout(()=>{
          const sub=fin().find(t=>t.label&&t.label.indexOf('Subtask')===0);
          ok('a subtask born inside the primary is half its length and nested (not measured against a range)', !!sub&&sub.estimatedDays===3&&sub.endDate<=prim.endDate, sub&&(sub.startDate+'–'+sub.endDate+' '+sub.estimatedDays+'d'));
          ok('a subtask is still a subtask (parent row, envelope, triangle)', !!finRow().querySelector('.npv-env')&&!!finRow().querySelector('.npv-tri'));
          ok('the subtask count on the row excludes the ranges', finRow().querySelector('.npv-n')&&finRow().querySelector('.npv-n').textContent==='1', finRow().querySelector('.npv-n')&&finRow().querySelector('.npv-n').textContent);
          E("NPV_OPEN.add('finish');npvRebuild()");
          const subRow=qa('#npv-body > .npv-row.child').find(r2=>r2.querySelector('.npv-gut[data-dept="finish"]'));
          const subBar=subRow&&subRow.querySelector('.npv-bar');
          if(subBar)drag(subBar,E('NPV_GEO.dw')*20);
          setTimeout(()=>{
            const h=fin();const s2=h.find(t=>t.id===sub.id),p1=h.find(t=>t.id==='f1');
            ok('the nested subtask stays inside the primary\'s window (clamp intact)', !!s2&&s2.endDate<=p1.endDate, s2&&(s2.startDate+'–'+s2.endDate+' vs '+p1.endDate));
            const r4=h.find(t=>t.range&&t.startDate==='2026-08-31');const r4s=r4.startDate;
            const nP=taskPatches().length;
            drag(barOf('f1').el,E('NPV_GEO.dw')*2);
            setTimeout(()=>{
              const k=fin();const p2=k.find(t=>t.id==='f1'),r4b=k.find(t=>t.id===r4.id),s3=k.find(t=>t.id===sub.id);
              ok('Link moves the primary and its subtask', p2.startDate>p1.startDate&&s3.startDate>s2.startDate, p1.startDate+'→'+p2.startDate+' sub '+s2.startDate+'→'+s3.startDate);
              ok('R3: the range stayed put', r4b.startDate===r4s, r4s+' → '+r4b.startDate);
              const pf=taskPatches().slice(nP).filter(c=>c.body&&c.body.appId==='f1');
              ok('D1: the primary\'s PATCH carries no range key (tristate on the write side)', pf.length>=1&&pf.every(c=>!('range' in c.body)), JSON.stringify(pf.map(c=>Object.keys(c.body))));
              E("ppDeletePhase('"+sub.id+"')");
              setTimeout(saved4,400);
            },400);
          },400);
        },500);
      },400);
    },400);
  },400);
}

function saved4(){
  sec('Plan 2 — × removes that range');
  const f=fin();
  const nBefore=f.length;
  const midLine=lines('finish').find(l=>l.classList.contains('rng'));
  const midId=midLine.dataset.key;
  click(midLine.querySelector('.rx'));
  setTimeout(()=>{
    const g=fin();
    ok('× removed exactly that range', g.length===nBefore-1&&!g.some(t=>t.id===midId), g.length+' '+g.map(t=>t.id).join());
    ok('the list repainted, one line fewer', lines('finish').length===g.length&&lines('finish').filter(l=>l.classList.contains('rng')).length===g.length-1, lines('finish').length);
    saved5();
  },500);
}

function saved5(){
  sec('R4 — right-click on the department\'s row; the row\'s own day count stays the primary\'s');
  const n0=fin().length;
  ok('the row menu offers "Add another range here"', rightClickRange('2026-09-09'));
  setTimeout(()=>{
    const f=fin();
    ok('R4: a range starts on the clicked day (Wed Sep 9)', f.length===n0+1&&f.some(t=>t.range&&t.startDate==='2026-09-09'), f.map(t=>t.startDate).join());
    /* a day inside the primary lands after it (Aug 17 is free now that the middle range moved on) */
    const prim=f.find(t=>t.id==='f1');
    rightClickRange('2026-08-13');
    setTimeout(()=>{
      const g=fin();
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
        /* a range BEFORE the primary must not take over the row's day count */
        rightClickRange('2026-08-03');
        setTimeout(()=>{
          const i=fin();const early=i.find(t=>t.range&&t.startDate==='2026-08-03');
          ok('a range can be placed before the primary (Mon Aug 3)', !!early&&i[0].id===early.id, i.map(t=>t.startDate).join());
          const dd=idr('finish').querySelector('.ddays');dd.value='2';change(dd);
          setTimeout(()=>{
            const j=fin();const pr=j.find(t=>t.id==='f1'),er=j.find(t=>t.id===early.id);
            const want=E("fmtDate(deptEndAfter('finish',parseDate('"+pr.startDate+"'),2))");
            ok('the row\'s day count edits the PRIMARY (its end moves to 2 workdays), not the range that sorts first', pr.estimatedDays===2&&pr.endDate===want, pr.startDate+'–'+pr.endDate+' '+pr.estimatedDays+'d (want '+want+')');
            ok('the early range is untouched', er.startDate==='2026-08-03'&&er.estimatedDays===early.estimatedDays, er.startDate+' '+er.estimatedDays);
            ok('and the field shows the primary\'s count', idr('finish').querySelector('.ddays').value==='2', idr('finish').querySelector('.ddays').value);
            saved6();
          },500);
        },500);
      },400);
    },400);
  },400);
}

function saved6(){
  sec('Plan 6 — totals count every range; R5 — the calendar draws each range as its own band; undo removes the last +');
  const f=fin();const ends=JSON.parse(E("JSON.stringify(ST.tasks.filter(t=>t.projectId==='p1'&&t.department!=='pm').map(t=>t.endDate))"));
  const lastEnd=ends.slice().sort().pop();
  ok('plan 6: Work ends is the last range\'s end (later than the install)', lastEnd>'2026-09-15'&&f.some(t=>t.range&&t.endDate===lastEnd)&&metaCell('Work ends')===nice(lastEnd), metaCell('Work ends')+' vs '+nice(lastEnd));
  ok('plan 6: Phases counts every non-PM row, ranges included', metaCell('Phases')===String(f.length+2), metaCell('Phases')+' vs '+(f.length+2));
  ok('plan 6: Shop starts is the earliest row', metaCell('Shop starts')==='Aug 3', metaCell('Shop starts'));
  E("NPV_CAL_OPEN.delete('finish');ppSelect(null,true);NPV_MODE='calendar';npvRender()"); /* the earlier subtask opened the department to level 2 */
  const bands=finBands();
  const col=rgb(E("DEPT_COLORS.finish")),kid=rgb(E("kidShade(DEPT_COLORS.finish)"));
  ok('R5: at least one band per Painting row', bands.length>=f.length, bands.length+' bands for '+f.length+' rows');
  ok('R5: every band is in the department colour, none in the subtask shade', bands.length>0&&bands.every(b=>bandCol(b)===col&&bandCol(b)!==kid), [...new Set(bands.map(bandCol))].join('|')+' vs '+col);
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
            E("NPV_CAL_OPEN.delete('finish');ppSelect(null,true);NPV_MODE='calendar';npvRender()");
            const bands=finBands(),col=rgb(E("DEPT_COLORS.finish"));
            ok('R5 draft: a band per Painting bar, all in the department colour', bands.length>=2&&bands.every(b=>bandCol(b)===col), bands.length+' '+[...new Set(bands.map(bandCol))].join('|'));
            E("NPV_MODE='gantt';npvRender()");
            /* the selected primary stays selected when a range is added BEFORE it (the 'd:' fallback prefers a non-range bar) */
            const pid=E("npvPrimary('finish').id");
            E("ppSelect('d:finish',true)");
            E("npvCreateRange('finish',fmtDate(addDays(parseDate(npvPrimary('finish').startDate),-14)))");
            setTimeout(()=>{
              ok('a range placed before the selected primary leaves the primary selected', E("(function(){const s=ppSelected();return !!s&&!s.range&&s.department==='finish';})()"), E("JSON.stringify(ppSelected()&&{id:ppSelected().id,range:ppSelected().range})")+' (primary was '+pid+')');
              ok('and the primary still owns the row (npvPrimary is not the earlier range)', E("!npvPrimary('finish').range&&NPV_PLAN.find(r=>r.dept==='finish').t.range!==true"));
              E("ppSelect(null,true);ppInspector()"); /* back to the project sections (the selection swapped the dock to the phase pane) */
              draft2();
            },400);
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
    ok('three Painting rows saved, two of them ranges', rows.length===3&&rows.filter(t=>t.range).length===2, JSON.stringify(rows.map(t=>[t.startDate,t.range])));
    ok('dates exactly as previewed', JSON.stringify(rows.map(t=>[t.startDate,t.endDate,!!t.range]).sort())===JSON.stringify(prev.sort()), JSON.stringify(rows.map(t=>[t.startDate,t.endDate]))+' vs '+JSON.stringify(prev));
    const posts=taskPosts().slice(n0).filter(c=>c.body.fields.department==='finish');
    ok('D1: the range rows POST range:true and the primary carries no range key', posts.length===3&&posts.filter(c=>c.body.fields.range===true).length===2&&posts.filter(c=>!('range' in c.body.fields)).length===1, JSON.stringify(posts.map(c=>c.body.fields.range)));
    done();
  },900);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},45000);
