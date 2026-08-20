/* The project dashboard. Run: node test49.js Timeline_49.html */
const {boot}=require('./harness');
const FILE=process.argv[2]||'Timeline_49.html';

/* The frozen REV50 reference predates E1 (bottom dock) — same convention as
   test-b1.js: E1-only assertions are skipped on pre-E1 builds. */
const E1=require('fs').readFileSync(FILE,'utf8').indexOf('pp-dock')>=0;
/* REV56 replaced the synthetic summary bar with the primary bar as the parent row;
   the summary-bar assertions only apply to older builds (test56 owns the new model). */
const SUMBAR=require('fs').readFileSync(FILE,'utf8').indexOf('npv-env')<0;

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1-2049',
  deadline:'2026-09-15',status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'pm1',projectId:'p1',department:'pm',assignee:'Stan',startDate:'2026-08-03',
  endDate:'2026-09-15',estimatedDays:30,ticketNodes:'[]',notes:'',pinned:false,label:''},
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
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const key=(k,opt)=>doc.dispatchEvent(new win.KeyboardEvent('keydown',
  Object.assign({key:k,bubbles:true,cancelable:true},opt||{})));
const menu=()=>doc.getElementById('npv-menu');
const byAct=a=>menu()&&menu().querySelector('button[data-act="'+a+'"]');
const insp=()=>doc.getElementById('pp-insp');

setTimeout(()=>{
  E('NPV_OPEN=new Set();LINK_SUBS=true;');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,800);
},1300);

function stage1(){
  sec('layout: the tabs are gone');
  ok('no tabbed panel', qa('#page .pg-tab').length===0, qa('#page .pg-tab').length+' tabs');
  ok('no separate side list', !doc.getElementById('npv-side'));
  ok('there is an inspector', !!insp());
  ok('chart and inspector are siblings in one row',
     !!q('.dash-body .dash-chart')&&!!q('.dash-body .dash-insp'));
  ok('the chart is still there', qa('#npv-body .npv-row').length>0);

  sec('the meta strip answers "where is this job"');
  const meta=doc.getElementById('pp-meta');
  ok('meta strip rendered', !!meta&&meta.children.length>0);
  const mt=meta.textContent;
  ok('it names the client', /Hermes/.test(mt), mt.slice(0,70));
  ok('it shows the job code', /H1-2049/.test(mt));
  ok('it shows the install date', /Sep/.test(mt));
  ok('it counts the phases', /Phases/.test(mt));

  sec('nothing selected means the project');
  ok('inspector says Project', /Project/.test(q('.ins-hd .t').textContent));
  ok('setup fields are present', !!doc.getElementById('pp-client')&&!!doc.getElementById('pp-deadline'));
  ok('client field is filled', doc.getElementById('pp-client').value==='Hermes');
  ok('team section exists', !!q('[data-sec="team"]'));
  ok('departments section exists', !!q('[data-sec="depts"]'));
  ok('agenda section exists', !!q('[data-sec="agenda"]'));
  ok('setup is open by default', q('[data-sec="setup"]').classList.contains('open'));
  if(E1){ /* pre-E1 builds default team/depts closed */
    ok('team is open by default', q('[data-sec="team"]').classList.contains('open'));
    ok('departments is open by default', q('[data-sec="depts"]').classList.contains('open'));
  }
  ok('agenda is open by default', q('[data-sec="agenda"]').classList.contains('open'));

  sec('sections no longer fold (E1: dock columns)');
  click(q('[data-sec="team"]>h4'));
  setTimeout(()=>{
    ok('clicking a heading leaves it open', q('[data-sec="team"]').classList.contains('open'));
    if(E1){
      ok('the dock exists with a resize handle',
         !!doc.getElementById('pp-dock')&&!!doc.getElementById('dock-resize'));
      ok('the footer lives inside the dock',
         !!q('#pp-dock .dash-foot'));
    }
    stage2();
  },150);
}

function stage2(){
  sec('selecting a bar');
  const bar=q('#npv-body .npv-bar:not(.sum)');
  bar.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:200,clientY:20,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:200,clientY:20,button:0}));
  setTimeout(()=>{
    ok('a click selects rather than opening a popover', E('PP_SEL')!==null, String(E('PP_SEL')));
    ok('no popover was thrown over the chart', !doc.getElementById('bar-pop'));
    ok('the selected bar is ringed', !!q('#npv-body .npv-bar.pick'));
    ok('its row is highlighted', !!q('#npv-body .npv-row.pickrow'));
    ok('the inspector switched to the phase', !!doc.getElementById('ins-name'));
    /* Whichever bar was clicked — with a department collapsed the first drawn bar is a
       leaf from another department, so assert against the selection, not a guess. */
    ok('the name field carries that phase\'s own label',
       doc.getElementById('ins-name').value===(E("(ppSelected()||{}).label")||''),
       'field "'+doc.getElementById('ins-name').value+'" vs task "'+E("(ppSelected()||{}).label")+'"');
    ok('the placeholder falls back to the department name',
       doc.getElementById('ins-name').placeholder.length>0,
       doc.getElementById('ins-name').placeholder);
    ok('start and end are editable', !!q('#pp-insp [data-f="startDate"]')&&!!q('#pp-insp [data-f="endDate"]'));
    ok('the agenda narrows to this phase', /On this phase/.test(insp().textContent));

    sec('editing in the inspector writes through');
    const nm=doc.getElementById('ins-name');
    nm.value='VIP Room';
    nm.dispatchEvent(new win.Event('change',{bubbles:true}));
    setTimeout(()=>{
      ok('renaming persists to ST', E("ST.tasks.some(t=>t.label==='VIP Room')"));
      ok('the bar in the chart shows the new name',
         /VIP Room/.test(q('#npv-body .npv-body,#npv-body').textContent));
      const dd=q('#pp-insp [data-f="estimatedDays"]');
      dd.value='9'; dd.dispatchEvent(new win.Event('change',{bubbles:true}));
      setTimeout(()=>{
        ok('changing days persists', E("ST.tasks.find(t=>t.label==='VIP Room').estimatedDays")===9,
           String(E("ST.tasks.find(t=>t.label==='VIP Room').estimatedDays")));
        ok('the selection survived the edit', E('PP_SEL')!==null);
        stage3();
      },300);
    },300);
  },300);
}

function stage3(){
  sec('right-click a bar');
  const bar=q('#npv-body .npv-bar:not(.sum)');
  const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:220,clientY:20,button:2});
  bar.dispatchEvent(ev);
  setTimeout(()=>{
    ok('the browser menu is suppressed', ev.defaultPrevented);
    ok('a menu opened', !!menu());
    ok('it offers rename', !!byAct('ren'));
    ok('it offers add subtask', !!byAct('sub'));
    ok('it offers add event and add task', !!byAct('ev')&&!!byAct('tk'));
    ok('it offers duplicate', !!byAct('dup'));
    ok('it offers delete', !!byAct('del'));
    ok('it teaches the keyboard', /<span class="k">S<\/span>/.test(menu().innerHTML));
    ok('delete sits below a separator', menu().innerHTML.indexOf('sep')<menu().innerHTML.indexOf('data-act="del"'));

    const n0=E('ST.tasks.length');
    click(byAct('dup'));
    setTimeout(()=>{
      ok('duplicate adds a bar', E('ST.tasks.length')===n0+1);
      ok('the copy is selected', E('PP_SEL')!==null);
      ok('the copy is named as one', /copy/.test(E("ST.tasks.slice(-1)[0].label")),
         E("ST.tasks.slice(-1)[0].label"));

      sec('undo is offered, not just bound to a key');
      const t=q('#toasts .toast');
      ok('a toast appeared', !!t, (t||{}).textContent);
      ok('the toast carries an Undo button', !!q('#toasts .toast .undo'));
      click(q('#toasts .toast .undo'));
      setTimeout(()=>{
        ok('undo removes the duplicate', E('ST.tasks.length')===n0, E('ST.tasks.length')+'');
        stage4();
      },300);
    },300);
  },300);
}

function stage4(){
  sec('right-click a department summary');
  E("NPV_OPEN=new Set();npvRebuild();ppSelect(null,true);");
  setTimeout(()=>{
    if(!SUMBAR){
      console.log('  SKIP  REV56 has no summary bar — the parent row is the primary bar (test56)');
      gutterSection();
      return;
    }
    const sum=q('#npv-body .npv-bar.sum');
    ok('there is a summary bar', !!sum);
    const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:200,clientY:20,button:2});
    sum.dispatchEvent(ev);
    setTimeout(()=>{
      ok('a department menu opened', !!menu());
      ok('it offers expand/collapse', !!byAct('tog'), menu().textContent.slice(0,60));
      ok('it offers add subtask', !!byAct('sub'));
      ok('it offers removing the department from the job', !!byAct('rmv'));
      E('npvCloseMenu();');
      gutterSection();
    },300);
  },300);
}

function gutterSection(){
  setTimeout(()=>{
    sec('right-click a row gutter');
    const gut=q('#npv-body .npv-gut');
    const ev2=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:40,clientY:20,button:2});
    gut.dispatchEvent(ev2);
    setTimeout(()=>{
      ok('the gutter opens the department menu too', !!menu()&&!!byAct('sub'));
      ok('the browser menu is suppressed there as well', ev2.defaultPrevented);
      E('npvCloseMenu();');
      stage5();
    },250);
  },300);
}

function stage5(){
  sec('keyboard');
  E("ppSelect(null,true);");
  const ev0=E("(ST.todos||[]).length");
  key('t');
  setTimeout(()=>{
    ok('T makes a task', E("(ST.todos||[]).length")===ev0+1);
    const n0=E("ST.tasks.reduce((n,t)=>n+(t.ticketNodes||[]).length,0)");
    key('e');
    setTimeout(()=>{
      ok('E makes an event', E("ST.tasks.reduce((n,t)=>n+(t.ticketNodes||[]).length,0)")===n0+1);
      key('c');
      setTimeout(()=>{
        ok('C switches to the calendar', E('NPV_MODE')==='calendar');
        key('g');
        setTimeout(()=>{
          ok('G switches back to the gantt', E('NPV_MODE')==='gantt');

          E("ppSelect(null,true);");
          key('ArrowDown');
          setTimeout(()=>{
            ok('down arrow selects the first bar', E('PP_SEL')===E('NPV_TASKS[0].id'));
            const first=E('PP_SEL');
            key('ArrowDown');
            setTimeout(()=>{
              ok('down arrow again moves on', E('PP_SEL')!==first);
              const sel=E('PP_SEL');
              const before=E("ST.tasks.find(t=>t.id==='"+sel+"').startDate");
              key('ArrowRight',{shiftKey:true});
              setTimeout(()=>{
                const after=E("ST.tasks.find(t=>t.id==='"+sel+"').startDate");
                ok('shift+right nudges the bar a day', before!==after, before+' -> '+after);
                ok('it stays selected while nudging', E('PP_SEL')===sel);

                key('?');
                setTimeout(()=>{
                  ok('? opens the shortcut sheet',
                     !doc.getElementById('pp-ks').classList.contains('hidden'));
                  key('Escape');
                  setTimeout(()=>{
                    ok('escape closes the sheet',
                       doc.getElementById('pp-ks').classList.contains('hidden'));
                    stage6();
                  },200);
                },200);
              },300);
            },200);
          },200);
        },200);
      },200);
    },300);
  },300);
}

function stage6(){
  sec('escape unwinds one layer at a time');
  E("ppSelect(NPV_TASKS[0].id,true);");
  setTimeout(()=>{
    ok('something is selected', E('PP_SEL')!==null);
    key('Escape');
    setTimeout(()=>{
      ok('first escape only deselects', E('PP_SEL')===null&&E("ROUTE.view")==='project');
      ok('the inspector fell back to the project', /Project/.test(q('.ins-hd .t').textContent));
      key('Escape');
      setTimeout(()=>{
        ok('second escape leaves the page', E("ROUTE.view")!=='project', E("ROUTE.view"));

        sec('typing is never hijacked by the single-letter keys');
        win.location.hash='#/project/p1';
        win.dispatchEvent(new win.Event('hashchange'));
        setTimeout(()=>{
          const c=doc.getElementById('pp-client');
          const before=E("(ST.todos||[]).length");
          c.focus();
          c.dispatchEvent(new win.KeyboardEvent('keydown',{key:'t',bubbles:true,cancelable:true}));
          setTimeout(()=>{
            ok('pressing T in a text field makes no task',
               E("(ST.todos||[]).length")===before, E("(ST.todos||[]).length")+' vs '+before);
            stage7();
          },250);
        },600);
      },200);
    },200);
  },200);
}

function stage7(){
  sec('deleting a phase, and taking it back');
  E("ppSelect(NPV_TASKS[0].id,true);");
  setTimeout(()=>{
    const id=E('PP_SEL'), n0=E('ST.tasks.length');
    click(doc.getElementById('ins-del'));
    setTimeout(()=>{
      ok('the phase is gone', E('ST.tasks.length')===n0-1);
      ok('nothing is selected afterwards', E('PP_SEL')===null);
      ok('the toast offers Undo', !!q('#toasts .toast .undo'));
      click(q('#toasts .toast .undo'));
      setTimeout(()=>{
        ok('undo brings it back', E('ST.tasks.length')===n0, E('ST.tasks.length')+'');
        ok('it comes back with the same id', E("ST.tasks.some(t=>t.id==='"+id+"')"));

        sec('the agenda is one list, undated first');
        E("ppSelect(null,true);");
        setTimeout(()=>{
          const days=qa('#pp-insp .ag-day').map(d=>d.textContent.trim());
          ok('there is an agenda with rows', qa('#pp-insp .ag-i').length>0,
             qa('#pp-insp .ag-i').length+' rows');
          ok('undated items are grouped first',
             days.length===0||days[0]==='No date yet'||!/No date yet/.test(days.join('|')),
             days.join(' | '));
          ok('the section header counts them',
             !!q('[data-sec="agenda"] .n'), (q('[data-sec="agenda"] .n')||{}).textContent);
          done();
        },250);
      },350);
    },300);
  },200);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
