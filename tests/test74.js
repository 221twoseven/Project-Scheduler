/* REV74: coach marks + help button (N14, owner-approved 2026-08-25).
   - A Help button in the global toolbar row starts a spotlight tour; steps whose
     target isn't in the DOM are dropped.
   - First run on a fresh browser auto-starts the tour once, after boot; the seen
     flag (set even on an abandoned tour) stops it ever nagging again.
   - Keyboard: Enter/→ next, ← back, Escape ends; the tour owns the keyboard while up.
   - Skip / Back / Next buttons; Next reads "Done" on the last step.
   Skips on builds that predate the tour.
   Run: node test74.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/btn-help/.test(src)){
  console.log('  SKIP  build predates the coach-mark tour (no btn-help) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
/* v1.10.0: the last home step chains into the project tour instead of reading Done */
const V1100=src.indexOf('coachUnchain')>=0;

/* First boot: fresh browser (coachFirstRun leaves the seen flag unset) */
const dom=boot(FILE,{coachFirstRun:true,data:{projects:[],tasks:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);
const key=k=>E("document.dispatchEvent(new KeyboardEvent('keydown',{key:'"+k+"',bubbles:true}))");

setTimeout(()=>{
  sec('First run: the tour auto-opens once');
  ok('the tour is up',!E("document.getElementById('coach').classList.contains('hidden')"));
  ok('the seen flag is set immediately',E("localStorage.getItem(COACH_KEY)")==='1');
  ok('it starts at step 1 and Back is disabled',
     E("document.getElementById('coach-step').textContent")==='STEP 1 OF '+E("COACH.steps.length")
     &&E("document.getElementById('coach-back').disabled")===true);
  ok('every declared step has a live target',E("COACH.steps.length")===E("COACH_STEPS.length"));

  sec('Stepping: buttons and keyboard agree');
  E("document.getElementById('coach-next').click()");
  ok('Next advances',E("COACH.i")===1&&/STEP 2/.test(E("document.getElementById('coach-step').textContent")));
  ok('the step names a real element',E("!!document.querySelector(COACH.steps[1].sel)"));
  key('ArrowRight');
  ok('→ advances too',E("COACH.i")===2);
  key('ArrowLeft');
  ok('← goes back',E("COACH.i")===1);
  E("document.getElementById('coach-back').click()");
  ok('Back reaches step 1 again',E("COACH.i")===0&&E("document.getElementById('coach-back').disabled")===true);

  sec('The tour owns the keyboard while up');
  key('/');
  ok('/ does not reach the search box',E("document.activeElement!==document.getElementById('t-search')"));

  sec('The last step finishes; Escape and Skip end early');
  E("COACH.i=COACH.steps.length-1;coachShow();");
  if(V1100){
    /* v1.10.0: the last home step CHAINS into the project tour — Next hides, the
       overlay lets the + New Project click through. Ending it here without clicking
       keeps this suite on the timeline; the chain itself is test-v1100's job. */
    ok('the chain step hides Next and arms the click-through',
       E("document.getElementById('coach').classList.contains('chain')")
       &&E("COACH.steps[COACH.i].chain===true"));
    E('coachEnd()');
    ok('ending clears the chain wiring',E("COACH===null")&&!E("document.getElementById('coach').classList.contains('chain')"));
  }else{
    ok('the last button reads Done',E("document.getElementById('coach-next').textContent")==='Done');
    E("document.getElementById('coach-next').click()");
    ok('Done closes the tour',E("COACH===null")&&E("document.getElementById('coach').classList.contains('hidden')"));
  }

  sec('Help replays it any time');
  E("document.getElementById('mi-tour').click()");
  ok('the button restarts the tour at step 1',E("COACH&&COACH.i===0")&&!E("document.getElementById('coach').classList.contains('hidden')"));
  key('Escape');
  ok('Escape ends it',E("COACH===null"));
  E("document.getElementById('mi-tour').click()");
  E("document.getElementById('coach-skip').click()");
  ok('Skip ends it too',E("COACH===null"));

  sec('Steps drop when their target is missing');
  E("var kept=document.getElementById('btn-dash');kept.parentNode.removeChild(kept);");
  E("document.getElementById('mi-tour').click()");
  ok('a missing target shortens the tour instead of breaking it',
     E("COACH.steps.length")===E("COACH_STEPS.length")-1
     &&E("COACH.steps.every(s=>!!document.querySelector(s.sel))"));
  key('Escape');

  sec('A browser that has seen the tour never gets nagged (second boot)');
  const dom2=require('./harness').boot(FILE,{data:{projects:[],tasks:[],todos:[]}});
  setTimeout(()=>{
    ok('no auto-tour when the flag is set',dom2.window.eval("document.getElementById('coach').classList.contains('hidden')"));
    console.log('\n'+'-'.repeat(46));
    console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
    process.exit(fail?1:0);
  },1500);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
