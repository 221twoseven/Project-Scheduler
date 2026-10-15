/* v1.48.0 — TODO item 6: show the last update, flag stale projects (owner wording 2026-10-13).
   The newest Graph stamp on a project or any of its phases/notes shows as "Last edited by Sam · Oct 12, 2:14 PM"
   on the project page header and under each project on the Meeting Sheet; a project with no edit in N days
   (App settings, Config key stale.days, default 14) gets a grey "Stale" chip in the sidebar, tooltip
   "No edits in 14 days". A completed project is never stale.
   Run: node tests/test-v1480.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const iso=d=>new Date(Date.now()-d*864e5).toISOString();

const P=(id,status)=>({appId:id,Title:'Job '+id,client:'Acme',jobCode:'A1',deadline:'2027-03-01',status:status||'auto',
  projectManager:'Stan',activeDepartments:'["td"]',createdAt:'2026-07-01',sortIndex:0});
const T=(id,pid)=>({appId:id,projectId:pid,department:'td',assignee:'',startDate:'2027-01-04',endDate:'2027-01-08',
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});

const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]'};
const dom=boot(FILE,{data:{projects:[P('fresh'),{...P('old'),projectManager:'Sam'},P('done','complete')],tasks:[T('t1','fresh'),T('t2','old'),T('t3','done')],staff:[SAM],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const chip=pid=>{const r=[...doc.querySelectorAll('.sb-row')].find(r=>r.textContent.indexOf('Job '+pid)>=0);return r&&r.querySelector('.sb-chip.stale');};

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  /* the harness stamps every row 2026-07-30; set our own: 'fresh' edited 2 days ago through a phase
     (its project row is old), 'old' 30 days ago, 'done' 30 days ago but complete */
  E(`(()=>{const at=(d)=>new Date(Date.now()-d*864e5).toISOString();
    const p=id=>ST.projects.find(x=>x.id===id);
    p('fresh').updatedAt=at(40);p('fresh').updatedBy='Peter';
    ST.tasks.find(t=>t.id==='t1').updatedAt=at(2);ST.tasks.find(t=>t.id==='t1').updatedBy='Sam';
    p('old').updatedAt=at(30);p('old').updatedBy='Peter';ST.tasks.find(t=>t.id==='t2').updatedAt=at(31);
    p('done').updatedAt=at(30);ST.tasks.find(t=>t.id==='t3').updatedAt=at(30);
    render();})()`);
  await wait(50);

  sec('the last edit counts the schedule, not just Setup');
  const le=E("JSON.stringify(projLastEdit(ST.projects.find(x=>x.id==='fresh')))");
  ok('a phase edit 2 days ago is the project\'s last edit, by its editor',JSON.parse(le).who==='Sam',le);

  sec('the Stale chip in the sidebar');
  ok('30 days without an edit: "Stale"',!!chip('old')&&chip('old').textContent==='Stale');
  ok('its tooltip says how long, and what to do',!!chip('old')&&chip('old').title==='No edits in 14 days. Open it to update the schedule, or confirm it’s still accurate.',chip('old')&&chip('old').title);
  ok('edited 2 days ago (through a phase): no chip',!chip('fresh'));
  ok('a completed project is never stale',!chip('done'));
  /* a new ST object, as every save makes one, so the status memo refreshes */
  const setSt=s=>E("ST={...ST,projects:ST.projects.map(x=>x.id==='old'?{...x,status:'"+s+"'}:x)};render()");
  setSt('on-hold');await wait(30);
  ok('nor is one On Hold (idle on purpose)',!chip('old'));
  setSt('auto');await wait(30);
  ok('back from On Hold, it is stale again',!!chip('old'));

  sec('the threshold is an App setting (stale.days)');
  E("CFG_RAW['stale.days']='45';render()");await wait(30);
  ok('at 45 days, the 30-day-old project is no longer stale',!chip('old'));
  E("CFG_RAW['stale.days']='7';render()");await wait(30);
  ok('at 7 days it is, and the tooltip says 7',!!chip('old')&&chip('old').title.indexOf('No edits in 7 days.')===0);
  E("CFG_RAW['stale.days']='junk';render()");await wait(30);
  ok('a bad value falls back to 14',E('staleDays()')===14);
  E("delete CFG_RAW['stale.days'];render()");

  sec('the project page header');
  win.location.hash='#/project/fresh';await wait(700);
  const cell=q('#pp-meta .m-upd');
  ok('the header has a "Last edited by" cell',!!cell&&/Last edited by/i.test(cell.querySelector('.k').textContent));
  ok('it reads "Sam · <Mon D>, <time>"',!!cell&&/^Sam · [A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2}/.test(cell.querySelector('.v').textContent),cell&&cell.querySelector('.v').textContent);
  win.location.hash='#/';await wait(300);
  E("location.hash='#/project/new';applyRoute()");await wait(700);
  ok('a new-project draft has no "Last edited" cell',!q('#pp-meta .m-upd'));
  win.location.hash='#/';await wait(300);

  sec('the Meeting Sheet, one line under each project');
  const sheet=E("(()=>{const w=buildMeetingSheet?buildMeetingSheet():null;return w?w.outerHTML:''})()");
  ok('each project carries "Last edited by …"',/mr-upd">Last edited by Sam · /.test(sheet)&&/mr-upd">Last edited by Peter · /.test(sheet));

  sec('the prompt: your stale projects on your own dashboard');
  E("enterDash('Sam')");await wait(200);
  const st=[...doc.querySelectorAll('#me-dock .md-stale')];
  ok('Sam, PM of the stale job, sees "Your stale projects"',/Your stale projects/.test(doc.getElementById('me-dock').textContent)&&st.length===1);
  ok('it lists that job, with "no edits since …"',!!st[0]&&/Job old/.test(st[0].textContent)&&/no edits since/.test(st[0].textContent));
  ok('a fresh job he doesn\'t PM is not on it',!st.some(b=>/Job fresh/.test(b.textContent)));
  st[0]&&st[0].click();await wait(700);
  ok('clicking it opens the project',E('ROUTE.view')==='project'&&E('ROUTE.id')==='old');
  E('exitDash&&exitDash()');

  sec('the action: "Schedule still accurate" on the stale project\'s page');
  const btn=()=>q('#pp-confirm');
  ok('the stale project offers the button',!!btn()&&btn().textContent==='Schedule still accurate');
  /* the list without the columns yet: the PATCH 400s naming them */
  const f0=win.fetch;
  win.fetch=function(url,init){
    if(init&&init.method==='PATCH'&&String(init.body).indexOf('confirmedAt')>=0)
      return Promise.resolve({ok:false,status:400,json:async()=>({}),text:async()=>"Field 'confirmedAt' is not recognized"});
    return f0.apply(this,arguments);};
  btn().click();await wait(200);
  /* v1.48.2 (item 48, PR 8): the one error rule — the sentence says a column is missing, Details names it */
  ok('without the columns it says what\'s missing',/Couldn’t record the confirmation: A column is missing from the list\./.test(doc.body.textContent)&&/confirmedAt/.test(doc.body.textContent));
  ok('and the project is still stale',E("isStale(ST.projects.find(x=>x.id==='old'))")===true);
  win.fetch=f0;
  const n0=win.__spCalls.length;
  btn().click();await wait(300);
  const pc=win.__spCalls.slice(n0).filter(c=>c.method==='PATCH');
  ok('one PATCH, on the project row',pc.length===1&&/ShopTimeline_Projects\/items\/[^/]+\/fields$/.test(pc[0].url),pc.map(c=>c.url).join());
  ok('it writes only confirmedAt and confirmedBy (Sam)',!!pc[0]&&Object.keys(pc[0].body).sort().join()==='confirmedAt,confirmedBy'&&pc[0].body.confirmedBy==='Sam');
  ok('the project is no longer stale',E("isStale(ST.projects.find(x=>x.id==='old'))")===false);
  ok('the button is gone',!btn());
  ok('the header says it was confirmed, keeping the real last edit',/confirmed [A-Z][a-z]{2} \d{1,2} by Sam/.test(q('#pp-meta .m-upd .v').textContent),q('#pp-meta .m-upd .v').textContent);
  E("ST={...ST,projects:ST.projects.map(x=>x.id==='old'?{...x,updatedAt:x.confirmedAt,updatedBy:'Sam'}:x)}");
  ok('the confirmation\'s own row stamp is not counted as an edit',
    E("projLastEdit(ST.projects.find(x=>x.id==='old')).at")<E("ST.projects.find(x=>x.id==='old').confirmedAt"));
  ok('a save never writes the confirmation',!('confirmedAt' in E("projToFields(ST.projects.find(x=>x.id==='old'))")));
  win.location.hash='#/';await wait(300);

  sec('App settings has the field');
  ok('the settings page renders a "Stale after N days" input',src.indexOf('id="as-stale"')>=0&&/saveConfigKey\('stale\.days'/.test(src));

  done();
}
