/* v1.51.1 — item 66, tracker #40: ticking names in a crew list. A tick (and a background poll)
   repainted the popover's list and the bottom panel's list with innerHTML, so the box jumped
   back to the top and the next click, aimed at the next name, hit another one. And a poll
   repaint landing while a name was pressed took the checkbox away mid-click, which Chrome
   drops. Now a repaint gives the same phase's list its scroll and focus back (crewHold), and
   a page repaint waits until a crew click is over. Draft and saved pages, the popover and the
   bottom panel, an install subtask whose pool is the whole staff.
   Run: node tests/test-v1511.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Q4 Frozen In Time 2026',client:'Example Client',jobCode:'Q4',deadline:D(30),
  status:'in-fabrication',projectManager:'Sam',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','cnc','install']),createdAt:D(-30),sortIndex:0}];
const T=(id,dept,s,e)=>({appId:id,projectId:'p1',department:dept,assignee:dept==='install'?'[]':'Sam',
  startDate:s,endDate:e,estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:''});
const tasks=[T('t0','pm',D(-5),D(28)),T('t1','cnc',D(5),D(12)),T('t2','install',D(25),D(27))];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''};
/* a whole staff: the install pool, long enough to scroll */
const CREW=Array.from({length:24},(_,i)=>({appId:'c'+i,Title:'Crew '+String(i+1).padStart(2,'0'),
  email:'crew'+i+'@example.com',depts:JSON.stringify([i<4?'cnc':'install']),ooo:'[]',role:''}));
const w=boot(FILE,{data:{projects,tasks,staff:[SAM,...CREW],todos:[]}}).window;
const doc=w.document,E=s=>w.eval(s);
const q=s=>doc.querySelector(s);
const go=h=>{w.location.hash=h;w.dispatchEvent(new w.Event('hashchange'));};
const box=where=>where==='popover'?q('#npv-pop [data-pop-crew]'):q('#pp-insp #ins-crew');
const pick=(where,name)=>[...box(where).querySelectorAll('input')].find(i=>i.value===name);
/* what a user does: aim at the name where it is now, and click it */
const tick=(where,name)=>{const i=pick(where,name);i.focus();i.click();};
const saved=()=>E('crewOf(ppSelected()).join("|")').split('|').filter(Boolean);
const top=where=>box(where).scrollTop;
const ev=(el,t)=>el.dispatchEvent(new w.Event(t,{bubbles:true}));

/* one surface, one phase already selected (and the popover open when it's the popover) */
async function surface(where,page){
  const tag=page+' '+where;
  const b=box(where);
  ok(tag+': the crew list is there, the whole staff (install pool)', !!b&&b.querySelectorAll('input').length>=25,
     b&&String(b.querySelectorAll('input').length));
  if(!b)return;

  sec(tag+': scroll, then tick one name');
  b.scrollTop=90;
  /* the panel's section scrolls too: on a short dock the list is reached by scrolling it */
  const sect=()=>box(where).closest('.ins-sec .in');
  if(where==='panel')sect().scrollTop=40;
  const g0=E('ST_GEN');
  tick(where,'Crew 20');
  ok(tag+': scrollTop unchanged (90)', top(where)===90, String(top(where)));
  if(where==='panel')ok(tag+': the section keeps its scroll too (40)', sect().scrollTop===40, String(sect().scrollTop));
  ok(tag+': the name is saved', saved().includes('Crew 20'), saved().join());
  ok(tag+': the box shows it ticked', pick(where,'Crew 20').checked);
  ok(tag+': the ticked box keeps the focus', doc.activeElement===pick(where,'Crew 20'));
  if(page==='saved')ok(tag+': one commit per tick', E('ST_GEN')-g0===1, String(E('ST_GEN')-g0));

  sec(tag+': three quick ticks in a row');
  ['Crew 21','Crew 22','Crew 23'].forEach(n=>tick(where,n));
  ok(tag+': all three saved', ['Crew 20','Crew 21','Crew 22','Crew 23'].every(n=>saved().includes(n)), saved().join());
  ok(tag+': still scrolled to 90', top(where)===90, String(top(where)));

  sec(tag+': a poll-style repaint mid-sequence');
  E('PP_KEEP=true;renderProjectPage();');
  ok(tag+': the repaint keeps the scroll', top(where)===90, String(top(where)));
  if(where==='panel')ok(tag+': and the section\'s', sect().scrollTop===40, String(sect().scrollTop));
  ok(tag+': and the ticks', ['Crew 20','Crew 21','Crew 22','Crew 23'].every(n=>pick(where,n).checked));
  tick(where,'Crew 24');
  ok(tag+': a tick after the repaint lands', saved().includes('Crew 24')&&saved().includes('Crew 20'), saved().join());

  sec(tag+': unticking keeps everything else');
  tick(where,'Crew 21');
  ok(tag+': Crew 21 is off, the rest stay', !saved().includes('Crew 21')&&saved().includes('Crew 22'), saved().join());
  ok(tag+': scroll still 90', top(where)===90, String(top(where)));
  /* clean slate for the next surface */
  ['Crew 20','Crew 22','Crew 23','Crew 24'].forEach(n=>tick(where,n));
  if(where!=='panel')return; /* a poll repaints the page; the popover lives outside it */

  /* Real Chrome drops a click whose pressed checkbox leaves the page mid-press (measured with
     CDP mouse events). jsdom can't show that, so this checks the repaint waits. */
  sec(tag+': a poll repaint during a press waits for the click');
  const hd=q('.npv-hd'),inp=pick(where,'Crew 19');
  ev(inp.closest('label'),'pointerdown');
  E('PP_KEEP=true;renderProjectPage();');
  ok(tag+': nothing repainted while the name is pressed', q('.npv-hd')===hd&&inp.isConnected);
  ev(inp.closest('label'),'pointerup');
  inp.click();
  ok(tag+': the pressed name is saved', saved().includes('Crew 19'), saved().join());
  await wait(150);
  ok(tag+': the repaint ran after the release', q('.npv-hd')!==hd);
  ok(tag+': and kept the scroll', top(where)===90, String(top(where)));

  sec(tag+': a press with no click (dragging the list\'s scrollbar) still lets it through');
  const hd0=q('.npv-hd');
  ev(box(where),'pointerdown');
  E('PP_KEEP=true;renderProjectPage();');
  ok(tag+': held while pressed', q('.npv-hd')===hd0);
  ev(box(where),'pointerup');
  await wait(150);
  ok(tag+': ran after the release', q('.npv-hd')!==hd0);

  sec(tag+': Space on a focused name holds it the same way');
  const hdk=q('.npv-hd');
  ev(pick(where,'Crew 17'),'keydown');
  E('PP_KEEP=true;renderProjectPage();');
  ok(tag+': held while the key is down', q('.npv-hd')===hdk);
  ev(doc.activeElement||doc.body,'keyup');
  await wait(150);
  ok(tag+': ran after the key came up', q('.npv-hd')!==hdk);

  sec(tag+': a cancelled press lets the repaint through');
  const hd1=q('.npv-hd');
  ev(pick(where,'Crew 18'),'pointerdown');
  E('PP_KEEP=true;renderProjectPage();');
  ok(tag+': held while pressed', q('.npv-hd')===hd1);
  ev(pick(where,'Crew 18'),'contextmenu');
  ok(tag+': ran when the press turned into a right-click menu', q('.npv-hd')!==hd1);

  sec(tag+': a press outside a crew list does not hold repaints');
  const hd2=q('.npv-hd');
  ev(q('#npv-body'),'pointerdown');
  E('PP_KEEP=true;renderProjectPage();');
  ok(tag+': the repaint ran at once', q('.npv-hd')!==hd2);
  ev(q('#npv-body'),'pointerup');
  tick(where,'Crew 19');
}

(async()=>{
  await wait(1500);
  ok('the source keeps crew lists through repaints (crewHold)', /function crewHold\(/.test(src));
  ok('Sam can edit', E('isAdmin()')===true);

  /* ---------- saved page ---------- */
  go('#/project/p1');await wait(900);
  ok('saved: the page opened', E('NPV_LIVE')===true);
  E("ppSelect('t2',true)");
  await surface('panel','saved');
  E("npvEditPop('phase','t2',10,10)");
  await surface('popover','saved');
  sec('saved: the popover and the panel agree');
  tick('popover','Crew 15');
  ok('saved: the panel shows the popover\'s tick', pick('panel','Crew 15').checked);
  tick('panel','Crew 15');
  ok('saved: the popover shows the panel\'s untick', !pick('popover','Crew 15').checked&&!saved().includes('Crew 15'));
  tick('popover','Crew 16');
  await wait(300);
  const last=w.__spCalls.filter(c=>c.method==='PATCH'&&c.body&&'assignee' in c.body).pop();
  ok('saved: the crew reached SharePoint', !!last&&/Crew 16/.test(JSON.stringify(last.body.assignee)),
     last&&JSON.stringify(last.body.assignee));
  tick('popover','Crew 16');
  sec('saved: another phase starts at the top');
  box('panel').scrollTop=60;
  E('npvPopClose()');E("ppSelect('t1',true)");
  ok('saved: the CNC list opens at the top', !!box('panel')&&top('panel')===0, box('panel')&&String(top('panel')));

  /* ---------- draft page ---------- */
  sec('draft page');
  go('#/project/new');await wait(800);
  const setF=(id,v)=>{const e=doc.getElementById(id);e.value=v;ev(e,'input');ev(e,'change');};
  setF('pp-name','Q4 Frozen In Time 2026');setF('pp-deadline',D(30));
  const ck=q('#pp-depts input[data-dept="install"]');
  if(ck&&!ck.checked){ck.click();if(!ck.checked){ck.checked=true;ev(ck,'change');}}
  await wait(400);
  const id=E("(NPV_TASKS.find(t=>t.department==='install')||{}).id");
  ok('draft: an install bar is drawn', !!id);
  if(!id){done();return;}
  E("ppSelect('"+id+"',true)");
  await surface('panel','draft');
  E("npvEditPop('phase','x',10,10)");
  await surface('popover','draft');
  E('npvPopClose();ppDraftDirty=()=>false;');
  done();
})();
