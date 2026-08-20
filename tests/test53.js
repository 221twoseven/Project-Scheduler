/* REV53: calendar create menu + parity.
   The Gantt grew a create menu, selection and keyboard over REV48-50; the calendar had
   none of it. REV53 gives calendar mode its own hit-testing (every day cell carries its
   date in data-d — no linear axis to do arithmetic against), the same create menu on
   empty cells, the bar menu and selection on phase bands, and both draft and saved
   behaviour on band clicks.
   Skips entirely on builds that predate it (the frozen REV50 reference).
   Run: node test53.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('npvCalHit')<0){
  console.log('  SKIP  build predates REV53 (no calendar create menu) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'td1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-07',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Exterior Windows'},
 {appId:'f1',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-20',
  endDate:'2026-09-04',estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'i1',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const menu=()=>doc.getElementById('npv-menu');
const items=()=>[...(menu()?menu().querySelectorAll('button'):[])].map(b=>b.textContent.trim());
const byAct=a=>menu()&&menu().querySelector('button[data-act="'+a+'"]');
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
/* Calendar hits resolve from the event's target element, not from coordinates, so the
   tests dispatch on the actual cell/band — exactly what a real click delivers. */
const clickOn=el=>{
  el.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0}));
  el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
};
const rclick=el=>{
  const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2});
  el.dispatchEvent(ev);return ev;
};
const keyOn=(el,k,o)=>el.dispatchEvent(new win.KeyboardEvent('keydown',
  Object.assign({key:k,bubbles:true,cancelable:true},o||{})));
const cell=iso=>doc.querySelector('#npv-body .cal-col[data-d="'+iso+'"]');
const bands=()=>[...doc.querySelectorAll('#npv-body .cal-band.ph[data-i]')];

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{E("NPV_MODE='calendar';npvRender();");setTimeout(stage1,300);},700);
},1300);

function stage1(){
  sec('saved project — the calendar is a hit-testable surface');
  ok('day cells carry their date', !!cell('2026-08-26'));
  ok('date numbers carry it too', !!doc.querySelector('#npv-body .cal-dn[data-d="2026-08-26"]'));
  ok('phase bands carry their task index', bands().length>0, bands().length+' bands');
  const hit=E("npvCalHit({target:document.querySelector('.cal-col[data-d=\\'2026-08-26\\']')})");
  ok('a cell resolves to its date', hit&&hit.date==='2026-08-26', hit&&hit.date);
  ok('the calendar has no department axis, so no row', hit&&hit.row===null);

  sec('right-click on an empty cell opens the create menu');
  const ev=rclick(cell('2026-08-26'));
  ok('the browser menu is suppressed', ev.defaultPrevented);
  ok('a menu opened', !!menu());
  ok('it names the date', /Aug/.test((menu()||{textContent:''}).textContent),
     (menu()||{textContent:''}).textContent.slice(0,50));
  ok('it offers an event and a task', !!byAct('ev')&&!!byAct('tk'), items().join(' | '));
  ok('it offers no subtask, there being no department row', !byAct('sub'));
  ok('it offers to add a department', !!byAct('depts'));

  click(byAct('ev'));
  setTimeout(()=>{
    const evs=JSON.parse(E("JSON.stringify(liveEvents(ppProject()))"));
    ok('the event exists on the clicked date', evs.length===1&&evs[0].date==='2026-08-26',
       JSON.stringify(evs));
    ok('it saved onto a phase', E("ST.tasks.some(t=>(t.ticketNodes||[]).length>0)"));
    ok('the calendar draws it', !!doc.querySelector('#npv-body .cal-band.ev'));
    stage2();
  },350);
}

function stage2(){
  sec('right-click on a phase band opens the bar menu');
  E('ppSelect(null);');
  const b=bands().find(x=>x.textContent==='Exterior Windows');
  const ev=rclick(b);
  ok('the browser menu is suppressed', ev.defaultPrevented);
  ok('a menu opened on the band', !!menu());
  /* N11 (REV57): the bar menu is add-only — rename/duplicate/delete live in the
     inspector — and right-click never changes the selection. */
  ok('it offers only add-new actions (N11)',
     !!byAct('sub')&&!!byAct('ev')&&!!byAct('tk')&&!byAct('ren')&&!byAct('del'),
     items().join(' | '));
  ok('it carries the inline name field', !!menu().querySelector('.mn'));
  ok('right-clicking a band does not change the selection', E('PP_SEL')===null);

  sec('creating a subtask from the band menu seeds the phase\'s date');
  const before=E("ST.tasks.filter(t=>t.department==='td').length");
  click(byAct('sub'));
  setTimeout(()=>{
    ok('a bar was added to that department',
       E("ST.tasks.filter(t=>t.department==='td').length")===before+1);
    const n=JSON.parse(E("JSON.stringify(ST.tasks.filter(t=>t.department==='td').slice(-1)[0])"));
    ok('it starts on the phase\'s start date', n.startDate==='2026-08-03', n.startDate);
    E('ppSelect(null);');
    stage3();
  },350);
}

function stage3(){
  sec('click selects; keyboard walks the selection');
  const b=bands()[0];
  clickOn(b);
  setTimeout(()=>{
    ok('a plain click on a band selects its phase',
       E('PP_SEL')===E('NPV_TASKS['+b.dataset.i+'].id'), String(E('PP_SEL')));
    ok('the inspector shows the phase', E("PP_INSP")==='phase');
    const was=E('PP_SEL');
    keyOn(doc.body,'ArrowDown');
    setTimeout(()=>{
      ok('ArrowDown moves the selection', E('PP_SEL')!==was&&E('PP_SEL')!==null);
      ok('the ring followed onto a band', !!doc.querySelector('#npv-body .cal-band.pick'));

      sec('left-click stays edit-only (N11); Escape closes one layer');
      E('ppSelect(null);');
      clickOn(cell('2026-08-26'));
      setTimeout(()=>{
        ok('no menu on a plain left click (N11)', !menu());
        rclick(cell('2026-08-26'));
        setTimeout(()=>{
        ok('right-click opens it instead', !!menu());
        keyOn(doc.body,'Escape');
        setTimeout(()=>{
          ok('escape closes the menu', !menu());
          ok('escape did not also leave the page', E('ROUTE.view')==='project');
          stage4();
        },200);
        },250);
      },250);
    },250);
  },250);
}

function stage4(){
  sec('the draft page gets the same surface');
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    E("NPV_MODE='calendar';npvRender();");
    setTimeout(()=>{
      const c=doc.querySelector('#npv-body .cal-col[data-d]');
      ok('the draft calendar stamps dates too', !!c);
      const iso=c.dataset.d;
      const e0=E('NPV_EVENTS.length');
      rclick(c);
      setTimeout(()=>{
        ok('right-click opens the create menu on a draft', !!menu());
        click(byAct('ev'));
        setTimeout(()=>{
          ok('the event landed in the draft, not in ST', E('NPV_EVENTS.length')===e0+1);
          ok('it carries the clicked date',
             E("NPV_EVENTS.slice(-1)[0].date")===iso, E("NPV_EVENTS.slice(-1)[0].date")+' vs '+iso);

          sec('a draft band opens the legacy popover, not the inspector');
          const b=doc.querySelector('#npv-body .cal-band.ph[data-i]');
          ok('the draft calendar draws phase bands', !!b);
          clickOn(b);
          setTimeout(()=>{
            ok('the popover opened', !!doc.getElementById('bar-pop'));
            ok('nothing was selected — drafts have no ST record', E('PP_SEL')===null);
            E('ppClosePop();');

            sec('a draft band\'s menu is add-only too (N11)');
            rclick(doc.querySelector('#npv-body .cal-band.ph[data-i]'));
            setTimeout(()=>{
              ok('a menu opened', !!menu());
              ok('it offers only add-new actions',
                 !!byAct('sub')&&!!byAct('ev')&&!!byAct('tk')&&!byAct('ren'),
                 items().join(' | '));
              ok('no delete or duplicate on a draft', !byAct('del')&&!byAct('dup'),
                 items().join(' | '));
              E('npvCloseMenu();');
              done();
            },250);
          },300);
        },350);
      },250);
    },300);
  },800);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
