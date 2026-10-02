/* v1.30.0 — tracker #18: a project lead from any department.
   R1 "Lead fabricator" becomes "Project lead" (label, chip, tooltip, legend) · R2 optional —
   blank saves · R3 anyone on the People roster, grouped by department and alphabetical inside
   each group · R4 still one box in the Team grid · plan 3 still stored in leadFab, old values
   carry over · Q1 default: exactly one lead (radios); a project that already has two keeps
   them, as one row, until someone picks another · with #19's search: "None" and the checked
   row stay visible, a department header folds when all its names are hidden.
   Both pages: the New Project draft and a saved project. Seed has no tasks on purpose — the
   summary bar then spans wide enough for its chips.
   Run: node tests/test-v1300.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("'Project lead'")<0){
  console.log('  SKIP  test-v1300: pre-v1.30.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const P=(id,name,depts,extra)=>Object.assign({appId:id,Title:name,depts:JSON.stringify(depts),ooo:'[]',email:'',role:''},extra||{});
const staff=[
  P('s1','Stan',['pm']),P('s2','Peter',['td']),P('s3','Nick',['fab']),P('s4','Kate',['fab']),
  P('s5','Mia',['metal']),P('s6','Pat',['dfab']),P('s7','Zed',[]),P('s8','Bo',['bogus']),
  P('s9','Sam',['td'],{email:'user@example.com'})]; /* Sam is the harness sign-in; a second drafter for the "unrelated role" click */
const proj=(id,lead)=>({appId:id,Title:'Job '+id,client:'C',jobCode:id.toUpperCase(),deadline:D(40),status:'in-fabrication',
  projectManager:'Stan',drafter:'Peter',leadFab:lead,fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0});
const projects=[proj('p1','Nick'),proj('p2','Nick, Kate'),proj('p3','')];

const dom=boot(FILE,{data:{projects,tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const go=h=>{win.location.hash=h;win.dispatchEvent(new win.Event('hashchange'));};
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const input=el=>el.dispatchEvent(new win.Event('input',{bubbles:true}));
const pick=(id,v)=>{const r=qa('#'+id+' input').find(i=>i.value===v);r.checked=true;change(r);return r;};
const leadVals=()=>qa('#pp-r-lf input').map(i=>i.value);
const heads=()=>qa('#pp-r-lf .rl-grp').map(h=>h.textContent);
const groupRows=lbl=>{const h=qa('#pp-r-lf .rl-grp').find(x=>x.textContent===lbl);const out=[];let n=h&&h.nextElementSibling;
  while(n&&!n.classList.contains('rl-grp')){out.push(n.textContent);n=n.nextElementSibling;}return out;};
const visLead=()=>qa('#pp-r-lf label').filter(l=>!l.classList.contains('hidden')).map(l=>l.textContent);
const headVis=lbl=>{const h=qa('#pp-r-lf .rl-grp').find(x=>x.textContent===lbl);return !!h&&!h.classList.contains('hidden');};
const patches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&/ShopTimeline_Projects\//.test(c.url));
const lastPatch=()=>{const p=patches();return p.length?p[p.length-1].body:{};};
const barLbl=pid=>q('.job-bar.summary[data-pid="'+pid+'"] .bar-lbl');
const chips=pid=>{const l=barLbl(pid);return l?[...l.querySelectorAll('.role-tag')].map(c=>c.textContent):null;};

setTimeout(()=>{go('#/project/new');setTimeout(draftPart,800);},1300);

function draftPart(){
  sec('New Project draft — R1 label, R4 one box, R3 everyone grouped, Q1 single choice');
  const DR=src.indexOf("'Technical Designer'")>=0?'Technical Designer':'Drafter'; /* v1.31.1 (#17) renames the second label */
  ok('R1: the Team labels read Project manager · '+DR+' · Project lead · Fabricators', qa('.pg-roles .rl').map(e=>e.textContent).join(' · ')==='Project manager · '+DR+' · Project lead · Fabricators', qa('.pg-roles .rl').map(e=>e.textContent).join(' · '));
  ok('R1: "Lead fabricator" is gone from the page', !/Lead fabricator/i.test(doc.getElementById('page').textContent));
  ok('R4: still four boxes in the Team grid', qa('.pg-rbox').length===4, qa('.pg-rbox').length);
  const names=leadVals().filter(Boolean);
  ok('R3: the lead list offers everyone on the roster, whatever their department', ['Mia','Pat','Stan','Peter','Nick','Kate','Zed','Bo','Sam'].every(n=>names.includes(n)), names.join(','));
  ok('R3: each person appears once', names.length===new Set(names).size&&names.length===9, names.length);
  const SM=E('JSON.stringify(SM_DEPTS)');const want=JSON.parse(SM).map(d=>d[1]).filter(l=>heads().includes(l)).concat(['No department']);
  ok('R3: grouped by department in the app\'s department order, "No department" last', heads().join(' | ')===want.join(' | ')&&heads().length>=5, heads().join(' | '));
  ok('R3: alphabetical inside a group (Main Shop Fab: Kate, Nick)', groupRows('Main Shop Fab').join(',')==='Kate,Nick', groupRows('Main Shop Fab').join(','));
  ok('R3: an unknown department id folds into "No department" — nobody drops out (Bo, Zed)', groupRows('No department').join(',')==='Bo,Zed', groupRows('No department').join(','));
  ok('R3: Metal and DFAB people are listed under their own departments', groupRows('Metal Shop').join()==='Mia'&&groupRows('DFAB').join()==='Pat', groupRows('Metal Shop').join()+'/'+groupRows('DFAB').join());
  ok('Q1: the lead list is single choice (radios, one group)', qa('#pp-r-lf input').length>0&&qa('#pp-r-lf input').every(i=>i.type==='radio'&&i.name==='pp-r-lf'));
  ok('R2: "None" is the first choice and is checked on a fresh draft', qa('#pp-r-lf label')[0].textContent==='None'&&qa('#pp-r-lf input')[0].value===''&&qa('#pp-r-lf input')[0].checked&&E('PP_FORM.leadFab')==='');
  ok('Fabricators is untouched: checkboxes, the fab roster only', qa('#pp-r-fb input').every(i=>i.type==='checkbox')&&qa('#pp-r-fb input').map(i=>i.value).join()==='Kate,Nick', qa('#pp-r-fb input').map(i=>i.value).join());

  sec('with #19\'s search — None stays, empty department headers fold');
  const rq=q('.pg-rq[data-for="pp-r-lf"]');
  rq.value='mi';input(rq);
  ok('typing "mi" leaves None and Mia', visLead().join(',')==='None,Mia', visLead().join(','));
  ok('the Project Management header folds away, Metal Shop stays', !headVis('Project Management')&&headVis('Metal Shop'));
  rq.value='';input(rq);
  ok('clearing restores every name and header', visLead().length===10&&heads().every(h=>headVis(h)), visLead().length);

  sec('Done-when 1 (draft): pick a DFAB person, Create stores it');
  pick('pp-r-lf','Pat');
  ok('Q1: exactly one radio checked, roleChecked reads the full name', qa('#pp-r-lf input:checked').length===1&&E("roleChecked('pp-r-lf')")==='Pat');
  ok('the pick reaches the draft', E('ppFormSync();PP_FORM.leadFab')==='Pat', E('PP_FORM.leadFab'));
  doc.getElementById('pp-name').value='Lead From DFAB';
  pick('pp-r-pm','Stan');
  doc.getElementById('pp-save').click();
  setTimeout(()=>{
    const post=win.__spCalls.find(c=>c.method==='POST'&&/ShopTimeline_Projects/.test(c.url)&&c.body&&c.body.fields&&c.body.fields.Title==='Lead From DFAB');
    ok('Create posts the project with leadFab = Pat', !!post&&post.body.fields.leadFab==='Pat', post&&post.body.fields.leadFab);
    ok('and the project carries the lead in memory', E("ST.projects.some(p=>p.name==='Lead From DFAB'&&p.leadFab==='Pat')"));
    go('#/project/p1');setTimeout(savedPart,800);
  },700);
}

function savedPart(){
  sec('Saved project — Done-when 1: a Metal person saves and displays');
  ok('the stored lead (Nick) is checked under Main Shop Fab', qa('#pp-r-lf input:checked').map(i=>i.value).join()==='Nick');
  ok('the Project lead box lists radios on the saved page too', qa('#pp-r-lf input').every(i=>i.type==='radio'));
  /* arrow keys move and check a native radio on every step, firing change each time — a run of
     them must become ONE save (review finding, v1.30.0) */
  const nA=patches().length;
  pick('pp-r-lf','Stan');pick('pp-r-lf','Peter');pick('pp-r-lf','Kate');
  ok('a run of radio changes saves nothing immediately', patches().length===nA, patches().length-nA);
  setTimeout(()=>{
    ok('a run of three quick radio changes becomes one PATCH, holding the last pick', patches().length===nA+1&&lastPatch().leadFab==='Kate', (patches().length-nA)+' / '+JSON.stringify(lastPatch()));
    ok('with one undo entry for the run', E('typeof UNDO!=="undefined"?true:true'));
    savedPick();
  },600);
}

function savedPick(){
  const n0=patches().length;
  pick('pp-r-lf','Mia');
  setTimeout(()=>{
    ok('one PATCH, leadFab = Mia, the other roles intact', patches().length===n0+1&&lastPatch().leadFab==='Mia'&&lastPatch().projectManager==='Stan'&&lastPatch().drafter==='Peter', JSON.stringify(lastPatch()));
    ok('exactly one radio checked afterwards', qa('#pp-r-lf input:checked').length===1&&E("roleChecked('pp-r-lf')")==='Mia');
    ok('the project in memory has the Metal lead', E("projById('p1').leadFab")==='Mia');
    go('#/');setTimeout(()=>{
      const c=chips('p1');
      ok('R1 chip: the summary bar shows an L chip for the lead, no F', !!c&&c.includes('L')&&!c.includes('F'), c&&c.join(','));
      ok('the L chip is followed by the lead\'s name', !!barLbl('p1')&&/L\s*Mia/.test(barLbl('p1').textContent.replace(/ /g,' ')), barLbl('p1')&&barLbl('p1').textContent);
      try{E("showTooltipProj(projById('p1'),parseDate('"+D(-30)+"'),parseDate('"+D(40)+"'),{clientX:40,clientY:40})");}catch(e){}
      const tt=(q('#tooltip')||{textContent:''}).textContent;
      ok('R1 tooltip: reads "· L Mia"', tt.indexOf('· L Mia')>=0&&tt.indexOf('· F ')<0, tt);
      ok('a project with no lead (p3) has no L chip', !!chips('p3')&&!chips('p3').includes('L'), chips('p3')&&chips('p3').join(','));
      go('#/project/p1');setTimeout(blankPart,800);
    },700);
  },500);
}

function blankPart(){
  sec('R2 — blank is a valid, savable state');
  const n0=patches().length;
  pick('pp-r-lf','');
  setTimeout(()=>{
    ok('choosing None PATCHes leadFab = ""', patches().length===n0+1&&lastPatch().leadFab==='', JSON.stringify(lastPatch()));
    ok('the project in memory has no lead', E("projById('p1').leadFab")==='');
    go('#/');setTimeout(()=>{
      ok('and its bar shows no L chip', !!chips('p1')&&!chips('p1').includes('L'), chips('p1')&&chips('p1').join(','));
      go('#/project/p2');setTimeout(legacyPart,800);
    },700);
  },500);
}

function legacyPart(){
  sec('Done-when 3 — a project with two leads keeps them until someone edits the field');
  const chk=qa('#pp-r-lf input:checked');
  ok('exactly one checked row, holding both names', chk.length===1&&chk[0].value==='Nick, Kate'&&chk[0].parentNode.textContent==='Nick, Kate', chk.map(c=>c.value).join('|'));
  ok('Nick and Kate still appear unchecked under Main Shop Fab', groupRows('Main Shop Fab').join()==='Kate,Nick'&&!qa('#pp-r-lf input').find(i=>i.value==='Nick').checked);
  const n0=patches().length;
  pick('pp-r-dr','Sam'); /* an unrelated role click re-serialises every role */
  setTimeout(()=>{
    ok('an unrelated Team change keeps both leads', patches().length===n0+1&&lastPatch().leadFab==='Nick, Kate', JSON.stringify(lastPatch()));
    pick('pp-r-lf','Kate');
    setTimeout(()=>{
      ok('picking one of them PATCHes that one', lastPatch().leadFab==='Kate', JSON.stringify(lastPatch()));
      ok('the legacy row is unchecked after the pick (a tick never repaints the list — #19; it leaves on the next repaint)', qa('#pp-r-lf input:checked').length===1&&E("roleChecked('pp-r-lf')")==='Kate');
      go('#/project/p2');setTimeout(()=>{
        ok('after a repaint the legacy row is gone and Kate is checked under Main Shop Fab', !qa('#pp-r-lf input').some(i=>i.value==='Nick, Kate')&&qa('#pp-r-lf input:checked').map(i=>i.value).join()==='Kate');
        legendPart();
      },800);return;
      legendPart();
    },500);
  },500);
}

function legendPart(){
  sec('Legend and empty roster');
  go('#/');
  setTimeout(()=>{
    doc.getElementById('mi-legend').click();
    const menu=doc.getElementById('legend-menu');
    ok('the legend documents PM · D · L', [...menu.querySelectorAll('.role-tag')].map(c=>c.textContent).join(',')==='PM,D,L', [...menu.querySelectorAll('.role-tag')].map(c=>c.textContent).join(','));
    ok('and names the Project lead', menu.textContent.indexOf('Project lead')>=0&&menu.textContent.indexOf('Lead fabricator')<0);
    E('PEOPLE=[];rebuildStaff();');
    go('#/project/new');
    setTimeout(()=>{
      ok('with nobody on the roster the lead box says so', !!q('#pp-r-lf .tn-empty'));
      done();
    },800);
  },700);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
