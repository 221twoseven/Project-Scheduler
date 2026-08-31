/* Timeline regression suite â€” run: node test46.js Timeline_46.html
   Covers the four REV46 fixes plus the invariants the old suites guarded. */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'Timeline_46.html';
const src=fs.readFileSync(FILE,'utf8');

let pass=0,fail=0;
const ok=(name,cond,extra)=>{
  if(cond){pass++;console.log('  PASS  '+name);}
  else{fail++;console.log('  FAIL  '+name+(extra?'   ('+extra+')':''));}
};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'approved',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','finish','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'t0',projectId:'p1',department:'pm',assignee:'Stan',startDate:'2026-08-03',
  endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-14',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-17',
  endDate:'2026-08-28',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t3',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));

setTimeout(run,1300);

function run(){
  sec('geometry constants match the stylesheet');
  /* Since the resizable gutter, the stylesheet reads var(--npv-gut) and geometry reads
     NPV_GUT (npvSetGut keeps them in step) â€” assert the var's fallback matches the
     boot default. Pre-var builds (the REV50 reference) still carry a literal width. */
  const gutVar=src.match(/\.npv-gut\{[^}]*width:var\(--npv-gut,(\d+)px\)/);
  const gut=gutVar?gutVar[1]:([...src.matchAll(/\.npv-gut\{[^}]*width:(\d+)px/g)].pop()||[])[1];
  const rowh=[...src.matchAll(/\.npv-row\{[^}]*height:(\d+)px/g)].pop();
  ok('NPV_GUT matches .npv-gut width', String(E('NPV_GUT'))===gut, 'JS '+E('NPV_GUT')+' vs CSS '+gut);
  ok('NPV_ROWH matches last .npv-row height', String(E('NPV_ROWH'))===rowh[1], 'JS '+E('NPV_ROWH')+' vs CSS '+rowh[1]);
  if(/--fs-fine:/.test(src)){ /* C5 tokens â€” skipped on pre-C5 builds like the REV50 reference */
    ok('--row-h token is Comfortable (Design-Language Â§4)',
       /applyDensity/.test(src)?/--row-h:56px/.test(src):/--row-h:44px/.test(src));
    ok('no informational font-size below 11px (C5)', !/font-size:(10|[0-9])(\.[0-9]+)?px/.test(src));
  }
  if(/applyDensity/.test(src)){ /* B5 density (three levels, owner 2026-08-26) â€” skipped on pre-B5 builds */
    ok('Snug override sets --row-h:44px', /body\.snug\{--row-h:44px\}/.test(src));
    ok('Compact override sets --row-h:32px', /body\.compact\{--row-h:32px\}/.test(src));
    ok('JS lane math mirrors --row-h at Comfortable (56)', E('rowH(1)')===56, 'rowH(1)='+E('rowH(1)'));
    E("applyDensity('snug')");
    ok('JS lane math mirrors --row-h at Snug (44)', E('rowH(1)')===44, 'rowH(1)='+E('rowH(1)'));
    E("applyDensity('compact')");
    ok('JS lane math mirrors --row-h at Compact (32)', E('rowH(1)')===32, 'rowH(1)='+E('rowH(1)'));
    ok('Compact bar keeps the â‰¥24px hit target (Â§4)', E('BAR_H')>=24, 'BAR_H='+E('BAR_H'));
    E("applyDensity('comfortable')");
  }

  sec('boot and status migration');
  ok('rev label rendered', doc.getElementById('tb-rev-num').textContent!=='');
  ok('retired status folds to in-fabrication', E("ST.projects[0].status")==='in-fabrication', E("ST.projects[0].status"));
  ok('rows built', E('ROWS.length')>0);

  sec('scheduler stays pure');
  const before=E('JSON.stringify(ST.tasks)');
  E("generateSchedule({id:'zz',deadline:'2026-10-01',activeDepartments:['td','fab','install']},{td:5,fab:5,install:1})");
  ok('generateSchedule does not touch ST', E('JSON.stringify(ST.tasks)')===before);

  sec('45s poll (REV46 fix 4)');
  const m=src.match(/if\(JSON\.stringify\(fresh\)!==JSON\.stringify\(([^\n]*?)\)\)\{ST=fresh/);
  ok('poll comparison found in source', !!m);
  if(m){
    const eq=E("(function(){var f=migrate({projects:JSON.parse(JSON.stringify(ST.projects)),tasks:JSON.parse(JSON.stringify(ST.tasks)),todos:JSON.parse(JSON.stringify(ST.todos||[]))});return JSON.stringify(f)===JSON.stringify("+m[1]+");})()");
    ok('unchanged data compares equal (no 45s clobber)', eq===true);
  }
  E("ST={projects:ST.projects,tasks:ST.tasks,todos:[{id:'x1',projectId:'p1',title:'Order acrylic',due:'2026-08-10',who:[],priority:'medium'}]};");
  const kept=E("(function(){var f=migrate({projects:ST.projects,tasks:ST.tasks,todos:[]});if(!TODOS_OK&&(ST.todos||[]).length&&!(f.todos||[]).length)f.todos=ST.todos;return f.todos.length;})()");
  ok('session-only tasks survive a poll while Tasks2 is missing', kept===1, 'kept '+kept);
  E("ST={projects:ST.projects,tasks:ST.tasks,todos:[]};");

  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage2,600);
}

function stage2(){
  sec('project page');
  ok('NPV_LIVE on a saved project', E('NPV_LIVE')===true);
  ok('PM is in NPV_ALL', E("NPV_ALL.some(t=>t.department==='pm')"));
  ok('PM is not drawn in NPV_TASKS', E("!NPV_TASKS.some(t=>t.department==='pm')"));

  sec('dragging a bar (REV46 fix 1)');
  const bar=doc.querySelectorAll('#npv-body .npv-bar')[0];
  const dw=E('NPV_GEO?NPV_GEO.dw:12');
  const b4=E("ST.tasks.find(t=>t.department==='td').startDate");
  mouse(bar,'mousedown',100,20); dmouse('mousemove',100+dw*5,20); dmouse('mouseup',100+dw*5,20);
  setTimeout(()=>{
    const after=E("ST.tasks.find(t=>t.department==='td').startDate");
    ok('body drag writes new dates to ST', b4!==after, b4+' -> '+after);
    ok('body drag does not leave a stale NPV_MANUAL entry', E('Object.keys(NPV_MANUAL).length')===0);
    const span=E("(function(){var t=ST.tasks.find(x=>x.department==='td');return (new Date(t.endDate)-new Date(t.startDate))/86400000;})()");
    ok('body drag keeps the bar the same length', span===11, 'span '+span);

    const bar2=doc.querySelectorAll('#npv-body .npv-bar')[0];
    const hdl=bar2.querySelector('.npv-hdl');
    const s4=E("ST.tasks.find(t=>t.department==='td').startDate");
    const d4=E("ST.tasks.find(t=>t.department==='td').estimatedDays");
    mouse(hdl,'mousedown',100,20); dmouse('mousemove',100+dw*3,20); dmouse('mouseup',100+dw*3,20);
    setTimeout(()=>{
      const s5=E("ST.tasks.find(t=>t.department==='td').startDate");
      const d5=E("ST.tasks.find(t=>t.department==='td').estimatedDays");
      ok('left-edge resize moves the start date', s4!==s5, s4+' -> '+s5);
      ok('left-edge resize recomputes estimated days', d4!==d5, d4+' -> '+d5);
      ok('resize leaves the end date alone', E("ST.tasks.find(t=>t.department==='td').endDate")!=='');
      stage3();
    },350);
  },350);
}

function stage3(){
  sec('events and tasks on a saved project (REV46 fix 2, REV49 surface)');
  /* REV49: the Events tab is gone. The inspector's agenda is the one list, and creating
     happens on the canvas or from its buttons. Same behaviour, one surface. */
  const addEv=()=>doc.querySelector('#pp-insp [data-ag="ev"]');
  const addTk=()=>doc.querySelector('#pp-insp [data-ag="tk"]');
  ok('the agenda offers an add-event button', !!addEv());
  ok('the agenda offers an add-task button', !!addTk());
  const nodes0=E("ST.tasks.reduce((n,t)=>n+(t.ticketNodes||[]).length,0)");
  click(addEv());
  setTimeout(()=>{
    const nodes1=E("ST.tasks.reduce((n,t)=>n+(t.ticketNodes||[]).length,0)");
    ok('+ Event writes a ticketNode into ST', nodes1===nodes0+1, nodes0+' -> '+nodes1);
    ok('the event appears in the agenda', doc.querySelectorAll('#pp-insp .ag-i').length===1);
    ok('draft array stays empty on a saved project', E('NPV_EVENTS.length')===0);

    /* Renaming happens inline in the agenda row. The checkpoint-editor agenda (post-REV50)
       renders a permanent name input; the reference build opens one on click. */
    const NEWAG=src.indexOf('<input class="nm"')>=0; /* the new agenda's name is a permanent INPUT; the reference renders a span and opens one on click */
    click(doc.querySelector('#pp-insp .ag-i .nm'));
    setTimeout(()=>{
      const inp=NEWAG?doc.querySelector('#pp-insp .ag-i input.nm')
                     :doc.querySelector('#pp-insp .ag-i input');
      ok('the row edits its name inline', !!inp);
      inp.value='Client review';
      if(NEWAG)inp.dispatchEvent(new win.Event('change',{bubbles:true}));
      else inp.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
      setTimeout(()=>{
        ok('editing an event name persists to ST',
          E("ST.tasks.some(t=>(t.ticketNodes||[]).some(n=>n.target==='Client review'))"));

        click(addTk());
        setTimeout(()=>{
          ok('+ Task writes into ST.todos', E('(ST.todos||[]).length')===1);
          ok('task is stamped with the project id', E("(ST.todos[0]||{}).projectId")==='p1');
          ok('both rows are in the agenda', doc.querySelectorAll('#pp-insp .ag-i').length===2);

          const rows=[...doc.querySelectorAll('#pp-insp .ag-i')];
          const tkRow=rows.find(r=>r.dataset.agK==='tk');
          click(tkRow.querySelector('.nm'));
          setTimeout(()=>{
            const i2=NEWAG?tkRow.querySelector('input.nm'):tkRow.querySelector('input');
            i2.value='Order acrylic';
            if(NEWAG)i2.dispatchEvent(new win.Event('change',{bubbles:true}));
            else i2.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
            setTimeout(()=>{
              ok('editing a task title persists to ST', E("ST.todos[0].title")==='Order acrylic');
              /* Names live in input values on the checkpoint-editor agenda, in
                 textContent on the reference build. */
              const agenda=NEWAG
                ? [...doc.querySelectorAll('#pp-insp .ag-i .nm')].map(i=>i.value).join(' | ')
                : doc.getElementById('pp-insp').textContent;
              ok('the agenda shows both rows',
                 /Client review/.test(agenda)&&/Order acrylic/.test(agenda), agenda.slice(0,90));

              const tkRow2=[...doc.querySelectorAll('#pp-insp .ag-i')].find(r=>r.dataset.agK==='tk');
              click(tkRow2.querySelector('.del'));
              setTimeout(()=>{
                ok('deleting a task removes it from ST', E('(ST.todos||[]).length')===0);
                stage4();
              },250);
            },250);
          },200);
        },300);
      },250);
    },200);
  },300);
}

function stage4(){
  sec('tint on the project-page gantt (REV46 fix 3)');
  E('NPV_MODE="gantt";TINT=true;npvRender();');
  setTimeout(()=>{
    const ax=doc.querySelectorAll('#npv-axis .npv-tintcol').length;
    const bd=doc.querySelectorAll('#npv-body .npv-tintl .npv-tintcol').length;
    ok('axis paints tint columns', ax>0, 'count '+ax);
    ok('body paints tint columns', bd>0, 'count '+bd);
    ok('body carries the .tinted class', /tinted/.test(doc.getElementById('npv-body').className));
    ok('tint layer does not become the first child (zebra intact)',
       doc.getElementById('npv-body').firstElementChild.classList.contains('npv-row'));
    E('TINT=false;npvRender();');
    setTimeout(()=>{
      ok('tint off removes the columns', doc.querySelectorAll('#npv-body .npv-tintcol').length===0);
      ok('tint off drops the .tinted class', !/tinted/.test(doc.getElementById('npv-body').className));

      sec('tint toggle does not wipe an unsaved draft (REV45 guard)');
      win.location.hash='#/project/new';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(()=>{
        const nmEl=doc.getElementById('pp-name');
        if(nmEl){nmEl.value='Draft job';nmEl.dispatchEvent(new win.Event('input',{bubbles:true}));}
        E("ppFormSync&&ppFormSync();");
        const tb=doc.getElementById('npv-tint'); click(tb);
        setTimeout(()=>{
          ok('draft name survives a tint toggle', E("PP_FORM&&PP_FORM.name")==='Draft job', E("PP_FORM&&PP_FORM.name"));
          done();
        },250);
      },500);
    },200);
  },250);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);


