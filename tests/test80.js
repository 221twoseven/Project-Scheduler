/* Phase 3.5 (REV80) — global-view polish. Owner review notes, 2026-08-26:
     1. bar text is always WHITE — the light palette slots were darkened (same hues)
        so labelColor() lands on white at ≥4.5:1 for every bar fill;
     2. the scroll wheel works with the mouse over the project sidebar;
     3. the date header drags to pan the timeline (month-name clicks survive);
     4. the Today button no longer sits against the screen edge.
   Run: node tests/test80.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* The frozen REV50 reference (and any pre-3.5 build) predates the pan/wheel layer. */
if(src.indexOf('drag the date header to pan')<0){
  console.log('test80: skipped — no header drag-to-pan in '+FILE+' (pre-REV80 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* independent WCAG math — verifies the app's palette, not itself */
function lum(hex){const n=parseInt(hex.slice(1),16),f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255);}
const whiteC=bg=>1.05/(lum(bg)+.05);
const r1=v=>Math.round(v*100)/100;

const D0=new Date();D0.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const rel=(days,months)=>{const d=new Date(D0);if(months)d.setMonth(d.getMonth()+months);if(days)d.setDate(d.getDate()+days);return iso(d);};

const proj=(id,name,dl)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:dl,status:'in-fabrication',projectManager:'Stan',drafter:'Dana',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab','install']),createdAt:rel(-40)});
const task=(id,pid,dept,s,e)=>({appId:id,projectId:pid,department:dept,assignee:'Nick',
  startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[proj('p1','Long Haul',rel(30)),proj('p2','Near Term',rel(15))];
const tasks=[task('t1','p1','fab',rel(-5),rel(25)),task('t2','p2','fab',rel(0),rel(12))];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('1 · every bar fill takes the white label at 4.5:1 (owner rule)');
  const fills=[...E('PCOLS'),...Object.values(E('DEPT_COLORS')),E('INSTALL_RED'),'#6B7484'];
  let allWhite=true,allPass=true,worst=99,worstHex='';
  for(const bg of new Set(fills)){
    if(E('labelColor('+JSON.stringify(bg)+')')!=='#FFFFFF'){allWhite=false;ok(bg+' labels white',false);}
    const c=whiteC(bg);if(c<worst){worst=c;worstHex=bg;}
    if(c<4.5){allPass=false;ok(bg+' white ≥4.5:1',false,r1(c)+':1');}
  }
  ok('every identity/department/fallback fill labels WHITE',allWhite);
  ok('…and white passes 4.5:1 on all of them (worst '+worstHex+' '+r1(worst)+':1)',allPass);

  sec('2 · rendered bars carry the white label');
  const sumLbl=doc.querySelector('.job-bar.summary .bar-lbl');
  ok('a summary (header) bar label exists',!!sumLbl);
  ok('its text is white',!!sumLbl&&/(#fff|255,\s*255,\s*255)/i.test(sumLbl.style.color),sumLbl&&sumLbl.style.color);

  sec('3 · the wheel scrolls the Gantt from over the sidebar');
  const sc=doc.getElementById('gantt-scroll');
  sc.scrollTop=0;
  doc.getElementById('sidebar').dispatchEvent(new win.WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));
  ok('wheel over the sidebar moves the Gantt scroller',sc.scrollTop===120,sc.scrollTop);
  const sl0=sc.scrollLeft; /* startup parks the timeline left-of-center — take a baseline */
  doc.getElementById('sidebar').dispatchEvent(new win.WheelEvent('wheel',{deltaY:-120,deltaX:40,bubbles:true,cancelable:true}));
  ok('deltaY scrolls back up',sc.scrollTop===0,sc.scrollTop);
  ok('deltaX pans horizontally too',sc.scrollLeft===sl0+40,sc.scrollLeft+' vs '+(sl0+40));

  sec('4 · the date header drags to pan');
  const hw=doc.getElementById('hdr-wrap');
  const mev=(type,tgt,x)=>(tgt||doc).dispatchEvent(new win.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x||0,clientY:40}));
  sc.scrollLeft=500;
  mev('mousedown',hw,300);
  mev('mousemove',doc,200);
  ok('dragging left pans the timeline right (+100)',sc.scrollLeft===600,sc.scrollLeft);
  mev('mousemove',doc,400);
  ok('and follows the pointer back (−100 from start)',sc.scrollLeft===400,sc.scrollLeft);
  mev('mouseup',doc,400);
  const menu=doc.getElementById('goto-menu');
  const mc=doc.querySelector('#gantt-hdr .hdr-m-cell');
  mev('click',mc,400);
  ok('the click after a drag is swallowed — no goto popover',menu.classList.contains('hidden'));

  sec('5 · a plain month-name click still opens the goto popover');
  mev('mousedown',mc,320);
  mev('mousemove',doc,321); /* under the 4px threshold — not a drag */
  mev('mouseup',doc,321);
  mev('click',mc,321);
  ok('sub-threshold movement is still a click',!menu.classList.contains('hidden'));
  ok('…and did not pan',sc.scrollLeft===400,sc.scrollLeft);

  sec('6 · the Today button sits off the screen edge');
  ok('the timeline toolbar row carries left padding',
     /\.tb-row\.tb-timeline\{padding-left:12px\}/.test(src));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
