/* v1.18.0 — availability tri-state + the Admin/Non-admin toggle (owner, 2026-09-02):
   - People editor gets Availability radios: Available / Not available (manual,
     stored in the new `availability` staff column) / Out of office (automatic,
     derived from the date ranges). The Status column follows; an active OOO range
     outranks the manual flag.
   - The dev Viewer toggle reads as the view you're IN: "Admin" by default,
     "Non-admin" while previewing — and the preview hides Help ▸ App settings.
   - renderCompanyPage runs applyPerms at the door (direct #/people loads left the
     dev cluster and Help entries stale).
   Run: node tests/test-v1180.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('cde-av-a')<0){
  console.log('test-v1180: skipped — pre-v1.18.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const staff=[
 {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM',admin:'dev'},
 /* manual flag alone */
 {appId:'s2',Title:'Dana West',depts:JSON.stringify(['fab']),ooo:'[]',email:'d@x.co',role:'',admin:'',availability:'unavailable'},
 /* active OOO range OUTRANKS the manual flag */
 {appId:'s3',Title:'Cody Hall',depts:JSON.stringify(['fin']),ooo:JSON.stringify([{id:'o1',start:D(-2),end:D(3),note:''}]),email:'c@x.co',role:'',admin:'',availability:'unavailable'},
 {appId:'s4',Title:'Alex Reyes',depts:JSON.stringify(['fab']),ooo:'[]',email:'a@x.co',role:'',admin:''}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);

setTimeout(main,1300);

function main(){
  sec('source markers');
  ok('availability rides the tristate mappers',
     src.indexOf('if(p.availability!=null)f.availability=p.availability')>=0
     &&src.indexOf('availability:f.availability==null?null:String(f.availability)')>=0);
  ok('merge keeps the kept record\'s flag first', /availability:keep\.availability!=null\?keep\.availability:dup\.availability/.test(src));
  ok('renderCompanyPage runs applyPerms at the door', /function renderCompanyPage\(\)\{\n[^]{0,300}applyPerms\(\);/.test(src));
  ok('the Driver column centers its check', src.indexOf('.cd-drv{text-align:center}')>=0);

  win.location.hash='#/people';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(()=>{
    sec('the Status column follows the tri-state');
    const st=n=>{const r=[...doc.querySelectorAll('#cd-rows .cd-row')].find(x=>x.querySelector('b').textContent.startsWith(n));
      const s=r.querySelector('.cd-avail');return s.textContent+'|'+s.className;};
    ok('manual Not available reads grey', st('Dana')==='Not available|cd-avail off', st('Dana'));
    ok('an active OOO range outranks the manual flag', /^Away until .+\|cd-avail away$/.test(st('Cody')), st('Cody'));
    ok('no flag, no ranges = Available', st('Alex')==='Available|cd-avail', st('Alex'));

    sec('the editor radios');
    E("CD_SEL=PEOPLE.find(p=>p.name==='Dana West').id");E('cdPaintRows();cdPaintDetail()');
    doc.getElementById('cdd-edit').click();
    ok('Not available is checked for the manual flag',
       doc.getElementById('cde-av-u').checked&&!doc.getElementById('cde-av-a').checked&&!doc.getElementById('cde-av-o').checked);
    ok('the OOO radio is never hand-selectable', doc.getElementById('cde-av-o').disabled);
    doc.getElementById('cde-av-a').checked=true;
    doc.getElementById('cde-av-a').dispatchEvent(new win.Event('change'));
    ok('picking Available lands in the edit buffer', E('CD_EDIT.availability')==='available');
    doc.getElementById('cde-save').click();
    setTimeout(()=>{
      ok('the save writes it to the roster', E("PEOPLE.find(p=>p.name==='Dana West').availability")==='available');
      ok('…and the outgoing PATCH carries availability',
         win.__spCalls.some(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url)&&c.body&&c.body.availability==='available'));
      E("CD_SEL=PEOPLE.find(p=>p.name==='Cody Hall').id");E('cdPaintDetail()');
      doc.getElementById('cdd-edit').click();
      ok('an active range checks the automatic radio',
         doc.getElementById('cde-av-o').checked&&!doc.getElementById('cde-av-u').checked);
      doc.getElementById('cde-cancel').click();

      sec('the view-as picker: Developer / Admin / Non-admin');
      const vs=doc.getElementById('tb-viewas');
      const pick=v=>{vs.value=v;vs.dispatchEvent(new win.Event('change'));};
      ok('reads "Developer" by default for the developer', vs.value==='dev'&&!vs.classList.contains('hidden'));
      ok('App settings is on the Help menu', !doc.getElementById('mi-appset').classList.contains('hidden'));
      pick('viewer');
      ok('picking Non-admin lights the picker', vs.value==='viewer'&&vs.classList.contains('active'));
      ok('the preview hides Help ▸ App settings', doc.getElementById('mi-appset').classList.contains('hidden'));
      ok('admin chrome is gone (+ Add person)', !doc.getElementById('cd-add'));
      pick('admin');
      ok('the Admin view keeps admin chrome but still hides dev-only Help',
         E('isAdmin()')===true&&!!doc.getElementById('cd-add')
         &&doc.getElementById('mi-appset').classList.contains('hidden'));
      pick('dev');
      ok('back to Developer restores the admin view',
         vs.value==='dev'&&!vs.classList.contains('active')
         &&!doc.getElementById('mi-appset').classList.contains('hidden')&&!!doc.getElementById('cd-add'));

      console.log('\ntest-v1180: '+pass+' passed, '+fail+' failed');
      process.exit(fail?1:0);
    },350);
  },350);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
