/* REV56: project-page subtask hierarchy (TODO §3 item 5 — the owner's notes).
   The synthetic summary bar is retired: a department's primary bar (first in display
   order) IS the parent row — full colour, drag, resize, select — and only the other
   bars nest under it, so the primary is never re-listed as its own subtask. Subtasks
   render in a lighter shade of the parent's hue, are born named and half the parent's
   window (never an exact copy), and a subtask nested inside its parent treats the
   parent's start/end as min/max while dragging or resizing. Subtasks outside the
   parent window (parallel subtasks, legacy layouts) stay free.
   Skips on builds that predate REV56 (the frozen REV50 reference).
   Run: node test56.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('npv-env')<0){
  console.log('  SKIP  build predates REV56 (summary-bar model — see test47)');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
/* td carries three parallel subtasks (no nesting); fab is a single primary bar the
   suite will add a nested subtask to; install is a leaf. */
const tasks=[
 {appId:'t0',projectId:'p1',department:'pm',assignee:'Stan',startDate:'2026-08-03',
  endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
 {appId:'td2',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-10',
  endDate:'2026-08-14',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Interior Windows'},
 {appId:'td3',projectId:'p1',department:'td',assignee:'Chris',startDate:'2026-08-17',
  endDate:'2026-08-19',estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:'VIP Room'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const rows=()=>qa('#npv-body > .npv-row');
const dates=id=>E("(function(){var t=ST.tasks.find(x=>x.id==='"+id+"');return t.startDate+'/'+t.endDate;})()");
const drag=(el,px)=>{mouse(el,'mousedown',100,10);dmouse('mousemove',100+px,10);dmouse('mouseup',100+px,10);};
/* jsdom may keep hex or normalize to rgb() — compare colours in one shape. */
const rgb=h=>{const n=parseInt(h.slice(1),16);return 'rgb('+((n>>16)&255)+', '+((n>>8)&255)+', '+(n&255)+')';};
const norm=s=>String(s||'').trim().toLowerCase();
const sameCol=(got,hex)=>norm(got)===norm(hex)||norm(got)===norm(rgb(hex));

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,700);
},1300);

function stage1(){
  sec('the parent row IS the primary bar — no synthetic summary');
  ok('the summary bar class is retired from the stylesheet', src.indexOf('.npv-bar.sum{')<0);
  ok('three drawn rows: one parent, two leaves', rows().length===3, rows().length+' rows');
  ok('technical design is a parent', E("NPV_PLAN.some(r=>r.kind==='parent'&&r.dept==='td')"));
  ok('the parent plan row carries the primary bar itself',
     E("(NPV_PLAN.find(r=>r.kind==='parent')||{}).t.id")==='td1');
  ok('no .npv-bar.sum is drawn', !q('.npv-bar.sum'));
  const pbar=q('.npv-row.parent .npv-bar');
  ok('the parent row draws a real bar with data-i', !!pbar&&pbar.hasAttribute('data-i'));
  ok('that bar is the primary (first in display order)',
     !!pbar&&E("NPV_TASKS["+(+pbar.dataset.i)+"].id")==='td1');
  ok('the primary bar keeps full department colour',
     sameCol(pbar.style.background,E("DEPT_COLORS['td']")), pbar.style.background);
  ok('it has resize handles like any bar', !!pbar.querySelector('.npv-hdl.r'));
  const env=q('.npv-row.parent .npv-env');
  ok('an envelope track shows the department extent', !!env);
  ok('the envelope spans min(start) to max(end)',
     (()=>{if(!env)return false;
       const lo=E("diffDays(NPV_GEO.lo,parseDate('2026-08-03'))*NPV_GEO.dw+NPV_GUT+NPV_PADL");
       return parseFloat(env.style.left)===lo;})(), env&&env.style.left);
  ok('the envelope is inert (clicks fall through to the canvas)',
     /\.npv-env\{[^}]*pointer-events:none/.test(src));
  ok('the count badge counts subtasks, not every bar',
     (q('.npv-row.parent .npv-n')||{}).textContent==='2');

  sec('expanding lists only the subtasks — the primary is not re-listed');
  E("NPV_OPEN.add('td');npvRender();");
  setTimeout(()=>{
    const kids=qa('.npv-row.child .npv-bar');
    ok('two child rows appear, not three', kids.length===2, kids.length+'');
    const names=kids.map(b=>b.textContent.trim());
    ok('the children are the subtasks only',
       names.join('|')==='Interior Windows|VIP Room', names.join('|'));
    ok('subtasks wear a lighter shade of the parent hue',
       kids.every(b=>sameCol(b.style.background,E("kidShade(DEPT_COLORS['td'])"))),
       kids[0]&&kids[0].style.background);
    ok('lightening keeps a readable label (labelColor picked for the shade)',
       kids.every(b=>b.style.color!==''));
    stage2();
  },250);
}

function stage2(){
  sec('dragging the parent bar carries its subtasks (Link on)');
  const before=['td1','td2','td3'].map(dates);
  const fabBefore=dates('f1');
  const dw=E('NPV_GEO.dw');
  drag(q('.npv-row.parent .npv-bar'),dw*4);
  setTimeout(()=>{
    const after=['td1','td2','td3'].map(dates);
    const shifts=['td1','td2','td3'].map((id,i)=>{
      const b=before[i].split('/')[0],a=after[i].split('/')[0];
      return (new Date(a)-new Date(b))/86400000;
    });
    ok('all three bars moved', before.every((b,i)=>b!==after[i]), after.join(' '));
    ok('all shifted by the same four days', shifts.every(s=>s===4), shifts.join(','));
    ok('a different department is untouched', dates('f1')===fabBefore);

    sec('with Link off the parent moves alone');
    E('LINK_SUBS=false;saveUI();npvRender();');
    setTimeout(()=>{
      const b1=dates('td1'),b2=dates('td2');
      drag(q('.npv-row.parent .npv-bar'),E('NPV_GEO.dw')*2);
      setTimeout(()=>{
        ok('the primary moved', dates('td1')!==b1, b1+' -> '+dates('td1'));
        ok('its subtasks did not', dates('td2')===b2);
        E('LINK_SUBS=true;saveUI();npvRender();');
        setTimeout(stage3,250);
      },300);
    },250);
  },300);
}

function stage3(){
  sec('resizing the parent changes only the parent');
  const b2=dates('td2'),b3=dates('td3');
  const before=dates('td1');
  const pbar=q('.npv-row.parent .npv-bar');
  const hdl=pbar.querySelector('.npv-hdl.r');
  const dw=E('NPV_GEO.dw');
  mouse(hdl,'mousedown',100,10);dmouse('mousemove',100+dw*2,10);dmouse('mouseup',100+dw*2,10);
  setTimeout(()=>{
    ok('the primary end date moved', dates('td1')!==before, before+' -> '+dates('td1'));
    ok('its start date did not', dates('td1').split('/')[0]===before.split('/')[0]);
    ok('subtask dates are independent of the parent resize',
       dates('td2')===b2&&dates('td3')===b3);
    const w=win.__spCalls.filter(c=>c.method==='PATCH'&&/ShopTimeline_Tasks\//.test(c.url));
    ok('the resize went to SharePoint', w.length>0, w.length+' PATCHes');
    stage4();
  },300);
}

function stage4(){
  sec('a new subtask is born distinct — named, nested, half the parent');
  const f=dates('f1').split('/');
  E("npvCreateSubtask('fab','"+f[0]+"')");
  setTimeout(()=>{
    const sub=E("JSON.stringify(ST.tasks.filter(t=>t.department==='fab'&&t.id!=='f1').map("+
      "t=>({id:t.id,label:t.label,startDate:t.startDate,endDate:t.endDate}))[0]||null)");
    const s=JSON.parse(sub);
    ok('a second fab row exists', !!s, sub);
    ok('it is named, not an unnamed copy', s&&s.label==='Subtask 2', s&&s.label);
    ok('it starts with its parent', s&&s.startDate===f[0], s&&s.startDate);
    ok('it nests inside the parent window, shorter than the parent',
       s&&s.endDate<f[1], s&&(s.endDate+' vs parent end '+f[1]));
    ok('fab became a parent row whose bar is still f1',
       E("(NPV_PLAN.find(r=>r.kind==='parent'&&r.dept==='fab')||{}).t.id")==='f1');
    stage5(s);
  },400);
}

function stage5(s){
  sec('a nested subtask treats the parent start/end as min/max');
  E("NPV_OPEN.add('fab');npvRender();ppSelect(null,true);");
  setTimeout(()=>{
    const pf=dates('f1').split('/');
    const kid=qa('.npv-row.child .npv-bar').find(b=>E("NPV_TASKS["+(+b.dataset.i)+"].id")===s.id);
    ok('the new subtask renders as a child bar', !!kid);
    const dw=E('NPV_GEO.dw');
    drag(kid,dw*20);   /* way past the parent's end */
    setTimeout(()=>{
      const now=dates(s.id).split('/');
      ok('a drag past the parent stops at the parent end', now[1]===pf[1], now[1]+' vs '+pf[1]);
      ok('the parent itself did not move', dates('f1')===pf.join('/'));
      E("NPV_OPEN.add('fab');npvRender();");
      setTimeout(()=>{
        const kid2=qa('.npv-row.child .npv-bar').find(b=>E("NPV_TASKS["+(+b.dataset.i)+"].id")===s.id);
        const hdl=kid2&&kid2.querySelector('.npv-hdl.r');
        mouse(hdl,'mousedown',100,10);dmouse('mousemove',100+dw*20,10);dmouse('mouseup',100+dw*20,10);
        setTimeout(()=>{
          ok('a resize past the parent clamps to the parent end',
             dates(s.id).split('/')[1]<=pf[1], dates(s.id));

          sec('a subtask outside the parent window stays free (parallel subtasks)');
          E("NPV_OPEN.add('td');npvRender();");
          setTimeout(()=>{
            const b2=dates('td2');
            const kd=qa('.npv-row.child .npv-bar').find(b=>E("NPV_TASKS["+(+b.dataset.i)+"].id")==='td2');
            drag(kd,E('NPV_GEO.dw')*2);
            setTimeout(()=>{
              ok('it moved the asked two days', (()=>{
                const a=new Date(dates('td2').split('/')[0]),b=new Date(b2.split('/')[0]);
                return (a-b)/86400000===2;})(), b2+' -> '+dates('td2'));
              stage6();
            },300);
          },250);
        },300);
      },250);
    },300);
  },250);
}

function stage6(){
  sec('markers still sit on the parent row when collapsed');
  E("NPV_OPEN=new Set();npvRebuild();");
  setTimeout(()=>{
    E("(function(){var t=ST.tasks.find(x=>x.id==='td3');t.ticketNodes=[{id:'n1',date:t.startDate,target:'Client review',notes:''}];npvRebuild();})()");
    setTimeout(()=>{
      const ev=q('#npv-body .npv-ev');
      ok('event marker is drawn', !!ev);
      if(ev){
        const top=parseFloat(ev.style.top);
        const tdRow=E("NPV_PLAN.findIndex(r=>r.dept==='td')");
        ok('marker sits on the collapsed parent row',
           Math.floor(top/E('NPV_ROWH'))===tdRow, 'top '+top+' row '+tdRow);
      }
      stage7();
    },300);
  },300);
}

function stage7(){
  sec('the draft page mirrors the model');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;
      e.dispatchEvent(new win.Event('input',{bubbles:true}));
      e.dispatchEvent(new win.Event('change',{bubbles:true}));};
    set('pp-name','Cartier Vitrine'); set('pp-deadline','2026-10-14');
    setTimeout(()=>{
      E('npvRebuild();');
      const dept=E('NPV_TASKS[0].department');
      E("npvCreateSubtask('"+dept+"')");
      setTimeout(()=>{
        const bars=JSON.parse(E("JSON.stringify(NPV_TASKS.filter(t=>t.department==='"+dept+
          "').map(t=>({label:t.label,startDate:t.startDate,endDate:t.endDate})))"));
        ok('the split made two bars', bars.length===2, bars.length+'');
        ok('the draft subtask is also born nested and shorter',
           bars[1].startDate===bars[0].startDate&&bars[1].endDate<=bars[0].endDate,
           JSON.stringify(bars));
        ok('the draft parent row is the primary line, not a summary',
           !!q('.npv-row.parent .npv-bar[data-i]')&&!q('.npv-bar.sum'));
        ok('exactly one child row (the primary is not re-listed)',
           qa('.npv-row.child').length===1, qa('.npv-row.child').length+'');
        const kid=q('.npv-row.child .npv-bar');
        ok('the draft subtask is the lighter shade too',
           !!kid&&sameCol(kid.style.background,E("kidShade(DEPT_COLORS['"+dept+"'])")),
           kid&&kid.style.background);
        const pe=bars[0].endDate;
        drag(kid,E('NPV_GEO.dw')*40);   /* way past the draft parent's end */
        setTimeout(()=>{
          const after=JSON.parse(E("JSON.stringify(NPV_TASKS.filter(t=>t.department==='"+dept+
            "'&&t.label==='Subtask 2').map(t=>({startDate:t.startDate,endDate:t.endDate}))[0])"));
          ok('a draft subtask clamps to its parent window as well',
             after.endDate<=pe, after.endDate+' vs '+pe);
          done();
        },400);
      },400);
    },400);
  },800);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
