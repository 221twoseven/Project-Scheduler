/* REV58: draft autosave. The new-project draft lives only in JS memory; a browser
   putting the tab to sleep reloads the page and everything typed reverted to defaults
   (beforeunload never fires on that path). The draft now stashes to sessionStorage on
   tab-hide/pagehide, restores when the draft route arrives fresh, and the stash is
   dropped on any accepted exit (Create or confirmed discard).
   Skips entirely on builds that predate REV58 (the frozen REV50 reference).
   Run: node test58.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/ppDraftUnstash/.test(src)){
  console.log('  SKIP  build predates REV58 (no draft autosave) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const KEY='shopTimelineDraft';
const route=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};

setTimeout(()=>{
  route('#/project/new');
  setTimeout(stage1,800);
},1300);

function stage1(){
  sec('The stash captures a dirty draft');
  const nm=doc.getElementById('pp-name');
  ok('the draft page mounted',!!nm);
  if(nm)nm.value='Sleepy Tab Project';
  E("NPV_EVENTS.push({id:'e1',name:'Delivery',date:'2026-09-01',dept:'fab'});"
   +"NPV_LINES.push({id:'l1',name:'Crating',dept:'fab',who:''});"
   +"ppDraftStash();");
  const raw=win.sessionStorage.getItem(KEY);
  ok('a dirty draft is written to sessionStorage',!!raw);
  const d=raw?JSON.parse(raw):{};
  ok('the stash carries the typed name',d.f&&d.f.name==='Sleepy Tab Project');
  ok('the stash carries chart state (event + line)',
     d.ev&&d.ev.length===1&&d.ln&&d.ln.length===1);

  sec('A reload of the draft route restores the stash');
  /* Emulate the tab-sleep reload: memory gone, hash still #/project/new, route arrives
     with ROUTE not already creating — the reset branch in renderProjectPage runs. */
  E("PP_FORM=null;PP_KEEP=false;NPV_EVENTS=[];NPV_LINES=[];"
   +"ROUTE={view:'timeline',id:null,creating:false};");
  E("ROUTE={view:'project',id:null,creating:true};renderProjectPage();");
  ok('the typed name is back',E('PP_FORM.name')==='Sleepy Tab Project');
  ok('the draft event is back',E('NPV_EVENTS.length')===1&&E("NPV_EVENTS[0].name")==='Delivery');
  ok('the draft line is back',E('NPV_LINES.length')===1);
  ok('the restored draft still counts as dirty',E('ppDraftDirty()')===true);
  const nm2=doc.getElementById('pp-name');
  ok('the form field renders the restored name',nm2&&nm2.value==='Sleepy Tab Project');

  sec('An accepted exit drops the stash — the next new project starts clean');
  route('#/');/* confirm is stubbed true: the discard is accepted */
  setTimeout(stage2,400);
}

function stage2(){
  ok('leaving the draft removed the stash',win.sessionStorage.getItem(KEY)===null);
  route('#/project/new');
  setTimeout(()=>{
    ok('a fresh draft is factory-default, not resurrected',E('PP_FORM.name')==='');
    ok('fresh draft chart state is empty',E('NPV_EVENTS.length')===0&&E('NPV_LINES.length')===0);

    sec('The saved-project page never stashes (REV49 lesson: assert both paths)');
    route('#/project/p1');
    setTimeout(()=>{
      E('ppDraftStash();');
      ok('stashing from a saved page writes nothing',win.sessionStorage.getItem(KEY)===null);
      done();
    },600);
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
