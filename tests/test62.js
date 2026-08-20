/* REV62: the roster fan-out and the named-lines system stop fighting on drafts.
   Background: PM/TD/Fab draw one parallel bar per person named in the role (deliberate
   since the beginning); draft bars regenerate per keystroke, so only NPV_LINES are
   durable. Editing one bar created a line for it alone — and applyPhaseLines then
   rebuilt the whole department from lines, silently deleting everyone else's bar
   (rename "removed all subtasks"), while deleting one person's bar fell through to
   unchecking the entire department.
   Now: before a department's first line is touched, ALL of its bars are line-backed
   (ppSeedLines), unnamed-but-assigned lines render, and deleting one of several bars
   removes only that bar.
   Skips entirely on builds that predate REV62.
   Run: node test62.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/ppSeedLines/.test(src)){
  console.log('  SKIP  build predates REV62 (no fan-out line seeding) — nothing to assert');
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
    sec('Three drafters fan out to three parallel bars (deliberate)');
    /* Check the real Team boxes — ppFormSync reads the DOM, so PP_FORM alone won't hold. */
    ['Peter','Chris','Kate'].forEach(n=>{
      const cb=[...doc.querySelectorAll('#pp-r-dr input')].find(i=>i.value===n);
      cb.checked=true;cb.dispatchEvent(new win.Event('change',{bubbles:true}));
    });
    setTimeout(()=>{
      let bars=tdBars();
      ok('one bar per person',bars.length===3,JSON.stringify(bars));
      ok('each carries its person',['Peter','Chris','Kate'].every(n=>bars.some(b=>b.who===n)));
      /* Collapsed departments draw every bar on the parent row (the "overlaid bars"
         look) — nested rows appear once the disclosure is open. */
      E("NPV_OPEN.add('td');npvRender();");
      ok('open, the chart shows a parent row with two nested subtask rows',
         [...doc.querySelectorAll('#npv-body .npv-row.child')].length>=2);

      sec('Renaming one bar keeps everyone else (was: deleted them all)');
      E("var _t=NPV_TASKS.find(t=>t.department==='td'&&t.assignee==='Chris');ppPopName(_t,'Elevations');");
      setTimeout(()=>{
        bars=tdBars();
        ok('still three bars',bars.length===3,JSON.stringify(bars));
        ok('the renamed bar carries the new name and its person',
           bars.some(b=>b.label==='Elevations'&&b.who==='Chris'));
        ok('the other two are untouched',
           bars.some(b=>b.who==='Peter'&&!b.label)&&bars.some(b=>b.who==='Kate'&&!b.label));

        sec('Changing who on one bar keeps the others');
        E("var _t2=NPV_TASKS.find(t=>t.department==='td'&&t.assignee==='Kate');ppPopWho(_t2,'Stan');");
        setTimeout(()=>{
          bars=tdBars();
          ok('still three bars after a who edit',bars.length===3,JSON.stringify(bars));
          ok('the edit landed on the one bar',bars.some(b=>b.who==='Stan')&&!bars.some(b=>b.who==='Kate'));

          sec('Deleting one bar of several removes just that bar');
          /* confirm() is stubbed true by the harness. */
          E("var _t3=NPV_TASKS.find(t=>t.department==='td'&&t.assignee==='Stan');ppPopDelete(_t3);");
          setTimeout(()=>{
            bars=tdBars();
            ok('two bars remain',bars.length===2,JSON.stringify(bars));
            ok('the department is still active',E("PP_FORM.activeDepartments.includes('td')"));

            sec('Adding a subtask keeps the fan-out (same root cause)');
            E("npvCreateSubtask('td','');");
            setTimeout(()=>{
              bars=tdBars();
              ok('the two people plus the new subtask',bars.length===3,JSON.stringify(bars));
              ok('the new subtask is born named',bars.some(b=>/^Subtask \d+$/.test(b.label)));
              sec('Draft-only system: the saved page never runs applyPhaseLines');
              ok('NPV_LINES is a draft store (guard: saved rebuild reads ST directly)',
                 /if\(NPV_LIVE\)\{[\s\S]{0,200}tasksOf/.test(src));
              done();
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
