/* v1.22.0 — weekly schedule on the People page (owner, 2026-09-15):
   - a Schedule column follows Status on the index, formatted "M-F 9-6" / "T-W-Th 11-4"
   - the editor gets seven day boxes + from/to time inputs (half-hour datalist, typing
     allowed, typed values snap to the half hour)
   - stored as JSON in the new `schedule` staff column, tristate like the other flags
   Run: node tests/test-v1220.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cde-sched')<0){
  console.log('test-v1220: skipped — pre-v1.22.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const staff=[
 {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM',admin:'dev',schedule:JSON.stringify({days:[1,2,3,4,5],start:'09:00',end:'18:00'})},
 {appId:'s2',Title:'Dana West',depts:JSON.stringify(['fab']),ooo:'[]',email:'d@x.co',role:'',admin:'',schedule:JSON.stringify({days:[2,3,4],start:'11:00',end:'16:00'})},
 {appId:'s3',Title:'Alex Reyes',depts:JSON.stringify(['fab']),ooo:'[]',email:'a@x.co',role:'',admin:''}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);

setTimeout(main,1300);

function main(){
  sec('formatting + parsing');
  ok('M-F 9-6', E("schedFmt({days:[1,2,3,4,5],start:'09:00',end:'18:00'})")==='M-F 9-6');
  ok('T-W-Th 11-4', E("schedFmt({days:[2,3,4],start:'11:00',end:'16:00'})")==='T-W-Th 11-4');
  ok('half hours keep :30', E("schedFmt({days:[1],start:'05:30',end:'13:00'})")==='M 5:30-1');
  ok('empty schedule reads blank', E("schedFmt({days:[],start:'',end:''})")===''&&E('schedFmt(null)')==='');
  ok('typed 5:17 snaps to 5:30 PM', E("schedParse('5:17')")==='17:30');
  ok('typed 9 is the morning, 5 the afternoon', E("schedParse('9')")==='09:00'&&E("schedParse('5')")==='17:00');
  ok('am/pm and 24h are honoured', E("schedParse('5am')")==='05:00'&&E("schedParse('17:00')")==='17:00');
  ok('garbage reads as no time', E("schedParse('soon')")==='');
  ok('schedule rides the tristate mappers',
     src.indexOf('if(p.schedule!=null)f.schedule=JSON.stringify(p.schedule)')>=0
     &&src.indexOf('schedule:f.schedule==null?null:schedSafe(f.schedule)')>=0);
  ok('merge keeps the kept record\'s schedule first', src.indexOf('schedule:keep.schedule!=null?keep.schedule:dup.schedule')>=0);

  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('the index column');
    ok('Schedule follows Status in the header',
       [...doc.querySelectorAll('.cd-cols>span')].map(s=>s.textContent).join(',')==='Name,Title,Phone,Email,Perms,Driver,Status,Schedule');
    const rowOf=n=>[...doc.querySelectorAll('#cd-rows .cd-row')].find(r=>r.querySelector('b').textContent.startsWith(n));
    ok('rows carry eight cells', rowOf('Sam').children.length===8);
    ok('Sam reads M-F 9-6', rowOf('Sam').querySelector('.cd-sch').textContent==='M-F 9-6');
    ok('Dana reads T-W-Th 11-4', rowOf('Dana').querySelector('.cd-sch').textContent==='T-W-Th 11-4');
    ok('no schedule = blank cell', rowOf('Alex').querySelector('.cd-sch').textContent==='');

    sec('the record + editor');
    E("CD_SEL=PEOPLE.find(p=>p.name==='Dana West').id");E('cdPaintRows();cdPaintDetail()');
    ok('the record shows the schedule row', /Schedule[^]{0,60}T-W-Th 11-4/.test(doc.getElementById('cd-detail').textContent));
    doc.getElementById('cdd-edit').click();
    const box=d=>doc.querySelector('#cde-sched input[data-day="'+d+'"]');
    ok('the day boxes reflect the stored days', box(2).checked&&box(3).checked&&box(4).checked&&!box(1).checked&&!box(5).checked);
    ok('the time inputs read 12-hour with AM/PM', doc.getElementById('cde-sch-s').value==='11:00 AM'&&doc.getElementById('cde-sch-e').value==='4:00 PM');
    ok('the datalist offers half hours only', [...doc.querySelectorAll('#cd-hrs option')].every(o=>/:(00|30) [AP]M$/.test(o.value)));
    box(1).checked=true;box(1).dispatchEvent(new win.Event('change'));
    box(5).checked=true;box(5).dispatchEvent(new win.Event('change'));
    const en=doc.getElementById('cde-sch-e');en.value='5:17';en.dispatchEvent(new win.Event('change'));
    ok('a typed 5:17 snaps to 5:30 PM in the box', en.value==='5:30 PM');
    doc.getElementById('cde-save').click();
    setTimeout(()=>{
      const d=E("PEOPLE.find(p=>p.name==='Dana West').schedule");
      ok('the save writes days + snapped end time', JSON.stringify(d)===JSON.stringify({days:[1,2,3,4,5],start:'11:00',end:'17:30'}), JSON.stringify(d));
      ok('…and the row now reads M-F 11-5:30', rowOf('Dana').querySelector('.cd-sch').textContent==='M-F 11-5:30');
      ok('…and the outgoing PATCH carries schedule as JSON',
         win.__spCalls.some(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url)&&c.body&&c.body.schedule===JSON.stringify(d)));

      sec('tristate: an untouched editor never sends the column');
      E("CD_SEL=PEOPLE.find(p=>p.name==='Alex Reyes').id");E('cdPaintDetail()');
      doc.getElementById('cdd-edit').click();
      const n0=win.__spCalls.length;
      const ph=doc.getElementById('cde-phone');ph.value='555-0100';ph.dispatchEvent(new win.Event('input'));
      doc.getElementById('cde-save').click();
      setTimeout(()=>{
        ok('Alex keeps a null schedule', E("PEOPLE.find(p=>p.name==='Alex Reyes').schedule")===null);
        const sent=win.__spCalls.slice(n0).filter(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url));
        ok('the PATCH omits the schedule field', sent.length>0&&sent.every(c=>!('schedule' in (c.body||{}))));
        console.log('\ntest-v1220: '+pass+' passed, '+fail+' failed');
        process.exit(fail?1:0);
      },350);
    },350);
  },350);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
