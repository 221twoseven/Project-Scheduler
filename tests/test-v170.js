/* v1.7.0 — Company Data pages (the 2026-09-01 Master Data UX Refactor handoff).
   People and Clients leave their management modals for first-class pages:
   #/people and #/clients render into #page on the project-page chrome pattern
   (trail bar, timeline toolbar row hidden), with a searchable record index, a
   read-first detail pane, and an explicit Edit state. Persistence is unchanged —
   saves clone the shared list, swap one record, and ride savePeople()/saveClients(),
   so the assertions here land on the same outgoing Graph calls as the modals made.
   v1.62.0 (item 87): People left Timeline for its own app (people/), as Clients did; the same
   grammar holds there, and the People checks run on it.
   Run: node tests/test-v170.js timeline/index.html  (or via tests/run.js) */
const {boot,bootPeople,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[
  {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:D(40),
   status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'Milo',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0},
  {appId:'p2',Title:'Madison Facade',client:'Madison',jobCode:'M2',deadline:D(60),
   status:'complete',projectManager:'Sam',drafter:'',leadFab:'Ines',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-20),sortIndex:1}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Milo',startDate:D(-2),endDate:D(5),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p2',department:'fab',assignee:'Ines',startDate:D(1),endDate:D(8),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const staff=[
  {appId:'s1',Title:'Milo',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s2',Title:'Ines',depts:JSON.stringify(['fab']),
   ooo:JSON.stringify([{id:'o1',start:D(3),end:D(6),note:'PTO'}]),email:'',role:''},
  {appId:'s3',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM'}];
const clients=[
  {Title:'Madison',field_2:'MAD'},
  {Title:'Hermes',field_2:'HRM'}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[],clients},clientsList:true});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const calls=()=>win.__spCalls;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const input=(el,v)=>{el.value=v;el.dispatchEvent(new win.Event('input',{bubbles:true}));};

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('the People app — a place, not a modal');
  E("location.hash='#/people';applyRoute()");
  ok('#/people sends you on to the People app (Timeline stays on the timeline)', E('ROUTE.view')==='timeline');
  ok('the timeline toolbar row is hidden by the route class (the Company Data pages that stay)', /body\.cd-route \.tb-timeline\{display:none\}/.test(src));
  ok('the management modals are gone from the DOM', !q('#staff-overlay')&&!q('#clients-overlay'));
  const pw=bootPeople({data:{projects,tasks,staff,todos:[]}}).window;
  await wait(1500);
  {
  const q=s=>pw.document.querySelector(s),qa=s=>[...pw.document.querySelectorAll(s)],E=s=>pw.eval(s),calls=()=>pw.__spCalls;
  const input=(el,v)=>{el.value=v;el.dispatchEvent(new pw.Event('input',{bubbles:true}));};
  ok('the header names the app: People', q('.ts-top .ts-app').textContent==='People');
  ok('the source cue names the record count and SharePoint', /3 people · SharePoint/.test(q('.cd-src').textContent));

  sec('read-first index and record');
  const rows=qa('.cd-row');
  ok('every roster person is a row', rows.length===3);
  ok('rows sort alphabetically', /Ines/.test(rows[0].textContent)&&/Sam/.test(rows[2].textContent));
  ok('Ines\'s row flags her upcoming OOO', /OOO/.test(rows[0].textContent));
  ok('no record selected → no form controls anywhere', qa('#cd-detail input').length===0);
  rows[1].click(); /* Milo — on p1's fab bar */
  ok('the record shows derived schedule context', /On 1 phase across 1 project/.test(q('#cd-detail').textContent));
  qa('.cd-row')[2].click(); /* Sam */
  ok('the record renders as information, not inputs', /PM/.test(q('#cd-detail').textContent)&&qa('#cd-detail input').length===0);
  ok('the record shows availability', /Available/.test(q('#cd-detail').textContent));
  ok('an explicit Edit action is offered', !!q('#cdd-edit'));

  sec('the explicit edit state, on the modal\'s save path');
  q('#cdd-edit').click();
  ok('Edit swaps the pane to form controls', qa('#cd-detail input').length>0);
  input(q('#cde-role'),'Boss');
  q('#cde-save').click();
  await wait(120);
  ok('the roster updated in memory', E("PEOPLE.find(p=>p.name==='Sam').role")==='Boss');
  ok('exactly Sam\'s item PATCHed the staff list',
     calls().some(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&c.body.role==='Boss'&&c.body.appId==='s3'));
  ok('the pane fell back to read mode with the new value', qa('#cd-detail input').length===0&&/Boss/.test(q('#cd-detail').textContent));

  sec('add and remove are record-level actions');
  q('#cd-add').click();
  ok('Add opens a blank editor in the pane', qa('#cd-detail input').length>0);
  input(q('#cde-name'),'Zed');
  q('#cde-save').click();
  await wait(120);
  ok('the new person POSTed to the staff list',
     calls().some(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Staff')&&c.body&&c.body.fields&&c.body.fields.Title==='Zed'));
  ok('the roster grew', E('PEOPLE.length')===4);
  const zrow=qa('.cd-row').find(r=>/Zed/.test(r.textContent));
  ok('the new person appears in the index', !!zrow);
  zrow.click();q('#cdd-edit').click();q('#cde-del').click();
  await wait(120);
  ok('the removal DELETEd from the staff list', calls().some(c=>c.method==='DELETE'&&c.url.includes('ShopTimeline_Staff')));
  ok('the roster is back to three', E('PEOPLE.length')===3);

  sec('index tools');
  input(q('#cd-q'),'ine');
  ok('search narrows the index', qa('.cd-row').length===1&&/Ines/.test(qa('.cd-row')[0].textContent));
  input(q('#cd-q'),'');
  ok('clearing the search restores the index', qa('.cd-row').length===3);
  }

  sec('the page is not a filter state');
  E("location.hash='#/changelog';applyRoute()"); /* v1.62.0: a Company Data page that stays in Timeline */
  E("PERSON='Milo'");
  ok('a person filter never flips the summary chrome here', E('dashOn()')===false);
  E("PERSON=''");

  sec('Esc walks out (of a Company Data page that stays: the Changelog)');
  E("location.hash='#/changelog';applyRoute()");
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Esc points the hash home', win.location.hash==='#/'||win.location.hash==='');
  E('applyRoute()');
  ok('…and the timeline is back', E('ROUTE.view')==='timeline'&&!doc.body.classList.contains('cd-route'));

  /* v1.58.0 (item 86): Clients left Timeline for its own app; the same grammar holds there. */
  sec('the Clients app — same grammar');
  E("location.hash='#/clients';applyRoute()");
  ok('#/clients sends you on to the Clients app (Timeline stays on the timeline)', E('ROUTE.view')==='timeline');
  const cw=boot(require('path').join(__dirname,'..','office','index.html'),{url:'https://example.github.io/Project-Scheduler/office/',
    data:{projects:[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',status:'in-fabrication',activeDepartments:'[]'}],tasks:[],staff:[],
      clients:[{Title:'Nordstrom',field_2:'NRD'},{Title:'Hermes',field_2:'HRM'}]},clientsList:true}).window;
  await wait(1500);
  const cq=s=>cw.document.querySelector(s),cqa=s=>[...cw.document.querySelectorAll(s)];
  const crows=cqa('#list .row');
  ok('every client is a row, sorted', crows.length===2&&/Hermes/.test(crows[0].textContent));
  crows[0].click();
  ok('client read mode: alias and derived counts, no inputs',
     /HRM/.test(cq('#rec').textContent)&&/1 in all/.test(cq('#rec').textContent)&&cqa('#rec input').length===0);
  cq('#edit').click();
  input(cq('#ce-alias'),'HER');
  cq('#ce-save').click();
  await wait(120);
  const ccalls=()=>cw.__spCalls;
  ok('the alias PATCHed the clients list',
     ccalls().some(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Clients')&&c.body&&c.body.field_2==='HER'));
  cq('#add').click();
  input(cq('#ce-name'),'Nike');
  cq('#ce-save').click();
  await wait(120);
  ok('a new client POSTed to the clients list',
     ccalls().some(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Clients')&&c.body&&c.body.fields&&c.body.fields.Title==='Nike'));
  ok('the directory grew', cw.eval('CLIENTS.length')===3);

  sec('navigation entries');
  ok('the toolbar menu reads Company Data', src.indexOf('Company Data <svg')>=0);
  ok('People left the menu for its own app (v1.62.0), as Clients did (v1.58.0)', !/id="mi-people"/.test(src)&&!/goPeople/.test(src)&&!/id="mi-clients"/.test(src)&&/id="mi-changelog"/.test(src));

  done();
}
