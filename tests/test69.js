/* REV69 (N3): the shared client list.
   - ShopTimeline_Clients loads as {spId, name: Title, alias: field_2}.
   - The project Client field is a native type-ahead (datalist) fed by the list, on
     BOTH the draft and saved project pages (the REV49 lesson); free text still works.
   - Settings → Clients manages the list (add/edit/remove, alias uppercased, dupes
     rejected); saves sync by SharePoint item id (POST new / PATCH changed) since the
     imported list has no appId column.
   - Absent list degrades to browser-local with a warning on save, quiet at load.
   Skips on builds that predate the client list.
   Run: node test69.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/ShopTimeline_Clients/.test(src)){
  console.log('  SKIP  build predates the client list (no ShopTimeline_Clients) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const projects=[
 {appId:'p1',Title:'Hermes Windows',client:'Hermès',jobCode:'HER-2419',deadline:'2026-10-02',
  status:'in-fabrication',projectManager:'Stan',drafter:'Peter',leadFab:'Nick',
  activeDepartments:JSON.stringify(['pm','td','fab']),createdAt:'2026-07-01',sortIndex:0}];
const clients=[
 {Title:'Hermès',field_2:'HER'},
 {Title:'Tiffany & Co.',field_2:'TIF'},
 {Title:'Cartier',field_2:'CAR'}];

const dom=boot(FILE,{data:{projects,tasks:[],staff:[],todos:[],clients},clientsList:true});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  sec('Load: Title/field_2 map to name/alias, keyed by item id');
  ok('three clients load',E('CLIENTS.length')===3,E('CLIENTS.length'));
  ok('name and alias mapped',E("CLIENTS[0].name")==='Hermès'&&E("CLIENTS[0].alias")==='HER');
  ok('rows keep their SharePoint item id',E("CLIENTS.every(c=>!!c.spId)"));
  ok('list reachable → CLIENTS_OK',E('CLIENTS_OK')===true);

  sec('Saved project page: the Client field suggests from the list');
  win.location.hash='#/project/p1';
  setTimeout(()=>{
    ok('client input carries the datalist',E("document.getElementById('pp-client').getAttribute('list')")==='cl-dl');
    ok('all clients offered',E("document.querySelectorAll('#cl-dl option').length")===3);
    ok('free text survives (existing value intact)',E("document.getElementById('pp-client').value")==='Hermès');

    sec('Draft page: same field, same list (REV49 lesson)');
    win.location.hash='#/project/new';
    setTimeout(()=>{
      ok('draft client input carries the datalist',E("document.getElementById('pp-client').getAttribute('list')")==='cl-dl');
      ok('all clients offered on the draft too',E("document.querySelectorAll('#cl-dl option').length")===3);

      win.location.hash='#/';
      setTimeout(()=>{
        sec('Settings → Clients manager');
        E("document.getElementById('mi-clients').click();");
        ok('modal opens with the current list',!E("document.getElementById('clients-overlay').classList.contains('hidden')")&&
           E("document.querySelectorAll('#cl-list .st-person').length")===3);
        ok('offline note hidden while the list is reachable',E("document.getElementById('cl-local-note').classList.contains('hidden')"));
        E("CM_CLIENTS.push({name:' Bergdorf ',alias:'ber'});document.getElementById('cl-save').click();");
        ok('save trims, uppercases the alias and lands in CLIENTS',
           E("JSON.stringify(CLIENTS.map(c=>c.name+':'+c.alias))").includes('Bergdorf:BER'));
        setTimeout(()=>{
          const post=E("JSON.stringify((__spCalls||[]).filter(c=>c.url.includes('ShopTimeline_Clients')&&c.method==='POST').map(c=>c.body))");
          ok('the new client POSTs Title + field_2',post.includes('Bergdorf')&&post.includes('field_2'),post);

          sec('Duplicate names are rejected');
          E("document.getElementById('mi-clients').click();CM_CLIENTS.push({name:'cartier',alias:'CA2'});document.getElementById('cl-save').click();");
          ok('save refuses and keeps the modal open',!E("document.getElementById('clients-overlay').classList.contains('hidden')")&&
             E("CLIENTS.filter(c=>c.name.toLowerCase()==='cartier').length")===1);
          E("document.getElementById('cl-cancel').click();");

          sec('Offline degrade');
          E("CLIENTS_OK=false;saveClients([{name:'LocalOnly',alias:'LO'}]);");
          ok('save still lands locally',E("CLIENTS[0].name")==='LocalOnly'&&
             E("JSON.parse(localStorage.getItem(CLIENTS_KEY))[0].name")==='LocalOnly');

          console.log('\n'+'-'.repeat(46));
          console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
          process.exit(fail?1:0);
        },400);
      },300);
    },300);
  },300);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
