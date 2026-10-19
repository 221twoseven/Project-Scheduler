/* v1.51.0 — item 75: a Today button on the project page (owner, 2026-10-16). In the chart's header row
   beside the zoom buttons and Reset, labelled "Today", titled "Scroll to today". Gantt: this week's
   Monday at the left edge, right of the name column (the timeline's rule, item 33). Calendar: this
   week's row at the top; a job wholly before or after today lands on its last or first week. Draft
   and saved pages, viewers too. No shortcut: T stays New note.
   Run: node tests/test-v1510.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const P=(id,name)=>({appId:id,Title:name,client:'Example Client',jobCode:id.toUpperCase(),deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','cnc','install']),createdAt:D(-90),sortIndex:0});
const T=(id,pid,dept,s,e)=>({appId:id,projectId:pid,department:dept,assignee:dept==='install'?'[]':'Sam',
  startDate:D(s),endDate:D(e),estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[P('p1','Q4 Frozen In Time 2026'),P('p2','Ahead Of Us'),P('p3','Long Done')];
const tasks=[T('a1','p1','cnc',-40,-30),T('a2','p1','install',40,42),
             T('b1','p2','cnc',40,60),T('b2','p2','install',70,72),
             T('c1','p3','cnc',-90,-70),T('c2','p3','install',-60,-58)];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]',role:''};
const PAT={appId:'s2',Title:'Pat',email:'pat@example.com',depts:'[]',ooo:'[]',role:'',admin:'1'};
const start=staff=>boot(FILE,{data:{projects,tasks,staff,todos:[]}}).window;
const goW=(w,h)=>{w.location.hash=h;w.dispatchEvent(new w.Event('hashchange'));};

/* checks for any window on a project page */
function button(w,where){
  const b=w.document.getElementById('npv-today');
  ok(where+': a Today button', !!b&&b.textContent==='Today'&&b.title==='Scroll to today'&&b.tagName==='BUTTON');
  ok(where+': styled like its neighbours, in the chart header', !!b&&b.classList.contains('npv-btn')&&!!b.closest('.npv-hd'));
  const hd=[...w.document.querySelectorAll('.npv-hd > *')],i=hd.indexOf(b);
  ok(where+': right after the zoom buttons', i>0&&hd[i-1].id==='npv-zoom', hd.map(e=>e.id||e.className).join(','));
  return b;
}
/* Gantt: from a far-scrolled start, today's x lands in the first week right of the name column */
function gantt(w,where){
  const E=s=>w.eval(s),sc=w.document.getElementById('npv-scroll');
  sc.scrollLeft=50000;
  w.document.getElementById('npv-today').click();
  const want=E("(()=>{const t=today(),d=t.getDay();return Math.max(0,diffDays(NPV_GEO.lo,addDays(t,-(d===0?6:d-1)))*NPV_GEO.dw);})()");
  ok(where+': Gantt scrolls to this week\'s Monday at the left edge', sc.scrollLeft===want, sc.scrollLeft+' vs '+want);
  const tx=E('NPV_GUT+diffDays(NPV_GEO.lo,today())*NPV_GEO.dw')-sc.scrollLeft;
  ok(where+': today\'s x is in view, within a week of the name column', tx>=E('NPV_GUT')&&tx<E('NPV_GUT')+7*E('NPV_GEO.dw'), 'x '+tx);
}
/* Calendar: jsdom has no layout, so each week row reports top = 100 × its index, less the scroll */
function calendar(w,where,expect){
  const E=s=>w.eval(s),doc=w.document,sc=doc.getElementById('npv-scroll');
  doc.getElementById('npv-m-c').click();
  const wks=[...doc.querySelectorAll('#npv-body .cal-wk')];
  wks.forEach((wk,i)=>{wk.getBoundingClientRect=()=>({top:i*100-sc.scrollTop,left:0,right:0,bottom:0,width:0,height:100});});
  sc.getBoundingClientRect=()=>({top:0,left:0,right:0,bottom:0,width:0,height:0});
  sc.scrollTop=777;
  const btn=doc.getElementById('npv-today');
  ok(where+': the button stays in Calendar mode', !!btn&&!btn.classList.contains('hidden'));
  btn.click();
  const iso=E('fmtDate(today())');
  const idx=expect==='today'?wks.findIndex(wk=>wk.querySelector('.cal-dn[data-d="'+iso+'"]')):expect==='first'?0:wks.length-1;
  ok(where+': Calendar puts '+(expect==='today'?'the current week':'the '+expect+' week')+' at the top', idx>=0&&sc.scrollTop===idx*100, sc.scrollTop+' vs week '+idx);
  doc.getElementById('npv-m-g').click();
}

(async()=>{
  const w=start([{...SAM,admin:'1'},PAT]);
  const doc=w.document,E=s=>w.eval(s);
  await wait(1500);

  sec('saved page');
  goW(w,'#/project/p1');await wait(900);
  button(w,'saved');
  gantt(w,'saved');
  doc.querySelector('#npv-zoom button[data-fit="7"]').click();
  gantt(w,'saved, Week zoom');
  calendar(w,'saved','today');

  sec('a job wholly ahead of today, and one long done');
  goW(w,'#/project/p2');await wait(900);
  gantt(w,'future job');
  calendar(w,'future job','first');
  goW(w,'#/project/p3');await wait(900);
  gantt(w,'past job');
  calendar(w,'past job','last');

  sec('draft page');
  goW(w,'#/project/new');await wait(800);
  button(w,'draft');
  const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));
    e.dispatchEvent(new w.Event('change',{bubbles:true}));};
  set('pp-name','Q4 Frozen In Time 2026');set('pp-deadline',D(30));
  const ck=doc.querySelector('#pp-depts input[data-dept="cnc"]');if(!ck.checked)ck.click();
  await wait(400);
  ok('draft: the chart is drawn', E('NPV_TASKS.length')>0);
  gantt(w,'draft');
  calendar(w,'draft','today');

  sec('no shortcut: T is still New note');
  if(doc.activeElement&&doc.activeElement.blur)doc.activeElement.blur();
  const n0=E('NPV_TODOS.length');
  doc.body.dispatchEvent(new w.KeyboardEvent('keydown',{key:'t',bubbles:true,cancelable:true}));
  await wait(100);
  ok('T makes a note on the project page', E('NPV_TODOS.length')===n0+1, E('NPV_TODOS.length')+' vs '+(n0+1));
  ok('the shortcut list is unchanged', E("KBD_PP.some(k=>k[0]==='T'&&k[1]==='New note')")&&!E("KBD_PP.some(k=>/today/i.test(k[1]))"));

  sec('a viewer can use it');
  {const v=start([{...SAM,admin:''},PAT]);
    await wait(1500);
    ok('viewer: Sam is a viewer', v.eval('isViewer()')===true);
    goW(v,'#/project/p1');await wait(900);
    button(v,'viewer');
    gantt(v,'viewer');
  }
  done();
})();
