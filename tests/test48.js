/* Canvas create menu + full-height subtask bars.
   Run: node test48.js Timeline_48.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'Timeline_48.html';
const src=fs.readFileSync(FILE,'utf8');
/* REV56: a subtask created inside its parent's window is born named and half the
   parent's length (see test56); older builds borrow the neighbours' average. */
const R56=src.indexOf('npv-env')>=0;
/* REV57 / N11: right-click menus are add-only; left-click never opens a create menu and
   right-click never changes the selection. (The old inline name field is retired — a New
   action now opens the edit popover, sniffed here to gate the new-build branches.) */
const N11=/npvEditPop/.test(src);

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
 {appId:'td2',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-10',
  endDate:'2026-08-14',estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Interior Windows'},
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

/* npvHit reads clientX/clientY against the body's box. jsdom reports a zero box, so
   coordinates are supplied relative to that origin — the same arithmetic the browser does. */
function at(px,py,type,button){
  const host=doc.getElementById('npv-body');
  const r=host.getBoundingClientRect();
  const ev=new win.MouseEvent(type||'click',
    {bubbles:true,cancelable:true,clientX:r.left+px,clientY:r.top+py,button:button||0});
  host.dispatchEvent(ev);
  return ev;
}
function leftClick(px,py){at(px,py,'mousedown',0);at(px,py,'click',0);}
function rightClick(px,py){return at(px,py,'contextmenu',2);}
const GUT=()=>E('NPV_GUT'), DW=()=>E('NPV_GEO.dw'), RH=()=>E('NPV_ROWH');
const colOf=iso=>E("diffDays(NPV_GEO.lo,parseDate('"+iso+"'))");
const rowOfDept=d=>E("NPV_PLAN.findIndex(r=>r.dept==='"+d+"')");

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,700);
},1300);

function stage1(){
  sec('subtask bars are full height');
  const base=[...src.matchAll(/\.npv-bar\{[^}]*height:([\d.]+)px/g)].pop()[1];
  const kid=src.match(/\.npv-bar\.kid\{[^}]*height:([\d.]+)px/);
  const sum=src.match(/\.npv-bar\.sum\{[^}]*height:([\d.]+)px/);
  ok('no shrunk .npv-bar.kid rule', !kid, kid?kid[1]+'px vs base '+base+'px':'');
  ok('no shrunk .npv-bar.sum rule', !sum, sum?sum[1]+'px vs base '+base+'px':'');
  ok('base bar still fills most of the row', Number(base)/E('NPV_ROWH')>0.65,
     base+'px in '+E('NPV_ROWH')+'px');

  sec('hit-testing');
  const c=colOf('2026-08-20');
  const hit=E("npvHit({clientX:document.getElementById('npv-body').getBoundingClientRect().left+"
    +(GUT()+c*DW()+2)+",clientY:document.getElementById('npv-body').getBoundingClientRect().top+"
    +(rowOfDept('fab')*RH()+10)+"})");
  ok('a point resolves to the right date', hit&&hit.date==='2026-08-20', hit&&hit.date);
  ok('a point resolves to the right row', hit&&hit.row&&hit.row.dept==='fab', hit&&hit.row&&hit.row.dept);
  const overGut=E("npvHit({clientX:document.getElementById('npv-body').getBoundingClientRect().left+4,clientY:document.getElementById('npv-body').getBoundingClientRect().top+10})");
  ok('a point over the gutter resolves to nothing', overGut===null);

  sec('right-click on empty canvas');
  const y=rowOfDept('fab')*RH()+10, x=GUT()+colOf('2026-08-20')*DW()+2;
  const ev=rightClick(x,y);
  ok('the browser menu is suppressed', ev.defaultPrevented);
  ok('a menu opened', !!menu());
  ok('it names the department and the date',
     /Main Shop Fab/.test(menu().textContent)&&/Aug/.test(menu().textContent),
     (menu()||{textContent:''}).textContent.slice(0,60));
  ok('it offers a subtask, an event and a task',
     !!byAct('sub')&&!!byAct('ev')&&!!byAct('tk'), items().join(' | '));
  ok('a leaf row offers no expand/collapse', !byAct('tog'));

  sec('creating a subtask from the menu');
  const before=E("ST.tasks.filter(t=>t.department==='fab').length");
  click(byAct('sub'));
  setTimeout(()=>{
    ok('the menu closed', !menu());
    ok('a bar was added to that department',
       E("ST.tasks.filter(t=>t.department==='fab').length")===before+1);
    const nu=E("JSON.stringify(ST.tasks.filter(t=>t.department==='fab').slice(-1)[0])");
    const n=JSON.parse(nu);
    ok('it starts on the day that was clicked', n.startDate==='2026-08-20', n.startDate);
    if(R56)ok('a nested subtask is born half its parent\'s length', n.estimatedDays===6, n.estimatedDays+'');
    else ok('it borrows the length of its neighbours', n.estimatedDays===12, n.estimatedDays+'');
    ok('it ends on a working day', E("isWorking(parseDate('"+n.endDate+"'))"));
    ok('it inherits the assignee', n.assignee==='Nick', String(n.assignee));
    ok('the department expanded to show it', E("NPV_OPEN.has('fab')"));
    ok('the new bar is selected', E('PP_SEL')===n.id, String(E('PP_SEL')));
    ok('the inspector shows its name field ready', !!doc.getElementById('ins-name')
       && doc.getElementById('ins-name').value===(R56?'Subtask 2':''));
    E('ppSelect(null);');
    stage2();
  },350);
}

function stage2(){
  sec('right-click on a bar offers its own actions');
  E("NPV_OPEN=new Set();npvRebuild();");
  setTimeout(()=>{
    const bar=doc.querySelector('#npv-body .npv-bar:not(.sum)');
    const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:2});
    bar.dispatchEvent(ev);
    setTimeout(()=>{
      ok('the browser menu is suppressed', ev.defaultPrevented);
      ok('a menu opened on the bar', !!menu());
      if(N11){
        ok('it offers only add-new actions (N11)',
           !!byAct('sub')&&!!byAct('ev')&&!!byAct('tk')&&!byAct('ren')&&!byAct('del'),
           items().join(' | '));
        ok('the menu no longer carries an inline name field', !menu().querySelector('.mn'));
        ok('right-clicking a bar does not change the selection', E('PP_SEL')===null);
      }else{
        ok('it offers rename, subtask and delete',
           !!byAct('ren')&&!!byAct('sub')&&!!byAct('del'), items().join(' | '));
        ok('right-clicking a bar also selects it', E('PP_SEL')!==null);
      }
      ok('it does not offer "new subtask here" as if on blank canvas',
         !/New subtask here/.test(menu().textContent));
      E('npvCloseMenu();ppSelect(null);');

      sec(N11?'left-click stays edit-only; the menu lives on right-click (N11)'
             :'left-click on empty canvas opens the same menu');
      const y=rowOfDept('td')*RH()+10, x=GUT()+colOf('2026-08-05')*DW()+2;
      leftClick(x,y);
      setTimeout(()=>{
        if(N11)ok('no menu on a plain left click', !menu());
        else ok('a menu opened on a plain left click', !!menu());
        rightClick(x,y);
        setTimeout(()=>{
        ok('a parent row offers expand', !!byAct('tog'), items().join(' | '));
        ok('the expand item names the department', /Technical Design/.test(byAct('tog').textContent));
        click(byAct('tog'));
        setTimeout(()=>{
          ok('it expanded the department', E("NPV_OPEN.has('td')"));
          ok('the menu closed after choosing', !menu());
          stage3();
        },250);
        },250);
      },250);
    },250);
  },300);
}

function stage3(){
  sec('a click that follows a drag does not open the menu');
  const y=rowOfDept('td')*RH()+10, x=GUT()+colOf('2026-08-05')*DW()+2;
  at(x,y,'mousedown',0);
  at(x+40,y,'click',0);
  setTimeout(()=>{
    ok('no menu after a 40px travel', !menu());

    sec('a left click that only dismisses does not re-open');
    at(x,y,'mousedown',0);at(x,y,'click',0);
    setTimeout(()=>{
      if(N11){ok('left clicks never open a menu (N11)', !menu());stage4();return;}
      ok('first click opens', !!menu());
      at(x,y,'mousedown',0);at(x,y,'click',0);
      setTimeout(()=>{
        ok('second click dismisses rather than re-opening', !menu());
        stage4();
      },200);
    },200);
  },250);
}

function stage4(){
  sec('empty space below the rows');
  const y=E('NPV_PLAN.length')*RH()+8, x=GUT()+colOf('2026-08-26')*DW()+2;
  rightClick(x,y);
  setTimeout(()=>{
    ok('a menu opened', !!menu());
    ok('it offers an event and a task', !!byAct('ev')&&!!byAct('tk'));
    ok('it offers no subtask, there being no department', !byAct('sub'), items().join(' | '));
    ok('it offers to add a department', !!byAct('depts'));

    click(byAct('depts'));
    setTimeout(()=>{
      ok('the department list opened in place', !!menu()&&!!menu().querySelector('button[data-act="dept"]'));
      const used=E("JSON.stringify([...new Set(NPV_TASKS.map(t=>t.department))])");
      ok('it lists only departments not already on the job',
         [...menu().querySelectorAll('button[data-act="dept"]')]
           .every(b=>JSON.parse(used).indexOf(b.dataset.dept)<0), used);
      ok('project management is never offered',
         !menu().querySelector('button[data-act="dept"][data-dept="pm"]'));

      const first=menu().querySelector('button[data-act="dept"]');
      const newDept=first.dataset.dept;
      click(first);
      setTimeout(()=>{
        ok('a bar was created in the new department',
           E("ST.tasks.some(t=>t.department==='"+newDept+"')"));
        ok('the department joined the project',
           E("(ST.projects[0].activeDepartments||[]).indexOf('"+newDept+"')>=0"),
           E("JSON.stringify(ST.projects[0].activeDepartments)"));
        E('ppSelect(null);');
        stage5();
      },350);
    },250);
  },300);
}

function stage5(){
  sec('an event created below the rows belongs to no department');
  const y=E('NPV_PLAN.length')*RH()+8, x=GUT()+colOf('2026-08-26')*DW()+2;
  rightClick(x,y);
  setTimeout(()=>{
    click(byAct('ev'));
    setTimeout(()=>{
      const evs=E("JSON.stringify(liveEvents(ppProject()))");
      const list=JSON.parse(evs);
      ok('the event exists', list.length===1, evs);
      ok('it carries the date that was clicked', list[0]&&list[0].date==='2026-08-26', list[0]&&list[0].date);
      ok('it belongs to no department', list[0]&&list[0].dept==='', JSON.stringify(list[0]&&list[0].dept));
      ok('it still saved onto a phase',
         E("ST.tasks.some(t=>(t.ticketNodes||[]).length>0)"));
      ok('it renders on the "Not on a phase" row',
         !!doc.querySelector('#npv-body .npv-row.extra')&&!!doc.querySelector('#npv-body .npv-ev'));

      sec('a task created in a department row carries it');
      const y2=rowOfDept('td')*RH()+10, x2=GUT()+colOf('2026-08-12')*DW()+2;
      rightClick(x2,y2);
      setTimeout(()=>{
        click(byAct('tk'));
        setTimeout(()=>{
          const td=E("JSON.stringify((ST.todos||[])[0]||null)");
          const o=JSON.parse(td);
          ok('the task exists', !!o, td);
          ok('it is due on the day that was clicked', o&&o.due==='2026-08-12', o&&o.due);
          ok('it carries the department', o&&o.dept==='td', o&&o.dept);
          stage6();
        },300);
      },250);
    },300);
  },300);
}

function stage6(){
  sec('escape and calendar mode');
  const y=rowOfDept('td')*RH()+10, x=GUT()+colOf('2026-08-05')*DW()+2;
  rightClick(x,y);
  setTimeout(()=>{
    ok('menu open before escape', !!menu());
    doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    setTimeout(()=>{
      ok('escape closes the menu', !menu());
      ok('escape did not also leave the project page', E("ROUTE.view")==='project', E("ROUTE.view"));

      E("NPV_MODE='calendar';npvRender();");
      setTimeout(()=>{
        const ev=rightClick(x,y);
        ok('calendar mode does not open the gantt menu', !menu());
        ok('calendar mode leaves the browser menu alone', !ev.defaultPrevented);
        E("NPV_MODE='gantt';npvRender();");

        sec('listeners are bound once, not once per render');
        const n0=E("(function(){var c=0;var h=document.getElementById('npv-body');return h.dataset.bound;})()");
        E('npvRender();npvRender();npvRender();');
        setTimeout(()=>{
          ok('the body carries a single bound flag', E("document.getElementById('npv-body').dataset.bound")==='1');
          const before=E("(ST.todos||[]).length");
          if(N11)rightClick(GUT()+colOf('2026-08-05')*DW()+2,rowOfDept('td')*RH()+10);
          else leftClick(GUT()+colOf('2026-08-05')*DW()+2,rowOfDept('td')*RH()+10);
          setTimeout(()=>{
            ok('one click still produces exactly one menu',
               doc.querySelectorAll('.npv-menu').length===1,
               doc.querySelectorAll('.npv-menu').length+' menus');
            done();
          },250);
        },250);
      },250);
    },200);
  },300);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},35000);
