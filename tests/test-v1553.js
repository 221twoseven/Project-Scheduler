/* v1.55.3 — item 98: a subtask's milestone on the project page's chart (owner, 2026-11-19:
   "Dragging doesn't drag to subtasks … reassigning in edit panel below works, but doesn't
   reflect on gantt"). A milestone riding on a subtask draws on that subtask's own row, and
   dragging a diamond onto a subtask's row hands it to that subtask. Asserted on the saved
   page (a draft has no subtask milestones) and on the outgoing Graph requests.
   Run: node tests/test-v1553.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Window Job',client:'C',jobCode:'AB123',deadline:D(40),status:'in-fabrication',
  projectManager:'',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['fab']),createdAt:D(-20),sortIndex:0}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'',startDate:D(-5),endDate:D(10),estimatedDays:10,
   ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p1',department:'fab',assignee:'',startDate:D(-2),endDate:D(3),estimatedDays:4,
   ticketNodes:'[]',notes:'',pinned:false,label:'Sample Set 1'}];
const events=[{appId:'e1',projectId:'p1',department:'fab',Title:'To production',date:D(1),notes:''}];
const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[],events},eventsList:true});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const calls=()=>win.__spCalls||[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mev=(type,tgt,x,y)=>tgt.dispatchEvent(new win.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y}));
const mark=()=>q('#npv-body .npv-ev[data-mk-id="e1"]');
const rowOf=m=>m?Math.round((parseFloat(m.style.top)-9.5)/E('NPV_ROWH')):null;
const planRow=id=>E("NPV_TOP+NPV_PLAN.findIndex(r=>r.bars.some(b=>b.t.id==='"+id+"'))");
const childRow=id=>E("NPV_TOP+NPV_PLAN.findIndex(r=>r.kind==='child'&&r.t.id==='"+id+"')");

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  E("location.hash='#/project/p1';applyRoute()");
  await wait(400);
  E("NPV_MSP='phase';NPV_MODE='gantt';NPV_OPEN.add('fab');npvRebuild()");
  await wait(100);

  sec('the subtask has its own row; a department milestone sits on the department\'s row');
  const sub=childRow('t2');
  ok('the open department shows the subtask on a row of its own',sub>=E('NPV_TOP'),sub);
  ok('the department milestone is drawn on the parent row',!!mark()&&rowOf(mark())===planRow('t1'),
    mark()&&rowOf(mark())+' vs '+planRow('t1'));

  sec('picked in the panel: the diamond moves to the subtask\'s row');
  E("ppSelect('t1')");
  const sel=q('.ag-i[data-ag-id="e1"] select[data-f="dept"]');
  ok('the panel lists the milestone with a phase picker',!!sel);
  if(sel){sel.value='sub:t2';sel.dispatchEvent(new win.Event('change',{bubbles:true}));}
  await wait(300);
  ok('the milestone rides on the subtask',E("(taskById('t2').ticketNodes||[]).some(n=>n.id==='e1')"));
  ok('its diamond is drawn on the subtask\'s row',!!mark()&&rowOf(mark())===sub,mark()&&rowOf(mark())+' vs '+sub);

  sec('dragged: back to the department row, then onto the subtask\'s row');
  const drag=async toRow=>{
    const m=mark();const from=rowOf(m),dy=(toRow-from)*E('NPV_ROWH');
    mev('mousedown',m,100,100);mev('mousemove',doc,100,100+dy);mev('mouseup',doc,100,100+dy);
    await wait(300);
  };
  await drag(planRow('t1'));
  ok('dropped on the parent row: a department milestone again',E("ST.events.some(e=>e.id==='e1'&&e.dept==='fab')")
    &&!E("(taskById('t2').ticketNodes||[]).some(n=>n.id==='e1')"));
  ok('…drawn on the parent row',!!mark()&&rowOf(mark())===planRow('t1'));
  const n0=calls().length;
  await drag(sub);
  ok('dropped on the subtask\'s row: the milestone rides on the subtask',
    E("(taskById('t2').ticketNodes||[]).some(n=>n.id==='e1')")&&!E("ST.events.some(e=>e.id==='e1')"));
  ok('…drawn on the subtask\'s row',!!mark()&&rowOf(mark())===sub,mark()&&rowOf(mark())+' vs '+sub);
  const cs=calls().slice(n0);
  ok('Graph: the Events row is deleted and the subtask\'s row carries the milestone',
    cs.some(c=>c.method==='DELETE'&&/ShopTimeline_Events/.test(c.url))
    &&cs.some(c=>/ShopTimeline_Tasks\b/.test(c.url)&&c.body&&String((c.body.fields||c.body).ticketNodes||'').includes('e1')),
    cs.map(c=>c.method+' '+c.url.split('/lists/')[1]).join(' ; '));
  ok('the panel\'s picker reads the subtask',E("(()=>{ppSelect('t2');const s=document.querySelector('.ag-i[data-ag-id=\"e1\"] select');return s&&s.value;})()")==='sub:t2');

  sec('a draft never makes a subtask milestone by drag');
  ok('the drag offers a subtask only on a saved job',/NPV_LIVE&&pr\.kind==='child'\?'sub:'\+pr\.t\.id:pr\.dept/.test(src));
  done();
}
