/* v1.35.0 — tracker #33: the Departments line reads the Cost Code.
   R1 each line under a person reads the project's Cost Code instead of its name · R2 the
   code fits whole: mono like the dates, no long string on the line · Q1 default: a project
   with no code keeps its name (with #24's muted client in front) · Q2 default: the client
   moves into the line's hover tip, "Client · Project name · Cost code" · custom label: a
   phase with a label reads "HE276 · label" · Q3 default: the Projects lens still shows the
   name on line 1 and the code on line 2 · Q4 default: print follows the screen.
   Run: node tests/test-v1350.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('.sb-asn .n.code')<0){
  console.log('  SKIP  test-v1350: pre-v1.35.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const LONG='Q4 Frozen In Time 2026 Holiday Windows';
const P=(id,name,client,code,i)=>({appId:id,Title:name,client,jobCode:code,deadline:D(45),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab','install']),createdAt:D(-30),sortIndex:i});
const T=(id,pid,dept,who,s,e,label)=>({appId:id,projectId:pid,department:dept,assignee:who,startDate:s,endDate:e,estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:label||''});
const projects=[P('p1',LONG,'VCA','HE276',0),P('p2','Holiday','Dior','',1),P('p3','Spring Vitrines','','  ',2)]; /* p3: a blank-but-whitespace code counts as none */
/* long-form dates: both ranges cross a month boundary ("Sep 29–Oct 30"), the widest the dates get */
const tasks=[
  T('a1','p1','fab','Nick',D(-2),D(31)),T('a2','p1','install','Nick',D(33),D(36),'mock-up days'),
  T('b1','p2','fab','Nick',D(2),D(34)),T('c1','p3','install','Nick',D(38),D(39))];
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''},
  {appId:'s2',Title:'Nick',email:'',depts:JSON.stringify(['fab','install']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const lanes=who=>qa('#side-rows .sb-row.lane-row').filter(r=>r.querySelector('.sb-name')&&r.querySelector('.sb-name').textContent===who);
const lines=who=>lanes(who).flatMap(l=>[...l.querySelectorAll('.sb-asn')]);
const find=(who,needle)=>lines(who).find(a=>a.title.indexOf(needle)>=0);
const rowOf=name=>qa('#side-rows .sb-row.proj-head').find(r=>r.querySelector('.sb-name')&&r.querySelector('.sb-name').textContent===name);
const DATES=/^[A-Z][a-z]{2} \d+–[A-Z][a-z]{2} \d+$/;

setTimeout(()=>{
  sec('Departments lens — R1 / R2 / Q1 / Q2 / custom label');
  E("LENS='dept';render()");
  const he=find('Nick',LONG);
  ok('R1: the coded line reads "HE276" and the dates — no project name, no client', !!he&&he.querySelector('.n').textContent==='HE276'&&DATES.test(he.querySelector('.d').textContent)&&he.textContent.indexOf('Frozen')<0&&he.textContent.indexOf('VCA')<0, he&&he.textContent);
  ok('R2: the code takes the dates\' mono type, by its token, so it fits whole', !!he&&he.querySelector('.n').classList.contains('code')&&/\.sb-asn \.n\.code\{font-family:var\(--mono\)/.test(src));
  ok('R2: the line is still cut before the dates, never the other way round', /\.sb-asn \.n\{overflow:hidden;text-overflow:ellipsis;min-width:0\}/.test(src)&&/\.sb-asn \.d\{[^}]*flex-shrink:0/.test(src));
  ok('Q2: the coded line\'s hover tip reads "Client · Project name · Cost code"', !!he&&he.title==='VCA · '+LONG+' · HE276', he&&he.title);
  const di=find('Nick','Dior');
  ok('Q1: the uncoded line reads "Dior", "Holiday" and the dates', !!di&&!!di.querySelector('.c')&&di.querySelector('.c').textContent==='Dior'&&di.querySelector('.n').textContent==='Dior · Holiday'&&DATES.test(di.querySelector('.d').textContent), di&&di.textContent);
  ok('Q1: the uncoded line is prose, not mono', !!di&&!di.querySelector('.n').classList.contains('code'));
  ok('Q2: the uncoded line\'s hover tip carries client and name', !!di&&di.title==='Dior · Holiday', di&&di.title);
  const sv=find('Nick','Spring Vitrines');
  ok('Q1: a whitespace-only code counts as none — the name shows, no client, tip is the name', !!sv&&sv.querySelector('.n').textContent==='Spring Vitrines'&&!sv.querySelector('.n').classList.contains('code')&&sv.title==='Spring Vitrines', sv&&(sv.textContent+' / '+sv.title));
  const lb=find('Nick','mock-up days');
  ok('custom label: a phase with a custom label reads "HE276 · label"', !!lb&&lb.querySelector('.n').textContent==='HE276 · mock-up days'&&lb.title==='VCA · '+LONG+' · HE276 · mock-up days', lb&&(lb.querySelector('.n').textContent+' / '+lb.title));

  sec('Q4 — print follows the screen');
  const sheet=E("buildPrintSheet('"+D(-7)+"','"+D(45)+"')");
  const sh=sheet&&sheet.querySelectorAll?sheet:null;
  const nCode=qa('#side-rows .sb-asn .n.code').length;
  ok('the Departments print sheet carries the coded lines the sidebar shows', !!sh&&nCode>=2&&sh.querySelectorAll('.sb-asn .n.code').length===nCode, (sh&&sh.querySelectorAll('.sb-asn .n.code').length)+' vs '+nCode);

  sec('Q3 — the Projects lens is unchanged: name on line 1, code on line 2');
  E("LENS='project';render()");
  const r=rowOf(LONG);
  ok('Q3: the first line is the project name', !!r&&r.querySelector('.sb-name').textContent===LONG);
  ok('Q3: the code sits on the second line, after the client', !!r&&r.querySelector('.sb-cl').textContent==='VCA'&&/^HE276/.test(r.querySelector('.sb-sub').textContent), r&&r.querySelector('.sb-sub').textContent);
  ok('Q3: the uncoded project keeps its name too', !!rowOf('Holiday'));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
