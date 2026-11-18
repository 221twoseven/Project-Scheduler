/* v1.53.0 — a project's client comes from the Clients list (item 81).
   R1 the Client field is a dropdown of every client, A–Z, its alias beside the name, with
      "Pick a client" first: nothing typed can reach a project ·
   R2 picking saves the list's spelling ·
   R3 a stored client matches the list ignoring case ·
   R4 a stored client not on the list stays selected, with the note (owner's wording), until
      someone picks one ·
   R5 the New Project draft has the same dropdown and Create sends the pick (the REV49 lesson) ·
   R6 with no client list at all, the field stays typed (nothing to pick from).
   Run: node tests/test-v1530.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const J=o=>JSON.stringify(o);

const staff=[{appId:'st1',Title:'Sam Jones',depts:'["pm"]',ooo:'[]'}];
const clients=[{Title:'Van Cleef & Arpels',field_2:'VCA'},{Title:'Acme Corp',field_2:'ACM'},{Title:"Grillo's Pickles"}];
const proj=(id,name,client,i)=>({appId:id,Title:name,client,jobCode:'',deadline:'2026-12-18',status:'in-fabrication',
  projectManager:'Sam Jones',drafter:'',leadFab:'',activeDepartments:'["pm","td"]',createdAt:'2026-10-01',sortIndex:i});
const projects=[proj('p1','Spring Windows','Van Cleef and Arpels',0),proj('p2','Lobby Wall','acme corp',1)];

const dom=boot(FILE,{data:{projects,tasks:[],staff,todos:[],clients},clientsList:true});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const pick=(el,v)=>{el.value=v;el.dispatchEvent(new win.Event('change',{bubbles:true}));};
const opts=()=>[...doc.querySelectorAll('#pp-client option')].map(o=>[o.value,o.textContent]);
const note=()=>{const n=q('#pp-client')&&q('#pp-client').parentNode.querySelector('.ins-note');return n?n.textContent:'';};
const projWrites=()=>win.__spCalls.filter(c=>c.method==='PATCH'&&c.url.includes('/lists/ShopTimeline_Projects/'));
const P=id=>JSON.parse(E('JSON.stringify(ST.projects.find(p=>p.id==="'+id+'"))'));

setTimeout(stageOff,1500);

function stageOff(){
  sec('R1, R4 — a saved project whose client isn\'t on the list');
  E("location.hash='#/project/p1';applyRoute()");
  setTimeout(()=>{
    const el=q('#pp-client');
    ok('the Client field is a dropdown, so nothing typed reaches a project',!!el&&el.tagName==='SELECT');
    ok('"Pick a client" comes first, then the stored name, then every client A–Z with its alias',
      J(opts())===J([['','Pick a client'],['Van Cleef and Arpels','Van Cleef and Arpels'],['Acme Corp','Acme Corp · ACM'],
        ["Grillo's Pickles","Grillo's Pickles"],['Van Cleef & Arpels','Van Cleef & Arpels · VCA']]),J(opts()));
    ok('the stored name stays selected until someone picks one',el.value==='Van Cleef and Arpels',el.value);
    ok('the note names it, in the owner\'s wording',
      note()==='“Van Cleef and Arpels” isn’t on the Clients list. Pick one from the list, or add it in Clients ↗ first.',note()); /* v1.58.0 (item 86): the Clients app */

    sec('R2 — picking saves the list\'s spelling');
    const n0=projWrites().length;
    pick(el,'Van Cleef & Arpels');
    setTimeout(()=>{
      const w=projWrites().slice(n0).pop(),f=w&&w.body;
      ok('the project saves "Van Cleef & Arpels"',!!f&&f.client==='Van Cleef & Arpels'&&P('p1').client==='Van Cleef & Arpels',f&&f.client);
      ok('the note goes, and the stored name leaves the list',!note()&&!opts().some(o=>o[0]==='Van Cleef and Arpels'));
      stageCase();
    },700);
  },800);
}

function stageCase(){
  sec('R3 — a stored client matches ignoring case');
  E("location.hash='#/project/p2';applyRoute()");
  setTimeout(()=>{
    const el=q('#pp-client');
    ok('"acme corp" selects the list\'s "Acme Corp", with no note',!!el&&el.value==='Acme Corp'&&!note(),el&&el.value);
    ok('…and isn\'t listed twice',opts().filter(o=>o[0].toLowerCase()==='acme corp').length===1);
    stageDraft();
  },800);
}

function stageDraft(){
  sec('R5 — the New Project draft');
  E("location.hash='#/project/new';applyRoute()");
  setTimeout(()=>{
    const el=q('#pp-client');
    ok('[draft] the same dropdown, on "Pick a client"',!!el&&el.tagName==='SELECT'&&el.value===''&&opts().length===4,el&&el.value);
    const dl=q('#pp-deadline');dl.value='2026-12-11';dl.dispatchEvent(new win.Event('change',{bubbles:true}));
    setTimeout(()=>{
      q('#pp-name').value='Holiday Vitrines';q('#pp-name').dispatchEvent(new win.Event('change',{bubbles:true}));
      pick(q('#pp-client'),"Grillo's Pickles");
      const pm=q('#pp-r-pm input[value="Sam Jones"]');if(pm&&!pm.checked){pm.checked=true;pm.dispatchEvent(new win.Event('change',{bubbles:true}));}
      const n0=win.__spCalls.length;
      q('#pp-save').click();
      setTimeout(()=>{
        const post=win.__spCalls.slice(n0).find(c=>c.method==='POST'&&c.url.includes('/lists/ShopTimeline_Projects/')&&c.body.fields.Title==='Holiday Vitrines');
        ok('[draft] Create sends the picked client',!!post&&post.body.fields.client==="Grillo's Pickles",post&&post.body.fields.client);
        stageNoList();
      },900);
    },500);
  },400);
}

function stageNoList(){
  sec('R6 — no client list at all');
  const w2=boot(FILE,{data:{projects,tasks:[],staff,todos:[]}}).window;
  setTimeout(()=>{
    w2.eval("location.hash='#/project/p1';applyRoute()");
    setTimeout(()=>{
      const el=w2.document.getElementById('pp-client');
      ok('with nothing to pick from, the field stays typed and keeps its value',!!el&&el.tagName==='INPUT'&&el.value==='Van Cleef and Arpels',el&&el.tagName);
      done();
    },800);
  },1500);
}

setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);
