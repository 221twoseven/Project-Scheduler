/* v1.59.0 — item 92, the owner's first Clients review notes (2026-11-18): "This menu should
   scroll independently. Client info should have current projects with at-a-glance info for
   each, project history (with names, cost codes and dates, team assignments)."
   R1 the client list scrolls on its own and stays beside the record (sticky; a short box on a
   phone) · R2 each current project at a glance: cost code, start to due date, the phases
   running now and the next one, PM · Lead · Designer, its status pill, the link into Timeline
   · R3 the project history: every finished project newest first, with name (a link), cost
   code, dates and the whole team (PM, lead, designer, then the crew from its fabricators and
   its phases), and its empty line · R4 the history hides when the projects couldn't be read.
   Run: node tests/test-v1590.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {boot,suite}=require('./harness');
const {ok,done}=suite();
const APP=path.join(__dirname,'..','office','index.html');
const app=fs.readFileSync(APP,'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const clients=[{Title:'Alder Studio',field_2:'ALD'},{Title:'Common Ground',field_2:'CG'}];
const P=(id,name,code,status,extra)=>({appId:id,Title:name,client:'Alder Studio',jobCode:code,status,activeDepartments:'[]',...(extra||{})});
const projects=[
  P('p1','Holiday windows','ALD-040','auto',{projectManager:'Jamie Park',leadFab:'Sam Roe',drafter:'Ann Lee'}),
  P('p2','Lobby sign','ALD-041','auto'),
  P('p3','Spring pop-up','ALD-030','auto',{projectManager:'Jamie Park',leadFab:'Sam Roe',fabricators:'Ed Moss'}),
  P('p4','Winter display','ALD-020','complete',{projectManager:'Jamie Park',drafter:'Ann Lee'}),
  P('p5','Old kiosk','','complete'),
  P('p6','Paused kiosk','ALD-043','on-hold'),P('p7','Spring launch','ALD-042','auto')];
const T=(id,p,dept,s,e,who)=>({appId:id,projectId:p,department:dept,startDate:s,endDate:e,assignee:who||'',estimatedDays:1});
const tasks=[
  T('t1','p1','cnc','2026-11-10','2026-11-25'),T('t2','p1','metal','2026-11-15','2026-11-20'),
  T('t3','p1','finish','2026-11-30','2026-12-05'),T('t4','p1','install','2026-12-10','2026-12-12'),
  T('t5','p3','fab','2026-03-02','2026-03-20','Kim Ng'),T('t6','p3','install','2026-04-28','2026-05-01','["Lu Park","Kim Ng","Installation"]'),
  T('t7','p4','td','2025-12-01','2025-12-10','Ann Lee'),T('t8','p4','install','2026-01-15','2026-01-16'),
  T('t9','p6','cnc','2026-11-16','2026-11-20'),T('t10','p7','td','2027-01-12','2027-01-20')];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]',admin:'1'};
const KIM={appId:'s2',Title:'Kim Ng',email:'kim@example.com',depts:'[]',ooo:'[]',nickname:'Kimmy'};

sec('R1: the client list scrolls on its own');
const rule=(sel)=>(app.match(new RegExp('\\n'+sel.replace(/\./g,'\\.')+'\\{([^}]*)\\}'))||[])[1]||'';
const list=rule('.list');
ok('the list scrolls inside its own box', /overflow:auto/.test(list)&&/max-height:calc\(100vh - 88px\)/.test(list), list);
ok('…and stays beside the record as the page scrolls, under the header', /position:sticky/.test(list)&&/top:72px/.test(list));
ok('on a phone it sits above the record in a short box of its own', /@media \(max-width:760px\)\{[^\n]*\.list\{position:static;max-height:40vh\}/.test(app));

(async()=>{try{await run();}catch(e){ok('suite threw: '+(e&&e.stack||e),false);}done();})();

async function run(){
  const W=boot(APP,{url:'https://example.github.io/Project-Scheduler/office/',clientsList:true,now:'2026-11-18',
    data:{clients,projects,tasks,staff:[SAM,KIM]}}).window;
  await wait(1500);
  const d=W.document,q=s=>d.querySelector(s),qa=s=>[...d.querySelectorAll(s)],E=s=>W.eval(s),txt=el=>el?el.textContent.trim():'';
  const click=el=>el.dispatchEvent(new W.MouseEvent('click',{bubbles:true}));
  const rows=()=>qa('#list .row');
  click(rows()[0]);

  sec('R2: each current project at a glance');
  const pr=qa('#rec .proj');
  ok('the current projects, soonest due first', pr.map(a=>txt(a.querySelector('.nm'))).join('|')==='Holiday windows|Lobby sign|Paused kiosk|Spring launch', pr.map(a=>txt(a.querySelector('.nm'))).join('|'));
  ok('cost code · start to due date', txt(pr[0].querySelector('.meta'))==='ALD-040 · Nov 10 – Dec 12, 2026 (due)', txt(pr[0].querySelector('.meta')));
  ok('what\'s running now, then the next phase and its start', txt(pr[0].querySelector('.now'))==='Now: CNC, Metal Shop · Next: Painting, Nov 30', txt(pr[0].querySelector('.now')));
  ok('PM · Project lead · Technical Designer, in Timeline\'s words', txt(pr[0].querySelector('.team'))==='PM Jamie Park · Project lead Sam Roe · Technical Designer Ann Lee', txt(pr[0].querySelector('.team')));
  ok('its status as a pill, in Timeline\'s size and colours', txt(pr[0].querySelector('.st-pill'))==='Fabrication'&&pr[0].querySelector('.st-pill').dataset.st==='in-fabrication'
    &&/\.st-pill\{font-family:var\(--mono\);font-size:11px;/.test(app)&&/\.st-pill\[data-st="in-fabrication"\]\{background:#E1F5EE;color:#0F6E56\}/.test(app));
  ok('…and opens the project in Timeline', pr[0].getAttribute('href')==='../timeline/#/project/p1'&&/Open in Timeline →/.test(txt(pr[0])));
  ok('a project with no phases or team shows only what it has', txt(pr[1].querySelector('.meta'))==='ALD-041'&&!pr[1].querySelector('.now')&&!pr[1].querySelector('.team')
    &&txt(pr[1].querySelector('.st-pill'))==='Estimating');
  ok('an on-hold project shows no running phases beside its ON HOLD pill', !pr[2].querySelector('.now')&&txt(pr[2].querySelector('.st-pill'))==='On Hold');
  ok('a next phase in another year names the year; no due date reads "from …"',
    txt(pr[3].querySelector('.now'))==='Next: Technical Design, Jan 12, 2027'&&txt(pr[3].querySelector('.meta'))==='ALD-042 · from Jan 12, 2027', txt(pr[3]));

  sec('R3: the project history');
  const secs=qa('#rec .sec'),hist=secs.find(s=>txt(s.querySelector('h3'))==='Project history');
  ok('a "Project history" section after Current projects', !!hist&&secs.indexOf(hist)===2);
  ok('"3 finished, newest first"', txt(hist.querySelector('.sec-h .mut'))==='3 finished, newest first');
  ok('the columns: Project, Cost code, Dates, Team', [...hist.querySelectorAll('th')].map(txt).join('|')==='Project|Cost code|Dates|Team');
  const tr=[...hist.querySelectorAll('tbody tr')].map(r=>[...r.cells].map(txt));
  ok('every finished project, newest first', tr.map(r=>r[0]).join('|')==='Spring pop-up|Winter display|Old kiosk', tr.map(r=>r[0]).join('|'));
  ok('its cost code and dates (both years when they differ)', tr[0][1]==='ALD-030'&&tr[0][2]==='Mar 2 – May 1, 2026'&&tr[1][1]==='ALD-020'&&tr[1][2]==='Dec 1, 2025 – Jan 16, 2026', JSON.stringify(tr));
  ok('the whole team: PM, lead, then the crew from its fabricators and phases, each once, by nickname as in Timeline', tr[0][3]==='PM Jamie Park · Project lead Sam Roe · Crew: Ed Moss, Kimmy, Lu Park', tr[0][3]);
  ok('…the designer named once, not again as crew', tr[1][3]==='PM Jamie Park · Technical Designer Ann Lee', tr[1][3]);
  ok('nothing known reads as a dash', tr[2].slice(1).join('|')==='—|—|—');
  ok('each name opens the project in Timeline', hist.querySelector('tbody a').getAttribute('href')==='../timeline/#/project/p3');
  ok('the table\'s headers are column headers', [...hist.querySelectorAll('th')].every(th=>th.getAttribute('scope')==='col'));
  click(rows()[1]);
  const h2=qa('#rec .sec').find(s=>txt(s.querySelector('h3'))==='Project history');
  ok('a client with none: "No finished projects yet."', !!h2&&txt(h2.querySelector('p'))==='No finished projects yet.'&&!h2.querySelector('.sec-h .mut'));

  sec('R4: no history when the projects couldn\'t be read');
  E("PROJ_OK=false;PROJECTS=[];TASKS=[];SEL='Alder Studio';paint()"); /* a failed read leaves no projects */
  ok('the history hides; the record says why', !qa('#rec h3').some(h=>txt(h)==='Project history')&&/Couldn't read the projects from SharePoint\./.test(txt(q('#rec'))));
}
