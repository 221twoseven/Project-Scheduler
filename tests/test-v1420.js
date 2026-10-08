/* v1.42.0 — a role change moves the project to the new holder (tracker #34, owner "proceed
   with fix" 2026-10-06, revised spec 2026-10-05):
   R1 a project whose PM changes leaves the old PM and appears under the new one · R2 the same
   for every role that owns a bar (PM → Project Management, Technical Designer → Technical
   Design, Project lead → Main Shop Fab; Fabricators owns none) · R3 every current view shows
   who holds the role now · R4 the Gantt keeps the old holder on the days up to the change.
   Q1 the change takes effect today · Q2 a bar crewed by a third person is left alone and a
   note offers the hand-over · Q3 a bar that already ended is history.
   Run: node tests/test-v1420.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function roleHandover(')<0){
  console.log('  SKIP  test-v1420: pre-v1.42.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
/* dates ride relative to today — the hand-over happens "today" */
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const P=(id,name,depts,extra)=>Object.assign({appId:id,Title:name,depts:JSON.stringify(depts),ooo:'[]',email:'',role:''},extra||{});
const staff=[P('s1','Kate',['pm']),P('s2','Sam',['pm'],{email:'user@example.com'}),P('s3','Dana',['td']),P('s4','Eve',['td']),
  P('s5','Lee',['fab']),P('s6','Mo',['fab']),P('s7','Zed',['fab']),P('s8','Ann',['fab'])];
const proj=(id,extra)=>Object.assign({appId:id,Title:'Job '+id,client:'C',jobCode:id.toUpperCase(),deadline:D(40),status:'in-fabrication',
  projectManager:'Kate',drafter:'Dana',leadFab:'Lee',fabricators:'',activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-40),sortIndex:0},extra||{});
const projects=[proj('p1'),proj('p2',{sortIndex:1})];
const T=(id,p,dept,who,s,e,extra)=>Object.assign({appId:id,projectId:p,department:dept,assignee:who,
  startDate:D(s),endDate:D(e),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},extra||{});
const tasks=[
  /* p1: the reporter's case — a Project Management bar with the PM's name baked in */
  T('pm1','p1','pm','Kate',-30,40),
  /* p2: umbrella bars (no crew of their own) and every edge the spec names */
  T('q-pm','p2','pm','',-20,30),
  T('q-tdold','p2','td','',-25,-15),                                   /* ended umbrella (Q3, R4) */
  T('q-td','p2','td','',10,15,{range:true}),                           /* starts later, umbrella */
  T('q-f1','p2','fab','',-10,20,{notes:'keep me',ticketNodes:JSON.stringify([{id:'n1',date:D(-2),target:'Past'},{id:'n2',date:D(5),target:'Future'}])}),
  T('q-fs','p2','fab','Lee',-3,3,{label:'Sub'}),                       /* a subtask crewed by the lead */
  T('q-fz','p2','fab','Zed',-4,8,{range:true}),                        /* a third person (Q2) */
  T('q-fa','p2','fab','Ann',-2,6,{label:'Cut'}),                       /* a fabricator's own subtask: never flagged */
  T('q-fend','p2','fab','',-30,-12,{range:true})];                     /* an ended umbrella range */

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const go=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const pick=(id,v,on)=>{const r=qa('#'+id+' input').find(i=>i.value===v);if(!r)return null;r.checked=on!==false;change(r);return r;};
const bars=(pid,dept)=>E('JSON.stringify(ST.tasks.filter(t=>t.projectId==='+JSON.stringify(pid)+'&&t.department==='+JSON.stringify(dept)+'))');
const B=(pid,dept)=>JSON.parse(bars(pid,dept));
const byId=id=>JSON.parse(E('JSON.stringify(ST.tasks.find(t=>t.id==='+JSON.stringify(id)+')||null)'));
const crew=t=>JSON.parse(E('JSON.stringify(barCrew('+JSON.stringify(t)+'))'));
/* who holds the department now, the way lanes, My Dashboard and the filter see it: bars still running */
const now=(pid,dept)=>[...new Set(B(pid,dept).filter(t=>t.endDate>=D(0)).flatMap(crew))].sort().join(',');

setTimeout(()=>{go('#/project/p1');setTimeout(pmNamed,800);},1300);

function pmNamed(){
  sec('R1 / R4 — the PM changes on a bar with the old PM\'s name on it (the reporter\'s case)');
  ok('setup: the Project manager list offers Kate (checked) and Sam', qa('#pp-r-pm input').some(i=>i.value==='Kate'&&i.checked)&&qa('#pp-r-pm input').some(i=>i.value==='Sam'&&!i.checked));
  pick('pp-r-pm','Sam');pick('pp-r-pm','Kate',false);
  ok('the project now names Sam as PM', E("ST.projects.find(p=>p.id==='p1').projectManager")==='Sam', E("ST.projects.find(p=>p.id==='p1').projectManager"));
  const all=B('p1','pm'),old=all.find(t=>t.id==='pm1'),nu=all.find(t=>t.id!=='pm1');
  ok('the bar splits on the day of the change: two Project Management bars', all.length===2, all.length);
  ok('R4: the part up to yesterday keeps Kate', !!old&&old.endDate===D(-1)&&old.startDate===D(-30)&&crew(old).join()==='Kate', old&&(old.startDate+'→'+old.endDate+' '+old.assignee));
  ok('R1: the part from today is Sam\'s, to the original end', !!nu&&nu.startDate===D(0)&&nu.endDate===D(40)&&crew(nu).join()==='Sam', nu&&(nu.startDate+'→'+nu.endDate+' '+nu.assignee));
  ok('the part from today continues as a range on the department\'s row', !!nu&&nu.range===true);
  ok('R3: every view that reads running bars sees Sam, not Kate', now('p1','pm')==='Sam', now('p1','pm'));
  /* the Departments lens builds its people lanes with laneRowsForSection — ask it directly */
  const lane=who=>JSON.parse(E("JSON.stringify((laneRowsForSection({kind:'group',id:'pmg',depts:['pm']}).find(l=>l.assignee==="+JSON.stringify(who)+")||{tasks:[]}).tasks.filter(t=>t.projectId==='p1'&&!t.__ghost).map(t=>t.startDate+'>'+t.endDate))"));
  ok('R3 / R4: Kate\'s Project Management lane keeps only the part up to yesterday', lane('Kate').join()===D(-30)+'>'+D(-1), lane('Kate').join());
  ok('R1: Sam\'s lane holds the project from today', lane('Sam').join()===D(0)+'>'+D(40), lane('Sam').join());
  setTimeout(()=>{ /* the sync runs after the save returns */
    const posts=win.__spCalls.filter(c=>c.method==='POST'&&/ShopTimeline_Tasks\/items/.test(c.url));
    ok('the saved split reached SharePoint: the new part is POSTed with its range flag', posts.some(c=>c.body&&c.body.fields&&c.body.fields.appId===(nu&&nu.id)&&c.body.fields.range===true),
       posts.map(c=>c.body&&c.body.fields&&c.body.fields.appId).join());
    ok('and the old part is PATCHed to end yesterday with Kate', win.__spCalls.some(c=>c.method==='PATCH'&&/ShopTimeline_Tasks\/items/.test(c.url)&&c.body&&c.body.endDate===D(-1)&&c.body.assignee==='Kate'));
    go('#/project/p2');setTimeout(umbrellas,800);
  },600);
}

function umbrellas(){
  sec('R1 / R4 — the PM changes on an umbrella bar (no crew of its own)');
  pick('pp-r-pm','Sam');pick('pp-r-pm','Kate',false);
  const all=B('p2','pm'),old=all.find(t=>t.id==='q-pm'),nu=all.find(t=>t.id!=='q-pm');
  ok('the umbrella splits: the past part is pinned to Kate by name', !!old&&old.endDate===D(-1)&&old.assignee==='Kate', old&&old.assignee);
  ok('the part from today stays an umbrella and follows the role to Sam', !!nu&&nu.assignee===''&&crew(nu).join()==='Sam', nu&&JSON.stringify(nu.assignee));

  sec('R2 — Technical Designer: an ended umbrella is history, a later one just follows');
  pick('pp-r-dr','Eve');pick('pp-r-dr','Dana',false);
  const tdo=byId('q-tdold'),tdl=byId('q-td');
  ok('Q3 / R4: the bar that ended keeps Dana (pinned, so the change can\'t rewrite it)', tdo.assignee==='Dana'&&tdo.endDate===D(-15), tdo.assignee);
  ok('a bar that starts later is not split and follows Eve', tdl.startDate===D(10)&&tdl.assignee===''&&crew(tdl).join()==='Eve', tdl.assignee);
  ok('no extra Technical Design bar was made', B('p2','td').length===2, B('p2','td').length);

  sec('R2 — Project lead (radio, one save after the last step)');
  pick('pp-r-lf','Mo');
  setTimeout(lead,500);
}

function lead(){
  ok('the project names Mo as Project lead', E("ST.projects.find(p=>p.id==='p2').leadFab")==='Mo', E("ST.projects.find(p=>p.id==='p2').leadFab"));
  const f1=byId('q-f1'),fab=B('p2','fab');
  const f1n=fab.find(t=>t.id!=='q-f1'&&t.range&&t.startDate===D(0)&&!t.label);
  ok('the primary umbrella splits: past part pinned to Lee', f1.endDate===D(-1)&&f1.assignee==='Lee', f1.endDate+' '+f1.assignee);
  ok('and its part from today is an umbrella range that follows Mo', !!f1n&&f1n.endDate===D(20)&&f1n.assignee===''&&crew(f1n).join()==='Mo', f1n&&JSON.stringify(f1n));
  ok('milestones stay on the part that covers their date', f1.ticketNodes.map(n=>n.id).join()==='n1'&&!!f1n&&f1n.ticketNodes.map(n=>n.id).join()==='n2',
     JSON.stringify(f1.ticketNodes)+' / '+JSON.stringify(f1n&&f1n.ticketNodes));
  ok('notes stay with the original bar', f1.notes==='keep me'&&!!f1n&&f1n.notes==='');
  const fs1=byId('q-fs'),fsn=fab.find(t=>t.id!=='q-fs'&&t.label==='Sub');
  ok('a subtask crewed by Lee splits too: Lee up to yesterday', fs1.endDate===D(-1)&&fs1.assignee==='Lee');
  ok('its part from today is Mo\'s and stays a subtask (not a range)', !!fsn&&fsn.startDate===D(0)&&fsn.endDate===D(3)&&fsn.assignee==='Mo'&&!fsn.range, fsn&&JSON.stringify(fsn));
  ok('Q3: the ended umbrella range is pinned to Lee', byId('q-fend').assignee==='Lee');
  ok('Q2: the bar crewed by Zed is untouched', byId('q-fz').assignee==='Zed'&&byId('q-fz').startDate===D(-4)&&byId('q-fz').endDate===D(8));

  sec('Fabricators owns no bar: changing it touches none');
  const before=bars('p2','fab');
  pick('pp-r-fb','Zed');
  ok('Fabricators changed', /Zed/.test(E("ST.projects.find(p=>p.id==='p2').fabricators")||''));
  ok('no Main Shop Fab bar changed', bars('p2','fab')===before);

  sec('Q2 — the note on a bar the change never reached, and its one-click hand-over');
  E('ppInspector()');
  const note=qa('#pp-depts .dhand').find(n=>/Zed/.test(n.textContent));
  ok('Main Shop Fab says the bar is held by Zed while Mo is the Project lead', !!note&&/held by Zed/.test(note.textContent)&&/Project lead is Mo/.test(note.textContent), note&&note.textContent);
  ok('nothing is said about bars that already follow the role', qa('#pp-depts .dhand').length===1, qa('#pp-depts .dhand').map(n=>n.textContent).join(' | '));
  const btn=note&&note.querySelector('button.hand');
  ok('the note carries a "Hand over from today" button', !!btn&&btn.textContent==='Hand over from today');
  if(btn)btn.click();
  const z=byId('q-fz'),zn=B('p2','fab').find(t=>t.id!=='q-fz'&&t.range&&t.startDate===D(0)&&t.endDate===D(8));
  ok('the click splits Zed\'s bar: Zed up to yesterday', z.endDate===D(-1)&&z.assignee==='Zed');
  ok('and Mo from today', !!zn&&zn.assignee==='Mo', zn&&JSON.stringify(zn));
  ok('the note is gone afterwards', !qa('#pp-depts .dhand').length);
  const fa=byId('q-fa');
  ok('a fabricator\'s subtask (crew chosen per subtask) is never flagged or handed over', fa.assignee==='Ann'&&fa.startDate===D(-2)&&fa.endDate===D(6), JSON.stringify(fa));
  const tops=[...new Set(B('p2','fab').filter(t=>t.endDate>=D(0)&&t.id!=='q-fa').flatMap(crew))].sort().join(',');
  ok('R3: Main Shop Fab\'s running bars now read Mo (Ann keeps only her own subtask)', tops==='Mo', tops);
  go('#/project/new');setTimeout(draft,800);
}

function draft(){
  sec('Draft page — the roles picked before Create are the ones on the saved bars');
  pick('pp-r-pm','Kate');pick('pp-r-pm','Sam');pick('pp-r-pm','Kate',false);
  doc.getElementById('pp-name').value='Handover Draft';
  doc.getElementById('pp-save').click();
  setTimeout(()=>{
    const pid=E("(ST.projects.find(p=>p.name==='Handover Draft')||{}).id");
    ok('the draft was created with Sam as PM', !!pid&&E("ST.projects.find(p=>p.name==='Handover Draft').projectManager")==='Sam');
    const pm=pid?B(pid,'pm'):[];
    ok('one Project Management bar, not split', pm.length===1, pm.length);
    ok('it follows the final PM, Sam', pm.length===1&&crew(pm[0]).join()==='Sam', pm[0]&&JSON.stringify(pm[0].assignee));
    console.log('\n'+'-'.repeat(46));
    console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
    process.exit(fail?1:0);
  },800);
}
