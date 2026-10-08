/* v1.43.0 — TODO item 9, owner rulings 2026-10-08:
   9a the Employee Contacts import asks only for the fields it uses (Pay Type and PersonalEmail
      never reach the browser), and imports nothing when it can't name them;
   9b deferred — the Mobile Phone fallback stays (personal numbers are posted in the breakroom);
   9c one phone format, 555-555-5555, whatever way it was typed or stored;
   Ext — a desk extension typed by hand on the People page (the HR list has none).
   Run: node tests/test-v1430.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function fmtPhone(')<0){
  console.log('  SKIP  test-v1430: pre-v1.43.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const staff=[
  {appId:'s1',Title:'Nick',depts:JSON.stringify(['fab']),ooo:'[]',email:'nick@x.co',phone:'(555) 555-5555',role:'Lead Fabricator'},
  {appId:'s2',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',phone:'5555550100',role:'PM'},
  {appId:'s3',Title:'Pat',depts:JSON.stringify(['fab']),ooo:'[]',email:'pat@x.co',phone:'',role:'Shop'}];
const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const calls=()=>win.__spCalls;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('9c — one phone format');
  const F=v=>E('fmtPhone('+JSON.stringify(v)+')');
  for(const v of ['5555555555','555-555-5555','555.555.5555','(555) 555-5555','555 555 5555','+1 555 555 5555','1-555-555-5555'])
    ok('"'+v+'" reads 555-555-5555', F(v)==='555-555-5555', F(v));
  ok('a short or partial number stays as typed', F('555-1')==='555-1');
  ok('a foreign number stays as typed', F('+44 20 7946 0958')==='+44 20 7946 0958');
  ok('text with the number stays as typed (nothing is dropped)', F('555-555-5555 x12')==='555-555-5555 x12');
  ok('blank stays blank', F('')===''&&F(null)==='');
  ok('a stored number loads in the one format', E("PEOPLE.find(p=>p.name==='Nick').phone")==='555-555-5555'&&E("PEOPLE.find(p=>p.name==='Sam').phone")==='555-555-0100');

  sec('9c — the one-time tidy rewrites the rows still stored another way');
  E("location.hash='#/people';applyRoute()");
  const tidy=q('#cd-tidy');
  ok('the People page offers "Tidy 2 phone numbers" (Nick and Sam; Pat has none)', !!tidy&&tidy.textContent==='Tidy 2 phone numbers', tidy&&tidy.textContent);
  const n0=calls().length;
  tidy.click();
  await wait(300);
  const tp=calls().slice(n0).filter(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff'));
  ok('it PATCHes exactly the two rows', tp.length===2, tp.length);
  ok('each PATCH carries the phone column only, in the one format',
     tp.every(c=>Object.keys(c.body).join()==='phone')&&tp.map(c=>c.body.phone).sort().join()==='555-555-0100,555-555-5555', JSON.stringify(tp.map(c=>c.body)));
  ok('afterwards the button is gone (nothing left to tidy)', !q('#cd-tidy'));
  ok('nothing is left to tidy', E("phoneUntidy().length")===0);

  sec('Office Extension — its own field (tristate column `ext`)');
  ok('a row without the column carries no ext (null), and the save omits it',
     E("PEOPLE.find(p=>p.name==='Nick').ext")===null&&E("'ext' in personToFields(PEOPLE.find(p=>p.name==='Nick'))")===false);
  const rt=JSON.parse(E("JSON.stringify(fieldsToPerson(personToFields({id:'x',name:'A',email:'',phone:'555.555.5555',role:'',depts:[],ooo:[],ext:'204'})))"));
  ok('ext survives the mapper round trip', rt.ext==='204'&&rt.phone==='555-555-5555');
  ok('the People table has an Office Extension column right after Phone',
     (()=>{E("location.hash='#/people';applyRoute()");const h=[...doc.querySelectorAll('.cd-cols>span')].map(s=>s.textContent);
       return h[2]==='Phone'&&h[3]==='Office Extension'&&h.length===9&&[...doc.querySelectorAll('.cd-row.pp7')].every(r=>r.children.length===9);})());

  sec('the People page: editor, save, list, detail, search');
  E("location.hash='#/people';applyRoute()");
  E("CD_SEL=PEOPLE.find(p=>p.name==='Pat').id;cdPaintDetail()");
  E("document.getElementById('cdd-edit').click()");
  ok('the editor has an Office Extension field', !!q('#cde-ext')&&q('#cde-ext').closest('.cd-fg').querySelector('label').textContent==='Office Extension');
  const ph=q('#cde-phone');ph.value='555.555.0199';ph.dispatchEvent(new win.Event('input',{bubbles:true}));ph.dispatchEvent(new win.Event('blur'));
  ok('leaving the phone box shows the stored format', ph.value==='555-555-0199', ph.value);
  const ex=q('#cde-ext');ex.value=' 204 ';ex.dispatchEvent(new win.Event('input',{bubbles:true}));
  E("cdSavePerson()");
  await wait(150);
  const patch=calls().filter(c=>c.method==='PATCH'&&c.url.includes('ShopTimeline_Staff')&&c.body).pop();
  ok('the save writes the hyphenated phone and the trimmed ext', !!patch&&patch.body.phone==='555-555-0199'&&patch.body.ext==='204', patch&&JSON.stringify(patch.body));
  ok('a row saved in the one format is never offered for tidying (the sync records what it wrote)', E("phoneUntidy().length")===0&&E("STAFF_RAW_PHONE[PEOPLE.find(p=>p.name==='Pat').id]")==='555-555-0199');
  E("cdPaintDetail()");
  const fld=dt=>{const d=[...doc.querySelectorAll('#cd-detail .cdd-f')].find(f=>f.querySelector('dt').textContent===dt);return d?d.querySelector('dd').textContent:null;};
  ok('the record shows Phone and Office Extension as two fields', fld('Phone')==='555-555-0199'&&fld('Office Extension')==='204', fld('Phone')+' / '+fld('Office Extension'));
  ok('a person with no extension shows no Office Extension field', (()=>{E("CD_SEL=PEOPLE.find(p=>p.name==='Sam').id;cdPaintDetail()");const r=fld('Office Extension')===null;E("CD_SEL=PEOPLE.find(p=>p.name==='Pat').id;cdPaintDetail()");return r;})());
  E("cdPaintRows()");
  const row=[...doc.querySelectorAll('.cd-row.pp7')].find(r=>/Pat/.test(r.textContent));
  ok('the list row has the phone and the extension in their own cells', !!row&&row.children[2].textContent==='555-555-0199'&&row.children[3].textContent==='204', row&&[...row.children].map(c=>c.textContent).join('|'));
  E("CD_Q='204';cdPaintRows()");
  ok('searching an extension finds its person', [...doc.querySelectorAll('.cd-row.pp7')].map(r=>r.querySelector('b').textContent).join()==='Pat');
  E("CD_Q='5555555555';cdPaintRows()");
  const hits=[...doc.querySelectorAll('.cd-row.pp7')].map(r=>r.querySelector('b').textContent);
  ok('searching the bare digits finds the person stored hyphenated', hits.length===1&&/Nick/.test(hits[0]), hits.join());
  E("CD_Q=''");

  sec('9a — the import asks for the fields it uses, and nothing else');
  const seen=[];
  E("window.__seen=[];gpageAll=async u=>{u=String(u);window.__seen.push(u);"
   +"if(u.indexOf('Employee')>=0&&u.indexOf('/columns')>=0)return [{name:'Title',displayName:'Employee Name'},{name:'field_3',displayName:'Status'},"
   +"{name:'Email',displayName:'Email'},{name:'PersonalEmail',displayName:'Personal Email'},{name:'Primary_x0020_Phone',displayName:'Primary Phone'},"
   +"{name:'Mobile_x0020_Phone',displayName:'Mobile Phone'},{name:'Current_x0020_Title',displayName:'Current Title'},{name:'Department',displayName:'Department'},"
   +"{name:'Pay_x0020_Type',displayName:'Pay Type'}];"
   +"if(u.indexOf('Employee')>=0)return [{id:'e1',fields:{Title:'Nick',field_3:'Active',Email:'nick@x.co',Primary_x0020_Phone:'555.555.0170'}},"
   +"{id:'e2',fields:{Title:'Pat',field_3:'Active',Email:'pat@x.co',Mobile_x0020_Phone:'(555) 555-0171'}}];"
   +"if(u.indexOf('/columns')>=0)return [{name:'Title'},{name:'status'}];return [];};");
  E("cdImportEC({disabled:false})");
  await wait(400);
  const items=E("window.__seen.find(u=>u.indexOf('Employee')>=0&&u.indexOf('/items')>=0)||''");
  const selPart=decodeURIComponent((items.match(/fields\(select=([^)]*)\)/)||[])[1]||'');
  ok('the item request selects named fields, not every field', /expand=fields\(select=/.test(items), items);
  ok('it names the six mapped fields by their internal names', ['Title','field_3','Email','Primary_x0020_Phone','Mobile_x0020_Phone','Current_x0020_Title','Department'].every(n=>selPart.split(',').includes(n)), selPart);
  ok('Pay Type and Personal Email are never requested', !/Pay_x0020_Type|PersonalEmail/.test(selPart), selPart);
  ok('the column list is read before the items', E("window.__seen.findIndex(u=>u.indexOf('Employee')>=0&&u.indexOf('/columns')>=0)")<E("window.__seen.findIndex(u=>u.indexOf('Employee')>=0&&u.indexOf('/items')>=0)"));
  ok('9c: an imported number lands hyphenated', E("PEOPLE.find(p=>p.name==='Nick').phone")==='555-555-0170', E("PEOPLE.find(p=>p.name==='Nick').phone"));
  ok('9b deferred: a row with only a Mobile Phone still imports it', E("PEOPLE.find(p=>p.name==='Pat').phone")==='555-555-0171', E("PEOPLE.find(p=>p.name==='Pat').phone"));
  ok('the import never touches the hand-typed ext', E("PEOPLE.find(p=>p.name==='Pat').ext")==='204');

  sec('9a — a renamed column is known by its display name');
  /* SharePoint keeps the internal name when a column is renamed: here "Email" was renamed
     "Personal Email", and the work address lives in a newer column displayed as "Email" */
  E("window.__seen=[];gpageAll=async u=>{u=String(u);window.__seen.push(u);"
   +"if(u.indexOf('Employee')>=0&&u.indexOf('/columns')>=0)return [{name:'Title',displayName:'Title'},{name:'Status',displayName:'Status'},"
   +"{name:'Email',displayName:'Personal Email'},{name:'WorkEmail',displayName:'Email'}];"
   +"if(u.indexOf('Employee')>=0)return [{id:'e9',fields:{Title:'Zoe New',Status:'Active',WorkEmail:'zoe@twoseven.net',Email:'zoe.home@gmail.com'}}];"
   +"if(u.indexOf('/columns')>=0)return [{name:'Title'},{name:'status'}];return [];};");
  E("cdImportEC({disabled:false})");
  await wait(400);
  const items2=E("window.__seen.find(u=>u.indexOf('Employee')>=0&&u.indexOf('/items')>=0)||''");
  const sel2=decodeURIComponent((items2.match(/fields\(select=([^)]*)\)/)||[])[1]||'').split(',');
  ok('the renamed personal column (internal Email) is not requested', !sel2.includes('Email')&&sel2.includes('WorkEmail'), sel2.join());
  ok('the work address is read from the column now called Email', E("(PEOPLE.find(p=>p.name==='Zoe New')||{}).email")==='zoe@twoseven.net', E("(PEOPLE.find(p=>p.name==='Zoe New')||{}).email"));
  ok('the personal address is nowhere on the roster', E("JSON.stringify(PEOPLE)").indexOf('gmail')<0);

  sec('9a — no column list, no import (never a fall-back to every field)');
  E("window.__seen=[];gpageAll=async u=>{u=String(u);window.__seen.push(u);if(u.indexOf('Employee')>=0&&u.indexOf('/columns')>=0)throw new Error('SharePoint 403');return [];};");
  const before=E("JSON.stringify(PEOPLE)");
  E("cdImportEC({disabled:false})");
  await wait(300);
  ok('the HR items are never requested', !E("window.__seen.some(u=>u.indexOf('Employee')>=0&&u.indexOf('/items')>=0)"));
  ok('the roster is unchanged', E("JSON.stringify(PEOPLE)")===before);

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
