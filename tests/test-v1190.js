/* v1.19.0 — the change log (§3 item 26, 2026-09-02): every landed save writes one row
   per changed record to ShopTimeline_Changelog (who, at, field, detail, projectId);
   a created/deleted project logs one row, not one per child; the global page lives at
   #/changelog (admin-only) and the project page grows a second dock behind the footer
   Changelog button — only one dock viewable at a time.
   Run: node tests/test-v1190.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('ShopTimeline_Changelog')<0){
  console.log('test-v1190: skipped — pre-v1.19.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const mkProj=(id,name,i)=>({appId:id,Title:name,client:'C',jobCode:'J'+i,deadline:D(40+i),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:i});
const mkTask=(id,pid,dept,who,s,e)=>({appId:id,projectId:pid,department:dept,assignee:who,
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});

const dom=boot(FILE,{data:{
  projects:[mkProj('p1','Alpha',0),mkProj('p2','Beta',1)],
  tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4)),mkTask('t2','p2','fab','Nick',D(0),D(4))],
  staff:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s),calls=()=>win.__spCalls;
const clogPosts=from=>calls().slice(from).filter(c=>c.method==='POST'&&/ShopTimeline_Changelog/.test(c.url));

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('a field edit logs one row: field, old → new detail, projectId');
  let n0=calls().length;
  E("saveState({projects:ST.projects.map(p=>p.id==='p1'?{...p,client:'C2'}:p),tasks:ST.tasks})");
  await wait(500);
  let rows=clogPosts(n0).map(c=>c.body.fields);
  ok('exactly one changelog row went out', rows.length===1, rows.length+' rows');
  const r0=rows[0]||{};
  ok('field names the changed column', r0.field==='client', r0.field);
  ok('detail carries old → new', /C\s*→\s*C2/.test(r0.detail||''), r0.detail);
  ok('the row points at the project', r0.projectId==='p1', r0.projectId);
  ok('the row is stamped who + at + appId', !!r0.at&&('who' in r0)&&!!r0.appId, JSON.stringify({who:r0.who,at:r0.at}));

  sec('save-stamp churn is not an edit');
  ok('updatedBy/updatedAt never appear as fields', rows.every(r=>!/updated(By|At)/.test(r.field||'')),
    rows.map(r=>r.field).join('|'));

  sec('a new phase logs created');
  n0=calls().length;
  E("saveState({projects:ST.projects,tasks:ST.tasks.concat([{id:'t3',projectId:'p1',department:'fin',assignee:'Kate',startDate:'"+D(5)+"',endDate:'"+D(9)+"',estimatedDays:5,ticketNodes:[],notes:'',pinned:false,label:''}])})");
  await wait(500);
  rows=clogPosts(n0).map(c=>c.body.fields);
  ok('one created row for the phase', rows.length===1&&rows[0].field==='created', rows.map(r=>r.field).join('|'));
  ok('the created row points at p1', rows.length===1&&rows[0].projectId==='p1', rows[0]&&rows[0].projectId);

  sec('deleting a project logs ONE row — children ride with it');
  n0=calls().length;
  E("saveState({projects:ST.projects.filter(p=>p.id!=='p1'),tasks:ST.tasks.filter(t=>t.projectId!=='p1'),todos:(ST.todos||[]).filter(t=>t.projectId!=='p1'),events:(ST.events||[]).filter(e=>e.projectId!=='p1')})");
  await wait(500);
  rows=clogPosts(n0).map(c=>c.body.fields);
  ok('exactly one deleted row', rows.length===1&&rows[0].field==='deleted',
    rows.map(r=>r.field+':'+r.Title).join('|'));
  ok('it names the project', /Project/.test((rows[0]||{}).Title||''), (rows[0]||{}).Title);

  sec('the global page: #/changelog renders for an admin');
  win.location.hash='#/changelog';
  await wait(400);
  ok('the changelog page is on screen', !!win.document.getElementById('clog-list'));
  ok('the menu entry exists', !!win.document.getElementById('mi-changelog'));

  sec('the project page: second dock behind the footer toggle, one at a time');
  win.location.hash='#/project/p2';
  await wait(500);
  const btn=win.document.getElementById('pp-clog-btn');
  ok('the footer Changelog button renders', !!btn);
  ok('the second dock renders hidden', !!win.document.getElementById('pp-clog')
    &&!win.document.querySelector('#page .pg.dash.clog-on'));
  btn.click();
  await wait(400);
  ok('the toggle swaps to the changelog dock', !!win.document.querySelector('#page .pg.dash.clog-on'));
  win.document.getElementById('pp-clog-close').click();
  ok('Back to editing swaps back', !win.document.querySelector('#page .pg.dash.clog-on'));

  console.log('\ntest-v1190: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
