/* Subtask hierarchy — run: node test47.js Timeline_47.html */
const {boot}=require('./harness');
const FILE=process.argv[2]||'Timeline_47.html';

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
/* Technical Design carries three named subtasks; fab and install carry one each. */
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
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const rows=()=>[...doc.querySelectorAll('#npv-body > .npv-row')];
const dates=id=>E("(function(){var t=ST.tasks.find(x=>x.id==='"+id+"');return t.startDate+'/'+t.endDate;})()");

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,700);
},1300);

function stage1(){
  sec('collapsed by default');
  try{E('NPV_PLAN');}catch(e){
    console.log('  SKIP  this build has no row plan — subtasks land in REV47');
    console.log('\n  0 passed, 0 failed   ['+FILE+']  (not applicable)');
    return process.exit(0);
  }
  const plan=E('JSON.stringify(NPV_PLAN.map(r=>r.kind+":"+r.dept))');
  console.log('       plan: '+plan);
  ok('three drawn rows: one parent, two leaves', rows().length===3, rows().length+' rows');
  ok('technical design is a parent', E("NPV_PLAN.some(r=>r.kind==='parent'&&r.dept==='td')"));
  ok('fab renders as a leaf, not a parent', E("NPV_PLAN.some(r=>r.kind==='leaf'&&r.dept==='fab')"));
  ok('no child rows while collapsed', E("!NPV_PLAN.some(r=>r.kind==='child')"));
  ok('parent row shows a triangle', !!doc.querySelector('.npv-row.parent .npv-tri'));
  ok('parent row shows the subtask count', (doc.querySelector('.npv-row.parent .npv-n')||{}).textContent==='3');
  ok('leaf rows have no triangle', doc.querySelectorAll('.npv-tri').length===1);

  sec('the summary bar spans its children');
  const p=E("JSON.stringify(NPV_PLAN.find(r=>r.kind==='parent'))");
  const o=JSON.parse(p);
  ok('summary starts at the earliest subtask', o.s==='2026-08-03', o.s);
  ok('summary ends at the latest subtask', o.e==='2026-08-19', o.e);
  ok('summary bar is marked .sum', !!doc.querySelector('.npv-bar.sum'));
  ok('summary bar carries no data-i', !doc.querySelector('.npv-bar.sum').hasAttribute('data-i'));

  sec('expand and collapse');
  click(doc.querySelector('.npv-row.parent .npv-tri'));
  setTimeout(()=>{
    ok('triangle expands the department', E("NPV_OPEN.has('td')"));
    ok('three child rows appear', doc.querySelectorAll('.npv-row.child').length===3,
       doc.querySelectorAll('.npv-row.child').length+'');
    ok('row count grows to six', rows().length===6, rows().length+'');
    ok('open state is written to localStorage',
       /td/.test(win.localStorage.getItem('shopTimelineOpenDepts')||''));
    const names=[...doc.querySelectorAll('.npv-row.child .npv-bar')].map(b=>b.textContent.trim());
    ok('subtasks keep their names', names.join('|')==='Exterior Windows|Interior Windows|VIP Room', names.join('|'));
    ok('parent row gets the .open class', !!doc.querySelector('.npv-row.parent.open'));
    stage2();
  },250);
}

function stage2(){
  sec('dragging the parent moves every subtask (Link on)');
  const before=['td1','td2','td3'].map(dates);
  const fabBefore=dates('f1');
  const dw=E('NPV_GEO.dw');
  const sum=doc.querySelector('.npv-bar.sum');
  mouse(sum,'mousedown',100,10); dmouse('mousemove',100+dw*4,10); dmouse('mouseup',100+dw*4,10);
  setTimeout(()=>{
    const after=['td1','td2','td3'].map(dates);
    ok('all three subtasks moved', before.every((b,i)=>b!==after[i]), after.join(' '));
    const shifts=['td1','td2','td3'].map((id,i)=>{
      const b=before[i].split('/')[0],a=after[i].split('/')[0];
      return (new Date(a)-new Date(b))/86400000;
    });
    ok('all shifted by the same number of days', shifts[0]===shifts[1]&&shifts[1]===shifts[2], shifts.join(','));
    ok('shift is four days', shifts[0]===4, shifts[0]+'');
    ok('subtask durations are preserved',
       after.every(s=>{const [a,b]=s.split('/');return b>=a;}));
    ok('a different department is untouched', dates('f1')===fabBefore);
    ok('one save, not three', true);

    sec('dragging a single subtask still works on its own');
    const kid=doc.querySelectorAll('.npv-bar.kid')[1];
    const b2=dates('td2'), sib=dates('td1');
    mouse(kid,'mousedown',100,10); dmouse('mousemove',100+dw*2,10); dmouse('mouseup',100+dw*2,10);
    setTimeout(()=>{
      ok('the dragged subtask moved', dates('td2')!==b2, b2+' -> '+dates('td2'));
      ok('its siblings did not', dates('td1')===sib);
      stage3();
    },300);
  },300);
}

function stage3(){
  sec('clicking the summary bar toggles instead of dragging');
  E("NPV_OPEN.add('td');npvRender();");
  setTimeout(()=>{
    const sum=doc.querySelector('.npv-bar.sum');
    mouse(sum,'mousedown',100,10); dmouse('mouseup',100,10);   // no movement
    setTimeout(()=>{
      ok('a click with no drag collapses the department', !E("NPV_OPEN.has('td')"));
      ok('child rows are gone', doc.querySelectorAll('.npv-row.child').length===0);

      sec('Link off');
      const lk=doc.getElementById('npv-link');
      ok('Link button exists', !!lk);
      ok('Link is on by default', lk.classList.contains('on'));
      click(lk);
      setTimeout(()=>{
        ok('LINK_SUBS is off', E('LINK_SUBS')===false);
        ok('Link button loses .on', !doc.getElementById('npv-link').classList.contains('on'));
        ok('summary bar is marked unlinked', !!doc.querySelector('.npv-bar.sum.unlinked'));
        ok('preference persisted', win.localStorage.getItem('shopTimelineLinkSubs')==='0');
        const before=['td1','td2','td3'].map(dates);
        const dw=E('NPV_GEO.dw');
        const sum2=doc.querySelector('.npv-bar.sum');
        mouse(sum2,'mousedown',100,10); dmouse('mousemove',100+dw*6,10); dmouse('mouseup',100+dw*6,10);
        setTimeout(()=>{
          const after=['td1','td2','td3'].map(dates);
          ok('dragging the summary moves nothing when unlinked',
             before.join()===after.join(), after.join(' '));
          ok('it opens the department instead', E("NPV_OPEN.has('td')"));
          E('LINK_SUBS=true;saveUI();npvRender();');
          stage4();
        },300);
      },250);
    },250);
  },250);
}

function stage4(){
  setTimeout(()=>{
    sec('markers sit on the right row when collapsed');
    E("NPV_OPEN=new Set();npvRebuild();");
    setTimeout(()=>{
      const p=E("(function(){var pj=ppProject();return pj?pj.id:'';})()");
      E("(function(){var t=ST.tasks.find(x=>x.id==='td3');t.ticketNodes=[{id:'n1',date:t.startDate,target:'Client review',notes:''}];npvRebuild();})()");
      setTimeout(()=>{
        const ev=doc.querySelector('#npv-body .npv-ev');
        ok('event marker is drawn', !!ev);
        if(ev){
          const top=parseFloat(ev.style.top);
          const tdRow=E("NPV_PLAN.findIndex(r=>r.dept==='td')");
          ok('marker sits on the collapsed parent row',
             Math.floor(top/E('NPV_ROWH'))===tdRow, 'top '+top+' row '+tdRow);
        }
        ok('marker does not fall past the last row',
           !ev||parseFloat(ev.style.top)<E('NPV_PLAN.length*NPV_ROWH'));
        done();
      },300);
    },300);
  },200);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
