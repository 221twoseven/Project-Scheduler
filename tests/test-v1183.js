/* v1.18.3 — child-first deletes in spSync (2026-09-02, from the live "TBD lane" orphan):
   deleting a project used to queue the project-row DELETE before its task DELETEs, so a
   run dying mid-queue stranded task rows behind a gone project (they surface as a
   phantom crew lane in the Departments lens, label "?"). Now every DELETE runs after
   every upsert, children before the project — a mid-queue death leaves a visibly
   incomplete project instead of invisible orphans.
   Run: node tests/test-v1183.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('dels.unshift')<0){
  console.log('test-v1183: skipped — pre-v1.18.3 build ('+FILE+')');
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
  projects:[mkProj('p1','Alpha',0)],
  tasks:[mkTask('t1','p1','fab','Sam',D(0),D(4)),mkTask('t2','p1','fin','Nick',D(5),D(9))],
  staff:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s),calls=()=>win.__spCalls;

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('mixed edit: upserts land before any delete');
  let n0=calls().length;
  E("saveState({projects:ST.projects.map(p=>({...p,client:'C2'})),tasks:ST.tasks.filter(t=>t.id!=='t2')})");
  await wait(400);
  let cs=calls().slice(n0);
  const pi=cs.findIndex(c=>c.method==='PATCH');
  const di=cs.findIndex(c=>c.method==='DELETE');
  ok('the edit PATCHed and the removed subtask DELETEd', pi>=0&&di>=0, pi+'/'+di);
  ok('the PATCH ran before the DELETE', pi>=0&&di>=0&&pi<di, pi+' vs '+di);
  ok('the DELETE hit ShopTimeline_Tasks', di>=0&&/ShopTimeline_Tasks\//.test(cs[di].url), di>=0?cs[di].url:'');

  sec('project delete: every child row DELETEs before the project row');
  n0=calls().length;
  E('saveState({projects:[],tasks:[],todos:[]})');
  await wait(400);
  cs=calls().slice(n0).filter(c=>c.method==='DELETE');
  const taskIdx=cs.map((c,i)=>/ShopTimeline_Tasks\//.test(c.url)?i:-1).filter(i=>i>=0);
  const projIdx=cs.map((c,i)=>/ShopTimeline_Projects\//.test(c.url)?i:-1).filter(i=>i>=0);
  ok('one task-row and one project-row DELETE went out', taskIdx.length===1&&projIdx.length===1,
     taskIdx.length+' tasks / '+projIdx.length+' projects');
  ok('the task row DELETEd before the project row',
     taskIdx.length&&projIdx.length&&Math.max(...taskIdx)<Math.min(...projIdx),
     'tasks@'+taskIdx.join(',')+' proj@'+projIdx.join(','));
  ok('nothing is left pointing at the gone project', E('ST.tasks.length')===0&&E('ST.projects.length')===0);

  console.log('\ntest-v1183: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
