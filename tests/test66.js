/* REV66: the identity chain + sticky lens.
   - Staff email/role round-trip through the SharePoint field mappers and the
     People & Availability editor (new Email / Role inputs).
   - meName(): login email vs Staff.email first, display name second, null when
     unresolved (the remembered-picker fallback belongs to the dashboard button).
   - The Person menu floats "me" to the top, right after Everyone.
   - The lens (Projects/Departments) persists in UI prefs and restores on load.
   Skips on builds that predate the identity chain.
   Run: node test66.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/meName/.test(src)){
  console.log('  SKIP  build predates the identity chain (no meName) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('Staff field mappers round-trip email and role');
  const rt=E("JSON.stringify(fieldsToPerson(personToFields({id:'x1',name:'Ana',email:'ana@twoseven.net',role:'Lead Painter',depts:['fab'],ooo:[]})))");
  const p=JSON.parse(rt);
  ok('email survives',p.email==='ana@twoseven.net',rt);
  ok('role survives',p.role==='Lead Painter',rt);
  ok('name/depts intact',p.name==='Ana'&&p.depts[0]==='fab');

  sec('meName: the identity chain');
  /* harness signs in as user@example.com / "Sam" */
  E("PEOPLE=[{id:'a',name:'Ana',email:'ana@x.co',depts:['fab'],ooo:[]},{id:'b',name:'Robert',email:'USER@Example.com ',depts:['pm'],ooo:[]}];rebuildStaff();");
  ok('email match wins (case/space-insensitive)',E('meName()')==='Robert',E('meName()'));
  E("PEOPLE=[{id:'a',name:'Sam',email:'',depts:['td'],ooo:[]},{id:'b',name:'Ana',email:'ana@x.co',depts:['fab'],ooo:[]}];");
  ok('display-name fallback',E('meName()')==='Sam',E('meName()'));
  E("PEOPLE=[{id:'a',name:'Ana',email:'ana@x.co',depts:['fab'],ooo:[]}];");
  ok('unresolved → null',E('meName()')===null,E('meName()'));

  sec('Person menu floats "me" to the top');
  E("PEOPLE=[{id:'a',name:'Ana',email:'',depts:['fab'],ooo:[]},{id:'b',name:'Robert',email:'user@example.com',depts:['pm'],ooo:[]},{id:'c',name:'Zoe',email:'',depts:['td'],ooo:[]}];buildPersonMenu();");
  const items=E("JSON.stringify([...document.querySelectorAll('#person-menu .sm-item')].map(x=>x.textContent.trim()))");
  const arr=JSON.parse(items);
  ok('order is Everyone, me, then the rest alphabetically',
     arr[0]==='Everyone'&&arr[1]==='Robert (me)'&&arr[2]==='Ana'&&arr[3]==='Zoe',items);
  ok('me is not listed twice',arr.filter(x=>x.startsWith('Robert')).length===1,items);

  sec('People & Availability editor carries email and role');
  E("document.getElementById('mi-people').click();");
  ok('email + role inputs render per person',E("document.querySelectorAll('#st-list .st-meta input').length")===6,
     E("document.querySelectorAll('#st-list .st-meta input').length"));
  E("SM_PEOPLE[0].email=' ana@twoseven.net ';SM_PEOPLE[0].role=' Painter ';document.getElementById('st-save').click();");
  ok('save trims and persists to PEOPLE',E("PEOPLE[0].email")==='ana@twoseven.net'&&E("PEOPLE[0].role")==='Painter',
     E("JSON.stringify({e:PEOPLE[0].email,r:PEOPLE[0].role})"));

  sec('Sticky lens');
  E("LENS='dept';saveUI();");
  ok('lens saved in UI prefs',E("JSON.parse(localStorage.getItem(UI_KEY)).lens")==='dept');
  E("LENS='project';loadLocalPrefs();");
  ok('lens restores on load',E('LENS')==='dept');
  ok('lens buttons reflect the restore',
     E("document.getElementById('btn-lens-dept').classList.contains('active')&&!document.getElementById('btn-lens-proj').classList.contains('active')"));

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1500);
