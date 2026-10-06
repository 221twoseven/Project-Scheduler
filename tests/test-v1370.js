/* v1.37.0 — Completed projects (tracker #6, TODO item 37; owner "Proceed with fix" 2026-10-05):
   R1 completed projects don't clutter the main dashboard — it opens on Active (every status
      but Complete) and the Meeting Sheet / print follow the same rows · R2 they stay
      reachable through an Active / Completed / All switch in the sidebar header, three
      presets of the existing status filter, remembered per person · R3 a completed row that
      is shown is muted and carries a grey "Completed" tag under the name (not red, no
      strike-through). Reopening a job (changing its status) moves it back to Active.
   Run: node tests/test-v1370.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/function doneMode/.test(src)){
  console.log('  SKIP  test-v1370: pre-v1.37.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const proj=(id,name,status,client)=>({appId:id,Title:name,client,jobCode:id.toUpperCase(),
  deadline:'2026-12-20',status,projectManager:'Sam',drafter:'Ana',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01'});
const task=(id,pid,s,e)=>({appId:id,projectId:pid,department:'fab',assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const DATA={projects:[proj('p1','Hermes Windows','in-fabrication','Hermes'),
                      proj('p2','Aster Lobby','complete','Aster'),
                      proj('p3','Held Job','on-hold','Held')],
  tasks:[task('t1','p1','2026-10-01','2026-10-12'),task('t2','p2','2026-10-01','2026-10-12'),task('t3','p3','2026-10-01','2026-10-12')],
  staff:[],todos:[]};

const UI_KEY='shopTimelineUI_v1';
let dom=boot(FILE,{data:DATA});
let win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const sideNames=()=>qa('#side-rows .sb-row.proj-head .sb-name').map(n=>n.textContent);
const sw=mode=>q('#sb-head .sb-done .t-btn[data-done="'+mode+'"]');
const pressed=()=>qa('#sb-head .sb-done .t-btn').filter(b=>b.classList.contains('active')).map(b=>b.dataset.done).join();

setTimeout(main,1300);

function main(){
  sec('R1 — the dashboard opens on Active: no Complete projects');
  ok('boot: every status but Complete is shown', E("SHOW_STATUS.size===ALL_STATUSES.length-1&&!SHOW_STATUS.has('complete')"));
  ok('the completed job is not in the sidebar', sideNames().join()==='Hermes Windows,Held Job', sideNames().join());
  ok('…nor on the canvas (no bar for its phase)', !q('#gantt-canvas .job-bar[data-pid="p2"]')&&!!q('#gantt-canvas .job-bar[data-pid="p1"]'));
  ok('the switch reads Active, aria-pressed on it alone', pressed()==='active'&&sw('active').getAttribute('aria-pressed')==='true'&&sw('all').getAttribute('aria-pressed')==='false', pressed());
  ok('Active is not a filter: no chip, no count', E('activeFilterCount()')===0&&qa('#filter-chips .f-chip').length===0);
  const meet=()=>E('buildMeetingSheet().textContent');
  ok('the Meeting Sheet follows the same rows', /Hermes Windows/.test(meet())&&!/Aster Lobby/.test(meet()));
  const print=()=>E('buildPrintSheet(fmtDate(TL_S),fmtDate(TL_E)).textContent');
  ok('print follows the same rows', /Hermes Windows/.test(print())&&!/Aster Lobby/.test(print()));
  E("document.getElementById('btn-lens-dept').click()");
  ok('the Departments lens hides its phases too', !q('#gantt-canvas .job-bar[data-tid="t2"]')&&!!q('#gantt-canvas .job-bar[data-tid="t1"]'));
  E("document.getElementById('btn-lens-proj').click()");

  sec('R2 — Active / Completed / All brings them back, and the choice sticks');
  click(sw('completed'));
  ok('Completed: only the completed job', sideNames().join()==='Aster Lobby'&&pressed()==='completed', sideNames().join()+' / '+pressed());
  ok('…still no filter chip (a preset is a view, not a filter)', E('activeFilterCount()')===0);
  ok('the Meeting Sheet follows the switch', /Aster Lobby/.test(meet())&&!/Hermes Windows/.test(meet()));
  click(q('#btn-reset'));
  ok('Clear filters keeps the preset the switch is on', pressed()==='completed'&&sideNames().join()==='Aster Lobby', pressed());
  click(sw('all'));
  ok('All: every project', sideNames().length===3&&pressed()==='all', sideNames().join());
  const saved=JSON.parse(win.localStorage.getItem(UI_KEY)||'{}');
  ok('the choice is saved per person (localStorage, with the v1.37.0 marker)', Array.isArray(saved.showStatus)&&saved.showStatus.includes('complete')&&saved.done===1, JSON.stringify(saved.showStatus));
  E("SHOW_STATUS=new Set(['in-design']);saveUI();updateFilterBadges();render()");
  ok('a hand-picked subset is still a filter: chip shows, switch reads Active', E('activeFilterCount()')===1&&pressed()==='active');
  click(q('#fm-showall'));
  ok('Show everything flips the switch to All', pressed()==='all'&&E('SHOW_STATUS.size===ALL_STATUSES.length'));

  sec('R3 — a completed row that is shown is muted and tagged');
  const row=qa('#side-rows .sb-row.proj-head').find(r=>r.querySelector('.sb-name').textContent==='Aster Lobby');
  ok('the row carries .done', !!row&&row.classList.contains('done'));
  const tag=row&&row.querySelector('.sb-l2 .cd-perm.done');
  ok('a Completed tag sits on the line under the name, first', !!tag&&tag.textContent==='Completed'&&tag===row.querySelector('.sb-l2').firstElementChild);
  ok('active rows carry no tag', qa('#side-rows .sb-row.proj-head .cd-perm.done').length===1);
  ok('the tag is grey, not red', /\.cd-perm\.done\{color:#5B6472;background:#E6E9EE/.test(src));
  ok('the row is muted by colour, no strike-through', /\.sb-row\.done \.sb-name\{color:var\(--ts-muted\)/.test(src)&&!/\.sb-row\.done[^}]*line-through/.test(src));
  ok('print carries the tag with the row', /Completed/.test(print()));

  sec('empty state — every job complete, on Active');
  E("saveState({projects:ST.projects.map(p=>({...p,status:'complete'})),tasks:ST.tasks});SHOW_STATUS=doneStatuses('active');saveUI();render()");
  ok('points at the switch, not Clear filters', !!q('#empty-state')&&/No active projects/.test(q('#empty-state').textContent)&&/Switch the sidebar/.test(q('#empty-state').textContent), q('#empty-state')&&q('#empty-state').textContent.slice(0,80));
  E("saveState({projects:ST.projects.map(p=>({...p,status:({p1:'in-fabrication',p2:'complete',p3:'on-hold'})[p.id]})),tasks:ST.tasks})");

  sec('reopening a job moves it back to Active (saved page)');
  win.location.hash='#/project/p2';win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const st=q('#pp-status');
    ok('the saved page shows the stored status', !!st&&st.value==='complete', st&&st.value);
    st.value='in-fabrication';st.dispatchEvent(new win.Event('change',{bubbles:true}));
    setTimeout(()=>{
      ok('the status is filed on the project', E("ST.projects.find(p=>p.id==='p2').status")==='in-fabrication');
      win.location.hash='#/';win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(()=>{
        E("SHOW_STATUS=doneStatuses('active');saveUI();render()");
        ok('back on Active, the job is listed again, no tag', sideNames().includes('Aster Lobby')&&qa('#side-rows .cd-perm.done').length===0, sideNames().join());
        draft();
      },300);
    },300);
  },600);
}

function draft(){
  sec('draft page — the status select still offers Complete, the switch is untouched');
  win.location.hash='#/project/new';win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const st=q('#pp-status');
    ok('#/project/new has the status select with a Complete option', !!st&&[...st.options].some(o=>o.value==='complete'));
    ok('the switch still reads Active behind the draft', pressed()==='active');
    win.location.hash='#/';win.dispatchEvent(new win.Event('hashchange'));
    setTimeout(reload,300);
  },600);
}

function reload(){
  sec('remembered per person — what a reload picks up');
  const legacy=JSON.stringify({showStatus:['forecast','estimating','in-design','in-fabrication','on-hold','complete'],density:'comfortable'});
  const d2=boot(FILE,{data:DATA,localStorage:{[UI_KEY]:legacy}});
  const d3=boot(FILE,{data:DATA,localStorage:{[UI_KEY]:JSON.stringify({showStatus:['complete'],done:1,density:'comfortable'})}});
  const d4=boot(FILE,{data:DATA});
  setTimeout(()=>{
    const E2=s=>d2.window.eval(s),E3=s=>d3.window.eval(s),E4=s=>d4.window.eval(s);
    ok('a pre-v1.37.0 save (all six statuses, no marker) opens on Active once', E2("doneMode()")==='active'&&!E2("SHOW_STATUS.has('complete')"));
    ok('a save made with the switch restores it (Completed)', E3("doneMode()")==='completed'&&[...d3.window.document.querySelectorAll('#side-rows .sb-row.proj-head .sb-name')].map(n=>n.textContent).join()==='Aster Lobby');
    ok('a fresh browser opens on Active', E4("doneMode()")==='active');
    ok('the tour\'s sidebar step still resolves', E4("COACH_STEPS.every(s=>!!document.querySelector(s.sel))"));
    console.log('\n'+'-'.repeat(46));
    console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
    process.exit(fail?1:0);
  },1300);
}
