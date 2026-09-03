/* v1.18.1 — the September audit round (16 confirmed review findings):
   - the viewer.subtasks grant no longer opens the whole Edit Phase modal (dates,
     department, Delete Phase ride the PHASES door; only the Milestones block and
     Save follow the subtasks grant), and the S key can't create a department's
     PRIMARY bar without the phases grant;
   - the staff poll re-checks after its await (a savePeople mid-round-trip is
     never clobbered — "my merges reverted");
   - leaving Company Data via × / All Projects confirms a mid-edit buffer and
     clears CD_EDIT (a stale one silently blocked every poll tick);
   - failed client / App-Settings writes park for the sync pill's retry;
   - applyRoute runs applyPerms at every door (booting on #/project/… left the
     viewer/dev chrome unapplied);
   - v1-era stored view:'month' migrates to the widest step instead of colliding
     with the new month step (~8× zoom-in on upgrade);
   - the seeded "Everything" view resets the client filter;
   - search matches roster names again beside nicknames;
   - the wordmark goes home from ANY route, person summary included;
   - dashboard Notes resolve legacy who-names through canonName;
   - unnamed calendar milestone bands read "Untitled milestone", never "Fab: ";
   - the People-page pane split reseats the column grips while dragging.
   Run: node tests/test-v1181.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("month:'month3'")<0){
  console.log('test-v1181: skipped — pre-v1.18.1 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

/* Sam signs in NON-admin (a real admin row exists, so permsLive is true and Sam is a
   viewer); Seungwoo carries a nickname for the search assertions. */
const staff=[
 {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM',admin:''},
 {appId:'s2',Title:'Rae Admin',depts:JSON.stringify(['pm']),ooo:'[]',email:'r@x.co',role:'',admin:'1'},
 {appId:'s3',Title:'Seungwoo Hong',depts:JSON.stringify(['fab']),ooo:'[]',email:'s@x.co',role:'',nickname:'Sean'}];
const projects=[{appId:'p1',Title:'Job One',client:'Acme',jobCode:'AC1',deadline:D(30),status:'auto',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',metalFab:'',
  activeDepartments:JSON.stringify(['pm','fab'])}];
const tasks=[
 {appId:'t1',projectId:'p1',department:'fab',assignee:'Seungwoo Hong',startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);

setTimeout(main,1300);

function main(){
  sec('source markers');
  ok('staff poll re-checks after its await', src.indexOf('pg===PEOPLE_GEN')>=0&&src.indexOf('PEOPLE_GEN++')>=0);
  ok('the merge scrub sequences on the roster save', /savePeople\([^]{0,120}\)\.then\(ok=>\{\s*if\(ok\)scrub\(\)/.test(src));
  ok('a parked staff retry runs the merge continuation', src.indexOf('if(p.after)p.after()')>=0);
  ok('failed client writes park for the pill', src.indexOf('function retryClientSync')>=0&&src.indexOf('if(PENDING_CLIENTS)retryClientSync()')>=0);
  ok('failed setting writes park for the pill', src.indexOf('function retryConfigSync')>=0&&src.indexOf('if(PENDING_CFG)retryConfigSync()')>=0);
  ok('beforeunload counts the new parks', /PENDING_STAFF\|\|PENDING_CLIENTS\|\|PENDING_CFG/.test(src));
  ok('Delete Phase rides the phases door in CSS', src.indexOf('body.viewer:not(.vg-phases) #tm-del')>=0);
  ok('Save opens under either grant', src.indexOf('body.viewer:not(.vg-subtasks):not(.vg-phases) #tm-save')>=0);
  ok('the Milestones block carries its own door', /data-vk="subtasks"/.test(src));
  ok('dashboard Notes resolve who through canonName', /\(t\.who\|\|\[\]\)\.map\(canonName\)\.includes\(PERSON\)/.test(src));
  ok('unnamed calendar markers get the Gantt fallback', /mk\.nm\|\|\(mk\.k==='ev'\?'Untitled milestone'/.test(src));
  ok('the pane split reseats the grips', /cdGripSync\(\);\}; \/\* the pane resize reflows/.test(src)||/CD_LISTW\+'px';list\.style\.maxWidth='none';\s*cdGripSync\(\)/.test(src));
  ok('applyRoute runs applyPerms at the door', /function applyRoute\(\)\{\n[^]{0,200}applyPerms\(\);/.test(src));

  sec('view-state migration and the seeded Everything view');
  E("applyViewState({view:'month'})");
  ok("v1's fit-less view:'month' lands on the widest step", E('FIT')===91, 'FIT='+E('FIT'));
  E("applyViewState({view:'month',fit:30})");
  ok('a fit-carrying month snapshot still restores exactly', E('FIT')===30, 'FIT='+E('FIT'));
  E("CLIENT_FILTER=new Set(['Acme'])");
  E("applyView({name:'Everything',state:defaultViewState()})");
  ok('Everything clears a live client filter', E('CLIENT_FILTER.size')===0, 'size='+E('CLIENT_FILTER.size'));

  sec('search matches roster names beside nicknames');
  E("FILTER='sean'");
  ok('the nickname matches', E("taskMatch(ST.tasks.find(t=>t.department==='fab'))")===true);
  E("FILTER='seungwoo'");
  ok('the roster name still matches', E("taskMatch(ST.tasks.find(t=>t.department==='fab'))")===true);
  E("FILTER=''");

  sec('the wordmark goes home from any route');
  E("PERSON='Seungwoo Hong'");
  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    doc.getElementById('tb-home').click();
    setTimeout(()=>{
      ok('one click lands on the timeline', E('ROUTE.view')==='timeline', E('ROUTE.view'));
      ok('…with the person summary dropped', E('PERSON')===null, String(E('PERSON')));

      sec('Company Data exits clear the edit buffer');
      win.location.hash='#/people';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(()=>{
        E("CD_EDIT={id:'s3',name:'Seungwoo Hong',depts:[],ooo:[],email:'',phone:'',role:'Typed'}");
        win.confirm=()=>false;
        doc.getElementById('cd-x').click();
        ok('a declined confirm stays on the page mid-edit', E('ROUTE.view')==='people'&&!!E('CD_EDIT'));
        win.confirm=()=>true;
        doc.getElementById('cd-x').click();
        setTimeout(()=>{
          ok('an accepted exit lands on the timeline', E('ROUTE.view')==='timeline', E('ROUTE.view'));
          ok('…and clears CD_EDIT so the poll runs again', E('CD_EDIT')===null);

          sec('the subtasks grant stops at the phase fields');
          E("CFG['viewer.subtasks']=true;applyPerms()");
          ok('Sam previews as a viewer', E('isViewer()')===true&&E("vcan('phases')")===false);
          win.location.hash='#/project/p1';
          win.dispatchEvent(new win.Event('hashchange'));
          setTimeout(()=>{
            const n0=E('ST.tasks.length');
            E("npvCreateSubtask('fab',ST.tasks[0].startDate)");
            ok('S under an existing bar still adds a subtask', E('ST.tasks.length')===n0+1, E('ST.tasks.length')+' vs '+n0);
            E("npvCreateSubtask('pm','"+D(0)+"')");
            ok('S on a bar-less department is refused (primary bar = a phase)', E('ST.tasks.length')===n0+1, String(E('ST.tasks.length')));
            E("openTaskModal(ST.tasks.find(t=>t.department==='fab').id)");
            ok('phase dates lock under the subtasks grant', doc.getElementById('tm-start').disabled&&doc.getElementById('tm-end').disabled&&doc.getElementById('tm-dept').disabled);
            ok('the notes field locks too (phase-level)', doc.getElementById('tm-notes').disabled);
            E('closeTaskModal(true)');
            E("CFG['viewer.subtasks']=false;CFG['viewer.phases']=true;applyPerms()");
            E("openTaskModal(ST.tasks.find(t=>t.department==='fab').id)");
            ok('the phases grant unlocks the dates', !doc.getElementById('tm-start').disabled&&!doc.getElementById('tm-end').disabled);
            E('closeTaskModal(true)');

            console.log('\ntest-v1181: '+pass+' passed, '+fail+' failed');
            process.exit(fail?1:0);
          },400);
        },300);
      },300);
    },300);
  },300);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
