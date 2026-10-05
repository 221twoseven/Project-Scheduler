/* v1.33.1 — the department's day count sits beside its own date pair, not on the header row.
   The primary date line (.ddates, not .rng) carries the row's .ddays, the way each range line
   carries its .rdays; the header row keeps the checkbox, the name and the +. The readers
   (ppCommitDepts / readPageDraft / the change delegate) query .ddays under the row, so moving
   it changes nothing they see. Both pages: a saved project and the New Project draft.
   Run: node tests/test-v1331.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('v1.33.1: the day count sits beside its own date pair')<0){
  console.log('  SKIP  test-v1331: pre-v1.33.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',deadline:'2026-09-15',status:'in-fabrication',
  projectManager:'Sam',drafter:'Peter',leadFab:'Nick',fabricators:'',activeDepartments:JSON.stringify(['pm','td','finish']),createdAt:'2026-07-01',sortIndex:0}];
const T=(id,dept,who,s,e,d,extra)=>Object.assign({appId:id,projectId:'p1',department:dept,assignee:who,startDate:s,endDate:e,estimatedDays:d,ticketNodes:'[]',notes:'',pinned:false,label:''},extra||{});
const tasks=[T('t0','pm','Sam','2026-08-03','2026-09-15',30),T('td1','td','Peter','2026-08-03','2026-08-07',5),
  T('td2','td','Peter','2026-08-10','2026-08-12',3,{range:true}),T('f1','finish','Nick','2026-08-10','2026-08-14',5)];
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const idr=d=>q('#pp-depts input[data-dept="'+d+'"]').closest('.idr');
const lines=d=>[...idr(d).querySelectorAll('.ddates')];
/* the header row = the .idr's children before its first date line */
const header=d=>{const r=idr(d),out=[];for(const c of r.children){if(c.classList.contains('ddates'))break;out.push(c);}return out;};

function check(page){
  sec(page+' — the day count lives on the primary date line');
  const ls=lines('td');
  ok('Technical Design has a primary line and a range line', ls.length===2&&!ls[0].classList.contains('rng')&&ls[1].classList.contains('rng'), ls.map(l=>l.className).join('|'));
  ok('the primary line carries the row\'s one .ddays, after its dates', !!ls[0].querySelector('.dend ~ .ddays')&&idr('td').querySelectorAll('.ddays').length===1);
  ok('…followed by its "d" label', (ls[0].querySelector('.ddays + .dlbl')||{}).textContent==='d');
  ok('the header row holds no day count or label — checkbox, name, + only', header('td').every(c=>!c.classList.contains('ddays')&&!c.classList.contains('dlbl')), header('td').map(c=>c.className||c.tagName).join('|'));
  ok('the range line keeps its own .rdays and no .ddays', !!ls[1].querySelector('.rdays')&&!ls[1].querySelector('.ddays'));
  ok('the PM row still reads "spans job" with no date line', /spans job/.test(idr('pm').textContent)&&lines('pm').length===0);
}

setTimeout(()=>{E("NPV_OPEN=new Set();LINK_SUBS=true;location.hash='#/project/p1';applyRoute()");setTimeout(()=>{
  check('Saved project');
  ok('the day count still shows the primary\'s days (5), not the range\'s', idr('td').querySelector('.ddays').value==='5', idr('td').querySelector('.ddays').value);
  const dd=idr('td').querySelector('.ddays');dd.value='3';change(dd);
  setTimeout(()=>{
    ok('editing it still moves the primary bar\'s end (Aug 3 + 3 workdays → Aug 5)', E("ST.tasks.find(t=>t.id==='td1').endDate")==='2026-08-05'&&E("ST.tasks.find(t=>t.id==='td1').estimatedDays")===3, E("ST.tasks.find(t=>t.id==='td1').endDate"));
    E("location.hash='#/project/new';applyRoute()");
    setTimeout(()=>{
      sec('New Project draft');
      const dd2=idr('td').querySelector('.ddays'),ls=lines('td');
      ok('the draft row\'s day count sits on its date line too', !!dd2&&ls.length>=1&&ls[0].contains(dd2)&&header('td').every(c=>!c.classList.contains('ddays')));
      ok('the draft commits the moved field (readPageDraft reads it under the row)', (()=>{dd2.value='7';change(dd2);E("readPageDraft&&readPageDraft()");return E("PP_FORM&&PP_FORM.est&&PP_FORM.est.td")===7;})(), E("PP_FORM&&PP_FORM.est&&PP_FORM.est.td"));
      done();
    },900);
  },500);
},900);},1300);

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
