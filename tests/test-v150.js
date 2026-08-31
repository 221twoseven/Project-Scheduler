/* v1.5.0 — viewport-fitting zoom (08-31 brief objs 7 and 8).
   Global: Week/Month/3-Month fit 7/30/91 days across the viewport (jsdom falls back
   to 1200px); W/M jump, +/− walk; a vertical date-bar drag sets FIT continuously
   (45° split vs the pan); FIT persists and old step names migrate.
   Project page: a Fit/Week/Month/3-Mo control drives NPV_GEO.dw the same way.
   Run: node tests/test-v150.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('FIT_STEPS')<0){
  console.log('test-v150: skipped — pre-v1.5.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const near=(a,b)=>Math.abs(a-b)<.01;

const D=n=>{const d=new Date();d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:D(30),status:'in-fabrication',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-5),
  endDate:D(10),estimatedDays:12,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const press=k=>doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:k}));

setTimeout(()=>{
  sec('the three steps fit the viewport');
  ok('boot lands on Month, 30 days across', E('VIEW')==='month'&&E('FIT')===30&&near(E('dw()'),40));
  press('w');
  ok('W = one week on screen', E('VIEW')==='week'&&near(E('dw()'),1200/7), E('dw()'));
  press('m');
  ok('M = one month on screen', E('VIEW')==='month'&&near(E('dw()'),40));
  press('-');
  ok('− steps out to 3-Month', E('VIEW')==='month3'&&near(E('dw()'),1200/91), E('VIEW')+' '+E('dw()'));
  press('-');
  ok('− at 3-Month is a no-op', E('VIEW')==='month3');
  press('+');
  ok('+ steps back in to Month', E('VIEW')==='month');
  click(q('#btn-week'));
  ok('the Week button works and highlights', E('VIEW')==='week'
     &&q('#btn-week').classList.contains('active')&&!q('#btn-month').classList.contains('active'));

  sec('the header degrades by px-per-day, not step name');
  E("setView('month')");
  ok('Month: day cells numbered every day', (()=>{
    const cells=qa('#gantt-hdr .hdr-row')[1].children;
    return cells.length>10&&[...cells].slice(0,7).every(c=>c.textContent!=='');})());
  E("setFit(60);"); /* custom 20px/day — the old 2-Day zone */
  ok('custom 60-day FIT: Mondays only', (()=>{
    const cells=[...qa('#gantt-hdr .hdr-row')[1].children];
    const labeled=cells.filter(c=>c.textContent);
    return labeled.length>0&&labeled.length<cells.length;})());
  ok('a custom FIT highlights no step button', qa('#tg-scale .t-btn.active').length===0);
  E("setView('month3')");
  ok('3-Month: week cells, labeled', (()=>{
    const cells=[...qa('#gantt-hdr .hdr-row')[1].children];
    return cells.length>0&&near(parseFloat(cells[0].style.width),7*1200/91)&&cells.some(c=>/\d/.test(c.textContent));})());

  sec('persistence + migration');
  E("setFit(45);saveUI()");
  ok('a drag-set FIT persists', JSON.parse(win.localStorage.getItem('shopTimelineUI_v1')).fit===45);
  E("setView('month');localStorage.setItem(UI_KEY,JSON.stringify({view:'days'}));loadLocalPrefs();");
  ok('old stored "days" migrates to Month', E('VIEW')==='month'&&E('FIT')===30);
  E("localStorage.setItem(UI_KEY,JSON.stringify({view:'weeks'}));loadLocalPrefs();");
  ok('old stored "weeks" migrates to 3-Month', E('VIEW')==='month3'&&E('FIT')===91);
  E("localStorage.setItem(UI_KEY,JSON.stringify({view:'bogus'}));setView('month');loadLocalPrefs();");
  ok('an unknown stored step is ignored', E('VIEW')==='month');

  sec('date-bar drag: horizontal pans, vertical zooms (45° split)');
  const hw=doc.getElementById('hdr-wrap'),sc=doc.getElementById('gantt-scroll');
  E("setView('month')");sc.scrollLeft=500;
  hw.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:30,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:220,clientY:34}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true}));
  ok('a mostly-horizontal drag pans', sc.scrollLeft===580, sc.scrollLeft);
  ok('…and never zooms', E('FIT')===30);
  hw.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:60,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:305,clientY:-90}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true}));
  setTimeout(()=>{
    const f=E('FIT');
    ok('a mostly-vertical drag up zooms in (fewer days)', f>15&&f<17, 'FIT='+f);
    ok('the zoomed FIT reads as custom', E('VIEW')==='custom'&&qa('#tg-scale .t-btn.active').length===0);
    ok('the drag-set FIT was saved once on release',
       Math.abs(JSON.parse(win.localStorage.getItem('shopTimelineUI_v1')).fit-f)<.01);
    setTimeout(npvPart,50);
  },80);
},1300);

function npvPart(){
  sec('obj 8 — the project page gets the same steps (+ Fit)');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const zm=q('#npv-zoom');
    ok('the zoom control renders on the Gantt', !!zm&&zm.querySelectorAll('button').length===4);
    ok('Fit is the default (whole job on screen)', E('NPV_FIT')===null
       &&zm.querySelector('button[data-fit=""]').classList.contains('on'));
    const dwFit=E('NPV_GEO.dw');
    click(zm.querySelector('button[data-fit="7"]'));
    ok('Week pins ~34px/day in the 240px jsdom panel', near(E('NPV_GEO.dw'),240/7), E('NPV_GEO.dw'));
    ok('the choice persists per browser', win.localStorage.getItem('shopTimelineNpvFit')==='7');
    click(q('#npv-zoom').querySelector('button[data-fit=""]'));
    ok('Fit restores the whole-job scale', E('NPV_GEO.dw')===dwFit, E('NPV_GEO.dw')+' vs '+dwFit);
    E("NPV_MODE='calendar';npvRender();");
    ok('the control hides on the calendar', q('#npv-zoom').classList.contains('hidden'));
    console.log('\ntest-v150: '+pass+' passed, '+fail+' failed');
    process.exit(fail?1:0);
  },800);
}
