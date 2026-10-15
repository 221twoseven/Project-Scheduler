/* Phase 3.5 (REV85) — the fourth exit (owner decision 2026-08-27): an × at the
   right edge of the project pages' breadcrumb bar, same action as Done/Esc.
   Asserted on BOTH the saved page and the New Project draft (the REV49 lesson).
   Run: node tests/test85.js index.html */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(savedPage,700);
},1300);

function savedPage(){
  sec('saved page · the × exits to the timeline');
  const x=doc.getElementById('pp-x');
  ok('the × sits on the breadcrumb bar', !!x&&!!x.closest('.dash-top'));
  click(x);
  setTimeout(()=>{
    ok('it left the project page', E("ROUTE.view")!=='project', E("ROUTE.view"));
    setTimeout(draftPage,300);
  },350);
}

function draftPage(){
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('draft page · same ×, leaves without creating');
    const x=doc.getElementById('pp-x');
    ok('the × sits on the draft breadcrumb bar too', !!x&&!!x.closest('.dash-top'));
    const n=E('ST.projects.length');
    click(x);
    setTimeout(()=>{
      ok('it left the draft page', E("ROUTE.view")!=='project', E("ROUTE.view"));
      ok('no project was created', E('ST.projects.length')===n);
      done();
    },350);
  },700);
}

setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
