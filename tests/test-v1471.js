/* v1.47.1 — TODO item 8: the department rollup band. On the project-page Gantt a faint track (.npv-env) runs
   behind each department's bars from its first start to its last finish, gaps included, so it could read as
   continuous work. The legend now names it "Overall span (gaps aren't work)" — Gantt only, and only when a
   department has more than one bar (with one bar the track hides behind it).
   Run: node tests/test-v1471.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('lg-span')<0){
  console.log('  SKIP  test-v1471: pre-v1.47.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const P=(id,depts)=>({appId:id,Title:'Job '+id,client:'',jobCode:'',deadline:'2026-12-15',status:'auto',projectManager:'Stan',
  activeDepartments:JSON.stringify(depts),createdAt:'2026-07-01',sortIndex:0});
const T=(id,pid,dept,s,e,label)=>({appId:id,projectId:pid,department:dept,assignee:'',startDate:s,endDate:e,estimatedDays:3,
  ticketNodes:'[]',notes:'',pinned:false,label:label||''});
const projects=[P('p1',['td','fab']),P('p2',['td','fab']),P('p3',['td','fab']),P('p4',['td','fab'])];
const tasks=[
  /* p1: Technical Design runs twice with a gap — the span track shows */
  T('a1','p1','td','2026-09-01','2026-09-10','Drawings'),T('a2','p1','td','2026-10-05','2026-10-09','Revisions'),
  T('b1','p1','fab','2026-10-12','2026-10-30'),
  /* p2: one bar per department — no span track to explain */
  T('c1','p2','td','2026-09-01','2026-09-10'),T('c2','p2','fab','2026-09-14','2026-09-30'),
  /* p3: Technical Design as two RANGES — each its own bar, no track between them (v1.32.0) */
  T('d1','p3','td','2026-09-01','2026-09-10'),{...T('d2','p3','td','2026-10-05','2026-10-09'),range:true},
  T('d3','p3','fab','2026-10-12','2026-10-30'),
  /* p4: a subtask inside the main bar's dates — the track hides behind the bar */
  T('e1','p4','td','2026-09-01','2026-09-30'),T('e2','p4','td','2026-09-08','2026-09-12','Check'),
  T('e3','p4','fab','2026-10-12','2026-10-30')];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const span=()=>q('#npv-leg .lg-span');

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('a department with a gap: the legend names the track');
  win.location.hash='#/project/p1';await wait(700);
  ok('the track is drawn behind Technical Design',!!q('#npv-body .npv-env'));
  ok('the legend has an "Overall span" entry',!!span()&&/Overall span/.test(span().textContent),span()&&span().textContent);
  ok('it says gaps aren\'t work',!!span()&&/gaps aren.t work/.test(span().textContent));
  ok('its tooltip says what the track is: first start to last finish',!!span()&&/first start to its last finish/.test(span().title));
  ok('the swatch is the track\'s own shape',!!q('#npv-leg .lg-span i.env'));
  ok('in the department\'s colour, as the track is',
    !!q('#npv-leg .lg-span i.env')&&q('#npv-leg .lg-span i.env').style.background===q('#npv-body .npv-env').style.background);

  sec('the calendar has no track, so no entry');
  E("NPV_MODE='calendar';npvRender()");await wait(100);
  ok('no "Overall span" in calendar mode',!span());
  E("NPV_MODE='gantt';npvRender()");await wait(100);
  ok('back on the Gantt it returns',!!span());

  sec('one bar per department: nothing to explain');
  win.location.hash='#/project/p2';await wait(700);
  ok('no "Overall span" entry',!span());
  ok('the department chips are still there',doc.querySelectorAll('#npv-leg .lg').length>=2);

  sec('ranges never get a track, so no entry');
  win.location.hash='#/project/p3';await wait(700);
  ok('two ranges draw two bars',doc.querySelectorAll('#npv-body .npv-bar').length>=3);
  ok('no track',!q('#npv-body .npv-env'));
  ok('no "Overall span" entry',!span());

  sec('a subtask inside the main bar: the track hides, so no entry');
  win.location.hash='#/project/p4';await wait(700);
  ok('no "Overall span" entry',!span());

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
