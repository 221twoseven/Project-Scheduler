/* v1.17.0 — the People-page round (owner, 2026-09-02 evening):
   1. HR title prefixes ("SFAB1 - Seasonal Fabricator") hidden on display
   2. Driver column (staff `driver`, tristate) — index ✓, detail row, editor box
   3. Permission-level filter beside the department filter
   4. Resizable index columns + list/detail split (persisted per browser)
   5. Poll repaints keep the index/detail scroll positions
   6. ↑↓ walk the index selection
   Run: node tests/test-v1170.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cd-drv')<0){
  console.log('test-v1170: skipped — pre-v1.17.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const staff=[
 {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM1 - Project Manager',admin:'dev',driver:'1'},
 {appId:'s2',Title:'Alex Reyes',depts:JSON.stringify(['fab']),ooo:'[]',email:'alex@x.com',role:'SFAB1 - Seasonal Fabricator',admin:'',driver:''},
 {appId:'s3',Title:'Bea Chen',depts:JSON.stringify(['td']),ooo:'[]',email:'bea@x.com',role:'TD2 - Technical Designer',admin:'1',feedbackRecipient:'1',driver:'1'},
 {appId:'s4',Title:'Cody Hall',depts:JSON.stringify(['fin']),ooo:'[]',email:'cody@x.com',role:'Co-Director of Finishing',admin:''}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const key=k=>doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
const selName=()=>{const b=doc.querySelector('#cd-rows .cd-row.sel b');return b?b.textContent:'';};

setTimeout(main,1300);

function main(){
  sec('source markers');
  ok('grid columns read their widths from vars', /--cdc1,minmax\(0,1\.05fr\)/.test(src));
  ok('renderCompanyPage carries scroll across the repaint',
     /const sc0=document\.getElementById\('cd-rows'\),st0=sc0\?sc0\.scrollTop:0;/.test(src)
     &&src.indexOf("sc1.scrollTop=st0")>=0);
  ok('KBD popover teaches the arrows', /\['↑ ↓','Move selection'\],\['⌘ Z','Undo'\],\['Esc','Back to the timeline'\]/.test(src));
  ok('driver rides the tristate mappers',
     src.indexOf("if(p.driver!=null)f.driver=p.driver?'1':''")>=0
     &&src.indexOf("driver:f.driver==null?null:flagTruthy(f.driver)")>=0);
  ok('merge folds the driver flag', /driver:\(keep\.driver\|\|dup\.driver\)\?true/.test(src));

  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('the index: seven columns, stripped titles, driver checks');
    ok('on the People page', E('ROUTE.view')==='people');
    ok('header names the seven columns',
       [...doc.querySelectorAll('.cd-cols>span')].map(s=>s.textContent).join(',')==='Name,Title,Phone,Email,Perms,Driver,Status');
    ok('rows carry seven cells', doc.querySelector('.cd-row.pp7').children.length===7);
    const rowOf=n=>[...doc.querySelectorAll('#cd-rows .cd-row')].find(r=>r.querySelector('b').textContent.startsWith(n));
    ok('"SFAB1 - Seasonal Fabricator" reads as "Seasonal Fabricator"',
       rowOf('Alex').children[1].textContent==='Seasonal Fabricator');
    ok('a real hyphenated title is untouched',
       rowOf('Cody').children[1].textContent==='Co-Director of Finishing');
    ok('the stored role keeps its prefix', E("PEOPLE.find(p=>p.name==='Alex Reyes').role")==='SFAB1 - Seasonal Fabricator');
    ok('drivers get a check, others stay empty',
       rowOf('Bea').querySelector('.cd-drv').textContent==='✓'&&rowOf('Cody').querySelector('.cd-drv').textContent==='');

    sec('the permission filter');
    const pf=doc.getElementById('cd-perm');
    ok('the filter renders once the flag columns are live', !!pf);
    pf.value='admin';pf.dispatchEvent(new win.Event('change'));
    ok('Admins = the flagged rows (developers included)',
       [...doc.querySelectorAll('#cd-rows .cd-row b')].map(b=>b.textContent).join('|')==='Bea Chen|Sam');
    pf.value='viewer';pf.dispatchEvent(new win.Event('change'));
    ok('Viewers = everyone without the admin flag',
       [...doc.querySelectorAll('#cd-rows .cd-row b')].map(b=>b.textContent).join('|')==='Alex Reyes|Cody Hall');
    pf.value='all';pf.dispatchEvent(new win.Event('change'));

    sec('↑↓ walk the selection');
    doc.querySelector('#cd-rows .cd-row').click();
    key('ArrowDown');key('ArrowDown');
    ok('two Downs from the top land on the third row', selName()==='Cody Hall', selName());
    key('ArrowUp');
    ok('Up steps back', selName()==='Bea Chen', selName());
    key('ArrowUp');key('ArrowUp');key('ArrowUp');
    ok('Up clamps at the first row', selName()==='Alex Reyes', selName());

    sec('detail + editor carry the flag');
    ok('the record reads Driver as information', /Driver/.test(doc.getElementById('cd-detail').innerHTML));
    doc.getElementById('cdd-edit').click();
    const dv=doc.getElementById('cde-driver');
    ok('the editor has the Driver checkbox', !!dv&&dv.checked===false);
    dv.checked=true;dv.dispatchEvent(new win.Event('change'));
    doc.getElementById('cde-save').click();
    setTimeout(()=>{
      ok('saving writes driver through the tristate mapper',
         E("PEOPLE.find(p=>p.name==='Alex Reyes').driver")===true);
      /* staff PATCHes go to /items/{id}/fields with the fields object as the body */
      const patched=win.__spCalls.some(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url)&&c.body&&c.body.driver==='1');
      ok('…and the outgoing Graph PATCH carries driver:"1"', patched);

      sec('resizable columns and split (the testable core)');
      /* v1.17.1 regression gate: the grips must be <i> CHILDREN OF THE HEADER ROW —
         as spans inside the cells, the `.cd-cols span` rule out-specified `.cd-grip`
         and collapsed every grip to 0px wide (owner: "columns are not resizeable"). */
      ok('grips are header-row <i> elements, never cell spans',
         doc.querySelectorAll('.cd-cols>i.cd-grip').length===7
         &&doc.querySelectorAll('.cd-cols span .cd-grip').length===0);
      const sp=doc.querySelector('.cd-cols>span');
      E("cdColDrag(new MouseEvent('mousedown',{clientX:100}),document.querySelector('.cd-cols>span'),0)");
      doc.dispatchEvent(new win.MouseEvent('mousemove',{clientX:160}));
      doc.dispatchEvent(new win.MouseEvent('mouseup'));
      ok('a header drag pins the column var',
         doc.querySelector('.cd-list').style.getPropertyValue('--cdc1')==='60px');
      ok('…and remembers it', win.localStorage.getItem('shopTimelineCdColW')==='[60]');
      E("cdSplitDrag(new MouseEvent('mousedown',{clientX:500}))");
      doc.dispatchEvent(new win.MouseEvent('mousemove',{clientX:560}));
      doc.dispatchEvent(new win.MouseEvent('mouseup'));
      ok('the split drag clamps to the 320px floor and persists',
         doc.querySelector('.cd-list').style.width==='320px'
         &&win.localStorage.getItem('shopTimelineCdListW')==='320');

      sec('a data repaint keeps the panes where they were');
      const rows=doc.getElementById('cd-rows');rows.scrollTop=40;
      E('render()');
      ok('the index scroll survives render()', doc.getElementById('cd-rows').scrollTop===40,
         String(doc.getElementById('cd-rows').scrollTop));
      ok('the remembered sizes re-apply after the repaint',
         doc.querySelector('.cd-list').style.width==='320px'
         &&doc.querySelector('.cd-list').style.getPropertyValue('--cdc1')==='60px');

      console.log('\ntest-v1170: '+pass+' passed, '+fail+' failed');
      process.exit(fail?1:0);
    },350);
  },350);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
