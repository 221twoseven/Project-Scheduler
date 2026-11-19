/* v1.18.0 — availability tri-state + the Admin/Non-admin toggle (owner, 2026-09-02):
   - People editor gets Availability radios: Available / Not available (manual,
     stored in the new `availability` staff column) / Out of office (automatic,
     derived from the date ranges). The Status column follows; an active OOO range
     outranks the manual flag.
   - The dev Viewer toggle reads as the view you're IN: "Admin" by default,
     "Non-admin" while previewing — and the preview hides Help ▸ App settings.
   - renderCompanyPage ran applyPerms at the door (direct #/people loads left the
     dev cluster and Help entries stale).
   v1.62.0 (item 87): the People page is the People app (people/), booted beside Timeline here;
   its admin rule is the roster's (no view-as there), and the view-as picker stays Timeline's.
   Run: node tests/test-v1180.js timeline/index.html  (or via tests/run.js) */
const {boot,bootPeople,suite}=require('./harness');
const {FILE,src,ok,done}=suite();
const psrc=require('fs').readFileSync(require('path').join(__dirname,'..','people','index.html'),'utf8').replace(/\r\n/g,'\n');

const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const staff=[
 {appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',role:'PM',admin:'dev'},
 /* manual flag alone */
 {appId:'s2',Title:'Dana West',depts:JSON.stringify(['fab']),ooo:'[]',email:'d@example.com',role:'',admin:'',availability:'unavailable'},
 /* active OOO range OUTRANKS the manual flag */
 {appId:'s3',Title:'Cody Hall',depts:JSON.stringify(['fin']),ooo:JSON.stringify([{id:'o1',start:D(-2),end:D(3),note:''}]),email:'c@example.com',role:'',admin:'',availability:'unavailable'},
 {appId:'s4',Title:'Alex Reyes',depts:JSON.stringify(['fab']),ooo:'[]',email:'a@example.com',role:'',admin:''}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const pwin=bootPeople({data:{projects:[],tasks:[],staff,todos:[]}}).window,pdoc=pwin.document,PE=s=>pwin.eval(s);

setTimeout(main,1300);

function main(){
  sec('source markers');
  ok('availability rides the tristate mappers',E( /* item 61: a round trip, not the mapper's source text */
     "personToFields({id:'x',name:'A',depts:[],ooo:[],availability:'unavailable'}).availability==='unavailable'"
     +"&&!('availability' in personToFields({id:'x',name:'A',depts:[],ooo:[]}))"
     +"&&fieldsToPerson({appId:'x',Title:'A',availability:'available'}).availability==='available'"
     +"&&fieldsToPerson({appId:'x',Title:'A'}).availability===null")===true);
  ok('merge keeps the kept record\'s flag first', /availability:keep\.availability!=null\?keep\.availability:dup\.availability/.test(psrc));
  ok('the People app reads admin from the roster on every paint (no stale chrome)', /function isAdmin\(\)\{return rosterAdmin\(PEOPLE\);\}/.test(psrc)&&!/function renderCompanyPage/.test(src));
  ok('the Driver column centers its check', psrc.indexOf('.cd-drv{text-align:center}')>=0);

  sec('the Status column follows the tri-state');
  const st=n=>{const r=[...pdoc.querySelectorAll('#cd-rows .cd-row')].find(x=>x.querySelector('b').textContent.startsWith(n));
    const s=r.querySelector('.cd-avail');return s.textContent+'|'+s.className;};
  ok('manual Not available reads grey', st('Dana')==='Not available|cd-avail off', st('Dana'));
  ok('an active OOO range outranks the manual flag', /^Away until .+\|cd-avail away$/.test(st('Cody')), st('Cody'));
  ok('no flag, no ranges = Available', st('Alex')==='Available|cd-avail', st('Alex'));

  sec('the editor radios');
  PE("CD_SEL=PEOPLE.find(p=>p.name==='Dana West').id");PE('cdPaintRows();cdPaintDetail()');
  pdoc.getElementById('cdd-edit').click();
  ok('Not available is checked for the manual flag',
     pdoc.getElementById('cde-av-u').checked&&!pdoc.getElementById('cde-av-a').checked&&!pdoc.getElementById('cde-av-o').checked);
  ok('the OOO radio is never hand-selectable', pdoc.getElementById('cde-av-o').disabled);
  pdoc.getElementById('cde-av-a').checked=true;
  pdoc.getElementById('cde-av-a').dispatchEvent(new pwin.Event('change'));
  ok('picking Available lands in the edit buffer', PE('CD_EDIT.availability')==='available');
  pdoc.getElementById('cde-save').click();
  setTimeout(()=>{
    ok('the save writes it to the roster', PE("PEOPLE.find(p=>p.name==='Dana West').availability")==='available');
    ok('…and the outgoing PATCH carries availability',
       pwin.__spCalls.some(c=>c.method==='PATCH'&&/ShopTimeline_Staff/.test(c.url)&&c.body&&c.body.availability==='available'));
    PE("CD_SEL=PEOPLE.find(p=>p.name==='Cody Hall').id");PE('cdPaintDetail()');
    pdoc.getElementById('cdd-edit').click();
    ok('an active range checks the automatic radio',
       pdoc.getElementById('cde-av-o').checked&&!pdoc.getElementById('cde-av-u').checked);
    pdoc.getElementById('cde-cancel').click();

    sec('the view-as picker: Developer / Admin / Non-admin (Timeline)');
    const vs=doc.getElementById('tb-viewas');
    const pick=v=>{vs.value=v;vs.dispatchEvent(new win.Event('change'));};
    ok('reads "Developer" by default for the developer', vs.value==='dev'&&!vs.classList.contains('hidden'));
    ok('App settings is on the Help menu', !doc.getElementById('mi-appset').classList.contains('hidden'));
    pick('viewer');
    ok('picking Non-admin lights the picker', vs.value==='viewer'&&vs.classList.contains('active'));
    ok('the preview hides Help ▸ App settings', doc.getElementById('mi-appset').classList.contains('hidden'));
    ok('admin chrome is gone (the viewer class)', doc.body.classList.contains('viewer'));
    pick('admin');
    ok('the Admin view keeps admin chrome but still hides dev-only Help',
       E('isAdmin()')===true&&!doc.body.classList.contains('viewer')
       &&doc.getElementById('mi-appset').classList.contains('hidden'));
    pick('dev');
    ok('back to Developer restores the admin view',
       vs.value==='dev'&&!vs.classList.contains('active')
       &&!doc.getElementById('mi-appset').classList.contains('hidden')&&!doc.body.classList.contains('viewer'));

    done();
  },350);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},25000);
