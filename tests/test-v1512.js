/* v1.51.2 — item 29: the dead columns. metalFab (Projects) and labels / checklist (Tasks2, the
   to-dos) held nothing the app used; they were kept only for the colleague app (D2 lifted
   2026-09-24). The app stops reading and writing them one release before the owner deletes
   the columns, so no build still sending them can 400 on a save afterwards.
   Run: node tests/test-v1512.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const P={appId:'p1',Title:'Job p1',client:'Acme',jobCode:'A1',deadline:'2027-03-01',status:'auto',
  projectManager:'Theo',metalFab:'Old value',activeDepartments:'["td"]',createdAt:'2026-07-01',sortIndex:0};
const TD={appId:'n1',Title:'Order steel',projectId:'p1',department:'td',assignees:'[]',progress:'notstarted',
  priority:'medium',notes:'',labels:'[]',checklist:'[]',createdBy:'',sortIndex:0};
const dom=boot(FILE,{data:{projects:[P],tasks:[],staff:[],todos:[TD]},todosList:true});
const win=dom.window,E=s=>win.eval(s);
const calls=(list,m)=>win.__spCalls.filter(c=>c.method===m&&c.url.includes(list+'/'));

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('the mappers');
  ok('a loaded project carries no metalFab',!('metalFab' in E("projById('p1')")));
  ok('projToFields never writes metalFab',!('metalFab' in E("projToFields(projById('p1'))")));
  ok('todoToFields never writes labels or checklist',
    E("(f=>!('labels' in f)&&!('checklist' in f))(todoToFields(ST.todos[0]))"));
  ok('search no longer reads metalFab',!/p\.metalFab/.test(src));
  ok('the name scrub no longer walks metalFab',!/'fabricators','metalFab'/.test(src));

  sec('real saves');
  E("saveState({...ST,projects:ST.projects.map(p=>({...p,name:'Job p1 renamed'}))})");
  E("saveState({...ST,todos:[...ST.todos,{...ST.todos[0],id:'n2',title:'Paint'}]})");
  await wait(1500);
  const pp=calls('ShopTimeline_Projects','PATCH');
  ok('the project save went out',pp.length>=1,String(pp.length));
  ok('its body has no metalFab',pp.every(c=>!('metalFab' in c.body)),pp.map(c=>Object.keys(c.body).join()).join(' | '));
  const tc=calls('ShopTimeline_Tasks2','POST');
  ok('the new to-do went out',tc.length>=1,String(tc.length));
  ok('its body has no labels or checklist',tc.every(c=>{const f=c.body.fields||c.body;return !('labels' in f)&&!('checklist' in f);}),
    tc.map(c=>Object.keys(c.body.fields||c.body).join()).join(' | '));
  done();
}
