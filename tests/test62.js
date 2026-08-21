/* REV63: work priority over people priority (supersedes the REV62 fan-out fixes).
   Background: PM/TD/Fab used to draw one parallel bar per person named in the role
   (the roster fan-out). Now a bar is a piece of work: departments generate ONE umbrella
   bar with no owner (ownership is implicit through the project team — barCrew), crews
   of any size ride on bars as comma-joined names, and subtasks (lines) split the work.
   This suite walks that lifecycle on the draft page: one bar per department, a crew
   edit lands on one bar, renames and deletes touch only their bar, and a new subtask
   arrives as its own line.
   Skips entirely on builds that predate the work-priority change.
   Run: node test62.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/barCrew/.test(src)){
  console.log('  SKIP  build predates work-priority crews (no barCrew) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const route=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const tdBars=()=>E("NPV_TASKS.filter(t=>t.department==='td').map(t=>({label:t.label||'',who:t.assignee||''}))");

setTimeout(()=>{
  E("PEOPLE=[{name:'Peter',depts:['td']},{name:'Chris',depts:['td']},{name:'Kate',depts:['td']},{name:'Stan',depts:['td']}];rebuildStaff();");
  route('#/project/new');
  setTimeout(()=>{
    sec('Three drafters make ONE unowned bar — work priority, not people priority');
    ['Peter','Chris','Kate'].forEach(n=>{
      const cb=[...doc.querySelectorAll('#pp-r-dr input')].find(i=>i.value===n);
      cb.checked=true;cb.dispatchEvent(new win.Event('change',{bubbles:true}));
    });
    setTimeout(()=>{
      let bars=tdBars();
      ok('one bar for the department',bars.length===1,JSON.stringify(bars));
      ok('the umbrella bar carries no owner',bars[0]&&!bars[0].who,JSON.stringify(bars));

      sec('A crew of any size rides on a bar as comma-joined names');
      E("var _t=NPV_TASKS.find(t=>t.department==='td');ppPopWho(_t,'Peter, Chris');");
      setTimeout(()=>{
        bars=tdBars();
        ok('still one bar after the crew edit',bars.length===1,JSON.stringify(bars));
        ok('the bar carries both people',bars[0].who==='Peter, Chris',bars[0].who);
        ok('crewOf splits the comma list',
           E("JSON.stringify(crewOf(NPV_TASKS.find(t=>t.department==='td')))")==='["Peter","Chris"]');

        sec('Renaming the bar keeps its crew');
        E("var _t2=NPV_TASKS.find(t=>t.department==='td');ppPopName(_t2,'Armature');");
        setTimeout(()=>{
          bars=tdBars();
          ok('still one bar',bars.length===1,JSON.stringify(bars));
          ok('name and crew both held',bars[0].label==='Armature'&&bars[0].who==='Peter, Chris',
             JSON.stringify(bars));

          sec('A subtask splits the work; a crew edit lands on it alone');
          E("npvCreateSubtask('td','');");
          setTimeout(()=>{
            bars=tdBars();
            ok('two bars — the work split',bars.length===2,JSON.stringify(bars));
            ok('the new subtask is born named',bars.some(b=>/^Subtask \d+$/.test(b.label)));
            E("var _t3=NPV_TASKS.find(t=>t.department==='td'&&/^Subtask/.test(t.label||''));ppPopWho(_t3,'Kate');");
            setTimeout(()=>{
              bars=tdBars();
              ok('the crew edit landed on the subtask',bars.some(b=>b.who==='Kate'),JSON.stringify(bars));
              ok('the Armature crew is untouched',
                 bars.some(b=>b.label==='Armature'&&b.who==='Peter, Chris'),JSON.stringify(bars));

              sec('Deleting one bar of several removes just that bar');
              /* confirm() is stubbed true by the harness. */
              E("var _t4=NPV_TASKS.find(t=>t.department==='td'&&t.assignee==='Kate');ppPopDelete(_t4);");
              setTimeout(()=>{
                bars=tdBars();
                ok('one bar remains',bars.length===1,JSON.stringify(bars));
                ok('the department is still active',E("PP_FORM.activeDepartments.includes('td')"));
                sec('Draft-only system: the saved page never runs applyPhaseLines');
                ok('NPV_LINES is a draft store (guard: saved rebuild reads ST directly)',
                   /if\(NPV_LIVE\)\{[\s\S]{0,200}tasksOf/.test(src));
                done();
              },400);
            },400);
          },400);
        },400);
      },400);
    },400);
  },900);
},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
