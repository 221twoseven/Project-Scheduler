/* v1.52.0 — stable IDs, item 28 (a): the names stay; each project, phase and note also
   stores which person or client every name means, in a `refs` column.
   R1 the column is probed once; a list without it never sees the field ·
   R2 a name with a ref reads as that person's or client's current name (a rename carries) ·
   R3 a ref whose person is gone keeps its name; refs stay out of ST ·
   R4 every save writes the names plus refs; only unambiguous matches get an ID; free-text
      departments are skipped ·
   R5 a rename on People or Clients reaches the records at once, writes nothing to them, and
      clears undo ·
   R6 backfillRefs(): the dry run lists unmatched names and writes nothing; (true) writes the
      refs column only ·
   R7 the saved project page and the New Project draft (the REV49 lesson).
   Run: node tests/test-v1520.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const J=o=>JSON.stringify(o);

/* Sam Smith was renamed Sam Jones on People after his refs were written; Acme was renamed
   Acme Corp on Clients. "Ghost" is a ref to someone no longer on the roster. Two Alexes make
   a bare "Alex" ambiguous. */
const staff=[
  {appId:'st1',Title:'Sam Jones',depts:'["pm"]',ooo:'[]'},
  {appId:'st2',Title:'Alex Kim',depts:'["td"]',ooo:'[]'},
  {appId:'st3',Title:'Alex Lee',depts:'["td"]',ooo:'[]'},
  {appId:'st4',Title:'Rita Moreno',depts:'["fab"]',ooo:'[]'}];
const clients=[{Title:'Acme Corp'},{Title:'Birch & Co'}]; /* spIds sp0, sp1 */
const projects=[
  {appId:'p1',Title:'Lobby Wall',client:'Acme',jobCode:'A1',deadline:'2026-12-04',status:'in-fabrication',
   projectManager:'Sam Smith',drafter:'Alex',leadFab:'Ghost',activeDepartments:'["pm","td","install"]',
   createdAt:'2026-10-01',sortIndex:0,
   refs:J({people:{'Sam Smith':'st1',Ghost:'st9'},client:{Acme:'sp0'}})},
  {appId:'p2',Title:'Window Bay',client:'Birch & Co',jobCode:'B1',deadline:'2026-12-18',status:'in-fabrication',
   projectManager:'Rita Moreno',drafter:'Nobody Known',leadFab:'',activeDepartments:'["pm","other"]',
   createdAt:'2026-10-01',sortIndex:1}];
const task=(id,p,d,a,s,e,refs)=>({appId:id,projectId:p,department:d,assignee:a,startDate:s,endDate:e,
  estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:'',...(refs?{refs:J(refs)}:{})});
const tasks=[
  task('t1','p1','pm','Sam Smith','2026-11-02','2026-12-04',{people:{'Sam Smith':'st1'}}),
  task('t2','p1','td','Alex','2026-11-09','2026-11-13'),
  task('t3','p1','install','["Sam Smith","Rita Moreno"]','2026-12-01','2026-12-03',{people:{'Sam Smith':'st1'}}),
  task('t4','p2','other','Sam Smith','2026-11-16','2026-11-18')]; /* free text: a label, not a person */
const todos=[{appId:'d1',projectId:'p1',Title:'Order glass',assignees:'["Sam Smith"]',department:'',
  refs:J({people:{'Sam Smith':'st1'}})}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos,clients},todosList:true,clientsList:true,
  /* Projects and Tasks carry the column; Tasks2 doesn't (R1) */
  columns:{ShopTimeline_Projects:['Title','refs'],ShopTimeline_Tasks:['refs'],ShopTimeline_Tasks2:['Title']}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const X=s=>JSON.parse(E('JSON.stringify('+s+')'));
const P=id=>X('ST.projects.find(p=>p.id==="'+id+'")');
const T=id=>X('ST.tasks.find(t=>t.id==="'+id+'")');
const D=id=>X('ST.todos.find(t=>t.id==="'+id+'")');
const calls=()=>win.__spCalls;
const writes=list=>calls().filter(c=>c.method!=='GET'&&c.url.includes('/lists/'+list+'/'));
const last=list=>writes(list).slice(-1)[0];
const fields=c=>c&&(c.body.fields||c.body); /* a POST wraps its fields; a PATCH sends them bare */
const change=el=>{el.dispatchEvent(new win.Event('input',{bubbles:true}));el.dispatchEvent(new win.Event('change',{bubbles:true}));};

setTimeout(stageRead,1500);

function stageRead(){
  sec('R1 — the column probe');
  ok('the probe finds refs on Projects and Tasks, not on Tasks2',J(X('REFS_OK'))===J({proj:true,task:true,todo:false}),J(X('REFS_OK')));
  ok('it asks each list once',calls().filter(c=>/\/columns/.test(c.url)).length===3);

  sec('R2 — a ref\'d name reads as the current name');
  const p1=P('p1');
  ok('the project manager reads Sam Jones (renamed since)',p1.projectManager==='Sam Jones',p1.projectManager);
  ok('the client reads Acme Corp (renamed since)',p1.client==='Acme Corp',p1.client);
  ok('the PM phase\'s crew follows',T('t1').assignee==='Sam Jones',T('t1').assignee);
  ok('a crew list follows, its unref\'d name untouched',J(T('t3').assignee)===J(['Sam Jones','Rita Moreno']),J(T('t3').assignee));
  ok('a note\'s assignee follows',J(D('d1').who)===J(['Sam Jones']),J(D('d1').who));

  sec('R3 — what a ref never does');
  ok('a ref to someone no longer on the roster keeps its name',p1.leadFab==='Ghost',p1.leadFab);
  ok('an unref\'d ambiguous name is left alone',p1.drafter==='Alex',p1.drafter);
  ok('refs stay out of ST (a ref is never an edit)',E('ST.projects.concat(ST.tasks,ST.todos).every(r=>!("refs" in r))'));
  /* the poll's comparison: a fresh load must read exactly like the state on screen, or every
     tick would count as a teammate's edit and wipe undo */
  E('spLoad()').then(f=>{
    ok('a poll\'s fresh load reads the same as the screen (no phantom edit)',
      E('stripStamps')(f)===E('stripStamps({projects:ST.projects,tasks:ST.tasks,todos:ST.todos,events:ST.events})'));
    stageWrite();
  });
}

function stageWrite(){
  sec('R4 — a save writes the names plus refs');
  E("saveState({projects:ST.projects.map(p=>p.id==='p1'?{...p,jobCode:'A2'}:p),"
   +"tasks:ST.tasks.map(t=>t.id==='t4'?{...t,notes:'x'}:t),"
   +"todos:ST.todos.map(t=>t.id==='d1'?{...t,notes:'y'}:t)})");
  setTimeout(()=>{
    const f=fields(last('ShopTimeline_Projects'));
    ok('the project save sends the names as on screen',!!f&&f.projectManager==='Sam Jones'&&f.client==='Acme Corp',f&&J([f.projectManager,f.client]));
    ok('…plus refs: Sam Jones → st1, the client → sp0; ambiguous Alex gets none, and so does Ghost (off the roster)',
      !!f&&f.refs===J({people:{'Sam Jones':'st1'},client:{'Acme Corp':'sp0'}}),f&&f.refs);
    const tf=fields(last('ShopTimeline_Tasks'));
    ok('a free-text department\'s label is not a person (no ID)',!!tf&&tf.refs===J({people:{}}),tf&&tf.refs);
    const df=fields(last('ShopTimeline_Tasks2'));
    ok('a list without the column never sees the field',!!df&&!('refs' in df),df&&Object.keys(df).join(','));
    ok('the edits are on the undo stack',E('UNDO_STACK.length')>0);
    stageRename();
  },700);
}

function stageRename(){
  sec('R5 — a rename on People or Clients carries the records');
  const n0=writes('ShopTimeline_Projects').length+writes('ShopTimeline_Tasks').length+writes('ShopTimeline_Tasks2').length;
  E("savePeople(PEOPLE.map(p=>p.id==='st1'?{...p,name:'Samuel Jones'}:p))");
  ok('the project manager reads Samuel Jones at once',P('p1').projectManager==='Samuel Jones',P('p1').projectManager);
  ok('so do the phase crews and the note',T('t1').assignee==='Samuel Jones'&&J(T('t3').assignee)===J(['Samuel Jones','Rita Moreno'])&&J(D('d1').who)===J(['Samuel Jones']));
  ok('the rename clears undo (an undo would write the old names back without IDs)',E('UNDO_STACK.length')===0);
  E("saveClients(CLIENTS.map(c=>c.spId==='sp0'?{...c,name:'Acme Holdings'}:c))");
  ok('a renamed client carries its project',P('p1').client==='Acme Holdings',P('p1').client);
  setTimeout(()=>{
    const n1=writes('ShopTimeline_Projects').length+writes('ShopTimeline_Tasks').length+writes('ShopTimeline_Tasks2').length;
    ok('neither rename writes a project, phase or note',n1===n0,n0+' → '+n1);
    stageBackfill();
  },500);
}

function stageBackfill(){
  sec('R6 — backfillRefs()');
  const n0=calls().length;
  E('backfillRefs()').then(r=>{
    r=JSON.parse(J(r));
    const names=r.unmatched.map(u=>u.name).sort();
    ok('the dry run writes nothing',calls().length===n0,(calls().length-n0)+' calls');
    ok('it links the two records that need it (Window Bay; the crew with Rita)',r.link===2,r.link);
    ok('it lists the names it can\'t match: both bare Alexes, Nobody Known, and Ghost (off the roster)',J(names)===J(['Alex','Alex','Ghost','Nobody Known']),J(names));
    ok('the free-text label is neither linked nor listed',!r.unmatched.some(u=>u.name==='Sam Smith'));
    const w0=calls().length;
    E('backfillRefs(true)').then(r2=>{
      const ws=calls().slice(w0).filter(c=>c.method==='PATCH');
      ok('it writes two records',ws.length===2&&r2.written===2&&r2.failed===0,ws.length+' / '+J(r2));
      ok('each write sends the refs column and nothing else',ws.every(c=>J(Object.keys(c.body))===J(['refs'])),ws.map(c=>J(Object.keys(c.body))).join(' '));
      const p2=ws.find(c=>c.url.includes('/lists/ShopTimeline_Projects/'));
      ok('Window Bay gets Rita and its client',!!p2&&p2.body.refs===J({people:{'Rita Moreno':'st4'},client:{'Birch & Co':'sp1'}}),p2&&p2.body.refs);
      /* the crew is still stored as "Sam Smith" (never re-saved): refs alone go up, so the
         stored name must keep its ref beside the new ones */
      const t3=ws.find(c=>c.url.includes('/lists/ShopTimeline_Tasks/')),r3=t3&&JSON.parse(t3.body.refs).people;
      ok('the crew keeps its stored name\'s ref and gains Rita',!!r3&&r3['Sam Smith']==='st1'&&r3['Samuel Jones']==='st1'&&r3['Rita Moreno']==='st4',t3&&t3.body.refs);
      E('backfillRefs()').then(r3=>{
        ok('run again, nothing is left to link',r3.link===0,r3.link);
        stageSaved();
      });
    });
  });
}

function stageSaved(){
  sec('R7 — the saved project page');
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(()=>{
    const c=q('#pp-client');
    ok('[saved] the client field shows the current client name',!!c&&c.value==='Acme Holdings',c&&c.value);
    ok('[saved] the page shows the PM\'s current name',doc.body.textContent.includes('Samuel Jones'));
    stageDraft();
  },800);
}

function stageDraft(){
  sec('R7 — the New Project draft');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const dl=q('#pp-deadline');dl.value='2026-12-11';change(dl);
    const ck=q('#pp-depts input[data-dept="td"]');if(ck&&!ck.checked){ck.checked=true;change(ck);}
    setTimeout(()=>{
      q('#pp-name').value='Draft One';change(q('#pp-name'));
      q('#pp-client').value='Birch & Co';change(q('#pp-client'));
      const pm=q('#pp-r-pm input[value="Samuel Jones"]'); /* the PM roster: st1, renamed above */
      if(pm&&!pm.checked){pm.checked=true;change(pm);}
      const n0=writes('ShopTimeline_Projects').length;
      q('#pp-save').click();
      setTimeout(()=>{
        const post=writes('ShopTimeline_Projects').slice(n0).find(c=>c.method==='POST'&&c.body.fields.Title==='Draft One');
        const refs=post&&JSON.parse(post.body.fields.refs||'null');
        ok('[draft] Create sends refs with the PM\'s and the client\'s IDs',!!refs&&J(refs)===J({people:{'Samuel Jones':'st1'},client:{'Birch & Co':'sp1'}}),post&&post.body.fields.refs);
        done();
      },900);
    },500);
  },400);
}

setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
