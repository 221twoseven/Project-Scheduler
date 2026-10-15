/* v1.48.3 — item 61, small simplifications from the 2026-10-12 audit:
   canonName remembers its answers until the roster changes; one PERSON_COLS table drives the Staff
   mappers (every optional column round-trips, tristate kept); the background poll pauses on the
   update check's updBusy() (owner OK 2026-10-14), so it also waits on New Project, a cursor in a
   toolbar field, or a parked client/settings save.
   Run: node tests/test-v1483.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const staff=[{appId:'s1',Title:'Sam Smith',email:'user@example.com',depts:'["pm"]',ooo:'[]'}];
const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('canonName remembers, and forgets when the roster changes');
  ok('a short name resolves', E("canonName('sam')")==='Sam Smith');
  ok('a pushed person invalidates the memo (the answer becomes ambiguous)',
     E("PEOPLE.push({id:'s2',name:'Sam Jones',depts:[],ooo:[]});canonName('sam')")==='sam');
  ok('a new roster array invalidates it too',
     E("PEOPLE=[{id:'s3',name:'Sam Lee',depts:[],ooo:[]}];canonName('sam')")==='Sam Lee');
  ok('an empty roster returns the input', E("(()=>{const k=PEOPLE;PEOPLE=[];const r=canonName('sam');PEOPLE=k;return r;})()")==='sam');

  sec('PERSON_COLS: every optional Staff column round-trips, tristate kept');
  const cols=JSON.parse(E("JSON.stringify(PERSON_COLS)"));
  ok('the table lists the 14 optional columns', cols.length===14, cols.length);
  const full=E(`JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'A',depts:['fab'],ooo:[],email:'a@x.co',phone:'555-555-0100',role:'R',
    ext:'204',admin:true,developer:true,feedbackRecipient:true,personalNotes:'n',status:'Active',nickname:'Ace',driver:false,availability:'available',
    schedule:{days:[1,2],start:'09:00',end:'17:00'},freelance:true,listeningTo:'t',listeningLink:'l',listeningVerb:'v',listeningShow:false})))`);
  const p=JSON.parse(full);
  ok('every set column comes back as set', p.ext==='204'&&p.admin===true&&p.developer===true&&p.feedbackRecipient===true
     &&p.personalNotes==='n'&&p.status==='Active'&&p.nickname==='Ace'&&p.driver===false&&p.availability==='available'
     &&p.schedule.start==='09:00'&&p.freelance===true&&p.listeningTo==='t'&&p.listeningLink==='l'&&p.listeningVerb==='v'&&p.listeningShow===false, full);
  const bare=JSON.parse(E("JSON.stringify(personToFields({id:'y',name:'B',depts:[],ooo:[]}))"));
  ok('an unset column is never written (no 400 on a site without it)',
     Object.keys(bare).sort().join()==='Title,appId,depts,email,ooo,phone,role', Object.keys(bare).join());
  const back=JSON.parse(E("JSON.stringify(fieldsToPerson({appId:'y',Title:'B'}))"));
  ok('a row without the columns reads them as null', cols.every(([k])=>back[k]===null)&&back.developer===false);
  ok('admin "dev" reads as admin + developer', E("(f=>f.admin&&f.developer)(fieldsToPerson({appId:'z',Title:'C',admin:'dev'}))")===true);
  ok('admin without developer writes "1"', E("personToFields({id:'z',name:'C',depts:[],ooo:[],admin:true}).admin")==='1');

  sec('the poll pauses on the update check\'s rule');
  ok('New Project counts as busy', E("(()=>{const k=ROUTE.creating;ROUTE.creating=true;const b=updBusy();ROUTE.creating=k;return b;})()")===true);
  ok('a parked client save counts as busy', E("(()=>{const k=PENDING_CLIENTS;PENDING_CLIENTS={old:[]};const b=updBusy();PENDING_CLIENTS=k;return b;})()")===true);
  ok('a cursor in a toolbar field counts as busy', E("(()=>{const i=document.createElement('input');document.getElementById('toolbar').appendChild(i);i.focus();const b=updBusy();i.remove();return b;})()")===true);
  ok('idle is not busy', E("(document.activeElement&&document.activeElement.blur&&document.activeElement.blur(),updBusy())")===false);

  done();
},1500);
