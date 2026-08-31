/* REV67: the person panel (me-dock) — Departments lens + person filter shows a
   bottom panel: who they are (role, depts, email), Working on (their bars, NOW tag),
   Checkpoints (future events on their projects), Tasks (their open to-dos), Time off.
   Hidden in the project lens and once the person clears; its ✕ clears the filter.
   Skips on builds that predate the panel.
   Run: node test67.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

const V12=src.indexOf('dash-bar')>=0; /* v1.2.0: exits live on the dashboard bar */
if(!/me-dock/.test(src)){
  console.log('  SKIP  build predates the person panel (no me-dock) — nothing to assert');
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
  activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:D(-30),sortIndex:0},
 {appId:'p2',Title:'Madison Facade',client:'Madison',jobCode:'M2',deadline:D(60),
  status:'in-design',projectManager:'Caroline',drafter:'Chris',leadFab:'Kate',
  activeDepartments:JSON.stringify(['pm','td']),createdAt:D(-20),sortIndex:1}];
const tasks=[
 {appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-2),endDate:D(3),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Armature build'},
 {appId:'t2',projectId:'p1',department:'fab',assignee:'Nick, Kate',startDate:D(7),endDate:D(12),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t3',projectId:'p2',department:'td',assignee:'Chris',startDate:D(1),endDate:D(9),
  estimatedDays:7,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const events=[
 {appId:'e1',projectId:'p1',department:'fab',Title:'Client walkthrough',date:D(5),notes:''},
 {appId:'e2',projectId:'p1',department:'fab',Title:'Old checkpoint',date:D(-3),notes:''},
 {appId:'e3',projectId:'p2',department:'td',Title:'Madison review',date:D(6),notes:''}];
const todos=[
 {appId:'k1',projectId:'p1',Title:'Order steel',assignees:JSON.stringify(['Nick']),dueDate:D(4),
  startDate:null,progress:'notstarted',priority:'high',notes:'',labels:'[]',checklist:'[]',createdBy:'',completedOn:null,completedBy:'',sortIndex:0},
 {appId:'k2',projectId:'p1',Title:'Done thing',assignees:JSON.stringify(['Nick']),dueDate:D(1),
  startDate:null,progress:'done',priority:'medium',notes:'',labels:'[]',checklist:'[]',createdBy:'',completedOn:D(-1),completedBy:'Nick',sortIndex:1},
 {appId:'k3',projectId:'p2',Title:'Not his task',assignees:JSON.stringify(['Chris']),dueDate:D(2),
  startDate:null,progress:'notstarted',priority:'medium',notes:'',labels:'[]',checklist:'[]',createdBy:'',completedOn:null,completedBy:'',sortIndex:2}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos,events},todosList:true,eventsList:true});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  E("PEOPLE=[{id:'a',name:'Nick',email:'nick@x.co',role:'Lead Fabricator',depts:['fab'],ooo:[{id:'o1',start:'"+D(10)+"',end:'"+D(14)+"',note:'PTO'}]},{id:'b',name:'Kate',email:'',role:'',depts:['fab'],ooo:[]},{id:'c',name:'Chris',email:'',role:'',depts:['td'],ooo:[]}];rebuildStaff();");

  sec('Panel appears with Departments lens + person filter');
  E("LENS='dept';PERSON='Nick';render();");
  ok('body gets me-dock-on',E("document.body.classList.contains('me-dock-on')"));
  ok('four sections render',E("document.querySelectorAll('#me-dock .ins-sec').length")===4,
     E("document.querySelectorAll('#me-dock .ins-sec').length"));
  ok('header shows name, role, dept and email',
     E("document.querySelector('#me-dock .md-hd').textContent").includes('Nick')&&
     E("document.querySelector('#me-dock .md-hd').textContent").includes('Lead Fabricator')&&
     E("document.querySelector('#me-dock .md-hd').textContent").includes('nick@x.co'));

  sec('Working on: his bars, NOW tag on the active one');
  const work=E("document.querySelectorAll('#me-dock .ins-sec')[0].textContent");
  ok('both his bars listed',work.includes('Armature build')&&work.includes('Hermes Windows'));
  ok('the active bar is tagged NOW',E("document.querySelectorAll('#me-dock .ins-sec')[0].querySelectorAll('.md-tag').length")===1);
  ok('other people’s bars stay out',!work.includes('Madison'));

  sec('Checkpoints: future events on his projects only');
  const cp=E("document.querySelectorAll('#me-dock .ins-sec')[1].textContent");
  ok('upcoming checkpoint on his project shows',cp.includes('Client walkthrough'));
  ok('past checkpoints and other projects stay out',!cp.includes('Old checkpoint')&&!cp.includes('Madison review'));

  sec('Tasks: his open to-dos only');
  const tk=E("document.querySelectorAll('#me-dock .ins-sec')[2].textContent");
  ok('his open task shows',tk.includes('Order steel'));
  ok('completed and other-people tasks stay out',!tk.includes('Done thing')&&!tk.includes('Not his task'));

  sec('Time off');
  ok('the PTO range shows',E("document.querySelectorAll('#me-dock .ins-sec')[3].textContent").includes('PTO'));

  sec('Visibility rules');
  E("LENS='project';render();");
  ok('hidden in the project lens',!E("document.body.classList.contains('me-dock-on')"));
  E("LENS='dept';PERSON=null;render();");
  ok('hidden with no person picked',!E("document.body.classList.contains('me-dock-on')"));
  E("PERSON='Nick';render();document.getElementById('"+(V12?'db-x':'md-close')+"').click();");
  ok('✕ clears the person filter and hides the panel',
     E('PERSON===null')&&!E("document.body.classList.contains('me-dock-on')"));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
