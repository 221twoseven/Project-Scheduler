/* REV66: the identity chain + sticky lens.
   - Staff email/role round-trip through the SharePoint field mappers and the
     People & Availability editor (new Email / Role inputs).
   - meName(): login email vs Staff.email first, display name second, null when
     unresolved (the remembered-picker fallback belongs to the dashboard button).
   - The Person menu floats "me" to the top, right after Everyone.
   - The lens (Projects/Departments) persists in UI prefs and restores on load.
   Skips on builds that predate the identity chain.
   Run: node test66.js timeline/index.html */
const {boot,bootPeople,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('Staff field mappers round-trip email and role');
  const rt=E("JSON.stringify(fieldsToPerson(personToFields({id:'x1',name:'Ana',email:'ana@example.com',role:'Lead Painter',depts:['fab'],ooo:[]})))");
  const p=JSON.parse(rt);
  ok('email survives',p.email==='ana@example.com',rt);
  ok('role survives',p.role==='Lead Painter',rt);
  ok('name/depts intact',p.name==='Ana'&&p.depts[0]==='fab');

  sec('meName: the identity chain');
  /* harness signs in as user@example.com / "Sam" */
  E("PEOPLE=[{id:'a',name:'Ana',email:'ana@example.com',depts:['fab'],ooo:[]},{id:'b',name:'Rupert',email:'USER@Example.com ',depts:['pm'],ooo:[]}];rebuildStaff();");
  ok('email match wins (case/space-insensitive)',E('meName()')==='Rupert',E('meName()'));
  E("PEOPLE=[{id:'a',name:'Sam',email:'',depts:['td'],ooo:[]},{id:'b',name:'Ana',email:'ana@example.com',depts:['fab'],ooo:[]}];");
  ok('display-name fallback',E('meName()')==='Sam',E('meName()'));
  E("PEOPLE=[{id:'a',name:'Ana',email:'ana@example.com',depts:['fab'],ooo:[]}];");
  ok('unresolved → null',E('meName()')===null,E('meName()'));

  sec('Person menu floats "me" to the top');
  E("PEOPLE=[{id:'a',name:'Ana',email:'',depts:['fab'],ooo:[]},{id:'b',name:'Rupert',email:'user@example.com',depts:['pm'],ooo:[]},{id:'c',name:'Zoe',email:'',depts:['td'],ooo:[]}];buildPersonMenu();");
  const items=E("JSON.stringify([...document.querySelectorAll('#person-menu .sm-item')].map(x=>x.textContent.trim()))");
  const arr=JSON.parse(items);
  ok('order is Everyone, me, then the rest alphabetically',
     arr[0]==='Everyone'&&arr[1]==='Rupert (me)'&&arr[2]==='Ana'&&arr[3]==='Zoe',items);
  ok('me is not listed twice',arr.filter(x=>x.startsWith('Rupert')).length===1,items);

  sec('People & Availability editor carries email and role');
  /* v1.62.0 (item 87): the editor is the People app's per-record edit state — same save path. */
  {
    const pw=bootPeople({data:{projects:[],tasks:[],todos:[],staff:[{appId:'a',Title:'Ana',email:'',depts:'["fab"]',ooo:'[]'}]}}).window,PE=x=>pw.eval(x);
    setTimeout(()=>{
      PE("CD_SEL=PEOPLE[0].id;cdPaintDetail();document.getElementById('cdd-edit').click();");
      ok('email + role inputs render in the edit state',
         PE("!!document.getElementById('cde-email')&&!!document.getElementById('cde-role')")===true);
      PE("CD_EDIT.email=' ana@example.com ';CD_EDIT.role=' Painter ';cdSavePerson();");
      ok('save trims and persists to PEOPLE',PE("PEOPLE[0].email")==='ana@example.com'&&PE("PEOPLE[0].role")==='Painter',
         PE("JSON.stringify({e:PEOPLE[0].email,r:PEOPLE[0].role})"));
      lens();
    },1300);
  }
},1500);

function lens(){
  sec('Sticky lens');
  E("LENS='dept';saveUI();");
  ok('lens saved in UI prefs',E("JSON.parse(localStorage.getItem(UI_KEY)).lens")==='dept');
  E("LENS='project';loadLocalPrefs();");
  ok('lens restores on load',E('LENS')==='dept');
  ok('lens buttons reflect the restore',
     E("document.getElementById('btn-lens-dept').classList.contains('active')&&!document.getElementById('btn-lens-proj').classList.contains('active')"));

  done();
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
