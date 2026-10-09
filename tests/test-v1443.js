/* v1.44.3 — tracker #37 (TODO item 55), approved 2026-10-09: Project Schedule no longer lists the
   automatic Project Management row. The group stays in the page, hidden (saves read its checkbox),
   the visible groups number from 1, and it shows only when its "Hand over from today" note applies.
   Run: node tests/test-v1443.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('class="idg-pm')<0){
  console.log('  SKIP  test-v1443: pre-v1.44.3 build ('+FILE+')');
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

const P=(id,name,i)=>({appId:id,Title:name,client:'C',jobCode:'',deadline:D(90),status:'forecast',projectManager:'Sam',
  drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-1),sortIndex:i});
const T=(id,p,dept,who,s,e)=>({appId:id,projectId:p,department:dept,assignee:who,startDate:D(s),endDate:D(e),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[P('p1','Spring 2027',0),P('p2','Handed over',1)];
const tasks=[T('pm1','p1','pm','',30,90),T('td1','p1','td','',30,60),T('fab1','p1','fab','',61,85),
  /* p2: the PM bar is still held by Kate, a former PM — the one case the group must show */
  T('pm2','p2','pm','Kate',-10,90),T('td2','p2','td','',-10,20)];
const staff=[{appId:'s1',Title:'Sam',depts:'["pm"]',ooo:'[]',email:'user@example.com',role:'PM'},
  {appId:'s2',Title:'Kate',depts:'["pm"]',ooo:'[]',email:'',role:'PM'}];
const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

/* What the Project Schedule panel shows, ignoring anything inside a hidden wrapper. */
function panel(){
  const box=q('#pp-depts'),pm=box&&box.querySelector('.idg-pm');
  const shown=el=>!el.closest('.hidden');
  const heads=box?[...box.querySelectorAll('.idg')].filter(shown).map(e=>e.textContent):[];
  const visText=box?[...box.querySelectorAll('.idr')].filter(shown).map(e=>e.textContent).join('|'):'';
  const ck=box&&box.querySelector('input[data-dept="pm"]');
  return {heads,visText,pmHidden:!!pm&&pm.classList.contains('hidden'),pmText:pm?pm.textContent:'',ckOn:!!ck&&ck.checked};
}

async function main(){
  sec('R1 + Q1 — the saved project page');
  win.location.hash='#/project/p1';await wait(700);
  let s=panel();
  ok('R1: no visible "Project Management" heading', !s.heads.some(h=>/Project Management/.test(h)), JSON.stringify(s.heads));
  ok('R1: no visible "spans job" row', !/spans job/.test(s.visText));
  ok('Q1: the first visible heading reads "1 · Technical Design"', s.heads[0]==='1 · Technical Design', s.heads[0]);
  ok('Q1: the next reads "2 · Digital Fabrication"', s.heads[1]==='2 · Digital Fabrication', s.heads[1]);
  ok('the PM group is still in the page, hidden, its box checked', s.pmHidden&&s.ckOn);
  ok('R2: the Project Manager picker still shows Sam checked', [...doc.querySelectorAll('#pp-r-pm input:checked')].map(i=>i.value).join()==='Sam');

  sec('saves keep Project Management');
  const fin=q('#pp-depts input[data-dept="finish"]');
  ok('a department can be toggled', !!fin&&!fin.checked);
  fin.checked=true;change(fin);await wait(500);
  ok('the save added Painting', E("projById('p1').activeDepartments.includes('finish')"), E("JSON.stringify(projById('p1').activeDepartments)"));
  ok('…and kept pm in activeDepartments', E("projById('p1').activeDepartments.includes('pm')"));
  ok('…and kept the PM bar', !!E("taskById('pm1')"));

  sec('Q2 — a PM bar held by a former PM shows the group with its note');
  win.location.hash='#/project/p2';await wait(700);
  s=panel();
  ok('Q2: the Project Management group shows', !s.pmHidden, s.pmText);
  ok('Q2: with "Hand over from today"', /Hand over from today/.test(s.pmText), s.pmText);
  ok('Q2: its heading carries no number; Technical Design is still 1', s.heads[0]==='Project Management'&&s.heads[1]==='1 · Technical Design', JSON.stringify(s.heads.slice(0,2)));

  sec('R1 + Q1 — the New Project draft');
  win.location.hash='#/';await wait(300);
  E("location.hash='#/project/new';applyRoute()");await wait(800);
  s=panel();
  ok('R1: the draft shows no Project Management row', !s.heads.some(h=>/Project Management/.test(h))&&!/spans job/.test(s.visText), JSON.stringify(s.heads));
  ok('Q1: the draft\'s first heading is "1 · Technical Design"', s.heads[0]==='1 · Technical Design', s.heads[0]);
  ok('the draft PM box is in the page and checked', s.pmHidden&&s.ckOn);
  E("document.getElementById('pp-name').value='Draft job';document.getElementById('pp-deadline').value='"+D(70)+"';"
   +"(()=>{const c=[...document.querySelectorAll('#pp-r-pm input')].find(i=>i.value==='Sam');if(c)c.checked=true;})();npvRebuild()");
  await wait(200);
  E("savePageProject()");await wait(600);
  const np=E("(ST.projects.find(p=>p.name==='Draft job')||{}).id");
  ok('creating from the draft still saves pm and a PM bar', !!np&&E("projById('"+np+"').activeDepartments.includes('pm')")&&!!E("tasksOf('"+np+"').find(t=>t.department==='pm')"));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
