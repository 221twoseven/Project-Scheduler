/* Named subtasks must survive a save and a reload.
   Run: node test-label.js Timeline_47.html */
const {boot}=require('./harness');
const FILE=process.argv[2]||'Timeline_47.html';

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,700);
},1300);

function taskWrites(){
  return win.__spCalls.filter(c=>/ShopTimeline_Tasks(\/|$)/.test(c.url.split('?')[0])
    && (c.method==='POST'||c.method==='PATCH'));
}

function stage1(){
  sec('the field mapping carries label in both directions');
  ok('taskToFields emits a label',
     'label' in E("taskToFields({id:'z',department:'td',label:'VIP Room'})"),
     JSON.stringify(E("taskToFields({id:'z',department:'td',label:'VIP Room'})").label));
  ok('taskToFields writes the subtask name, not the department',
     E("taskToFields({id:'z',department:'td',label:'VIP Room'}).label")==='VIP Room');
  ok('Title stays the department name',
     E("taskToFields({id:'z',department:'td',label:'VIP Room'}).Title")==='Technical Design');
  ok('fieldsToTask reads it back',
     E("fieldsToTask({appId:'z',department:'td',label:'VIP Room'}).label")==='VIP Room');

  sec('naming a subtask through the bar context menu');
  const bar=doc.querySelector('#npv-body .npv-bar:not(.sum)');
  const cm=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:2});
  bar.dispatchEvent(cm);
  setTimeout(()=>{
    ok('right-click opened a menu on the bar', !!doc.getElementById('npv-menu'));
    const sub=doc.querySelector('#npv-menu button[data-act="sub"]');
    ok('the menu offers Add subtask', !!sub);
    click(sub);
    setTimeout(()=>{
      ok('a second bar now exists in Technical Design',
         E("ST.tasks.filter(t=>t.department==='td').length")===2,
         E("ST.tasks.filter(t=>t.department==='td').length")+'');
      ok('technical design became a parent row',
         E("NPV_PLAN.some(r=>r.kind==='parent'&&r.dept==='td')"));
      ok('the new bar is selected in the inspector', !!doc.getElementById('ins-name'));

      const before=taskWrites().length;
      const nm=doc.getElementById('ins-name');
      nm.value='VIP Room';
      nm.dispatchEvent(new win.Event('change',{bubbles:true}));
      setTimeout(()=>{
        sec('what actually went to SharePoint');
        const writes=taskWrites().slice(before);
        const withLabel=writes.filter(c=>(c.body&&c.body.fields&&c.body.fields.label==='VIP Room')
                                      || (c.body&&c.body.label==='VIP Room'));
        ok('a request was sent', writes.length>0, writes.length+' requests');
        ok('the request body carries label="VIP Room"', withLabel.length>0,
           JSON.stringify(writes.map(w=>w.body&&(w.body.fields||w.body)).slice(-2)));

        sec('reload from SharePoint');
        const round=E("fieldsToTask(taskToFields(ST.tasks.filter(t=>t.department==='td').slice(-1)[0]))");
        ok('the name survives the round trip', round.label==='VIP Room', round.label);
        ok('phaseLabel renders the subtask name',
           E("phaseLabel({department:'td',label:'VIP Room'})")==='VIP Room');
        ok('an unnamed bar still falls back to the department',
           E("phaseLabel({department:'td',label:''})")==='Technical Design');
        done();
      },450);
    },450);
  },350);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
