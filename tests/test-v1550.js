/* v1.55.0 — item 28 (b): the name-matching helpers retire; the People merge moves records by ID.
   R1 canonName and scrubLegacyNames are gone ·
   R2 an unlinked abbreviation ("Dean B.", no ref) stays its own name: no guess at who it is ·
   R3 backfillRefs() matches the exact name, ignoring case ("sam jones"), and lists the abbreviation ·
   R4 the draft page: a new project's PM saves with its ref (the REV49 lesson) ·
   R5 the merge: a record linked to the duplicate moves even under an older spelling, the save
      links it to the kept person, and an unlinked name that isn't the duplicate's stays ·
   R6 the saved project page shows the kept name.
   v1.62.0 (item 87): the merge is the People app's (the owner's option a); R5 runs it there and
   reads what it sends SharePoint, and R6 boots Timeline afresh on the lists as they then stand.
   Run: node tests/test-v1550.js timeline/index.html  (or via tests/run.js) */
const {boot,bootPeople,suite}=require('./harness');
const {FILE,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const J=o=>JSON.stringify(o);
const ref=people=>({refs:J({people})});

const staff=[
  {appId:'st1',Title:'Dean Baek',depts:'["pm","fab"]',ooo:'[]'},
  {appId:'st2',Title:'Donghyun Baek',depts:'["fab"]',ooo:'[]'},   /* the duplicate */
  {appId:'st3',Title:'Sam Jones',depts:'["pm"]',ooo:'[]'}];
const projects=[{appId:'p1',Title:'Lobby Wall',client:'',jobCode:'',deadline:'2026-12-18',status:'in-fabrication',
  projectManager:'Sam Jones',drafter:'',leadFab:'D. Baek',activeDepartments:'["pm","fab"]',createdAt:'2026-10-01',sortIndex:0,
  ...ref({'Sam Jones':'st3','D. Baek':'st2'})}];
const task=(id,a,s,e,r)=>({appId:id,projectId:'p1',department:'fab',assignee:a,startDate:s,endDate:e,estimatedDays:3,
  ticketNodes:'[]',notes:'',pinned:false,label:'',...r});
const tasks=[
  task('t1','Donghyun Baek','2026-11-09','2026-11-13',ref({'Donghyun Baek':'st2'})),
  task('t2','Dean B.','2026-11-16','2026-11-18'),   /* never linked: an abbreviation */
  task('t3','sam jones','2026-11-19','2026-11-20')]; /* never linked: the exact name, other case */
const todos=[{appId:'d1',projectId:'p1',Title:'Order glass',assignees:'["Donghyun Baek"]',department:'',
  ...ref({'Donghyun Baek':'st2'})}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos},todosList:true,
  columns:{ShopTimeline_Projects:['refs'],ShopTimeline_Tasks:['refs'],ShopTimeline_Tasks2:['refs']}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const ch=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const X=s=>JSON.parse(E('JSON.stringify('+s+')'));
const P=id=>X('ST.projects.find(p=>p.id==="'+id+'")');
const T=id=>X('ST.tasks.find(t=>t.id==="'+id+'")');
const calls=()=>win.__spCalls;
const body=c=>c.body&&c.body.fields?c.body.fields:c.body; /* a POST wraps its fields, a PATCH sends them bare */

setTimeout(stageRetired,1500);

function stageRetired(){
  sec('R1 — the name-matching helpers are gone');
  ok('canonName is gone',E('typeof canonName')==='undefined');
  ok('scrubLegacyNames is gone',E('typeof scrubLegacyNames')==='undefined');

  sec('R2 — an unlinked abbreviation stays its own name');
  ok('"Dean B." is not read as Dean Baek',J(X("barCrew(ST.tasks.find(t=>t.id==='t2'))"))===J(['Dean B.']));
  ok('…on the bar either',E("assigneeText(ST.tasks.find(t=>t.id==='t2'))")==='Dean B.');
  ok('a linked older spelling still reads as its person',P('p1').leadFab==='Donghyun Baek',P('p1').leadFab);

  sec('R3 — backfillRefs() matches the exact name');
  const n0=calls().length;
  E('backfillRefs()').then(r=>{
    r=JSON.parse(J(r));
    ok('the dry run writes nothing',calls().length===n0);
    ok('it links "sam jones" (same name, other case) and nothing else',r.link===1,r.link);
    ok('it lists "Dean B." as unmatched',J(r.unmatched.map(u=>u.name))===J(['Dean B.']),J(r.unmatched));
    stageDraft();
  });
}

function stageDraft(){
  sec('R4 — the draft page: a new project\'s PM saves with its ref');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const dl=q('#pp-deadline');dl.value='2027-01-29';ch(dl);
    setTimeout(()=>{
      q('#pp-name').value='Spring Vitrines';ch(q('#pp-name'));
      const pm=q('#pp-r-pm input[value="Sam Jones"]');if(pm&&!pm.checked){pm.checked=true;ch(pm);}
      const m0=calls().length;
      q('#pp-save').click();
      setTimeout(()=>{
        const post=calls().slice(m0).find(c=>c.method==='POST'&&c.url.includes('/lists/ShopTimeline_Projects/'));
        const f=post&&body(post),r=f&&f.refs&&JSON.parse(f.refs);
        ok('[draft] the project saves with Sam Jones as PM',!!f&&f.projectManager==='Sam Jones',f&&f.projectManager);
        ok('[draft] …and his ref',!!r&&r.people['Sam Jones']==='st3',f&&f.refs);
        E("location.hash='#/';applyRoute()");
        setTimeout(stageMerge,400);
      },900);
    },400);
  },400);
}

function stageMerge(){
  sec('R5 — the merge moves records by ID (the People app)');
  /* The state a poll leaves when it loads while the duplicate is already off the roster:
     the project's lead is stored under its older spelling, still linked to the duplicate. */
  projects[0].leadFab='D. Baek';
  const pw=bootPeople({data:{projects,tasks,staff,todos},
    columns:{ShopTimeline_Projects:['refs'],ShopTimeline_Tasks:['refs'],ShopTimeline_Tasks2:['refs']}}).window;
  setTimeout(async()=>{
    const m0=pw.__spCalls.length;
    await pw.eval("cdMergePerson('st1','st2')"); /* harness confirm = yes */
    setTimeout(()=>{
      const all=pw.__spCalls.slice(m0),sent=all.filter(c=>c.method==='PATCH');
      const at=(list,id)=>{const c=sent.find(x=>x.url.includes('/lists/'+list+'/items/'+id+'/'));return c?body(c):null;};
      const pp=at('ShopTimeline_Projects','sp0'),t1=at('ShopTimeline_Tasks','sp0'),t2=at('ShopTimeline_Tasks','sp1'),d1=at('ShopTimeline_Tasks2','sp0');
      const refsOf=b=>b&&b.refs?JSON.parse(b.refs).people:{};
      ok('the duplicate leaves the roster',!pw.eval("PEOPLE.some(p=>p.id==='st2')")&&all.some(c=>c.method==='DELETE'&&c.url.includes('ShopTimeline_Staff')));
      ok('the project linked to it under "D. Baek" moves to Dean Baek',!!pp&&pp.leadFab==='Dean Baek',J(pp));
      ok('the phase moves',!!t1&&t1.assignee==='Dean Baek',J(t1));
      ok('the note moves',!!d1&&d1.assignees===J(['Dean Baek']),J(d1));
      ok('the unlinked "Dean B." stays as it is',!t2,J(t2));
      ok('the project saves the kept name, linked to the kept person',!!pp&&refsOf(pp)['Dean Baek']==='st1'&&refsOf(pp)['Sam Jones']==='st3',pp&&J(pp.refs));
      ok('the phase saves the same',!!t1&&refsOf(t1)['Dean Baek']==='st1',t1&&J(t1.refs));
      ok('no saved ref points at the duplicate',!sent.some(c=>{const x=body(c);return x.refs&&x.refs.includes('"st2"');}),J(sent.map(c=>body(c).refs)));
      /* what SharePoint now holds: the renames applied, the duplicate's row gone */
      Object.assign(projects[0],pp);Object.assign(tasks[0],t1);Object.assign(todos[0],d1);
      staff.splice(staff.findIndex(x=>x.appId==='st2'),1);
      stageSaved();
    },600);
  },1500);
}

function stageSaved(){
  sec('R6 — the saved project page shows the kept name');
  const w2=boot(FILE,{data:{projects,tasks,staff,todos},todosList:true,url:'https://example.github.io/shop-timeline/#/project/p1',
    columns:{ShopTimeline_Projects:['refs'],ShopTimeline_Tasks:['refs'],ShopTimeline_Tasks2:['refs']}}).window;
  setTimeout(()=>{
    const lead=[...w2.document.querySelectorAll('#pp-r-lf input')],on=lead.filter(i=>i.checked).map(i=>i.value);
    ok('[saved] Project lead has Dean Baek checked',J(on)===J(['Dean Baek']),J(on));
    ok('[saved] …and no box for the duplicate or its old spelling',!lead.some(i=>/Donghyun|D\. Baek/.test(i.value)),J(lead.map(i=>i.value)));
    done();
  },1600);
}

setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
