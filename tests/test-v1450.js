/* v1.45.0 — TODO item 2, owner ruling 2026-10-09 (option 1): "Protect dates" (was "Lock dates")
   means drags never change dates, on the timeline AND the project page (Gantt and calendar).
   Moving a bar to another lane stays allowed; typed dates still change.
   Run: node tests/test-v1450.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('<span class="lock-txt">Protect dates</span>')<0){
  console.log('  SKIP  test-v1450: pre-v1.45.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const projects=[{appId:'p1',Title:'Window Job',client:'C',jobCode:'AB123',deadline:D(60),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-10),sortIndex:0}];
const T=(id,dept,who,s,e)=>({appId:id,projectId:'p1',department:dept,assignee:who,startDate:D(s),endDate:D(e),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[T('pm1','pm','Sam',0,60),T('td1','td','Sam',7,20),T('fab1','fab','',21,40)];
const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}));
const st=id=>JSON.parse(E("JSON.stringify(taskById('"+id+"'))"));
const span=t=>t.startDate+'..'+t.endDate;
const toasts=()=>[...doc.querySelectorAll('.toast,#toast,.toasts *')].map(e=>e.textContent).join('|');

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

/* project-page Gantt: drag a bar (or its edge) by N days */
const npvBar=dept=>q('#npv-body .npv-bar[data-i="'+E("NPV_TASKS.findIndex(t=>t.department==='"+dept+"')")+'"]');
const npvDrag=async(el,days)=>{const dw=E('NPV_GEO.dw');mouse(el,'mousedown',100,20);dmouse('mousemove',100+dw*days,20);dmouse('mouseup',100+dw*days,20);await wait(300);};
/* timeline: the drag engages after a 200 ms hold */
const tlDrag=async(el,days)=>{const dw=E('dw()');mouse(el,'mousedown',100,20);await wait(250);dmouse('mousemove',100+dw*days,20);await wait(30);dmouse('mouseup',100+dw*days,20);await wait(250);};

async function main(){
  sec('(b) the toggle is "Protect dates" and says what it stops');
  const lbl=q('.lock-tog');
  ok('it reads "Protect dates"', q('.lock-txt').textContent.trim()==='Protect dates');
  ok('its tooltip says drags never change dates, lanes still change, typed dates still change',
     /never changes its dates/.test(lbl.title)&&/lane/.test(lbl.title)&&/typed dates still change/.test(lbl.title), lbl.title);
  ok('(d) its tooltip names the view-only rule', /Always on for view-only users/.test(lbl.title));

  sec('(a) the timeline — a drag moves no dates');
  E("EXPANDED.add('p1');DATE_LOCK=true;render()");
  const tb=()=>q('.job-bar[data-tid="td1"]');
  const b0=st('td1');
  await tlDrag(tb(),5);
  ok('a move with Protect dates on leaves the dates alone', span(st('td1'))===span(b0), span(st('td1')));
  const h=tb()&&tb().querySelector('.rh,.handle-r,.r-handle,[class*="hdl"]');
  if(h){await tlDrag(h,5);ok('an edge drag leaves them alone too', span(st('td1'))===span(b0), span(st('td1')));}

  sec('(a) the project page Gantt — move AND resize are refused (was: resize only)');
  win.location.hash='#/project/p1';await wait(700);
  E('DATE_LOCK=true');
  let t0=st('td1');
  await npvDrag(npvBar('td'),3);
  ok('a move leaves the dates alone', span(st('td1'))===span(t0), span(st('td1')));
  await npvDrag(npvBar('td').querySelector('.npv-hdl.r'),3);
  ok('a resize leaves them alone', span(st('td1'))===span(t0), span(st('td1')));
  ok('the refused drag says why', /Protect dates is on — drags can’t change dates/.test(doc.body.textContent));
  E("ppSelect('td1',true)");
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true}));await wait(300);
  ok('a Shift+Arrow nudge (a keyboard move) leaves the dates alone too', span(st('td1'))===span(t0), span(st('td1')));
  E('DATE_LOCK=false');
  await npvDrag(npvBar('td'),3);
  ok('with Protect dates off, the same move shifts the dates (control)', st('td1').startDate!==t0.startDate, span(st('td1')));

  sec('(a) the project page calendar uses the same rule');
  ok('the calendar drag rule includes DATE_LOCK for moves', (src.match(/const locked=!vcan\('phases'\)\|\|DATE_LOCK\|\|\(!!resize&&!!t\.pinned\);/g)||[]).length===2);

  sec('(a) a new project draft — the same');
  win.location.hash='#/';await wait(300);
  E("location.hash='#/project/new';applyRoute()");await wait(800);
  E("document.getElementById('pp-deadline').value='"+D(60)+"';npvRebuild();DATE_LOCK=true");await wait(200);
  const d0=E("JSON.stringify(NPV_TASKS.find(t=>t.department==='td'))");
  await npvDrag(npvBar('td'),3);
  ok('a draft move leaves the dates alone', E("JSON.stringify(NPV_TASKS.find(t=>t.department==='td'))")===d0);
  E('DATE_LOCK=false');

  sec('typed dates still change (Protect dates guards drags only)');
  win.location.hash='#/';await wait(300);
  win.location.hash='#/project/p1';await wait(700);
  E('DATE_LOCK=true');
  const ds=q('#pp-depts .dstart[data-dept="td"]');
  ok('the Technical Design start field is editable', !!ds&&!ds.disabled);
  const want=E("fmtDate(addDays(parseDate(taskById('td1').startDate),-7))"); /* same weekday a week earlier — a workday */
  if(ds){ds.value=want;ds.dispatchEvent(new win.Event('change',{bubbles:true}));await wait(400);}
  ok('typing a start date changes it', st('td1').startDate===want, span(st('td1'))+' vs '+want);
  E('DATE_LOCK=false');

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
