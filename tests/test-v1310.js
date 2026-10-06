/* v1.31.0 — tracker #24: the client shows on the dashboard.
   R1 the saved Client shows next to each project in both views · R2 the project name is
   never altered · R3 Departments view: compact, full text on hover; Projects view: the
   client is cut first, full on hover · R4 a Client edit repaints the dashboard · plan 1
   Projects view line 2 = client · cost code · date · plan 2 Departments lines start with a
   muted client · plan 4 no "Dior · Dior - …" doubling · Q1 default: bar labels unchanged.
   Both pages for R4: a saved project's Setup and the New Project draft.
   v1.35.0 (#33, Q2 default): a coded Departments line reads the cost code and the client
   moves into its hover tip; the muted prefix stays on lines with no code (p5 here).
   Run: node tests/test-v1310.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('sb-cl')<0){
  console.log('  SKIP  test-v1310: pre-v1.31.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const nice=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'});};

const P=(id,name,client,code,depts,extra)=>Object.assign({appId:id,Title:name,client,jobCode:code,deadline:D(40),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(depts),createdAt:D(-30),sortIndex:0},extra||{});
const T=(id,pid,dept,who,s,e,label)=>({appId:id,projectId:pid,department:dept,assignee:who,startDate:s,endDate:e,estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:label||''});
const projects=[
  P('p1','Artport 2026','Whitney Museum','WMU004',['pm','fab','install'],{sortIndex:0}),
  P('p2','Dior - HOD Holiday','Dior','DI251',['pm','fab'],{sortIndex:1}),
  P('p3','Holiday Windows','','HW1',['pm','fab'],{sortIndex:2}),
  P('p4','No Dates','Cartier','',['pm'],{sortIndex:3}),
  P('p5','Soho Vitrines','Bulgari','',['pm','fab'],{sortIndex:4})]; /* v1.35.0: no code, so its Departments line keeps the muted client */
const tasks=[
  T('a1','p1','fab','Nick',D(-2),D(5)),T('a2','p1','install','',D(19),D(21)),
  T('b1','p2','fab','Nick',D(8),D(12),'mock-up'),
  T('c1','p3','fab','Nick',D(14),D(16)),
  T('e1','p5','fab','Kate',D(2),D(4))]; /* on Kate's lane: Nick's row height fits three lines */
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''},
  {appId:'s2',Title:'Nick',email:'',depts:JSON.stringify(['fab']),ooo:'[]',role:''},
  {appId:'s3',Title:'Kate',email:'',depts:JSON.stringify(['fab']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const rowOf=name=>qa('#side-rows .sb-row.proj-head').find(r=>r.querySelector('.sb-name')&&r.querySelector('.sb-name').textContent===name);
const cl=name=>{const r=rowOf(name);return r?r.querySelector('.sb-cl'):null;};
const sub=name=>{const r=rowOf(name);return r?r.querySelector('.sb-sub').textContent:'(no row)';};
const lane=who=>qa('#side-rows .sb-row.lane-row').find(r=>r.querySelector('.sb-name')&&r.querySelector('.sb-name').textContent===who);
const line=(who,needle)=>{const l=lane(who);return l?[...l.querySelectorAll('.sb-asn')].find(a=>a.textContent.indexOf(needle)>=0||a.title.indexOf(needle)>=0):null;}; /* v1.35.0: a coded line names its project only in the hover tip */
const patches=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&/ShopTimeline_Projects\//.test(c.url));
const DATES=/[A-Z][a-z]{2} \d+–[A-Z][a-z]{2} \d+/;

setTimeout(stage1,1500);

function stage1(){
  sec('Projects view — R1 / plan 1: client · cost code · date on line 2');
  const c1=cl('Artport 2026');
  ok('R1: the client shows under the project name', !!c1&&c1.textContent==='Whitney Museum', c1&&c1.textContent);
  ok('plan 1: it comes first, the code · date part is unchanged beside it', !!c1&&c1.nextElementSibling&&c1.nextElementSibling.classList.contains('sb-sub')&&sub('Artport 2026')==='WMU004 · '+nice(D(21)), sub('Artport 2026'));
  ok('R3: the full client is on hover', !!c1&&c1.title==='Whitney Museum');
  ok('R2: the project name is untouched', rowOf('Artport 2026').querySelector('.sb-name').textContent==='Artport 2026');
  ok('plan 1: a project with no client has no client span', !!rowOf('Holiday Windows')&&cl('Holiday Windows')===null);
  ok('plan 1 (literal): "Dior - HOD Holiday" still shows Dior on its second line', !!cl('Dior - HOD Holiday')&&cl('Dior - HOD Holiday').textContent==='Dior');
  ok('v1.26.0 R6 interplay: a client with neither code nor date shows alone', !!cl('No Dates')&&cl('No Dates').textContent==='Cartier'&&sub('No Dates')==='');
  ok('Q1 default: bar labels carry no client', qa('#gantt-canvas .job-bar').length>0&&qa('#gantt-canvas .job-bar').every(b=>b.textContent.indexOf('Whitney')<0));
  ok('the client is sans (prose), the quiet grey of its line, cut first, never below an ellipsis', /\.sb-cl\{[^}]*color:var\(--txt-dim\)[^}]*text-overflow:ellipsis[^}]*min-width:1\.5em[^}]*flex-shrink:1/.test(src)&&/\.sb-cl\+\.sb-sub:last-child\{flex-shrink:0\}/.test(src));
  ok('beside a LATE / soon chip the code · date may shrink again, so the chip never overflows the row', !/\.sb-cl\+\.sb-sub\{flex-shrink:0\}/.test(src));
  ok('the separator rides on the code · date part, only when there is one', /\.sb-cl\+\.sb-sub:not\(:empty\)::before\{content:"· "\}/.test(src));

  sec('Departments view — R1 / plan 2: the client in the hover tip (#33 Q2) or, with no code, a muted prefix; plan 4: never doubled');
  E("LENS='dept';render()");
  const art=line('Nick','Artport');
  ok('R1: the client is in the Departments hover tip (the line itself reads the cost code, #33)', !!art&&!art.querySelector('.c')&&art.querySelector('.n').textContent==='WMU004'&&art.title.indexOf('Whitney Museum')===0, art&&(art.textContent+' / '+art.title));
  ok('plan 2 (#33): the tip reads "Whitney Museum · Artport 2026 · WMU004"', !!art&&art.title==='Whitney Museum · Artport 2026 · WMU004', art&&art.title);
  ok('the dates still follow', !!art&&DATES.test(art.querySelector('.d').textContent), art&&art.querySelector('.d').textContent);
  const soho=line('Kate','Soho');
  ok('plan 2: a line with no cost code starts with the muted client', !!soho&&!!soho.querySelector('.c')&&soho.querySelector('.c').textContent==='Bulgari'&&soho.querySelector('.n').textContent==='Bulgari · Soho Vitrines', soho&&soho.querySelector('.n').textContent);
  ok('R3: the whole line is on hover', !!soho&&soho.title==='Bulgari · Soho Vitrines', soho&&soho.title);
  const dior=line('Nick','Dior');
  ok('plan 4: "Dior - HOD Holiday" is not prefixed with Dior in its tip', !!dior&&!dior.querySelector('.c')&&dior.title==='Dior - HOD Holiday · DI251 · mock-up', dior&&dior.title);
  ok('plan 4 / #33: its line reads the code and the custom label', !!dior&&dior.querySelector('.n').textContent==='DI251 · mock-up', dior&&dior.querySelector('.n').textContent);
  const hw=line('Nick','Holiday Windows');
  ok('plan 2: a project with no client has no client in its tip', !!hw&&!hw.querySelector('.c')&&hw.title==='Holiday Windows · HW1', hw&&hw.title);
  ok('clientLead(): the seam #33 names', E("clientLead(projById('p1'))")==='Whitney Museum'&&E("clientLead(projById('p2'))")===''&&E("clientLead(null)")==='');
  ok('the prefix takes the dates\' grey, by its token', /\.sb-asn \.c\{color:var\(--txt-micro\)\}/.test(src));

  sec('Print — the sheet clones the sidebar, client included');
  const sheet=E("buildPrintSheet('"+D(-7)+"','"+D(30)+"')");
  const sh=sheet&&sheet.querySelectorAll?sheet:null;
  const nC=qa('#side-rows .sb-asn .c').length; /* Kate's fab lane lists Soho Vitrines (no code, so the prefix stays) */
  ok('the Departments print sheet carries the client prefixes the sidebar shows', !!sh&&nC>=1&&sh.querySelectorAll('.sb-asn .c').length===nC, (sh&&sh.querySelectorAll('.sb-asn .c').length)+' vs '+nC);
  E("LENS='project';render()");
  const sheet2=E("buildPrintSheet('"+D(-7)+"','"+D(30)+"')");
  const sh2=sheet2&&sheet2.querySelectorAll?sheet2:null;
  ok('the Projects print sheet carries the client spans', !!sh2&&sh2.querySelectorAll('.sb-cl').length===qa('#side-rows .sb-cl').length&&qa('#side-rows .sb-cl').length===4, sh2&&sh2.querySelectorAll('.sb-cl').length);
  setTimeout(stage2,200);
}

function stage2(){
  sec('R4 saved project — a Client edit repaints the dashboard');
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(()=>{
    const f=q('#pp-client');
    ok('the Setup Client field holds the saved client', !!f&&f.value==='Whitney Museum', f&&f.value);
    const n0=patches().length;
    f.value='Whitney Museum of American Art';change(f);
    setTimeout(()=>{
      const p=patches().slice(n0);
      ok('the edit PATCHes the project', p.length>=1&&p[p.length-1].body.client==='Whitney Museum of American Art', p.length&&JSON.stringify(p[p.length-1].body));
      E("location.hash='#/';applyRoute()"); /* the route repaint alone must carry the client (R4) */
      setTimeout(()=>{
        ok('R4: the Projects view shows the new client', !!cl('Artport 2026')&&cl('Artport 2026').textContent==='Whitney Museum of American Art'&&cl('Artport 2026').title==='Whitney Museum of American Art', cl('Artport 2026')&&cl('Artport 2026').textContent);
        E("LENS='dept';render()");
        const art=line('Nick','Artport');
        ok('R4: the Departments hover tip carries it too (#33: the line reads the code)', !!art&&art.querySelector('.n').textContent==='WMU004'&&art.title==='Whitney Museum of American Art · Artport 2026 · WMU004', art&&art.title);
        E("LENS='project';render()");
        stage3();
      },400);
    },500);
  },600);
}

function stage3(){
  sec('R4 New Project draft — the client typed at Create shows on the dashboard');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    q('#pp-name').value='Soho Holiday';change(q('#pp-name'));
    q('#pp-client').value='Bulgari';change(q('#pp-client'));
    q('#pp-deadline').value=D(40);change(q('#pp-deadline'));
    const pm=qa('#pp-r-pm input').find(i=>i.value==='Sam');if(pm){pm.checked=true;change(pm);}
    q('#pp-save').click();
    setTimeout(()=>{
      ok('the draft was created', E("ST.projects.some(p=>p.name==='Soho Holiday'&&p.client==='Bulgari')"));
      E("location.hash='#/';applyRoute()");
      setTimeout(()=>{
        ok('R4: the new project\'s row shows its client', !!cl('Soho Holiday')&&cl('Soho Holiday').textContent==='Bulgari', cl('Soho Holiday')&&cl('Soho Holiday').textContent);
        ok('R2: and its name as typed', !!rowOf('Soho Holiday'));
        done();
      },400);
    },800);
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
