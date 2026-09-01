/* v1.7.0 — Company Data pages (the 2026-09-01 Master Data UX Refactor handoff).
   People and Clients leave their management modals for first-class pages:
   #/people and #/clients render into #page on the project-page chrome pattern
   (trail bar, timeline toolbar row hidden), with a searchable record index, a
   read-first detail pane, and an explicit Edit state. Persistence is unchanged —
   saves clone the shared list, swap one record, and ride savePeople()/saveClients(),
   so the assertions here land on the same outgoing Graph calls as the modals made.
   Run: node tests/test-v170.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('renderCompanyPage')<0){
  console.log('test-v170: skipped — pre-v1.7.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[
  {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:D(40),
   status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'Nick',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0},
  {appId:'p2',Title:'Madison Facade',client:'Madison',jobCode:'M2',deadline:D(60),
   status:'complete',projectManager:'Sam',drafter:'',leadFab:'Kate',
   activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-20),sortIndex:1}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-2),endDate:D(5),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'t2',projectId:'p2',department:'fab',assignee:'Kate',startDate:D(1),endDate:D(8),
   estimatedDays:6,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const staff=[
  {appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''},
  {appId:'s2',Title:'Kate',depts:JSON.stringify(['fab']),
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
  sec('the People page — a place, not a modal');
  E("location.hash='#/people';applyRoute()");
  ok('#/people routes to its own view', E('ROUTE.view')==='people');
  ok('the body carries cd-route', doc.body.classList.contains('cd-route'));
  ok('#main hides, #page shows', q('#main').classList.contains('hidden')&&!q('#page').classList.contains('hidden'));
  ok('the trail reads All Projects › People', /All Projects/.test(q('#page .pg-trail').textContent)&&/People/.test(q('#page .pg-trail').textContent));
  ok('the timeline toolbar row is hidden by the route class', /body\.cd-route \.tb-timeline\{display:none\}/.test(src));
  ok('the source cue names the record count and SharePoint', /3 people · SharePoint/.test(q('.cd-src').textContent));
  ok('the management modals are gone from the DOM', !q('#staff-overlay')&&!q('#clients-overlay'));

  sec('read-first index and record');
  const rows=qa('.cd-row');
  ok('every roster person is a row', rows.length===3);
  ok('rows sort alphabetically', /Kate/.test(rows[0].textContent)&&/Sam/.test(rows[2].textContent));
  ok('Kate\'s row flags her upcoming OOO', /OOO/.test(rows[0].textContent));
  ok('no record selected → no form controls anywhere', qa('#cd-detail input').length===0);
  rows[1].click(); /* Nick — on p1's fab bar */
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
  input(q('#cd-q'),'ka');
  ok('search narrows the index', qa('.cd-row').length===1&&/Kate/.test(qa('.cd-row')[0].textContent));
  input(q('#cd-q'),'');
  ok('clearing the search restores the index', qa('.cd-row').length===3);

  sec('the page is not a filter state');
  E("PERSON='Nick'");
  ok('a person filter never flips the summary chrome here', E('dashOn()')===false);
  E("PERSON=''");

  sec('Esc walks out');
  doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Esc points the hash home', win.location.hash==='#/'||win.location.hash==='');
  E('applyRoute()');
  ok('…and the timeline is back', E('ROUTE.view')==='timeline'&&!doc.body.classList.contains('cd-route'));

  sec('the Clients page — same grammar');
  E("location.hash='#/clients';applyRoute()");
  ok('#/clients routes to its own view', E('ROUTE.view')==='clients');
  const crows=qa('.cd-row');
  ok('every client is a row, sorted', crows.length===2&&/Hermes/.test(crows[0].textContent));
  crows[0].click();
  ok('client read mode: alias and derived counts, no inputs',
     /HRM/.test(q('#cd-detail').textContent)&&/1 total/.test(q('#cd-detail').textContent)&&qa('#cd-detail input').length===0);
  q('#cdd-edit').click();
  input(q('#cde-alias'),'HER');
  q('#cde-save').click();
  await wait(120);
  ok('the alias PATCHed the clients list',
     calls().some(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Clients')&&c.body&&c.body.field_2==='HER'));
  q('#cd-add').click();
  input(q('#cde-name'),'Nike');
  q('#cde-save').click();
  await wait(120);
  ok('a new client POSTed to the clients list',
     calls().some(c=>c.method==='POST'&&c.url.includes('ShopTimeline_Clients')&&c.body&&c.body.fields&&c.body.fields.Title==='Nike'));
  ok('the directory grew', E('CLIENTS.length')===3);

  sec('navigation entries');
  ok('the toolbar menu reads Company Data', src.indexOf('Company Data <svg')>=0);
  ok('People & Availability became People', /id="mi-people"[^>]*>People</.test(src));
  ok('the menu items navigate instead of opening modals', /goPeople\(\)/.test(src)&&/goClients\(\)/.test(src));

  console.log('\ntest-v170: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
