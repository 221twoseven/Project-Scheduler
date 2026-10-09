/* v1.44.2 — tracker #36 (TODO item 54), approved 2026-10-09: a project's bar and the header's
   Shop starts begin at its first real phase, not at the hidden Project Management bar (which keeps
   the start it was generated with). A new project's PM bar starts with its first phase.
   Run: node tests/test-v1442.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function projSpan(')<0){
  console.log('  SKIP  test-v1442: pre-v1.44.2 build ('+FILE+')');
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

/* The report: a Forecast project whose PM bar starts months before its first phase. */
const P=(id,name,dl,depts,i)=>({appId:id,Title:name,client:'Van Cleef',jobCode:'',deadline:dl,status:'forecast',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(depts),createdAt:D(-1),sortIndex:i});
const T=(id,p,dept,s,e)=>({appId:id,projectId:p,department:dept,assignee:'',startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[P('p1','Spring 2027',D(160),['pm','td','fab'],0),P('p2','PM only',D(60),['pm'],1),P('p3','No bars',D(80),['pm'],2)];
const tasks=[T('pm1','p1','pm',D(-10),D(160)),T('td1','p1','td',D(30),D(90)),T('fab1','p1','fab',D(91),D(150)),
  T('pm2','p2','pm',D(5),D(60))];
const dom=boot(FILE,{data:{projects,tasks,staff:[{appId:'s1',Title:'Sam',depts:'["pm"]',ooo:'[]',email:'user@example.com',role:'PM'}],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const iso=expr=>E("fmtDate("+expr+")");

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('the shared rule (projSpan)');
  ok('Spring 2027 starts at Technical Design, not the PM bar', iso("projSpan(projById('p1'),tasksOf('p1')).s")===D(30), iso("projSpan(projById('p1'),tasksOf('p1')).s"));
  ok('its end is unchanged (the latest bar)', iso("projSpan(projById('p1'),tasksOf('p1')).e")===D(160));
  ok('a project with only a PM bar starts at the PM bar', iso("projSpan(projById('p2'),tasksOf('p2')).s")===D(5));
  ok('a project with no bars starts 14 days before its install date', iso("projSpan(projById('p3'),tasksOf('p3')).s")===D(66));

  sec('R1 — the dashboard bar');
  const bar=q('.job-bar.summary[data-pid="p1"]');
  ok('R1: the summary bar\'s left edge sits on Technical Design\'s start', !!bar&&bar.style.left===E("d2x(parseDate('"+D(30)+"'))")+'px',
     bar&&bar.style.left+' vs '+E("d2x(parseDate('"+D(30)+"'))")+'px (PM would be '+E("d2x(parseDate('"+D(-10)+"'))")+'px)');

  sec('the printed Gantt');
  const pages=E("prBuild('timeline','"+D(-14)+"','"+D(170)+"')");
  const holder=doc.createElement('div');pages.forEach(pg=>holder.appendChild(pg));
  const pb=holder.querySelector('.job-bar.summary[data-pid="p1"]');
  /* The print window opens on D(-14). From Technical Design (D(30)) the bar runs 131 days and sits
     44 days in (left/width ≈ 0.34); from the PM bar (D(-10)) it would run 171 days, 4 days in (≈ 0.02). */
  const ratio=pb?parseFloat(pb.style.left)/parseFloat(pb.style.width):NaN;
  ok('the printed bar starts at Technical Design too', ratio>0.25&&ratio<0.45, pb&&pb.style.left+' / '+pb.style.width+' → '+ratio.toFixed(3));
  ok('the print code path uses projSpan', /prGanttInto[\s\S]{0,1500}projSpan\(p,tasksOf\(p\.id\)\)/.test(src));

  sec('R2 — the header strip and Kickoff agree');
  win.location.hash='#/project/p1';await wait(700);
  const cell=k=>{const m=[...doc.querySelectorAll('#pp-meta .m')].find(m=>m.querySelector('.k').textContent===k);return m?m.querySelector('.v').textContent:null;};
  const want=E("fmtNice('"+D(30)+"')");
  ok('R2: Shop starts reads Technical Design\'s start', cell('Shop starts')===want, cell('Shop starts')+' vs '+want);
  ok('Kickoff reads the same day', (q('#npv-foot')||{}).textContent&&q('#npv-foot').textContent.includes('Kickoff '+E("fmtNice(fmtDate(parseDate('"+D(30)+"')))")), (q('#npv-foot')||{}).textContent);
  ok('Work ends is unchanged', cell('Work ends')===E("fmtNice('"+D(160)+"')"), cell('Work ends'));
  ok('the stored PM bar is not rewritten (Q2)', E("taskById('pm1').startDate")===D(-10));
  win.location.hash='#/';await wait(400);

  sec('R3 / plan 2 — a new project\'s PM bar starts with its first phase');
  E("location.hash='#/project/new';applyRoute()");await wait(800);
  /* the draft re-reads its fields from the page, so fill the inputs themselves */
  E("document.getElementById('pp-name').value='Spring draft';document.getElementById('pp-deadline').value='"+D(160)+"';"
   +"(()=>{const c=[...document.querySelectorAll('#pp-r-pm input')].find(i=>i.value==='Sam');if(c)c.checked=true;})();npvRebuild()");
  await wait(200);
  const before=E("NPV_ALL.find(t=>t.department==='pm').startDate");
  const firstGen=E("NPV_ALL.filter(t=>t.department!=='pm').map(t=>t.startDate).sort()[0]");
  ok('as generated, the PM bar starts with the earliest phase', before===firstGen, before+' vs '+firstGen);
  /* the report: Technical Design, the first phase, is moved later by hand (to "Nov 30") */
  ok('Technical Design is the first generated phase', E("NPV_TASKS.find(t=>t.department==='td').startDate")===firstGen);
  E("(()=>{const t=NPV_TASKS.find(t=>t.department==='td');NPV_MANUAL[npvKey(t)]={startDate:fmtDate(addDays(parseDate(t.startDate),5)),endDate:t.endDate};})();npvRebuild()");
  await wait(200);
  const firstNow=E("NPV_ALL.filter(t=>t.department!=='pm').map(t=>t.startDate).sort()[0]");
  ok('after the hand move, the draft PM bar starts on the new first phase', E("NPV_ALL.find(t=>t.department==='pm').startDate")===firstNow&&firstNow>firstGen,
     E("NPV_ALL.find(t=>t.department==='pm').startDate")+' vs '+firstNow);
  ok('the draft strip\'s Shop starts reads it', cell('Shop starts')===E("fmtNice('"+firstNow+"')"), cell('Shop starts'));
  E("savePageProject()");await wait(600);
  const np=E("(ST.projects.find(p=>p.name==='Spring draft')||{}).id");
  ok('the project was created', !!np);
  ok('its saved PM bar starts on the first phase', !!np&&E("tasksOf('"+np+"').find(t=>t.department==='pm').startDate")===firstNow,
     np&&E("tasksOf('"+np+"').find(t=>t.department==='pm').startDate"));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
