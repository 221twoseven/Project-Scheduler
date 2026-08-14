/* C2 quiet-canvas suite — run: node tests/test-quiet.js ./index.html
   Design-Language §2.4: quiet is the default, the vivid MONTH_HSL look lives
   behind the "Vivid months" toggle, print never emits vivid tints. */
const {boot}=require('./harness');
const fs=require('fs');
const path=require('path');
const FILE=process.argv[2]||'./index.html';
const src=fs.readFileSync(FILE,'utf8');

/* The frozen REV50 reference predates C2 — same convention as test-c1-color.js. */
if(src.indexOf('quietCellBg')<0){
  console.log('test-quiet: skipped — no quietCellBg() in '+FILE+' (pre-C2 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(name,cond,extra)=>{
  if(cond){pass++;console.log('  PASS  '+name);}
  else{fail++;console.log('  FAIL  '+name+(extra?'   ('+extra+')':''));}
};
const sec=t=>console.log('\n'+t);

const projects=[{appId:'p1',Title:'Hermes Windows',client:'Hermes',jobCode:'H1',
  deadline:'2026-09-15',status:'approved',projectManager:'Stan',drafter:'Peter',
  leadFab:'Nick',activeDepartments:JSON.stringify(['td','fab','install']),
  createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
 {appId:'t1',projectId:'p1',department:'td',assignee:'Peter',startDate:'2026-08-03',
  endDate:'2026-08-14',estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t2',projectId:'p1',department:'fab',assignee:'Nick',startDate:'2026-08-17',
  endDate:'2026-09-11',estimatedDays:20,ticketNodes:'[]',notes:'',pinned:false,label:''},
 {appId:'t3',projectId:'p1',department:'install',assignee:'[]',startDate:'2026-09-14',
  endDate:'2026-09-15',estimatedDays:2,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
/* jsdom normalises colour strings; run every expectation through the same parser. */
const probe=()=>doc.createElement('div');
const norm=v=>{const p=probe();p.style.background=v;return p.style.background;};

setTimeout(run,1300);

function run(){
  sec('quiet is the default (no stored preference)');
  ok('TINT boots false', E('TINT')===false);
  ok('body does not carry .vivid', !doc.body.classList.contains('vivid'));

  const quietSet=new Set(['#FCFDFE','hsl(0, 6%, 97%)'].map(norm));
  for(let m=0;m<12;m++)quietSet.add(norm(E('quietCellBg('+m+')')));
  const bgs=[...doc.querySelectorAll('#gantt-canvas .bg-col')].map(b=>b.style.background);
  ok('canvas paints week columns', bgs.length>0, 'count '+bgs.length);
  ok('every workday column is quiet (#FCFDFE / hsl(h,6%,97%))',
     bgs.every(b=>quietSet.has(b)), 'stray: '+bgs.find(b=>!quietSet.has(b)));
  ok('month boundaries draw hairlines', doc.querySelectorAll('#gantt-canvas .mon-line').length>0);
  ok('weekend columns still painted', doc.querySelectorAll('#gantt-canvas .wknd-col').length>0);
  ok('quiet weekend fill is #EEF1F5', /\.wknd-col\{[^}]*#EEF1F5/.test(src));
  ok('vivid weekend look preserved behind body.vivid',
     /body\.vivid \.wknd-col\{background:rgba\(148,163,184,\.24\)/.test(src));

  const mc=doc.querySelector('.hdr-m-cell');
  const hdrBgSet=new Set(),hdrFgSet=new Set();
  for(let m=0;m<12;m++){
    hdrBgSet.add(norm(E('monthHdrBg('+m+')')));
    const p=probe();p.style.color=E('monthHdrFg('+m+')');hdrFgSet.add(p.style.color);
  }
  ok('month header band capped at hsl(h,30%,88%)', hdrBgSet.has(mc.style.background), mc.style.background);
  ok('month header text is hsl(h,35%,30%)', hdrFgSet.has(mc.style.color), mc.style.color);

  sec('Vivid months toggle restores the old look');
  ok('toolbar button is relabelled', doc.getElementById('t-tint').textContent==='Vivid months');
  ok('cellBg formula is byte-identical to the REV50 reference', (function(){
    const ref=fs.readFileSync(path.join(__dirname,'..','reference','Timeline_50.html'),'utf8');
    const g=s=>(s.match(/function cellBg\([^\n]*/)||[''])[0].replace(/\r$/,'');
    return g(ref)!==''&&g(ref)===g(src);
  })());
  click(doc.getElementById('t-tint'));
  setTimeout(()=>{
    const vividSet=new Set();
    for(let m=0;m<12;m++){vividSet.add(norm(E('cellBg('+m+',0)')));vividSet.add(norm(E('cellBg('+m+',1)')));}
    const bgs2=[...doc.querySelectorAll('#gantt-canvas .bg-col')].map(b=>b.style.background);
    ok('vivid paints the MONTH_HSL columns', bgs2.length>0&&bgs2.every(b=>vividSet.has(b)),
       'stray: '+bgs2.find(b=>!vividSet.has(b)));
    ok('vivid drops the hairlines', doc.querySelectorAll('#gantt-canvas .mon-line').length===0);
    ok('body carries .vivid', doc.body.classList.contains('vivid'));
    ok('localStorage key is unchanged (continuity)', E("localStorage.getItem('shopTimelineTint')")==='1');
    click(doc.getElementById('t-tint'));
    setTimeout(stage2,300);
  },300);
}

function stage2(){
  sec('quiet on the project-page gantt');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    E('NPV_MODE="gantt";npvRender();');
    setTimeout(()=>{
      ok('axis paints quiet columns', doc.querySelectorAll('#npv-axis .npv-qcol').length>0);
      ok('body paints quiet columns', doc.querySelectorAll('#npv-body .npv-tintl .npv-qcol').length>0);
      ok('no vivid tint columns in quiet', doc.querySelectorAll('.npv-tintcol').length===0);
      ok('quiet does not add the .tinted class', !/tinted/.test(doc.getElementById('npv-body').className));
      ok('quiet layer stays behind the rows (zebra intact)',
         doc.getElementById('npv-body').firstElementChild.classList.contains('npv-row'));

      sec('quiet in calendar mode');
      E('NPV_MODE="calendar";npvRender();');
      setTimeout(()=>{
        const quietSet=new Set();
        for(let m=0;m<12;m++)quietSet.add(norm(E('quietCellBg('+m+')')));
        const cols=[...doc.querySelectorAll('.cal-col')];
        ok('calendar renders day columns', cols.length>0);
        const work=cols.filter(c=>!c.classList.contains('we')&&!c.classList.contains('tod'));
        ok('workday cells carry the quiet wash',
           work.length>0&&work.every(c=>quietSet.has(c.style.background)),
           'stray: '+(work.find(c=>!quietSet.has(c.style.background))||{}).style?.background);
        ok('weekend cells keep their hatch class', cols.some(c=>c.classList.contains('we')));

        sec('print never emits vivid tints');
        const pr=(src.match(/@media print\{[\s\S]*?\n\}/)||[''])[0];
        ok('print forces quiet day columns', /\.bg-col,\.hdr-d-cell\{background-color:#FCFDFE!important\}/.test(pr));
        ok('print neutralises the month header band', /\.hdr-m-cell\{background-color:#EDF1F7!important;color:#33415A!important/.test(pr));
        ok('print flattens the weekend overlay', /\.wknd-col\{background:#EEF1F5!important/.test(pr));
        done();
      },300);
    },300);
  },600);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
