/* v1.41.0 — Print formatting (owner, 2026-10-06, approved from the print mockup):
   R1 Paper (Letter / Tabloid) and Bars (Color / Outline) are picked in the Print Preview, Paper in the
      Meeting Sheet too, with a note naming the matching print-dialog setting (Tabloid = "Ledger")
   R2 Color is the default: an 8% tint with the 3px colour edge and yellow milestones; Outline is white
      inside a 1px outline in the bar's colour, the 3px edge kept, hollow milestones; remembered per browser
   R3 everything else always prints white: no weekend, holiday, past, header or sidebar fills
   R4 project Gantt: milestone labels never overlap — they stack in lanes and the row grows
   R5 project Calendar: weeks grow to fit their content; a month that outgrows its page continues on the next;
      a milestone named after its block is not prefixed twice ("SHIPPING : AVE", not "Shipping: SHIPPING : AVE")
   Run: node tests/test-v1410.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function setPrBars(')<0){
  console.log('  SKIP  test-v1410: pre-v1.41.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const P={appId:'p1',Title:'Q4 Windows',client:'Hermès',jobCode:'HE276',deadline:'2026-11-25',status:'auto',projectManager:'Sam',
  drafter:'Peter',leadFab:'Nick',fabricators:'',activeDepartments:JSON.stringify(['pm','td','fab','shipping']),createdAt:'2026-07-01',sortIndex:0};
const T=(id,dept,s,e,nodes)=>({appId:id,projectId:'p1',department:dept,assignee:'',startDate:s,endDate:e,estimatedDays:5,
  ticketNodes:JSON.stringify(nodes||[]),notes:'',pinned:false,label:''});
const same=['SCOTTSDALE','TROY','BOISE'].map((n,i)=>({id:'n'+i,date:'2026-11-23',target:'SHIPPING : '+n}));
const tasks=[T('t1','td','2026-09-07','2026-10-02'),T('t2','fab','2026-10-05','2026-11-13'),
  T('t3','shipping','2026-11-02','2026-11-24',[{id:'na',date:'2026-11-05',target:'SHIPPING : AVE'},{id:'nb',date:'2026-11-06',target:'Crate check'},{id:'nc',date:'2026-11-02',target:'Shippingdock sweep'},...same])];
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects:[P],tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const ls=k=>win.localStorage.getItem(k);

sec('R2/R3 — the paper rules in the source');
ok('R2: Color bars are an 8% tint with the 3px edge', /\.pr-page \.job-bar\{background-color:color-mix\(in srgb,var\(--c\) 8%,#fff\)!important;border-left:3px solid var\(--c\)/.test(src));
ok('R2: Outline bars are white in a 1px outline, the 3px edge kept (Gantt and Calendar)', /\.pr-ol \.job-bar,\.pr-ol \.cal-band\.ph,\.pr-ol \.cal-band\.ph\.slim\{background-color:#fff!important;border:1px solid var\(--c\);border-left:3px solid var\(--c\)\}/.test(src));
ok('R2: Outline milestones are hollow; Color keeps the yellow diamond', /\.pr-ol \.pr-mk\.ev i,\.pr-ol \.cal-band\.ev \.cal-mki\{background:#fff\}/.test(src)&&/\.pr-mk\.ev i\{background:#F7C948/.test(src));
ok('R3: no weekend or past fill on paper', /\.pr-page \.wknd-col,\.pr-page \.past-col\{display:none!important\}/.test(src));
ok('R3: white week columns, month header, sidebar and calendar cells', /\.pr-page \.bg-col\{background:#fff!important/.test(src)&&/\.pr-page \.hdr-m-cell\{background:#fff!important/.test(src)
  &&/\.pr-side,\.pr-page \.sb-row\{background:#fff!important\}/.test(src)&&/\.pr-page \.cal-col,\.pr-page \.cal-col\.we\{background:#fff!important\}/.test(src));
ok('R3: holidays wear an outlined tag; today is a thin dashed line', /\.pr-page \.hol-tag\{background:#fff;color:#475569;border:1px solid #94A3B8/.test(src)&&/\.pr-page \.today-line\{border-left:1px dashed #CE4242;background:none\}/.test(src));

setTimeout(()=>{
  sec('R1 — the pickers and the print-dialog note');
  ok('R1: Paper and Bars radios in the Print Preview, Paper in the Meeting Sheet', qa('input[name=pp-paper]').length===2&&qa('input[name=pp-bars]').length===2&&qa('input[name=meet-paper]').length===2);
  ok('R2: Color is the default on a first visit', E('PR_OUTLINE')===false&&q('input[name=pp-bars][value=color]').checked);
  ok('R1: on Letter the note names Letter', qa('.pp-hint').length===2&&qa('.pp-hint').every(h=>/Paper size to <b>Letter/.test(h.innerHTML)), q('.pp-hint').innerHTML);
  const tb=q('input[name=pp-paper][value=tabloid]');tb.checked=true;change(tb);
  ok('R1: picking Tabloid in the preview sets the paper, its page rule, the Print menu and the sheet', E('PAPER')==='tabloid'&&doc.getElementById('print-page-size').textContent==='@page{size:17in 11in;margin:.5in}'
    &&q('input[name=paper-pick][value=tabloid]').checked&&q('input[name=meet-paper][value=tabloid]').checked&&ls('shopTimelinePaper')==='tabloid');
  ok('R1: …and the note names Tabloid / Ledger', qa('.pp-hint').every(h=>/Tabloid \/ Ledger \(11 × 17"\)/.test(h.innerHTML)&&/Scale on <b>Default/.test(h.innerHTML)));

  win.location.hash='#/project/p1';E('applyRoute()');
  setTimeout(project,900);
},1200);

function project(){
  sec('R2 — the Bars choice reaches every page box');
  E("NPV_MODE='gantt';npvRender()");
  let g=E("prBuild('project')");
  ok('R2: Color pages carry no outline class', g.length>0&&g.every(p=>!p.classList.contains('pr-ol')));
  const ol=q('input[name=pp-bars][value=outline]');ol.checked=true;change(ol);
  g=E("prBuild('project')");
  ok('R2: Outline pages carry .pr-ol and the choice is remembered', g.every(p=>p.classList.contains('pr-ol'))&&ls('shopTimelinePrintBars')==='outline');
  E("setPrBars('color')");

  sec('R4 — milestone lanes on the project Gantt');
  const mks=[...g[0].querySelectorAll('.pr-mk.ev')];
  const gut=[...g[0].querySelectorAll('.pr-gut.extra')].find(e=>e.textContent==='Milestones');
  ok('R4: every milestone prints', mks.length===6, mks.length);
  ok('R4: three on one day stack in three lanes, never on one line', new Set(mks.filter(m=>/SCOTTSDALE|TROY|BOISE/.test(m.textContent)).map(m=>m.style.top)).size===3);
  ok('R4: a milestone the day after another moves to a free lane', mks.find(m=>/AVE/.test(m.textContent)).style.top!==mks.find(m=>/Crate/.test(m.textContent)).style.top);
  ok('R4: the Milestones row grows with its lanes', gut&&parseInt(gut.style.height,10)===16*3+16, gut&&gut.style.height);
  ok('R4: a label that would run off the page reads leftward from its diamond', mks.filter(m=>/SCOTTSDALE|TROY|BOISE/.test(m.textContent)).every(m=>m.classList.contains('flip')&&m.style.right!==''));

  sec('R5 — the Calendar');
  E("NPV_MODE='calendar';NPV_CAL_MK=true;npvRender()");
  const bands=qa('#npv-body .cal-band.ev').map(b=>b.textContent);
  ok('R5: a name that starts with its block is not prefixed twice', bands.includes('SHIPPING : AVE')&&!bands.some(t=>/^Shipping: SHIPPING/.test(t)), bands.join(' | '));
  ok('R5: any other name still leads with its block, and only a whole-word match drops it', bands.includes('Shipping: Crate check')&&bands.includes('Shipping: Shippingdock sweep'), bands.join(' | '));
  let c=E("prBuild('project')");
  ok('R5: weeks share the page when they fit — one page a month, every week a px height', c.length===3&&c.every(p=>[...p.querySelectorAll('.cal-wk')].every(w=>/^\d+px$/.test(w.style.height))), c.length);
  E('PR_FIXED_H=300');c=E("prBuild('project')");E('PR_FIXED_H=null');
  const mons=c.map(p=>p.querySelector('.cal-mon').textContent);
  ok('R5: taller weeks continue the month on the next page, marked (continued)', c.length>3&&mons.some(t=>/\(continued\)$/.test(t))&&c.every(p=>p.querySelectorAll('.cal-wk').length>=1), mons.join(' / '));
  ok('R5: no week is squeezed below its content', c.every(p=>[...p.querySelectorAll('.cal-wk')].every(w=>parseInt(w.style.height,10)>=300)));
  ok('R5: page numbers run through the continuation pages', c.map(p=>p.querySelector('.pr-pageno').textContent).join('/')===c.map((p,i)=>'Page '+(i+1)+' of '+c.length).join('/'));

  sec('R2 — a reload remembers Outline');
  const dom2=boot(FILE,{data:{projects:[P],tasks,staff,todos:[]},localStorage:{shopTimelinePrintBars:'outline'}});
  setTimeout(()=>{
    ok('R2: Outline comes back after a reload and the preview shows it', dom2.window.eval('PR_OUTLINE')===true&&dom2.window.document.querySelector('input[name=pp-bars][value=outline]').checked);
    done();
  },1200);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
