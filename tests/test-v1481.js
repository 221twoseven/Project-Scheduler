/* v1.48.1 — review of #141/#142 (2026-10-13), two fixes to "Schedule still accurate":
   (1) a confirmation is a stamp, not an edit: stripStamps (the poll's "did anything really change?" test,
       which clears undo/redo when true) and the change log's CLOG_SKIP both ignore confirmedAt/confirmedBy;
   (2) the button never hides a parked failed save: the sync pill keeps its "not saved — click to retry"
       text when a save is still waiting, and only reads "synced" when nothing is.
   Run: node tests/test-v1481.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const P={appId:'p1',Title:'Job One',client:'Acme',jobCode:'A1',deadline:'2027-03-01',status:'auto',projectManager:'Sam',
  activeDepartments:'["td"]',createdAt:'2026-07-01',sortIndex:0};
const T={appId:'t1',projectId:'p1',department:'td',assignee:'',startDate:'2027-01-04',endDate:'2027-01-08',
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''};
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]'};

const dom=boot(FILE,{data:{projects:[P],tasks:[T],staff:[SAM],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const pill=()=>doc.getElementById('sync-pill');

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('(1) a confirmation is a stamp, not an edit');
  ok('stripStamps ignores confirmedAt / confirmedBy',
    E("stripStamps({projects:[{id:'a',name:'x',confirmedAt:'2026-10-13T10:00:00Z',confirmedBy:'Kim'}]})")
      ===E("stripStamps({projects:[{id:'a',name:'x'}]})"));
  ok('a real field still counts',
    E("stripStamps({projects:[{id:'a',name:'x'}]})")!==E("stripStamps({projects:[{id:'a',name:'y'}]})"));
  ok('the change log skips them',E("!!(CLOG_SKIP.confirmedAt&&CLOG_SKIP.confirmedBy)"));
  /* the poll path: undo history survives a colleague's confirmation arriving */
  E("saveState({...ST,projects:ST.projects.map(p=>({...p,client:'Acme 2'}))})");await wait(300);
  const u0=E('UNDO_STACK.length');
  ok('an edit made undo history',u0>0,u0);
  const wipe=E(`(()=>{const fresh={projects:ST.projects.map(p=>({...p,confirmedAt:'2026-10-13T10:00:00Z',confirmedBy:'Kim'})),tasks:ST.tasks,todos:ST.todos||[],events:ST.events||[]};
    return stripStamps(fresh)!==stripStamps({projects:ST.projects,tasks:ST.tasks,todos:ST.todos||[],events:ST.events||[]});})()`);
  ok('the poll\'s wipe test says "no real change" for a colleague\'s confirmation',wipe===false);

  sec('(2) the button never hides a parked failed save');
  E("ST={...ST,projects:ST.projects.map(p=>({...p,updatedAt:new Date(Date.now()-30*864e5).toISOString()}))};ST.tasks.forEach(t=>t.updatedAt=new Date(Date.now()-30*864e5).toISOString())");
  win.location.hash='#/project/p1';await wait(700);
  ok('the stale project offers the button',!!q('#pp-confirm'));
  E("PENDING_SYNC={old:ST};setSync('err','not saved — click to retry')");
  q('#pp-confirm').click();await wait(300);
  ok('with a save parked, the pill still says "not saved — click to retry"',/not saved — click to retry/.test(pill().textContent)&&pill().className==='err',pill().className+' '+pill().textContent);
  ok('and the confirmation still landed',E("!!ST.projects.find(p=>p.id==='p1').confirmedAt"));
  E("PENDING_SYNC=null;ST={...ST,projects:ST.projects.map(p=>{const{confirmedAt,confirmedBy,...r}=p;return r;})};renderProjectPage()");await wait(100);
  q('#pp-confirm').click();await wait(300);
  ok('with nothing parked, it reads "synced"',/synced/.test(pill().textContent)&&pill().className==='ok',pill().textContent);

  done();
}
