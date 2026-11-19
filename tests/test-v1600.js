/* v1.60.0 — item 93, projects from before Timeline in a client's history (owner, 2026-11-18:
   "Management will add pre-timeline projects if necessary"; where: "Yes, in Clients"; the
   wording: "Wording OK"). Clients owns ShopTimeline_PastProjects.
   R1 no list, no add button, the history as before · R2 they join the history by finish
   date, tagged "Before Timeline", only the client's own · R3 add one, in the owner's words,
   POSTed to the list · R4 change one (PATCH by its ID) · R5 remove one, asking first ·
   R6 a failed save stays on screen and retries from the pill.
   Run: node tests/test-v1600.js timeline/index.html  (or via tests/run.js) */
const path=require('path');
const {boot,suite}=require('./harness');
const {ok,done}=suite();
const APP=path.join(__dirname,'..','office','index.html');
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const clients=[{__id:'7',Title:'Alder Studio',field_2:'ALD'},{__id:'8',Title:'Common Ground',field_2:'CG'}];
const P=(id,name,code,status,extra)=>({appId:id,Title:name,client:'Alder Studio',jobCode:code,status,activeDepartments:'[]',...(extra||{})});
const projects=[P('p3','Spring pop-up','ALD-030','complete',{projectManager:'Jamie Park'}),P('p5','Old kiosk','','complete')];
const tasks=[{appId:'t5',projectId:'p3',department:'fab',startDate:'2026-03-02',endDate:'2026-05-01',assignee:'',estimatedDays:1}];
const past=[
  {__id:'3',Title:'Old storefront',clientId:7,jobCode:'ALD-005',startDate:'2019-04-01T05:00:00Z',endDate:'2019-06-14T05:00:00Z',team:'PM Jo Day, crew Al Fox'},
  {__id:'4',Title:'Mural',clientId:7},
  {__id:'5',Title:'Not theirs',clientId:8,endDate:'2020-01-01T05:00:00Z'}];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'[]',ooo:'[]',admin:'1'};

(async()=>{try{await run();}catch(e){ok('suite threw: '+(e&&e.stack||e),false);}done();})();

function page(pastList){
  const W=boot(APP,{url:'https://example.github.io/Project-Scheduler/office/',clientsList:true,pastList,now:'2026-11-18',
    data:{clients,projects,tasks,staff:[SAM],past}}).window;
  const d=W.document,q=s=>d.querySelector(s),qa=s=>[...d.querySelectorAll(s)],txt=el=>el?el.textContent.trim():'';
  const click=el=>el.dispatchEvent(new W.MouseEvent('click',{bubbles:true}));
  const type=(el,v)=>{el.value=v;el.dispatchEvent(new W.Event('input',{bubbles:true}));};
  const hist=()=>qa('#rec .sec').find(s=>txt(s.querySelector('h3'))==='Project history');
  const rows=()=>[...hist().querySelectorAll('tbody tr')].map(r=>[...r.cells].map(txt));
  const pick=name=>click(qa('#list .row').find(r=>txt(r.querySelector('b'))===name));
  const calls=()=>W.__spCalls.filter(c=>/ShopTimeline_PastProjects/.test(c.url));
  return {W,q,qa,txt,click,type,hist,rows,pick,calls};
}

async function run(){
  sec('R1: no list, no add button');
  {const A=page(false);await wait(1500);A.pick('Alder Studio');
    ok('no "+ Add a past project"', !A.q('#add-past'));
    ok('the history is Timeline\'s finished projects only', A.rows().map(r=>r[0]).join('|')==='Spring pop-up|Old kiosk', A.rows().map(r=>r[0]).join('|'));}

  const A=page(true),{W,q,qa,txt,click,type,hist,rows,pick,calls}=A;
  await wait(1500);pick('Alder Studio');

  sec('R2: they join the history');
  ok('"+ Add a past project" in the history\'s header', txt(q('#add-past'))==='+ Add a past project'&&!!hist().querySelector('.sec-h #add-past'));
  ok('newest first with Timeline\'s; undated last', rows().map(r=>r[0]).join('|')==='Spring pop-up|Old storefrontBefore Timeline|MuralBefore Timeline|Old kiosk', rows().map(r=>r[0]).join('|'));
  ok('"4 finished, newest first"', txt(hist().querySelector('.sec-h .mut'))==='4 finished, newest first');
  ok('its cost code, dates and team as entered', rows()[1].slice(1).join('|')==='ALD-005|Apr 1 – Jun 14, 2019|PM Jo Day, crew Al Fox', rows()[1].join('|'));
  ok('nothing entered reads as a dash', rows()[2].slice(1).join('|')==='—|—|—');
  const tag=hist().querySelector('tbody tr:nth-child(2) .st-pill');
  ok('tagged "Before Timeline"; its name is a button, not a Timeline link', txt(tag)==='Before Timeline'&&!!hist().querySelector('tbody tr:nth-child(2) button.link')&&!hist().querySelector('tbody tr:nth-child(2) a'));
  ok('another client\'s past project isn\'t shown', !rows().some(r=>/Not theirs/.test(r[0])));

  sec('R3: add one');
  click(q('#add-past'));
  ok('the form: "Past project"', txt(q('#rec h2'))==='Past project');
  ok('fields: Project name, Cost code, Started, Finished, Team', qa('#rec .field > span').map(txt).join('|')==='Project name|Cost code|Started|Finished|Team');
  ok('dates are date pickers; Team has the hint', q('#pe-start').type==='date'&&q('#pe-end').type==='date'&&q('#pe-team').placeholder==='PM, project lead, designer, crew');
  ok('a new one has no Remove; Cancel and Save', !q('#pe-del')&&txt(q('#pe-cancel'))==='Cancel'&&txt(q('#pe-save'))==='Save');
  click(q('#pe-save'));
  ok('no name: "Give the project a name first."', /Give the project a name first\./.test(txt(q('#toasts')))&&!!q('#pe-name'));
  let asked='';W.confirm=m=>{asked=m;return false;};
  type(q('#pe-name'),'Lobby desk');pick('Common Ground');
  ok('leaving mid-edit asks "Discard the changes to this past project?"', asked==='Discard the changes to this past project?'&&!!q('#pe-name'));
  W.confirm=m=>{asked=m;return true;};
  type(q('#pe-code'),' ALD-002 ');type(q('#pe-start'),'2018-03-05');type(q('#pe-end'),'2018-04-20');type(q('#pe-team'),'PM Jo Day');
  click(q('#pe-save'));await wait(200);
  const post=calls().find(c=>c.method==='POST');
  ok('"Lobby desk saved", in the history', /Lobby desk saved/.test(txt(q('#toasts')))&&rows().some(r=>r[0]==='Lobby deskBefore Timeline'&&r[1]==='ALD-002'&&r[2]==='Mar 5 – Apr 20, 2018'));
  ok('POSTed to the list: name, the client\'s ID, cost code, dates at noon UTC, team',
    !!post&&JSON.stringify(post.body.fields)==='{"Title":"Lobby desk","clientId":7,"jobCode":"ALD-002","team":"PM Jo Day","startDate":"2018-03-05T12:00:00Z","endDate":"2018-04-20T12:00:00Z"}', post&&JSON.stringify(post.body.fields));
  ok('…and takes the new item\'s ID', W.eval("PAST.some(y=>y.name==='Lobby desk'&&y.spId==='91')"));

  sec('R4: change one');
  click(hist().querySelector('tbody tr:nth-child(2) button.link'));
  ok('a click opens it, filled in', q('#pe-name').value==='Old storefront'&&q('#pe-start').value==='2019-04-01'&&q('#pe-team').value==='PM Jo Day, crew Al Fox');
  type(q('#pe-code'),'ALD-006');type(q('#pe-end'),'');click(q('#pe-save'));await wait(200);
  const patch=calls().find(c=>c.method==='PATCH');
  ok('PATCHes that row by its ID; a cleared date is cleared', !!patch&&/\/items\/3\/fields$/.test(patch.url)&&patch.body.jobCode==='ALD-006'&&patch.body.endDate===null, patch&&JSON.stringify(patch.body));

  sec('R5: remove one');
  click([...hist().querySelectorAll('tbody button.link')].find(b=>txt(b)==='Mural'));
  W.confirm=m=>{asked=m;return false;};click(q('#pe-del'));
  ok('Remove asks "Remove Mural from Alder Studio\'s history?"', txt(q('#pe-del'))==='Remove…'&&asked==='Remove Mural from Alder Studio\'s history?', asked);
  W.confirm=m=>{asked=m;return true;};click(q('#pe-del'));await wait(200);
  ok('…DELETEs it and says "Mural removed"', calls().some(c=>c.method==='DELETE'&&/\/items\/4$/.test(c.url))&&/Mural removed/.test(txt(q('#toasts')))&&!rows().some(r=>/^Mural/.test(r[0])));

  sec('R6: a failed save');
  const f0=W.fetch;W.fetch=(u,i)=>(i&&i.method&&i.method!=='GET')?Promise.resolve({ok:false,status:500,json:async()=>({}),text:async()=>'boom'}):f0(u,i);
  click(q('#add-past'));type(q('#pe-name'),'Window seat');click(q('#pe-save'));await wait(200);
  ok('the pill says "past projects not saved — click to retry"', /past projects not saved — click to retry/.test(txt(q('#sync-pill'))));
  ok('the row stays on screen; a reload is held back', rows().some(r=>/^Window seat/.test(r[0]))&&W.eval('updBusy()')===true);
  W.fetch=f0;const n=calls().length;click(q('#sync-pill'));await wait(200);
  ok('a click on the pill retries, and it lands', /synced/.test(txt(q('#sync-pill')))&&calls().slice(n).some(c=>c.method==='POST'&&c.body.fields.Title==='Window seat'));
  W.fetch=(u,i)=>(i&&i.method==='PATCH')?Promise.resolve({ok:false,status:500,json:async()=>({}),text:async()=>'boom'}):f0(u,i);
  const edit=v=>{click([...hist().querySelectorAll('tbody button.link')].find(b=>txt(b)==='Lobby desk'));type(q('#pe-code'),v);click(q('#pe-save'));};
  edit('ALD-008');await wait(200);W.fetch=f0;edit('ALD-009');await wait(200);
  const m=calls().length;click(q('#sync-pill'));await wait(200);
  ok('a retried change sends the row as it is now, not the older failed change', calls().slice(m).filter(c=>c.method==='PATCH').every(c=>c.body.jobCode==='ALD-009')&&calls().slice(m).some(c=>c.method==='PATCH'));
}
