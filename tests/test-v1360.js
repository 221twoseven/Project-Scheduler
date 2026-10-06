/* v1.36.0 — bar labels stick to the visible left edge (tracker #4, TODO item 35):
   R1 while scrolling sideways, a bar's label (phase name / project name) stays visible at
      the left edge of the chart, next to the sidebar, and rides with the bar again once
      the bar's start scrolls into view — dashboard (both lenses) and project page ·
   R2 the project row's status pill goes with the label (it is the label's first piece).
   Done when: a bar that starts off-screen has its label's left edge at the chart's visible
   left edge; the label never passes its bar's end (ellipsis zone LBL_TAIL); screenshot.
   jsdom has no layout, so these assert the mechanism: the offset computed from a simulated
   scrollLeft, the scroll handlers, and the ellipsis CSS.
   Run: node tests/test-v1360.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('const LBL_TAIL=')<0){
  console.log('  SKIP  test-v1360: pre-v1.36.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
/* one long job that started well before today — the reporter's scenario */
const projects=[{appId:'p1',Title:'Stephanie Seafood Madison',client:'Stephanie',jobCode:'TB1',deadline:D(40),
  status:'in-fabrication',projectManager:'Robert',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','td','fab','install']),createdAt:'2026-07-01',sortIndex:0}];
const tasks=[
  {appId:'a0',projectId:'p1',department:'pm',assignee:'Robert',startDate:D(-40),endDate:D(40),estimatedDays:60,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'a1',projectId:'p1',department:'td',assignee:'Peter',startDate:D(-40),endDate:D(20),estimatedDays:45,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'a2',projectId:'p1',department:'fab',assignee:'Nick',startDate:D(-30),endDate:D(30),estimatedDays:45,ticketNodes:'[]',notes:'',pinned:false,label:''},
  {appId:'a3',projectId:'p1',department:'install',assignee:'[]',startDate:D(38),endDate:D(40),estimatedDays:3,ticketNodes:'[]',notes:'',pinned:false,label:''}];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const px=v=>parseFloat(v)||0;
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
const change=el=>el&&el.dispatchEvent(new win.Event('change',{bubbles:true}));

setTimeout(stage1,1500);

function stage1(){
  const sc=doc.getElementById('gantt-scroll');
  Object.defineProperty(sc,'clientWidth',{get:()=>800,configurable:true});
  const TAIL=E('LBL_TAIL');

  sec('R1 — dashboard, Projects lens: the label parks at the visible left edge');
  E("EXPANDED.add('p1');render()"); /* the reporter's view: the project row opened to its phases */
  const bar=doc.querySelector('#gantt-canvas .job-bar[data-tid="a1"]');
  const lbl=bar&&bar.querySelector('.bar-lbl');
  ok('the Technical Design bar carries a label',!!lbl);
  const bx=px(bar.style.left),bw=px(bar.style.width),base=Number(lbl.dataset.base);
  /* scroll so the bar's start is 300px off-screen to the left, then let the scroll handler run */
  sc.scrollLeft=bx+300;sc.dispatchEvent(new win.Event('scroll'));
  setTimeout(()=>{
    const stuck=px(lbl.style.left);
    ok('label left edge sits at the chart\'s visible left edge (scrollLeft + 14px inset)',
       bx+stuck===sc.scrollLeft+14,'bar.left '+bx+' + label.left '+stuck+' vs scrollLeft '+sc.scrollLeft);
    ok('the Today line no longer anchors the label (labelLeftFor ignores TODAY_X)',
       !/function labelLeftFor[\s\S]{0,400}TODAY_X/.test(src));
    ok('gantt-scroll\'s scroll handler queues the reposition',
       /gScroll\.addEventListener\('scroll',[^\n]*queueLabelReposition\(\)/.test(src));
    ok('a dashboard drag re-parks the ghost\'s label as it moves',
       /DRAG\.ghost\.style\.width=Math\.max\(DW_,DRAG\.ow\+dd\*DW_\)\+'px';\r?\n  \}\r?\n  queueLabelReposition\(\);/.test(src));

    sec('Done when — the label never passes its bar\'s end');
    sc.scrollLeft=bx+bw-10;sc.dispatchEvent(new win.Event('scroll'));
    setTimeout(()=>{
      ok('with 10px of bar left on screen, the label stops LBL_TAIL px short of the bar\'s end',
         px(lbl.style.left)===Math.round(bw-TAIL),lbl.style.left+' vs '+(bw-TAIL));
      ok('…and ellipsises there (.bar-lbl keeps overflow:hidden + text-overflow:ellipsis + a right inset)',
         /\.bar-lbl\{[^}]*overflow:hidden;text-overflow:ellipsis/.test(src)&&lbl.style.right==='7px');

      sec('R1 — the label rides with the bar once its start scrolls into view');
      sc.scrollLeft=Math.max(0,bx-50);sc.dispatchEvent(new win.Event('scroll'));
      setTimeout(()=>{
        ok('label back at its natural inset',px(lbl.style.left)===base,lbl.style.left+' vs base '+base);
        ok('labelLeftFor returns the base when the bar start is visible',E('labelLeftFor(1000,600,8)')===8);
        ok('labelLeftFor parks at scrollLeft+14 when the bar starts off-screen',
           E('labelLeftFor(0,2000,8)')===Math.round(sc.scrollLeft+14),E('labelLeftFor(0,2000,8)')+' vs scrollLeft '+sc.scrollLeft);

        sec('R2 — the project row\'s status pill is part of the parked label');
        const sum=doc.querySelector('#gantt-canvas .job-bar.summary[data-pid="p1"]');
        const sl=sum&&sum.querySelector('.bar-lbl');
        ok('the project row label leads with the status pill',!!sl&&!!sl.firstElementChild&&sl.firstElementChild.classList.contains('sum-pill'));
        const sx=px(sum.style.left);
        sc.scrollLeft=sx+200;sc.dispatchEvent(new win.Event('scroll'));
        setTimeout(()=>{
          ok('the project label (pill included) parks at the visible left edge',sx+px(sl.style.left)===sc.scrollLeft+14,sl.style.left);

          sec('R1 — Departments lens uses the same bars and rule');
          click(doc.getElementById('btn-lens-dept'));
          setTimeout(()=>{
            const db=doc.querySelector('#gantt-canvas .job-bar[data-tid="a1"]');
            const dl=db&&db.querySelector('.bar-lbl');
            ok('the phase bar renders in the Departments lens with a label',!!dl);
            if(dl){const dx=px(db.style.left);sc.scrollLeft=dx+300;sc.dispatchEvent(new win.Event('scroll'));}
            setTimeout(()=>{
              ok('…parked at the visible left edge',!!dl&&px(db.style.left)+px(dl.style.left)===sc.scrollLeft+14,dl&&dl.style.left);
              click(doc.getElementById('btn-lens-proj'));
              setTimeout(stage2,400);
            },120);
          },500);
        },120);
      },120);
    },120);
  },120);
}

function stage2(){
  sec('R1 — project page (saved project)');
  win.location.hash='#/project/p1';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    checkNpv('saved',()=>{
      sec('R1 — project page (New Project draft)');
      win.location.hash='#/project/new';
      win.dispatchEvent(new win.Event('hashchange'));
      setTimeout(()=>{
        /* a draft only draws once it has a deadline and departments (test-v1320 recipe) */
        const dl=doc.getElementById('pp-deadline');dl.value=D(40);change(dl);
        for(const d of ['td','fab']){const ck=doc.querySelector('#pp-depts input[data-dept="'+d+'"]');if(ck&&!ck.checked){ck.checked=true;change(ck);}}
        setTimeout(()=>checkNpv('draft',done),900);
      },700);
    });
  },800);
}

function checkNpv(tag,next){
  const sc=doc.getElementById('npv-scroll');
  /* jsdom has no layout: give the panel a width so a phase bar is wider than the ellipsis zone */
  Object.defineProperty(sc,'clientWidth',{get:()=>1400,configurable:true});
  E('npvRebuild()');
  const bar=doc.querySelector('#npv-body .npv-bar');
  const lbl=bar&&bar.querySelector('.npv-lbl');
  ok('['+tag+'] the chart drew a phase bar with an .npv-lbl label',!!lbl,bar?bar.outerHTML.slice(0,120):'no bar');
  if(!lbl){next();return;}
  const GUT=E('NPV_GUT'),TAIL=E('LBL_TAIL');
  const bx=px(bar.style.left),bw=px(bar.style.width);
  ok('['+tag+'] the bar is wider than the ellipsis zone plus the parked inset (scenario sanity)',bw>=TAIL+80,bw);
  /* the bar's start sits 60px under the name column; most of the bar is still on screen */
  sc.scrollLeft=bx-GUT+60;sc.dispatchEvent(new win.Event('scroll'));
  setTimeout(()=>{
    ok('['+tag+'] the label parks just right of the name column (scrollLeft + gutter + 8px)',
       bx+6+px(lbl.style.marginLeft)===Math.round(sc.scrollLeft+GUT+8),'bar '+bx+' margin '+lbl.style.marginLeft+' scrollLeft '+sc.scrollLeft+' gut '+GUT);
    sc.scrollLeft=bx+bw-GUT-10;sc.dispatchEvent(new win.Event('scroll'));
    setTimeout(()=>{
      ok('['+tag+'] the label never passes its bar\'s end (margin stops LBL_TAIL short)',
         px(lbl.style.marginLeft)===Math.round(bw-TAIL),lbl.style.marginLeft+' vs '+(bw-TAIL));
      ok('['+tag+'] .npv-lbl shrinks and ellipsises (min-width:0 + text-overflow)',
         /\.npv-lbl\{[^}]*min-width:0;overflow:hidden;text-overflow:ellipsis/.test(src));
      sc.scrollLeft=Math.max(0,bx-GUT-50);sc.dispatchEvent(new win.Event('scroll'));
      setTimeout(()=>{
        ok('['+tag+'] the label rides with the bar again once its start is in view',lbl.style.marginLeft==='5px',lbl.style.marginLeft);
        ok('['+tag+'] npvRender re-parks after every paint',/host\.innerHTML=h;\r?\n  host\.style\.width=innerW\+'px';\r?\n  npvStickLabels\(\);/.test(src));
        ok('['+tag+'] a drag on the chart re-parks the label as the bar moves',/npvStickLabels\(\); \/\* v1\.36\.0 \(#4\): a parked label follows/.test(src));
        next();
      },120);
    },120);
  },120);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
