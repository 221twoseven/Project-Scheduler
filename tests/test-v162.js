/* v1.6.2 + v1.6.3 — the second /preview/ polish round and its fix batch (2026-08-31).
   v1.6.2:
   0) Follow-up on v1.6.1 item 9: the date header syncs in the SAME frame as the
      canvas during zooms (hdr-wrap no longer lags a scroll-event tick behind).
   1) The project-page date strip drives the global header's gestures — drag
      left/right pans, drag up/down zooms continuously (NPV_FIT goes float).
   2) Dept lens + another person's filter reads as "Summary · name", not My
      Dashboard — the toolbar button stays dark; your own stays "My Dashboard".
   3) The phase dock gains a third column: agenda's width halved, notes full-height.
   v1.6.3 (the project-Gantt scroll fallout):
   4) Step buttons anchor today's pixel through the fit change (no random snap).
   5) The axis gets a sticky gutter mask — dates/months/shading no longer slide
      under the name column when the panel is scrolled.
   6) Weekend webs move into the z0 tint layer with the §2.4 hatch treatment —
      they used to paint ABOVE the rows, washing every bar that crossed a weekend.
   v1.6.4 (third review round):
   7) The Summary/Dashboard place follows the person into the Projects lens too —
      the lens toggle hides whenever a person is on; only the dept reading is flat.
   Run: node tests/test-v162.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('NPV_AXDRAG')<0){
  console.log('test-v162: skipped — pre-v1.6.2 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D=n=>{const d=new Date();d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:D(30),status:'in-fabrication',projectManager:'Sam',drafter:'Sam',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-5),
  endDate:D(10),estimatedDays:12,ticketNodes:'[]',notes:'check the glass order',pinned:false,label:''}];
/* Sam matches the harness account (user@example.com) so meName() resolves to Sam. */
const staff=[
  {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM'},
  {appId:'s2',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];

setTimeout(main,1300);

function main(){
  sec('item 0 — the date header tracks the canvas in the same frame');
  const sc=doc.getElementById('gantt-scroll'),hw=doc.getElementById('hdr-wrap');
  E("setView('week');zoomSettle()");
  ok('after a step zoom, header and canvas scroll agree',
     hw.scrollLeft===sc.scrollLeft, hw.scrollLeft+' vs '+sc.scrollLeft);
  E("setView('month');zoomSettle()");
  ok('…and again on the way back', hw.scrollLeft===sc.scrollLeft);

  sec('item 2 — another person\'s view is a Summary, mine is My Dashboard');
  E("LENS='dept';PERSON='Sam';saveUI();render()");
  ok('my own dashboard still reads My Dashboard', q('#db-name').textContent==='My Dashboard · Sam',
     q('#db-name').textContent);
  ok('…and the toolbar button lights', q('#btn-dash').classList.contains('active'));
  ok('…and the sidebar label says My Dashboard',
     q('#sb-head .sb-dash-lbl').textContent==='My Dashboard');
  E("PERSON='Nick';saveUI();render()");
  ok('another person reads Summary · name', q('#db-name').textContent==='Summary · Nick',
     q('#db-name').textContent);
  ok('…the My Dashboard button stays dark', !q('#btn-dash').classList.contains('active'));
  ok('…and the sidebar label follows', q('#sb-head .sb-dash-lbl').textContent==='Summary');
  ok('the view mechanics are unchanged (still the dashboard machinery)', E('dashOn()')===true);

  sec('v1.6.4 — the summary follows the person into the Projects lens');
  E("LENS='project';saveUI();render()");
  ok('project lens + person still presents as the summary place',
     E('dashOn()')===true&&doc.body.classList.contains('dash-on'));
  ok('…trail bar and sidebar label intact', q('#db-name').textContent==='Summary · Nick'
     &&q('#sb-head .sb-dash-lbl').textContent==='Summary');
  ok('…the person never counts as a filter here', E('activeFilterCount()')===0);
  ok('…but the flat treatment stays dept-only (carets/⇕ All keep working)',
     !doc.body.classList.contains('dash-flat'));
  E("LENS='dept';render()");
  ok('the dept reading flattens as before', doc.body.classList.contains('dash-flat'));
  E("PERSON=null;LENS='project';saveUI();render()");

  /* items 1 + 3 live on the project page */
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(projPart,800);
}

function projPart(){
  sec('item 3 — the phase dock gets a full-height notes column');
  E("ppSelect('t1')");
  const secs=qa('#pp-insp .ins-sec').map(s=>s.dataset.sec);
  ok('three dock sections: phase | agenda | notes',
     JSON.stringify(secs)===JSON.stringify(['phase','agenda','notes']), secs.join(','));
  const ta=q('#pp-insp .ins-sec[data-sec="notes"] textarea[data-f="notes"]');
  ok('the notes textarea lives in its own section', !!ta);
  ok('…seeded with the stored notes', ta&&ta.value==='check the glass order');
  ok('…and the old inline notes row is gone',
     !q('#pp-insp .ins-sec[data-sec="phase"] textarea[data-f="notes"]'));
  if(ta){
    ta.value='verify hinge stock too';
    ta.dispatchEvent(new win.Event('change',{bubbles:true}));
  }
  ok('editing it commits through the shared field path',
     E("ST.tasks.find(t=>t.id==='t1').notes")==='verify hinge stock too',
     E("ST.tasks.find(t=>t.id==='t1').notes"));

  sec('item 1 — the date strip pans and zooms like the global header');
  const ax=doc.getElementById('npv-axis'),sc=doc.getElementById('npv-scroll');
  ok('the strip advertises the gesture', (ax.title||'').indexOf('Drag')>=0);
  ok('boot state is Fit (no stored step)', E('NPV_FIT')===null);
  /* horizontal drag pans */
  sc.scrollLeft=100;
  ax.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:20,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:220,clientY:24}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true}));
  ok('a mostly-horizontal drag pans the panel', sc.scrollLeft===180, sc.scrollLeft);
  ok('…and never zooms', E('NPV_FIT')===null);
  /* vertical drag zooms continuously */
  ax.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:60,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:305,clientY:-30}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true}));
  setTimeout(()=>{
    const f=E('NPV_FIT');
    ok('a mostly-vertical drag up zooms in (fewer days)', typeof f==='number'&&f>7&&f<34, 'NPV_FIT='+f);
    ok('a drag-set fit lights no step button (Fit included)',
       qa('#npv-zoom button.on').length===0);
    ok('…and persisted on release',
       Math.abs(parseFloat(win.localStorage.getItem('shopTimelineNpvFit'))-f)<.01,
       win.localStorage.getItem('shopTimelineNpvFit'));
    E("document.querySelector('#npv-zoom button[data-fit=\\'\\']').click()");
    ok('the Fit button restores whole-job scale', E('NPV_FIT')===null);
    v163Part();
  },120);
}

function v163Part(){
  sec('v1.6.3 — step buttons anchor today through the fit change');
  const sc=doc.getElementById('npv-scroll');
  const todayX=()=>E('NPV_GUT+diffDays(NPV_GEO.lo,today())*NPV_GEO.dw')-sc.scrollLeft;
  const x0=todayX();
  E("document.querySelector('#npv-zoom button[data-fit=\\'7\\']').click()");
  ok('Fit → Week holds today at the same pixel', Math.abs(todayX()-x0)<1.5,
     x0+' -> '+todayX());
  E("document.querySelector('#npv-zoom button[data-fit=\\'30\\']').click()");
  ok('Week → Month holds it too', Math.abs(todayX()-x0)<1.5, x0+' -> '+todayX());

  sec('v1.6.3 — the axis wears a sticky gutter mask');
  const ag=q('#npv-axis .npv-axgut');
  ok('the mask renders first in the axis', !!ag&&ag===doc.getElementById('npv-axis').firstChild);
  ok('…sized to the name column', ag&&ag.style.width===E('NPV_GUT')+'px', ag&&ag.style.width);

  sec('v1.6.3 — weekend webs live under the rows, not over the bars');
  ok('webs render inside the z0 tint layer', qa('#npv-body .npv-tintl .npv-web').length>0,
     qa('#npv-body .npv-tintl .npv-web').length+' webs');
  ok('…and none float loose above the rows anymore',
     qa('#npv-body > .npv-web').length===0);
  ok('the web carries the §2.4 hatch, not the old grey slab',
     /\.npv-web\{[^}]*\}|repeating-linear-gradient/.test(src)
     &&src.indexOf('.npv-web{position:absolute;top:0;bottom:0;background:rgba(100,116,139,.10)')<0);
  done();
}

function done(){
  console.log('\ntest-v162: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
