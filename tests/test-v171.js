/* v1.7.1 — fonts (§3 items 6–7) + the staff phone field.
   - Brauer Neue Std Bold (the one committed file, licence confirmed 2026-09-01)
     drives the TWOSEVEN title via @font-face; Bahnschrift leads --sans via local()
     only — no committed file. The deploy allowlist must carry the font on all
     three sparse-checkout lists or the guard step kills the deploy.
   - phone joins the person record (owner-created column, 2026-09-01): field
     mappers, People page read mode, edit state, and the outgoing PATCH body.
   Run: node tests/test-v171.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const fs=require('fs');
const {FILE,src,ok,done}=suite();

/* v1.8.1: gate on the FEATURE marker, not the version prefix — the old
   APP_VER='1.7 check silently skipped this whole suite the moment v1.8.0 shipped. */

const sec=t=>console.log('\n'+t);

sec('fonts (src + deploy allowlist)');
ok('Brauer Neue @font-face points at the committed bold file',
   /@font-face\{font-family:'Brauer Neue';src:url\('design\/fonts\/BrNStdBd\.otf'\)/.test(src));
ok('the TWOSEVEN title asks for Brauer Neue first', /\.tb-co\{font-family:'Brauer Neue',var\(--sans\)/.test(src));
ok('Bahnschrift leads the app-wide stack via local()', /--sans:Bahnschrift,'Segoe UI'/.test(src));
const yml=fs.readFileSync('.github/workflows/deploy-pages.yml','utf8');
/* one list per published branch, so count lists, don't hard-code (a third ran 2026-10-16 → 19, item 72) */
const nLists=(yml.match(/sparse-checkout: \|/g)||[]).length;
ok('the font is on every deploy sparse-checkout list',
   nLists>=2&&(yml.match(/design\/fonts\/BrNStdBd\.otf/g)||[]).length===nLists, nLists);

const staff=[
  {appId:'s1',Title:'Milo',depts:JSON.stringify(['fab']),ooo:'[]',email:'',phone:'212-555-0100',role:'Lead Fabricator'},
  {appId:'s2',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',phone:'',role:'PM'}];
const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const calls=()=>win.__spCalls;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('phone rides the person record');
  const rt=JSON.parse(E("JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'Ana',email:'a@example.com',phone:'917-555-0101',role:'',depts:[],ooo:[]})))"));
  ok('phone survives the field-mapper round trip', rt.phone==='917-555-0101');
  ok('a loaded person carries the stored phone', E("PEOPLE.find(p=>p.name==='Milo').phone")==='212-555-0100');

  sec('the People page reads and edits it');
  E("location.hash='#/people';applyRoute()");
  E("CD_SEL=PEOPLE.find(p=>p.name==='Milo').id;cdPaintDetail()");
  ok('read mode shows the phone as information', /212-555-0100/.test(q('#cd-detail').textContent)
     &&doc.querySelectorAll('#cd-detail input').length===0);
  E("document.getElementById('cdd-edit').click()");
  ok('the edit state carries a phone input', E("document.getElementById('cde-phone').value")==='212-555-0100');
  E("CD_EDIT.phone=' 646-555-0102 ';cdSavePerson()");
  await wait(120);
  ok('save trims and persists the phone', E("PEOPLE.find(p=>p.name==='Milo').phone")==='646-555-0102');
  ok('the PATCH body carries the phone field',
     calls().some(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&c.body.phone==='646-555-0102'));

  done();
}
