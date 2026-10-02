/* v1.26.3 — tracker #13 and #27: People page columns.
   #13 R1 columns fit their text, nothing spills (cut off with …, hover for the full value) ·
   R2 the table sits inside the list pane, leftover space stays empty, too wide scrolls
   sideways · R3 resizing one column leaves its neighbours unchanged · R4 double-click a
   grip to fit; Reset widths in the column menu.
   #27 R1 the header bar never spills into the detail panel; header and rows scroll
   together · R2 what does not fit is cut off at a divider.
   People page only (the project-page rule does not apply). jsdom has no layout, so
   widths are proven on the stylesheet, the inline --cdcN variables and the DOM; the
   fit is driven by stubbing scrollWidth.
   Run: node tests/test-v1263.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function cdFitCol')<0){
  console.log('  SKIP  test-v1263: pre-v1.26.3 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const LONGROLE='SFAB1 - Seasonal Fabricator and Lead Paint Technician';
const LONGMAIL='maximiliana.featherstonehaugh@twoseven-international-holdings.example';
const staff=[
 {appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:'PM1 - Project Manager',phone:'',admin:'dev',driver:'1'},
 {appId:'s2',Title:'Maximiliana Featherstonehaugh-Worthington',email:LONGMAIL,depts:JSON.stringify(['fab']),ooo:'[]',role:LONGROLE,phone:'+1 (555) 010-0100 ext. 12345'},
 {appId:'s3',Title:'Bea Chen',email:'bea@example.com',depts:JSON.stringify(['td']),ooo:'[]',role:'',admin:'1',feedbackRecipient:'1'},
 {appId:'s4',Title:'Cody Hall',email:'',depts:JSON.stringify(['fab']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]},
  localStorage:{shopTimelineCdColW:'[100,120,null,150,60,48,90,96]'}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const v=n=>q('.cd-list').style.getPropertyValue('--cdc'+n);
const stub=(el,w)=>Object.defineProperty(el,'scrollWidth',{value:w,configurable:true});
const col=i=>qa('.cd-cols>span:nth-child('+(i+1)+'),.cd-row.pp7>:nth-child('+(i+1)+')');
const rowOf=n=>qa('#cd-rows .cd-row.pp7').find(r=>r.querySelector('b').textContent.startsWith(n));

setTimeout(()=>{
  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(main,500);
},1300);

function main(){
  sec('#13 R2 / R3 — fixed px tracks, the table as wide as its columns');
  ok('R2/R3: the People template is eight px tracks, no fr or auto', /\.cd-cols,\.cd-row\.pp7\{grid-template-columns:\s*(var\(--cdc[1-8],\d+px\)\s*){8};\s*width:max-content;min-width:100%/.test(src));
  ok('R1: header and rows share one template and the same side padding', qa('.cd-cols>span').length===8&&qa('.cd-row.pp7').length===4&&qa('.cd-row.pp7').every(r=>r.children.length===8), qa('.cd-row.pp7').map(r=>r.children.length).join());
  ok('R3 setup: the remembered widths are applied, the unpinned column 3 reads the stylesheet default', v(1)==='100px'&&v(2)==='120px'&&v(3)===''&&v(4)==='150px', [v(1),v(2),v(3),v(4)].join(' '));
  E("cdColDrag(new MouseEvent('mousedown',{clientX:100}),document.querySelectorAll('.cd-cols>span')[1],1)");
  doc.dispatchEvent(new win.MouseEvent('mousemove',{clientX:160}));
  doc.dispatchEvent(new win.MouseEvent('mouseup'));
  ok('R3: dragging column 2 pins only column 2', v(2)==='60px'&&v(1)==='100px'&&v(3)===''&&v(4)==='150px'&&v(5)==='60px'&&v(6)==='48px'&&v(7)==='90px'&&v(8)==='96px', [v(1),v(2),v(3),v(4),v(5),v(6),v(7),v(8)].join(' '));
  ok('R3: the remembered widths carry that one change', win.localStorage.getItem('shopTimelineCdColW')==='[100,60,null,150,60,48,90,96]', win.localStorage.getItem('shopTimelineCdColW'));

  sec('#13 R1 — fit to content, capped, floored, not persisted unless asked');
  col(2).forEach(c=>stub(c,120));
  E('cdFitCol(2)');
  ok('plan 1: a column fits its widest text plus 2px', v(3)==='122px', v(3));
  ok('plan 1: an automatic fit is not remembered', win.localStorage.getItem('shopTimelineCdColW')==='[100,60,null,150,60,48,90,96]');
  stub(col(2)[1],900);E('cdFitCol(2)');
  ok('plan 1: the fit is capped at 280px', v(3)==='280px', v(3));
  col(2).forEach(c=>stub(c,5));E('cdFitCol(2)');
  ok('plan 1: never below the 36px floor', v(3)==='36px', v(3));

  sec('#13 R1 plan 4 / #27 R2 — every cell cuts off with an ellipsis and shows in full on hover');
  ok('the shared rule covers header cells and every People cell', /\.cd-cols span,\.cd-row\.pp7>\*\{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis\}/.test(src));
  const max=rowOf('Maximiliana');
  ok('a long title shows in full on hover', !!max&&max.children[1].title==='Seasonal Fabricator and Lead Paint Technician', max&&max.children[1].title);
  ok('a long email shows in full on hover', !!max&&max.children[3].title===LONGMAIL);
  ok('the name shows in full on hover', !!max&&max.children[0].title.startsWith('Maximiliana'));
  const sam=rowOf('Sam');
  ok('permission chips keep their own tooltips (no parent title)', !!sam&&sam.children[4].title===''&&/^Developer/.test((sam.querySelector('.cd-perm.dev')||{title:''}).title), sam&&(sam.querySelector('.cd-perm.dev')||{}).title);

  sec('#13 R4 — double-click fits and remembers; Reset widths in the column menu');
  col(0).forEach(c=>stub(c,140));
  qa('.cd-cols>i.cd-grip')[0].dispatchEvent(new win.MouseEvent('dblclick',{bubbles:true}));
  ok('R4: double-clicking a grip fits that column and remembers it', v(1)==='142px'&&JSON.parse(win.localStorage.getItem('shopTimelineCdColW'))[0]===142, v(1)+' / '+win.localStorage.getItem('shopTimelineCdColW'));
  ok('the grip tooltip names the double-click', /double-click to fit/.test(qa('.cd-cols>i.cd-grip')[0].title));
  q('.cd-cols').dispatchEvent(new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:300,clientY:180}));
  const menu=q('#cd-colmenu');
  ok('R4: right-click on the header opens the column menu', !!menu&&menu.classList.contains('tb-menu')&&!menu.classList.contains('hidden'));
  /* drop the stubbed measurements first: after a reset every column is unpinned and fits
     its content again, which with no layout means the stylesheet default */
  col(0).forEach(c=>stub(c,0));col(2).forEach(c=>stub(c,0));
  q('#cd-reset-w').dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  ok('R4: Reset widths clears every pin and the memory', E('CD_COLW')===null&&win.localStorage.getItem('shopTimelineCdColW')===null&&[1,2,3,4,5,6,7,8].every(n=>v(n)===''), [1,2,3,4,5,6,7,8].map(v).join('|'));
  col(0).forEach(c=>stub(c,140));
  E('cdApplySizes()');
  ok('R4: after a reset the unpinned columns fit their content again (not remembered)', v(1)==='142px'&&win.localStorage.getItem('shopTimelineCdColW')===null, v(1));
  col(0).forEach(c=>stub(c,0));
  ok('and closes the menu', menu.classList.contains('hidden'));
  q('.cd-cols').dispatchEvent(new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:300,clientY:180}));
  doc.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  ok('the column menu closes on an outside click', menu.classList.contains('hidden'));

  sec('#27 R1 — the header lives inside the list scroller and sticks');
  ok('R1: the header row is inside #cd-rows with the rows', !!q('#cd-rows>.cd-cols')&&!!q('#cd-rows .cd-row.pp7'));
  ok('R1: the scroller clips both axes', /\.cd-rows\{overflow:auto;flex:1/.test(src));
  ok('R1: the list pane clips too', /\.cd-list\{[^}]*overflow:hidden/.test(src));
  ok('R1: the header sticks to the top of the scroller', /\.cd-cols\{position:sticky;top:0;z-index:1;background:/.test(src));
  const rows=q('#cd-rows');rows.scrollLeft=30;rows.scrollTop=40;
  E('render()');
  ok('R1: a data repaint keeps the sideways and the vertical scroll', q('#cd-rows').scrollLeft===30&&q('#cd-rows').scrollTop===40, q('#cd-rows').scrollLeft+' / '+q('#cd-rows').scrollTop);

  sec('#27 R2 — the divider and the column edge lines');
  ok('R2: the list/detail divider is present and the split handle rides it', !!q('#cd-split')&&/\.cd-list\{[^}]*border-right:1px solid #E2E8F0/.test(src)&&/#cd-split\{flex:0 0 6px;margin-left:-3px/.test(src));
  ok('R2 plan 3: every column edge draws its thin line', qa('.cd-cols>i.cd-grip').length===8&&/\.cd-grip::after\{[^}]*width:1px;background:#D8E2EF\}/.test(src));

  sec('the Clients page is untouched');
  win.location.hash='#/clients';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    const cl=qa('.cd-row.cl');
    ok('client rows keep their three cells', cl.length>=0&&cl.every(r=>r.children.length===3), cl.map(r=>r.children.length).join());
    ok('no People column variable is applied on the Clients page', !q('.cd-list')||q('.cd-list').style.getPropertyValue('--cdc1')==='');
    done();
  },400);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
