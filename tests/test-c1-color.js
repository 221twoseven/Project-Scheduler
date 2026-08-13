/* C1 / Design-Language §2.2: project colors come from a stable hash of the id.
   Adding, deleting, or re-sorting projects must never change any other project's
   color; visible-collision shifts go to the nearest free slot; nothing nears
   INSTALL_RED. Run: node tests/test-c1-color.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';

/* The frozen REV50 reference predates C1 — same convention as test-e3-resize.js. */
if(fs.readFileSync(FILE,'utf8').indexOf('hashSlot')<0){
  console.log('test-c1-color: skipped — no hashSlot() in '+FILE+' (pre-C1 build)');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* ids chosen for known hash slots: pa→5, pb→6, pc→7, pm→5 (collides with pa) */
const proj=(id,name)=>({appId:id,Title:name,client:'',jobCode:id.toUpperCase(),
  deadline:'2026-10-01',status:'in-fabrication',projectManager:'Stan',drafter:'',
  leadFab:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-07-01'});
const projects=[proj('pa','Alpha'),proj('pb','Bravo'),proj('pc','Charlie')];

const dom=boot(FILE,{data:{projects,tasks:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s);

setTimeout(()=>{
  sec('colors are hash-derived, not index-derived');
  const before={pa:E('projColor("pa")'),pb:E('projColor("pb")'),pc:E('projColor("pc")')};
  ok('pa sits in its hash slot',before.pa===E('PCOLS[hashSlot("pa")]'),before.pa);
  ok('all three colors are distinct',new Set(Object.values(before)).size===3);

  sec('deleting the first project moves nobody else');
  E('saveState({projects:ST.projects.filter(x=>x.id!=="pa"),tasks:ST.tasks,todos:ST.todos||[]})');
  ok('pb unchanged after delete',E('projColor("pb")')===before.pb,E('projColor("pb")'));
  ok('pc unchanged after delete',E('projColor("pc")')===before.pc,E('projColor("pc")'));

  sec('re-sorting moves nobody');
  E('sortProjectsBy((a,b)=>a.name<b.name?1:-1,"test",null)');
  ok('pb unchanged after re-sort',E('projColor("pb")')===before.pb);
  ok('pc unchanged after re-sort',E('projColor("pc")')===before.pc);

  sec('visible collision: later-created project shifts, earlier keeps its slot');
  /* pa (slot 5) back in, plus pm (also slot 5, later id). With 5,6,7 taken the
     nearest free slot from 5 is 4 (right neighbor 6 is used). */
  E('saveState({projects:[...ST.projects,'+JSON.stringify({id:'pa',name:'Alpha'})+','
    +JSON.stringify({id:'pm',name:'Collide'})+'],tasks:ST.tasks,todos:ST.todos||[]})');
  ok('earlier project keeps its hash slot',E('projColor("pa")')===E('PCOLS[hashSlot("pa")]'));
  ok('later collider shifted off the shared slot',E('projColor("pm")')!==E('projColor("pa")'));
  ok('…to the nearest free slot',E('projColor("pm")')===E('PCOLS[4]'),E('projColor("pm")'));
  ok('pb and pc still untouched',E('projColor("pb")')===before.pb&&E('projColor("pc")')===before.pc);

  sec('no palette slot approaches the reserved install red');
  const hue=hex=>{const n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,
    mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;
    let h=mx===r?(g-b)/d%6:mx===g?(b-r)/d+2:(r-g)/d+4;return ((h*60)+360)%360;};
  /* legacy p02 orange (#E27035, doc-kept for continuity) sits at 20°; the floor
     guards against anything creeping closer to red than the palette already is */
  const red=hue(E('INSTALL_RED'));
  for(const c of E('PCOLS')){
    const diff=Math.min(Math.abs(hue(c)-red),360-Math.abs(hue(c)-red));
    ok(c+' is ≥20° from INSTALL_RED',diff>=20,Math.round(diff)+'°');
  }

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
