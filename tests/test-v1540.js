/* v1.54.0 — department phases stop storing the department's name as their crew (item 82).
   R1 a new project's shop-department phase (CNC) starts with no crew; roster departments stay
      empty, Installation a list, an "Other" row keeps its label (the draft, the REV49 lesson) ·
   R2 the saved project and the Departments view still name the department ·
   R3 search still finds a phase by its department ·
   R4 tidyDeptCrews(): the dry run lists every crew slot holding a department's name ("CNC",
      the old "Finishing") or a dash, keeps people, skips "Other" labels, writes nothing ·
   R5 tidyDeptCrews(true) saves them through the normal path, with undo.
   Run: node tests/test-v1540.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const J=o=>JSON.stringify(o);

const staff=[{appId:'st1',Title:'Sam Jones',depts:'["pm"]',ooo:'[]'},{appId:'st2',Title:'Rita Moreno',depts:'["cnc"]',ooo:'[]'}];
const projects=[{appId:'p1',Title:'Lobby Wall',client:'',jobCode:'',deadline:'2026-12-18',status:'in-fabrication',
  projectManager:'Sam Jones',drafter:'',leadFab:'',activeDepartments:'["pm","cnc","finish","fab","other"]',createdAt:'2026-10-01',sortIndex:0}];
const task=(id,d,a,s,e)=>({appId:id,projectId:'p1',department:d,assignee:a,startDate:s,endDate:e,estimatedDays:3,
  ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[
  task('c1','cnc','CNC','2026-11-02','2026-11-06'),            /* the department's own name */
  task('c2','cnc','CNC, Rita Moreno','2026-11-09','2026-11-11'), /* a person beside it stays */
  task('f1','finish','Finishing','2026-11-16','2026-11-20'),     /* Painting's old name */
  task('m1','fab','—','2026-11-02','2026-11-13'),                /* a dash: nobody */
  task('o1','other','Vacuum Former','2026-11-23','2026-11-25'),  /* an "Other" label is the bar's name */
  task('r1','cnc','Rita Moreno','2026-11-30','2026-12-02')];     /* people only: untouched */

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const ch=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const T=id=>JSON.parse(E('JSON.stringify(ST.tasks.find(t=>t.id==="'+id+'"))'));
const taskPatches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&c.url.includes('/lists/ShopTimeline_Tasks/'));

setTimeout(stageDraft,1500);

function stageDraft(){
  sec('R1 — a new project\'s phases (the draft)');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const dl=q('#pp-deadline');dl.value='2027-01-29';ch(dl);
    setTimeout(()=>{
      for(const d of ['cnc','install']){const c=q('#pp-depts input[data-dept="'+d+'"]');if(c&&!c.checked){c.checked=true;ch(c);}}
      setTimeout(()=>{
        q('#pp-name').value='Spring Vitrines';ch(q('#pp-name'));
        const pm=q('#pp-r-pm input[value="Sam Jones"]');if(pm&&!pm.checked){pm.checked=true;ch(pm);}
        const n0=win.__spCalls.length;
        q('#pp-save').click();
        setTimeout(()=>{
          const posts=win.__spCalls.slice(n0).filter(c=>c.method==='POST'&&c.url.includes('/lists/ShopTimeline_Tasks/')).map(c=>c.body.fields);
          const by=d=>posts.find(f=>f.department===d);
          ok('[draft] the CNC phase starts with no crew (was "CNC")',!!by('cnc')&&by('cnc').assignee==='',by('cnc')&&J(by('cnc').assignee));
          ok('[draft] Project Management stays empty, Installation an empty list',
            !!by('pm')&&by('pm').assignee===''&&!!by('install')&&by('install').assignee==='[]',J([by('pm')&&by('pm').assignee,by('install')&&by('install').assignee]));
          stageSaved();
        },900);
      },400);
    },400);
  },400);
}

function stageSaved(){
  sec('R2, R3 — an empty crew still names the department');
  E("ST={...ST,tasks:ST.tasks.map(t=>t.id==='c1'?{...t,assignee:''}:t)};location.hash='#/project/p1';applyRoute()");
  setTimeout(()=>{
    ok('[saved] the phase is labelled "CNC" on the project page',E("phaseLabel(ST.tasks.find(t=>t.id==='c1'))")==='CNC'&&doc.getElementById('npv-body').textContent.includes('CNC'));
    E("location.hash='#/';applyRoute();LENS='dept';render()");
    setTimeout(()=>{
      ok('the Departments view keeps the bar in the CNC lane',E("ROWS.some(r=>r.kind==='deptLane'&&r.dept==='cnc'&&r.label==='CNC'&&r.tasks.some(t=>t.id==='c1'))"));
      ok('search for "cnc" still finds it',E("(()=>{const f=FILTER;FILTER='cnc';const hit=taskMatch(ST.tasks.find(t=>t.id==='c1'));FILTER=f;return hit;})()"));
      E("ST={...ST,tasks:ST.tasks.map(t=>t.id==='c1'?{...t,assignee:'CNC'}:t)};LENS='project';render()");
      stageTidy();
    },400);
  },800);
}

function stageTidy(){
  sec('R4 — tidyDeptCrews(), the dry run');
  const n0=win.__spCalls.length;
  const r=JSON.parse(J(E('tidyDeptCrews()')));
  const row=pre=>r.find(x=>x.phase.startsWith(pre));
  ok('it writes nothing',win.__spCalls.length===n0,(win.__spCalls.length-n0)+' calls');
  ok('it lists four phases',r.length===4,J(r.map(x=>x.before)));
  ok('"CNC" → empty',r.some(x=>x.before==='CNC'&&x.after===''));
  ok('"CNC, Rita Moreno" → "Rita Moreno" (people stay)',r.some(x=>x.before==='CNC, Rita Moreno'&&x.after==='Rita Moreno'));
  ok('"Finishing" (Painting\'s old name) → empty',!!row('Painting')&&row('Painting').before==='Finishing'&&row('Painting').after==='');
  ok('a dash → empty',!!row('Main Shop Fab')&&row('Main Shop Fab').before==='—'&&row('Main Shop Fab').after==='');
  ok('the "Other" label and a people-only crew are left alone',!r.some(x=>x.before==='Vacuum Former'||x.before==='Rita Moreno'));

  sec('R5 — tidyDeptCrews(true)');
  const p0=taskPatches().length,u0=E('UNDO_STACK.length');
  E('tidyDeptCrews(true)');
  setTimeout(()=>{
    const sent=taskPatches().slice(p0).map(c=>c.body.assignee).sort();
    ok('the four phases save with their tidied crews',J(sent)===J(['','','','Rita Moreno']),J(sent));
    ok('…and on screen',T('c1').assignee===''&&T('c2').assignee==='Rita Moreno'&&T('f1').assignee===''&&T('m1').assignee===''
      &&T('o1').assignee==='Vacuum Former'&&T('r1').assignee==='Rita Moreno');
    ok('it\'s one undoable step',E('UNDO_STACK.length')===u0+1);
    ok('run again, nothing is left',E('tidyDeptCrews().length')===0);
    done();
  },900);
}

setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
