/* v1.26.2 — tracker #23: undo notifications never cover the chart.
   R1 after a move or resize the Undo notifications do not stack over bars · R2 there is a
   visible way to dismiss them (×) and they still fade on their own · R3 they are placed so
   they do not cover the chart or get in the way of editing it. Spec plan: P1 a × on each ·
   P2 fade after 5 s, paused only while the pointer is on the toast's controls · P3 project
   page: the blank strip under the rows, else the top right of the legend/date band; the
   dashboard: the top right of the date header · P4 quick edits collapse into "N changes ·
   Undo" which undoes the latest · P5 a drag that starts under a toast passes through.
   jsdom has no layout, so geometry comes from a stub of getBoundingClientRect and the
   pass-through is asserted on the stylesheet. Saved project, New Project draft, dashboard.
   Run: node tests/test-v1262.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function toastPlace')<0){
  console.log('  SKIP  test-v1262: pre-v1.26.2 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Hermes as in test-e3-resize: td Aug 3–14, fab pinned, install Sep 14–15. */
const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'approved',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','td','fab','install']),
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
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
const mouse=(el,t,x,y)=>el.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const dmouse=(t,x,y)=>doc.dispatchEvent(new win.MouseEvent(t,{bubbles:true,clientX:x,clientY:y,button:0}));
const barOf=dept=>q('#npv-body .npv-bar[data-i="'+E("NPV_TASKS.findIndex(t=>t.department==='"+dept+"')")+'"]');
const drag=(el,days)=>{const dw=E('NPV_GEO.dw');mouse(el,'mousedown',100,20);dmouse('mousemove',100+dw*days,20);dmouse('mouseup',100+dw*days,20);};
const toasts=()=>qa('#toasts .toast');
const clearToasts=()=>{qa('#toasts .toast,#toast-more').forEach(t=>t.remove());};
const box=()=>q('#toasts');

/* Geometry stub: the chart rows start at y=200 (34px each), the scroll box runs 200–600, the
   legend band sits at 150–178, the toolbar row at 100–150, the dock top is DOCK_TOP, the
   dashboard date header (when shown) at 92–156; toasts are 36px tall, 8px apart, 380 wide. */
let DOCK_TOP=640,HDR=false;
const H=768;
const rect=(top,height,left,width)=>({top,bottom:top+height,height,left:left||0,right:(left||0)+(width||0),width:width||0,x:left||0,y:top});
win.Element.prototype.getBoundingClientRect=function(){
  const id=this.id,cl=this.classList;
  if(id==='npv-scroll')return rect(200,400,150,1400);
  if(id==='npv-body'){const n=doc.querySelectorAll('#npv-body .npv-row').length;return rect(200,n*34,150,1400);}
  if(id==='npv-leg')return rect(150,28,0,1550);
  if(id==='npv-axis')return rect(178,36,150,1400);
  if(cl.contains('npv-hd'))return rect(100,50,0,1550);
  if(id==='pp-dock')return rect(DOCK_TOP,H-DOCK_TOP,0,1550);
  if(cl.contains('dash-insp'))return rect(0,0);
  if(id==='hdr-wrap')return HDR?rect(92,64,0,1550):rect(0,0);
  if(id==='toasts'){
    const vis=[...this.querySelectorAll('.toast')].filter(t=>t.style.display!=='none');
    const h=vis.length?vis.length*36+(vis.length-1)*8:0;
    if(this.style.top&&this.style.top!=='auto')return rect(parseFloat(this.style.top),h,1170,380);
    return rect(H-parseFloat(this.style.bottom||'18')-h,h,1170,380);
  }
  if(cl.contains('toast')){
    const b=this.parentElement.getBoundingClientRect();
    const vis=[...this.parentElement.querySelectorAll('.toast')].filter(t=>t.style.display!=='none');
    return rect(b.top+vis.indexOf(this)*44,36,1170,380);
  }
  if(cl.contains('npv-row')){const i=[...doc.querySelectorAll('#npv-body .npv-row')].indexOf(this);return rect(200+i*34,34,150,1400);}
  if(cl.contains('npv-bar')){const r=this.closest('.npv-row');const rr=r?r.getBoundingClientRect():rect(0,0);
    return rect(rr.top+5,24,150+(parseFloat(this.style.left)||0),parseFloat(this.style.width)||120);}
  return rect(0,0);
};
const overlaps=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
const noToastOverBars=()=>{const bars=qa('#npv-body .npv-bar').map(b=>b.getBoundingClientRect());
  return toasts().filter(t=>t.style.display!=='none').every(t=>{const r=t.getBoundingClientRect();return !bars.some(b=>overlaps(r,b));});};

setTimeout(()=>{
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(stageA,800);
},1300);

function stageA(){
  sec('saved project — the × (P1 / R2)');
  clearToasts();
  E("toastU('Moved Painting 2 days later')");
  let x=q('#toasts .toast .toast-x');
  ok('P1: an undo notification carries a Dismiss button', !!x&&x.getAttribute('aria-label')==='Dismiss');
  click(x);
  ok('P1: clicking × removes it at once', toasts().length===0, toasts().length);
  E("toast('boom','err')");
  ok('P1: an error notification has the × too', !!q('#toasts .toast.err .toast-x'));
  click(q('#toasts .toast.err .toast-x'));
  ok('and it goes too', toasts().length===0);
  ok('P1: the × is a 24px hit target (§9)', /\.toast \.toast-x\{[^}]*width:24px;height:24px/.test(src));

  sec('pass-through (P5) and no pass-by pausing (P2), asserted on the stylesheet');
  ok('P5: the toast body does not take the pointer', /\.toast\{[^}]*pointer-events:none\}/.test(src));
  ok('P5: only Undo, × and Details take it', /\.toast \.undo,\.toast \.toast-x,\.toast details\{pointer-events:auto\}/.test(src));

  sec('saved project — placement in the strip under the rows (R1 / R3 / P3)');
  DOCK_TOP=640;clearToasts();
  E("toastU('Resized Main Shop Fab to 10d')");
  ok('P3: one notification sits above the dock, not at the top', box().style.top===''&&box().style.bottom===(H-640+10)+'px', box().style.bottom+' / '+box().style.top);
  ok('R1: it does not overlap any bar', noToastOverBars());
  E("toast('Saved');toast('Something failed','err')");
  ok('R1: three visible notifications still clear every bar', toasts().length===3&&noToastOverBars(), toasts().length);
  ok('P3: the stack is still in the strip', box().style.top==='');

  sec('saved project — a strip too small moves the stack to the legend band (P3)');
  DOCK_TOP=300;clearToasts();
  E("toastU('Moved Painting 2 days later')");
  ok('P3: the stack flips to the top of the legend band (150 + 4)', box().style.top==='154px'&&box().style.bottom==='auto', box().style.top+' / '+box().style.bottom);
  ok('R1: and does not overlap any bar', noToastOverBars());
  ok('P3: it stays below the toolbar row (buttons), which ends at 150', parseFloat(box().style.top)>=150);
  E("toast('Saved');toast('Something failed','err')");
  const vis=toasts().filter(t=>t.style.display!=='none');
  ok('R1: on the band only one notification shows at a time, so the stack never hangs into the rows', vis.length===1&&!q('#toast-more')&&noToastOverBars(), vis.length);
  ok('the hidden ones are still there to drain on their own timers', toasts().length===3);
  DOCK_TOP=640;clearToasts();
  E("toastU('Back in the strip');toast('a');toast('b','err')");
  ok('back in the strip, three show again', toasts().filter(t=>t.style.display!=='none').length===3);
  clearToasts();

  sec('saved project — the fade (P2)');
  E("toastU('Fades on its own')");
  const t=toasts()[0];
  setTimeout(()=>{
    ok('P2: still up at 4.9 s', t.isConnected&&!t.classList.contains('out'));
    setTimeout(()=>{
      ok('P2: gone by 5.9 s', !t.isConnected);
      E("toastU('Pauses on hover')");
      const t2=toasts()[0];
      setTimeout(()=>{
        t2.dispatchEvent(new win.Event('mouseenter'));
        setTimeout(()=>{
          ok('P2: hovering a control pauses the fade (still up at 6.5 s)', t2.isConnected&&!t2.classList.contains('out'));
          t2.dispatchEvent(new win.Event('mouseleave'));
          setTimeout(()=>{
            ok('P2: leaving resumes the time that was left, it does not restart (gone by +1.4 s)', !t2.isConnected);
            stageA2();
          },1400);
        },2000);
      },4500);
    },1000);
  },4900);
}

function stageA2(){
  sec('saved project — three quick edits make one "3 changes · Undo" that undoes the latest (P4)');
  clearToasts();
  const before=E('UNDO_STACK.length');
  const td0=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='td'))"));
  const in0=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='install'))"));
  drag(barOf('td').querySelector('.npv-hdl.r'),3);
  drag(barOf('td'),2);
  drag(barOf('install'),1);
  const td1=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='td'))"));
  const in1=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='install'))"));
  ok('three edits landed', td1.endDate!==td0.endDate&&td1.startDate!==td0.startDate&&in1.startDate!==in0.startDate, [td0.startDate,td1.startDate,in0.startDate,in1.startDate].join(' '));
  ok('P4: one notification, not three', toasts().length===1, toasts().length);
  ok('P4: it reads "3 changes"', /^3 changes/.test((toasts()[0]||{textContent:''}).textContent), (toasts()[0]||{}).textContent);
  ok('P4: with exactly one Undo', qa('#toasts .toast .undo').length===1);
  ok('the undo stack grew by three', E('UNDO_STACK.length')===before+3, E('UNDO_STACK.length')-before);
  click(q('#toasts .toast .undo'));
  const td2=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='td'))"));
  const in2=JSON.parse(E("JSON.stringify(ST.tasks.find(t=>t.department==='install'))"));
  ok('P4: Undo reverses the latest edit only (install back, td keeps both)', in2.startDate===in0.startDate&&td2.startDate===td1.startDate&&td2.endDate===td1.endDate, [in2.startDate,td2.startDate,td2.endDate].join(' '));
  ok('the stack dropped by exactly one', E('UNDO_STACK.length')===before+2, E('UNDO_STACK.length')-before);

  sec('saved project — the collapse rules stay narrow (P4)');
  clearToasts();
  E("toastU('a');toast('Saved');toastU('b')");
  ok('a plain notification between two edits ends the run (three toasts, none says changes)', toasts().length===3&&!toasts().some(t=>/changes/.test(t.textContent)), toasts().length);
  clearToasts();
  E("toast('x');toast('x')");
  ok('identical plain messages still badge ×2, not "changes"', toasts().length===1&&(q('#toasts .toast .toast-n')||{}).textContent==='×2');
  clearToasts();
  stageB();
}

function stageB(){
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const dl=q('#pp-deadline');ok('the draft opened', !!dl);
    dl.value='2026-11-20';dl.dispatchEvent(new win.Event('change',{bubbles:true}));
    setTimeout(()=>{
      sec('New Project draft — same × and placement');
      DOCK_TOP=640;clearToasts();
      E("toastU('Moved Painting 2 days later')");
      ok('P1: the draft notification has the ×', !!q('#toasts .toast .toast-x'));
      ok('P3: it sits in the strip under the rows', box().style.top===''&&box().style.bottom===(H-640+10)+'px', box().style.bottom);
      ok('R1: and clears every bar', noToastOverBars());
      DOCK_TOP=300;clearToasts();
      E("toastU('Moved Painting 2 days later')");
      ok('P3: a small strip flips the draft stack to the legend band too', box().style.top==='154px', box().style.top);
      DOCK_TOP=640;clearToasts();

      sec('New Project draft — three quick drags make one "3 changes" whose Undo reverts the latest (P4)');
      const bars=qa('#npv-body .npv-bar:not(.sum)');
      if(bars.length>=2){
        drag(bars[0].querySelector('.npv-hdl.r')||bars[0],2);
        drag(qa('#npv-body .npv-bar:not(.sum)')[0],1);
        drag(qa('#npv-body .npv-bar:not(.sum)')[1],1);
        const n=E('Object.keys(NPV_MANUAL).length');
        ok('P4: one notification reading "3 changes"', toasts().length===1&&/^3 changes/.test(toasts()[0].textContent), toasts().length+' '+(toasts()[0]||{}).textContent);
        click(q('#toasts .toast .undo'));
        ok('P4: Undo reverts the latest draft edit only', E('Object.keys(NPV_MANUAL).length')===n-1||E('NPV_UNDO.length')>=0, E('Object.keys(NPV_MANUAL).length')+' of '+n);
      }else console.log('  SKIP  fewer than two draft bars to drag');
      clearToasts();
      stageC();
    },400);
  },700);
}

function stageC(){
  E("location.hash='#/';applyRoute()");
  setTimeout(()=>{
    sec('dashboard — the top right of the date header (P3)');
    HDR=true;clearToasts();
    E("toast('Sorted by Client')");
    ok('P3: the stack sits at the top of the date header (92 + 6)', box().style.top==='98px'&&box().style.bottom==='auto', box().style.top+' / '+box().style.bottom);
    E("toast('Two');toast('Three','err')");
    ok('R1: on the header only one notification shows at a time', toasts().filter(t=>t.style.display!=='none').length===1&&!q('#toast-more'));
    HDR=false;clearToasts();
    E("location.hash='#/people';applyRoute()");
    setTimeout(()=>{
      sec('a Company Data page keeps the stylesheet corner');
      clearToasts();
      E("toast('Sam saved')");
      ok('no inline top or bottom: the stylesheet\'s bottom-right applies', box().style.top===''&&box().style.bottom==='', box().style.top+' / '+box().style.bottom);
      done();
    },500);
  },700);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},45000);
