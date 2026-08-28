/* Bottom-dock collapse — a footer toggle hides the edit form (chart takes the window);
   the state is persisted in localStorage, so it survives a reload / new login session.
   Skips on builds that predate the toggle (the frozen REV50 reference).
   Run: node test92.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/pp-dock-toggle/.test(src)){
  console.log('  SKIP  build predates the dock-collapse toggle — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:'Weld-up'}];
const DATA={projects,tasks,staff:[],todos:[]};
const K='shopTimelineDockCollapsed';

/* --- dom 1: default (expanded), exercise the toggle + persistence writes --- */
const dom=boot(FILE,{data:DATA});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const dock=()=>doc.getElementById('pp-dock');
const toggle=()=>doc.getElementById('pp-dock-toggle');

setTimeout(()=>{
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,800);
},1300);

function stage1(){
  sec('the dock starts expanded, with a collapse toggle in the bottom-right corner');
  ok('the dock is present', !!dock());
  ok('it is not collapsed by default', !dock().classList.contains('collapsed'));
  ok('the dock carries the collapse toggle', !!toggle());
  ok('the toggle sits in its own dock corner, outside the footer button row',
     !!(toggle()&&toggle().closest('#pp-dock')&&!toggle().closest('.dash-foot')));
  ok('the edit form is present', !!q('#pp-insp'));
  ok('aria-expanded reads true', toggle().getAttribute('aria-expanded')==='true');

  sec('clicking the toggle collapses the form');
  click(toggle());
  setTimeout(()=>{
    ok('the dock is now collapsed', dock().classList.contains('collapsed'));
    ok('the footer (and toggle) stay', !!toggle()&&!!q('.dash-foot'));
    ok('aria-expanded flips to false', toggle().getAttribute('aria-expanded')==='false');
    ok('the state was written to localStorage', win.localStorage.getItem(K)==='1',
       String(win.localStorage.getItem(K)));

    sec('clicking again expands it');
    click(toggle());
    setTimeout(()=>{
      ok('the dock expands again', !dock().classList.contains('collapsed'));
      ok('localStorage records expanded', win.localStorage.getItem(K)==='0',
         String(win.localStorage.getItem(K)));
      stage2();
    },200);
  },200);
}

/* --- dom 2: a fresh load with the collapsed flag already set (a new session) --- */
function stage2(){
  sec('a fresh load restores the collapsed state (persists across sessions)');
  const dom2=boot(FILE,{data:DATA,localStorage:{[K]:'1'}});
  const w2=dom2.window,d2=w2.document;
  setTimeout(()=>{
    w2.location.hash='#/project/p1';
    w2.dispatchEvent(new w2.Event('hashchange'));
    setTimeout(()=>{
      const dk=d2.getElementById('pp-dock');
      ok('the reloaded page reads the persisted flag', w2.eval('DOCK_COLLAPSED')===true);
      ok('the dock renders collapsed from the start', !!dk&&dk.classList.contains('collapsed'));
      ok('the toggle shows the expand affordance', d2.getElementById('pp-dock-toggle')
         &&d2.getElementById('pp-dock-toggle').getAttribute('aria-expanded')==='false');
      done();
    },900);
  },1300);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},30000);
