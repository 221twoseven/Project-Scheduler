/* v1.7.1 — fonts (§3 items 6–7) + the staff phone field.
   - Brauer Neue Std Bold (the one committed file, licence confirmed 2026-09-01)
     drives the TWOSEVEN title via @font-face; Bahnschrift leads --sans via local()
     only — no committed file. The deploy allowlist must carry the font on all
     three sparse-checkout lists or the guard step kills the deploy.
   - phone joins the person record (owner-created column, 2026-09-01): field
     mappers, People page read mode, edit state, and the outgoing PATCH body.
   Run: node tests/test-v171.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* v1.8.1: gate on the FEATURE marker, not the version prefix — the old
   APP_VER='1.7 check silently skipped this whole suite the moment v1.8.0 shipped. */
if(src.indexOf('cde-phone')<0){
  console.log('test-v171: skipped — pre-v1.7.1 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

sec('fonts (src + deploy allowlist)');
ok('Brauer Neue @font-face points at the committed bold file',
   /@font-face\{font-family:'Brauer Neue';src:url\('fonts\/BrNStdBd\.otf'\)/.test(src));
ok('the TWOSEVEN title asks for Brauer Neue first', /\.tb-co\{font-family:'Brauer Neue',var\(--sans\)/.test(src));
ok('Bahnschrift leads the app-wide stack via local()', /--sans:Bahnschrift,'Segoe UI'/.test(src));
const yml=fs.readFileSync('.github/workflows/deploy-pages.yml','utf8');
ok('the font is on all three deploy sparse-checkout lists',
   (yml.match(/fonts\/BrNStdBd\.otf/g)||[]).length===3);

const staff=[
  {appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'',phone:'212-555-0100',role:'Lead Fabricator'},
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
  const rt=JSON.parse(E("JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'Ana',email:'a@x.co',phone:'917-555-0101',role:'',depts:[],ooo:[]})))"));
  ok('phone survives the field-mapper round trip', rt.phone==='917-555-0101');
  ok('a loaded person carries the stored phone', E("PEOPLE.find(p=>p.name==='Nick').phone")==='212-555-0100');

  sec('the People page reads and edits it');
  E("location.hash='#/people';applyRoute()");
  E("CD_SEL=PEOPLE.find(p=>p.name==='Nick').id;cdPaintDetail()");
  ok('read mode shows the phone as information', /212-555-0100/.test(q('#cd-detail').textContent)
     &&doc.querySelectorAll('#cd-detail input').length===0);
  E("document.getElementById('cdd-edit').click()");
  ok('the edit state carries a phone input', E("document.getElementById('cde-phone').value")==='212-555-0100');
  E("CD_EDIT.phone=' 646-555-0102 ';cdSavePerson()");
  await wait(120);
  ok('save trims and persists the phone', E("PEOPLE.find(p=>p.name==='Nick').phone")==='646-555-0102');
  ok('the PATCH body carries the phone field',
     calls().some(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body&&c.body.phone==='646-555-0102'));

  console.log('\ntest-v171: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
}
