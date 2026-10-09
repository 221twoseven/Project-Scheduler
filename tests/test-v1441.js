/* v1.44.1 — tracker #21 (TODO item 1, Cost Code half), revised spec 2026-10-08, approved 2026-10-09:
   every on-screen label of the project identifier reads "Cost code"; values, the stored field
   and the plain word "job" stay; Changelog rows show stored keys in plain words.
   Run: node tests/test-v1441.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('const CLOG_LBL=')<0){
  console.log('  SKIP  test-v1441: pre-v1.44.1 build ('+FILE+')');
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

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',deadline:D(40),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-20),sortIndex:0}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:D(-5),endDate:D(10),estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p1',department:'pm',assignee:'Sam',startDate:D(-5),endDate:D(40),estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s),calls=()=>win.__spCalls;

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

/* Setup label + placeholder and the header strip's labels, on whichever project page is up. */
function page(){
  const inp=q('#pp-code');
  const lbl=inp&&inp.closest('.ins-f')?inp.closest('.ins-f').querySelector('label').textContent:null;
  const keys=[...doc.querySelectorAll('#pp-meta .m .k')].map(k=>k.textContent);
  const vals=[...doc.querySelectorAll('#pp-meta .m')].map(m=>m.textContent);
  return {lbl,ph:inp&&inp.placeholder,keys,vals};
}

async function main(){
  sec('R1/R2 + Q1 — the saved project page');
  win.location.hash='#/project/p1';await wait(600);
  let s=page();
  ok('R1: the Setup label reads "Cost code"', s.lbl==='Cost code', s.lbl);
  ok('R1: no "Job code" label on the page', !/job code/i.test(q('#page').textContent));
  ok('the Setup placeholder is AB123 (owner, Q3)', s.ph==='AB123', s.ph);
  ok('Q1: the header strip has a "Cost code" cell and no "Job" cell', s.keys.includes('Cost code')&&!s.keys.includes('Job'), JSON.stringify(s.keys));
  ok('R3: the strip still shows the value WMU004', s.vals.some(v=>v==='Cost codeWMU004'), JSON.stringify(s.vals));

  sec('R1/R2 + Q1 — the New Project draft');
  win.location.hash='#/project/new';await wait(800);
  s=page();
  ok('R1: the draft Setup label reads "Cost code"', s.lbl==='Cost code', s.lbl);
  ok('the draft placeholder is AB123', s.ph==='AB123', s.ph);
  ok('Q1: the draft strip has "Cost code" and no "Job"', s.keys.includes('Cost code')&&!s.keys.includes('Job'), JSON.stringify(s.keys));
  E("PP_FORM=null");win.location.hash='#/';await wait(400);

  sec('Tour (R2) — steps 1 and 9');
  const tour=E("JSON.stringify([COACH_STEPS[0].b,COACH_PP_STEPS.map(x=>x.b).find(b=>/install date and days out/.test(b))])");
  const [t1,t9]=JSON.parse(tour);
  ok('step 1 says "cost codes", not "job codes"', /cost codes/i.test(t1)&&!/job codes?/i.test(t1), t1);
  ok('step 9 says "cost code", not "job code"', /cost code/i.test(t9||'')&&!/job code/i.test(t9||''), t9);

  sec('Q2 — the Clients directory');
  ok('the Clients menu tooltip says "cost-code aliases"', /cost-code aliases/.test(q('#mi-clients').title), q('#mi-clients').title);
  win.location.hash='#/clients';await wait(400);
  ok('the Clients subtitle says "cost-code aliases"', /cost-code aliases/.test((q('#page .cd-sub')||{}).textContent||''));
  ok('the alias placeholder says "cost-code prefix"', src.includes('placeholder="2–3 letter cost-code prefix"'));
  win.location.hash='#/';await wait(400);

  sec('R3 — the value shows unchanged everywhere it did');
  ok('sidebar sub-line', /WMU004/.test(q('#sidebar').textContent));
  ok('the project bar label', [...doc.querySelectorAll('.job-bar.summary')].some(b=>/WMU004/.test(b.textContent)),
     [...doc.querySelectorAll('.job-bar.summary')].map(b=>b.textContent).join('|'));
  E("showTooltipProj(projById('p1'),parseDate('"+D(-5)+"'),parseDate('"+D(40)+"'),{clientX:40,clientY:40})");
  ok('the project hover tip', /Hermes · WMU004/.test(q('#tooltip').textContent), q('#tooltip').textContent);
  ok('the stored field is still jobCode', E("projToFields(projById('p1')).jobCode")==='WMU004'&&E("'costCode' in projToFields(projById('p1'))")===false);

  sec('R4 — the plain word "job" stays');
  for(const w of ['spans job','Every job, one list','The job at a glance','The job has ended'])
    ok('"'+w+'" is still in the app', src.includes(w));

  sec('Q5 — Changelog rows name fields in plain words');
  let n0=calls().length;
  E("saveState({projects:ST.projects.map(p=>p.id==='p1'?{...p,jobCode:'HE276',drafter:'Dana'}:p),tasks:ST.tasks})");
  await wait(500);
  const row=calls().slice(n0).filter(c=>c.method==='POST'&&/ShopTimeline_Changelog/.test(c.url)).map(c=>c.body.fields)[0]||{};
  ok('the stored row keeps its keys (jobCode, drafter)', /jobCode/.test(row.field||'')&&/^jobCode: WMU004 → HE276$/m.test(row.detail||''), JSON.stringify(row));
  const html=E("(()=>{const d=document.createElement('div');d.innerHTML=clogRowsHtml(["+JSON.stringify({...row,title:row.Title,at:row.at||new Date().toISOString()})+"],false);return d.textContent;})()");
  ok('the row reads "Cost code: WMU004 → HE276"', /Cost code: WMU004 → HE276/.test(html), html);
  ok('a drafter change reads "Technical Designer: …"', /Technical Designer: /.test(html), html);
  ok('"jobCode" and "drafter" appear nowhere in the drawn row', !/jobCode|drafter/.test(html), html);
  ok('a note line that merely starts like a key is left alone mid-line', E("clogLbl('see jobCode: x')")==='see jobCode: x');
  ok('a bulk-change line "Title — jobCode, drafter" is mapped too',
     E("clogLbl('Project “A” — jobCode, drafter')")==='Project “A” — Cost code, Technical Designer', E("clogLbl('Project “A” — jobCode, drafter')"));
  /* the Changelog page's filter matches the words on screen */
  E("clogFetch=async()=>["+JSON.stringify({...row,title:row.Title,at:row.at||new Date().toISOString()})+"]");
  win.location.hash='#/changelog';await wait(500);
  const qi=q('#clog-q');
  const hits=v=>{qi.value=v;qi.dispatchEvent(new win.Event('input',{bubbles:true}));return doc.querySelectorAll('#clog-list .clog-row').length;};
  ok('Changelog search: "cost code" finds the row', !!qi&&hits('cost code')===1, qi&&hits('cost code'));
  ok('Changelog search: "technical designer" finds the row', !!qi&&hits('technical designer')===1);
  win.location.hash='#/';await wait(300);

  sec('Source check');
  const notes=src.slice(src.indexOf('RELEASE_NOTES:BEGIN'),src.indexOf('RELEASE_NOTES:END'));
  const rest=src.replace(notes,'');
  ok('no "job code" / "job-code" outside the release-notes block', !/job[ -]code/i.test(rest), (rest.match(/.{30}job[ -]code.{30}/i)||[''])[0]);

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
