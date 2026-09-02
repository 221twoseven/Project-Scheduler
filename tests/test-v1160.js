/* v1.16.0 — demo preamble slides (developer-only):
   - Help ▸ Take a tour on a developer login opens four modal slides first; the
     last button ("Start the tour") runs the normal tour. Skip/Esc close without it.
   - Non-developers go straight to the coach tour, unchanged.
   Run: node tests/test-v1160.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('DEMO_SLIDES')<0){
  console.log('test-v1160: skipped — pre-v1.16.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Alpha',client:'Acme',jobCode:'J1',deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',
  startDate:D(0),endDate:D(4),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];
/* admin:'dev' = developer (v1.9.0) — the slides are gated on isDeveloper() */
const staff=[{appId:'s1',Title:'Sam',depts:JSON.stringify(['pm','fab']),ooo:'[]',
  email:'user@example.com',role:'',admin:'dev'}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,E=s=>win.eval(s);
const vis=id=>!win.document.getElementById(id).classList.contains('hidden');
const click=id=>win.document.getElementById(id).click();
const key=k=>win.document.dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));

setTimeout(main,1300);

function main(){
  sec('source markers');
  ok('slides overlay uses the standard modal chrome', src.indexOf('id="demo-modal"')>=0&&/<div class="modal" id="demo-modal">/.test(src));
  ok('titles wear the Brauer face', /#demo-modal h3\{font-family:'Brauer Neue'/.test(src));
  /* v1.18.0 added !DEV_VIEW to the gate (the Non-admin preview gets the plain tour) */
  ok('mi-tour gates the slides on developer, off project pages',
     /isDeveloper\(\)&&(!DEV_VIEW&&)?ROUTE\.view!=='project'\)\{demoStart\(\);return;\}/.test(src));
  ok('first-visit auto-run still starts the plain tour', /setTimeout\(coachStart,700\)/.test(src));

  E('coachEnd()'); /* the first-visit auto tour may be up — clear the deck */
  sec('a developer’s Help ▸ Take a tour opens the slides');
  ok('signed-in user is a developer', E('isDeveloper()')===true);
  click('mi-tour');
  ok('slides overlay opens', vis('demo-overlay'));
  ok('coach tour did NOT start', E('COACH')===null);
  ok('four slides', E('DEMO_SLIDES.length')===4);
  ok('step counter reads 1 / 4', win.document.getElementById('demo-step').textContent==='1 / 4');
  ok('Back is disabled on the first slide', win.document.getElementById('demo-back').disabled===true);
  ok('slide 1 title renders', win.document.getElementById('demo-title').textContent.length>0);
  ok('slide body renders paragraphs', win.document.querySelectorAll('#demo-body p').length>0);

  sec('navigation');
  click('demo-next');
  ok('Next advances (2 / 4)', win.document.getElementById('demo-step').textContent==='2 / 4');
  click('demo-back');
  ok('Back returns (1 / 4)', win.document.getElementById('demo-step').textContent==='1 / 4');
  key('ArrowRight');
  ok('→ advances too', win.document.getElementById('demo-step').textContent==='2 / 4');
  key('ArrowLeft');
  ok('← goes back', win.document.getElementById('demo-step').textContent==='1 / 4');
  click('demo-next');click('demo-next');click('demo-next');
  ok('last slide relabels Next', win.document.getElementById('demo-next').textContent==='Start the tour');
  click('demo-next');
  ok('finishing the slides closes the modal', !vis('demo-overlay'));
  ok('…and starts the normal tour', E('COACH')!==null&&vis('coach'));
  E('coachEnd()');

  sec('skip and Esc close without the tour');
  click('mi-tour');
  click('demo-skip');
  ok('Skip closes, no tour', !vis('demo-overlay')&&E('COACH')===null);
  click('mi-tour');
  key('Escape');
  ok('Esc closes, no tour', !vis('demo-overlay')&&E('COACH')===null);

  sec('non-developers are untouched');
  E("personByName(meName()).developer=false");
  click('mi-tour');
  ok('tour starts directly', E('COACH')!==null&&vis('coach'));
  ok('no slides', !vis('demo-overlay'));

  console.log('\ntest-v1160: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
