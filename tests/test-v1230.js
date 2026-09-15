/* v1.23.0 — the Freelance flag (owner, 2026-09-15): a checkbox in the People editor's
   Schedule block greys the day/hour controls out; the Schedule column and record read
   "Freelance". Stored as `freelance` ('1'/empty) on the staff row, tristate.
   Run: node tests/test-v1230.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cde-free')<0){
  console.log('test-v1230: skipped — pre-v1.23.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const staff=[
 {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM',admin:'dev',schedule:JSON.stringify({days:[1,2,3,4,5],start:'09:00',end:'18:00'})},
 /* freelance with stale hours on the row — the flag wins */
 {appId:'s2',Title:'Dana West',depts:JSON.stringify(['fab']),ooo:'[]',email:'d@x.co',role:'',admin:'',freelance:'1',schedule:JSON.stringify({days:[2,3,4],start:'11:00',end:'16:00'})},
 {appId:'s3',Title:'Alex Reyes',depts:JSON.stringify(['fab']),ooo:'[]',email:'a@x.co',role:'',admin:'',freelance:''}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);

setTimeout(main,1300);

function main(){
  sec('source markers');
  ok('freelance rides the tristate mappers',
     src.indexOf("if(p.freelance!=null)f.freelance=p.freelance?'1':''")>=0
     &&src.indexOf('freelance:f.freelance==null?null:flagTruthy(f.freelance)')>=0);
  ok('merge folds the flag', /freelance:\(keep\.freelance\|\|dup\.freelance\)\?true/.test(src));

  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('the index + record');
    const rowOf=n=>[...doc.querySelectorAll('#cd-rows .cd-row')].find(r=>r.querySelector('b').textContent.startsWith(n));
    ok('a freelancer reads Freelance, whatever hours the row carries', rowOf('Dana').querySelector('.cd-sch').textContent==='Freelance');
    ok('a non-freelancer keeps the hours', rowOf('Sam').querySelector('.cd-sch').textContent==='M-F 9-6');
    ok('flag off + no hours = blank', rowOf('Alex').querySelector('.cd-sch').textContent==='');
    E("CD_SEL=PEOPLE.find(p=>p.name==='Dana West').id");E('cdPaintRows();cdPaintDetail()');
    ok('the record shows Freelance', /Schedule[^]{0,40}Freelance/.test(doc.getElementById('cd-detail').textContent));

    sec('the editor');
    doc.getElementById('cdd-edit').click();
    const fr=doc.getElementById('cde-free');
    const ctl=()=>[...doc.querySelectorAll('#cde-sched input, #cde-sched-hrs input')];
    ok('the box is checked for a freelancer', fr.checked);
    ok('…and the week controls are disabled + greyed', ctl().length===9&&ctl().every(i=>i.disabled)
       &&doc.getElementById('cde-sched').classList.contains('off'));
    fr.checked=false;fr.dispatchEvent(new win.Event('change'));
    ok('unticking re-enables the week', ctl().every(i=>!i.disabled)&&!doc.getElementById('cde-sched').classList.contains('off'));
    ok('…and the buffer carries the change', E('CD_EDIT.freelance')===false);
    doc.getElementById('cde-save').click();
    setTimeout(()=>{
      ok('the save writes freelance:false and the hours show again',
         E("PEOPLE.find(p=>p.name==='Dana West').freelance")===false&&rowOf('Dana').querySelector('.cd-sch').textContent==='T-W-Th 11-4');
      ok('…and the outgoing PATCH carries freelance:""',
         win.__spCalls.some(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url)&&c.body&&c.body.freelance===''));

      sec('tristate: a row without the column never sends it');
      E("CD_SEL=PEOPLE.find(p=>p.name==='Sam').id");E('cdPaintDetail()');
      doc.getElementById('cdd-edit').click();
      ok('the box is unchecked and the week enabled for a null flag', !doc.getElementById('cde-free').checked&&ctl().every(i=>!i.disabled));
      const n0=win.__spCalls.length;
      const ph=doc.getElementById('cde-phone');ph.value='555-0100';ph.dispatchEvent(new win.Event('input'));
      doc.getElementById('cde-save').click();
      setTimeout(()=>{
        const sent=win.__spCalls.slice(n0).filter(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url));
        ok('Sam keeps a null flag and the PATCH omits it',
           E("PEOPLE.find(p=>p.name==='Sam').freelance")===null&&sent.length>0&&sent.every(c=>!('freelance' in (c.body||{}))));
        console.log('\ntest-v1230: '+pass+' passed, '+fail+' failed');
        process.exit(fail?1:0);
      },350);
    },350);
  },350);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
