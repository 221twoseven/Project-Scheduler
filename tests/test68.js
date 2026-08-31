/* REV68: the dashboard button + breadcrumb.
   - "My Dashboard" enters the composition in one click: Departments lens + person
     filter set to "me" + person panel; the button lights while it's showing.
   - Identity: meName() first; unresolved falls back to a one-time "who are you?"
     menu remembered on this device (ME_KEY); stale remembered names are ignored.
   - The panel header is an N1-style trail — Timeline › name — and Timeline (or ✕)
     unwinds to the home view, restoring the lens you came from.
   Skips on builds that predate the dashboard button.
   Run: node test68.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');
/* v1.2.0 (obj 1): the trail and the × moved off the dock header onto the #dash-bar. */
const V12=src.indexOf('dash-bar')>=0;
const HOME=V12?'db-all':'md-home', X=V12?'db-x':'md-close';

if(!/btn-dash/.test(src)){
  console.log('  SKIP  build predates the dashboard button (no btn-dash) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[
 {appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:D(45),
  status:'in-fabrication',projectManager:'Stan',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[
 {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-2),endDate:D(3),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('Unresolved identity: the one-time "who are you?" pick');
  /* harness account is user@example.com / "Sam" — no email or name match here */
  E("localStorage.removeItem(ME_KEY);PEOPLE=[{id:'a',name:'Nick',email:'',role:'',depts:['fab'],ooo:[]},{id:'b',name:'Kate',email:'',role:'',depts:['fab'],ooo:[]}];rebuildStaff();LENS='project';PERSON=null;render();");
  E("document.getElementById('btn-dash').click();");
  ok('the ask menu opens instead of guessing',!E("document.getElementById('dash-menu').classList.contains('hidden')"));
  ok('it lists the roster',E("document.querySelectorAll('#dash-menu .sm-item').length")===2);
  E("[...document.querySelectorAll('#dash-menu .sm-item')].find(x=>x.textContent==='Nick').click();");
  ok('picking remembers on this device',E("localStorage.getItem(ME_KEY)")==='Nick');
  ok('and enters the dashboard',E("LENS==='dept'&&PERSON==='Nick'&&document.body.classList.contains('me-dock-on')"));
  ok('the button lights up',E("document.getElementById('btn-dash').classList.contains('active')"));

  sec('Breadcrumb and the way back');
  ok('the trail renders',V12
     ?(!E("document.getElementById('dash-bar').classList.contains('hidden')")
       &&E("document.getElementById('db-name').textContent")==='My Dashboard · Nick'
       &&E("document.querySelector('#me-dock .md-hd .t').textContent")==='Nick')
     :(E("document.getElementById('md-home').textContent")==='Timeline'
       &&E("document.querySelector('#me-dock .md-hd .t').textContent")==='Nick'));
  E("document.getElementById('"+HOME+"').click();");
  ok('Timeline unwinds to the lens you came from',E("LENS==='project'&&PERSON===null"));
  ok('the dock and button switch off',!E("document.body.classList.contains('me-dock-on')")&&!E("document.getElementById('btn-dash').classList.contains('active')"));

  sec('Remembered pick: the second click goes straight in');
  E("document.getElementById('btn-dash').click();");
  ok('no menu this time',E("document.getElementById('dash-menu').classList.contains('hidden')"));
  ok('straight to the dashboard as Nick',E("LENS==='dept'&&PERSON==='Nick'"));
  E("document.getElementById('"+X+"').click();");
  ok('✕ exits the same way',E("LENS==='project'&&PERSON===null"));

  sec('meName beats the remembered pick; dept-lens entry stays dept on exit');
  E("PEOPLE=[{id:'r',name:'Robert',email:'user@example.com',role:'',depts:['pm'],ooo:[]},{id:'a',name:'Nick',email:'',role:'',depts:['fab'],ooo:[]}];rebuildStaff();LENS='dept';render();");
  E("document.getElementById('btn-dash').click();");
  ok('identity wins over the remembered name',E("PERSON")==='Robert');
  E("document.getElementById('"+HOME+"').click();");
  ok('entered from dept lens → exit stays in dept lens',E("LENS==='dept'&&PERSON===null"));

  sec('A stale remembered name is ignored');
  E("localStorage.setItem(ME_KEY,'Ghost');PEOPLE=[{id:'a',name:'Nick',email:'',role:'',depts:['fab'],ooo:[]}];rebuildStaff();");
  ok('rememberedMe() rejects names not on the roster',E("rememberedMe()")===null);

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
