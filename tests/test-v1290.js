/* v1.29.0 — tracker #19: employee names are easier to find in project setup.
   R1 each Team list (Project manager, Drafter, Lead fabricator, Fabricators) is alphabetical
   by the name as shown (plan 1: first-name order, a nickname sorts where it reads) ·
   R2 a Search box above each list narrows the names as you type, on any part of the shown
   or stored name (plan 2) · plan 3 checked names stay at the top and stay visible while
   filtering · plan 4 the lists show about nine names before scrolling.
   Both pages: the New Project draft and a saved project render the Team section through
   the same fillRoleChecks().
   Run: node tests/test-v1290.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('pg-rq')<0){
  console.log('  SKIP  test-v1290: pre-v1.29.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

/* SharePoint order deliberately scrambled; ten PMs so the box overflows. Molly Chen goes by Zoe. */
const P=(id,name,dept,extra)=>Object.assign({appId:id,Title:name,depts:JSON.stringify([dept]),ooo:'[]',email:'',role:''},extra||{});
const staff=[
  P('s1','Stan Kim','pm'),P('s2','Matthew Schulz','pm'),P('s3','Tyler Brooks','pm'),P('s4','Caroline Bondi','pm'),
  P('s5','Robert Maciel','pm'),P('s6','Nina Okafor','pm'),P('s7','Mac Milsark','pm'),P('s8','Molly Chen','pm',{nickname:'Zoe'}),
  P('s9','Greg Walsh','pm'),P('s10','Hubert Li','pm'),
  P('s11','Peter Skvarla','td'),P('s12','Jason Pfaeffle','td'),P('s13','Sam Ortiz','td',{email:'user@example.com'}),
  P('s14','Danny Park','fab'),P('s15','Jeffrey Niles','fab'),P('s16','Emil Byrne','fab')];
const projects=[{appId:'p1',Title:'Saved Job',client:'C',jobCode:'J1',deadline:D(40),status:'in-fabrication',
  projectManager:'Hubert Li',drafter:'Peter S.',leadFab:'Emil Byrne',fabricators:'',
  activeDepartments:JSON.stringify(['pm','td']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'td',assignee:'Peter Skvarla',startDate:D(0),endDate:D(4),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const go=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const input=el=>el.dispatchEvent(new win.Event('input',{bubbles:true}));
const labels=id=>qa('#'+id+' label');
const texts=id=>labels(id).map(l=>l.textContent);
const vis=id=>labels(id).filter(l=>!l.classList.contains('hidden')).map(l=>l.textContent);
const rq=id=>q('.pg-rq[data-for="'+id+'"]');
const tick=id=>{const ck=qa('#pp-r-pm input').find(i=>i.value===id);ck.checked=true;change(ck);return ck;};
const sorted=a=>a.slice().sort((x,y)=>x.localeCompare(y));
const patches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&/ShopTimeline_Projects\//.test(c.url));
const PM_ORDER='Caroline Bondi, Greg Walsh, Hubert Li, Mac Milsark, Matthew Schulz, Nina Okafor, Robert Maciel, Stan Kim, Tyler Brooks, Zoe';

setTimeout(()=>{go('#/project/new');setTimeout(draftPart,800);},1300);

function draftPart(){
  sec('New Project draft — R1 alphabetical, R2 search, plan 3 checked stay visible');
  ok('R1: the Project manager list is in display-name order (the nickname sorts where it reads)', texts('pp-r-pm').join(', ')===PM_ORDER, texts('pp-r-pm').join(', '));
  /* v1.30.0 (#18) turns the lead list into a grouped single-choice list — grouped, not flat, so it leaves this check */
  const ids=E('PP_ROLES.map(r=>r[0])').filter(id=>!(src.indexOf("'Project lead'")>=0&&id==='pp-r-lf'));
  ok('R1: every Team list is alphabetical', ids.every(id=>texts(id).join('|')===sorted(texts(id)).join('|')), ids.map(id=>texts(id).join('/')).join(' ; '));
  ok('R2: each list has its own Search box above it', ids.every(id=>{const b=rq(id);return !!b&&b.type==='text'&&!!(b.compareDocumentPosition(doc.getElementById(id))&4);}));
  ok('the search box lives outside the list, so the list still holds only checkboxes', qa('#pp-r-pm input').every(i=>i.type==='checkbox')&&qa('#pp-r-pm input').length===10);
  rq('pp-r-pm').value='ma';input(rq('pp-r-pm'));
  ok('R2 done-when: typing "ma" narrows to the names containing it (any part: Maciel too)', vis('pp-r-pm').join(', ')==='Mac Milsark, Matthew Schulz, Robert Maciel', vis('pp-r-pm').join(', '));
  ok('typing alone does not dirty the draft', E('ppDraftDirty()')===false);
  ok('the other lists are untouched by that search', vis('pp-r-dr').length===texts('pp-r-dr').length);
  rq('pp-r-pm').value='';input(rq('pp-r-pm'));
  ok('clearing the box shows all ten again', vis('pp-r-pm').length===10, vis('pp-r-pm').length);
  rq('pp-r-pm').value='chen';input(rq('pp-r-pm'));
  ok('R2 default: the stored name matches too ("chen" finds Zoe)', vis('pp-r-pm').join(', ')==='Zoe', vis('pp-r-pm').join(', '));
  rq('pp-r-pm').value='';input(rq('pp-r-pm'));
  tick('Caroline Bondi');
  rq('pp-r-pm').value='zz';input(rq('pp-r-pm'));
  ok('plan 3 done-when: a checked name stays visible while filtering', vis('pp-r-pm').join(', ')==='Caroline Bondi', vis('pp-r-pm').join(', '));
  ok('and every other name is hidden', labels('pp-r-pm').filter(l=>l.classList.contains('hidden')).length===9);
  rq('pp-r-pm').value='ma';input(rq('pp-r-pm'));
  tick('Mac Milsark');
  ok('a tick while filtering reaches the draft (hidden checked values included)', E('ppFormSync();PP_FORM.projectManager')==='Caroline Bondi, Mac Milsark', E('PP_FORM.projectManager'));
  ok('and the typed filter survives the tick', rq('pp-r-pm').value==='ma'&&vis('pp-r-pm').join(', ')==='Caroline Bondi, Mac Milsark, Matthew Schulz, Robert Maciel', vis('pp-r-pm').join(', '));
  ok('the list did not re-sort under the pointer', texts('pp-r-pm').join(', ')===PM_ORDER);
  E('PP_FORM.projectManager="";PP_SNAP=JSON.stringify(PP_FORM)');
  go('#/project/p1');setTimeout(savedPart,800);
}

function savedPart(){
  sec('Saved project — plan 3 checked at the top, the filter keeps them, saves carry hidden ticks');
  ok('R1 saved: the checked PM sits first, the rest alphabetical', texts('pp-r-pm').join(', ')==='Hubert Li, Caroline Bondi, Greg Walsh, Mac Milsark, Matthew Schulz, Nina Okafor, Robert Maciel, Stan Kim, Tyler Brooks, Zoe', texts('pp-r-pm').join(', '));
  ok('and is checked', qa('#pp-r-pm input:checked').map(i=>i.value).join()==='Hubert Li');
  ok('R1 saved, legacy: "Peter S." checks Peter Skvarla first and adds no phantom box', texts('pp-r-dr').join(', ')==='Peter Skvarla, Jason Pfaeffle, Sam Ortiz'&&qa('#pp-r-dr input:checked').map(i=>i.value).join()==='Peter Skvarla', texts('pp-r-dr').join(', '));
  ok('the saved page lists checkboxes only in the box', qa('#pp-r-pm input').every(i=>i.type==='checkbox'));
  rq('pp-r-pm').value='ma';input(rq('pp-r-pm'));
  ok('plan 3 saved: "ma" keeps the checked name visible with the matches', vis('pp-r-pm').join(', ')==='Hubert Li, Mac Milsark, Matthew Schulz, Robert Maciel', vis('pp-r-pm').join(', '));
  const n0=patches().length;
  tick('Matthew Schulz');
  setTimeout(()=>{
    const p=patches().slice(n0);
    ok('a tick while filtering sends one PATCH', p.length===1, p.length);
    ok('whose Project manager keeps the hidden checked name', p.length===1&&p[0].body.projectManager==='Hubert Li, Matthew Schulz', p.length&&p[0].body.projectManager);
    ok('the other roles ride along intact', p.length===1&&p[0].body.drafter==='Peter Skvarla'&&p[0].body.leadFab==='Emil Byrne', p.length&&JSON.stringify(p[0].body));
    ok('the filter survives the save (no repaint under PP_QUIET)', rq('pp-r-pm').value==='ma'&&labels('pp-r-pm').filter(l=>l.classList.contains('hidden')).length===6, vis('pp-r-pm').join(', '));
    change(rq('pp-r-pm'));
    setTimeout(()=>{
      ok('a change event on the search box saves nothing', patches().length===n0+1, patches().length-n0);
      /* a Setup field change repaints the whole panel (ppInspector) — the typed search comes back */
      const st=q('#pp-status');st.value='on-hold';change(st);
      setTimeout(()=>{
        /* Matthew is checked now too, so the repaint sorts him up beside Hubert (checked first) */
        ok('the typed search survives a full repaint of the setup panel', rq('pp-r-pm').value==='ma'&&vis('pp-r-pm').join(', ')==='Hubert Li, Matthew Schulz, Mac Milsark, Robert Maciel', rq('pp-r-pm').value+' / '+vis('pp-r-pm').join(', '));
        ok('and the other boxes stay unfiltered', vis('pp-r-dr').length===texts('pp-r-dr').length);
        go('#/project/new');
        setTimeout(()=>{
          ok('another project opens with empty search boxes', rq('pp-r-pm').value===''&&vis('pp-r-pm').length===10, rq('pp-r-pm').value);
          sourcePart();
        },800);
      },500);
    },300);
  },500);
}

function sourcePart(){
  sec('plan 4 and the viewer rule (source)');
  const m=[...src.matchAll(/\.pg-rbox\{[^}]*\bmax-height:(\d+)px/g)];
  ok('plan 4: one .pg-rbox max-height rule, at least 180px (the old 160px override is gone)', m.length===1&&parseInt(m[0][1],10)>=180, m.map(x=>x[1]).join(','));
  ok('a locked viewer loses the search with the checkboxes; a granted viewer keeps both', /body\.viewer \.pg-rq:disabled\{display:none\}/.test(src));
  ok('the search box uses the control-line token, not an ad-hoc hex border', /\.pg-rq\{[^}]*border:1px solid var\(--ts-control-line\)/.test(src));
  ok('and the chrome text token (§2.6: no ad-hoc hex in new code)', /\.pg-rq\{[^}]*color:var\(--ts-text\)/.test(src));
  ok('the search box meets the 24px hit target', /\.pg-rq\{[^}]*min-height:24px/.test(src));
  done();
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
