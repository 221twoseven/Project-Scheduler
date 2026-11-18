/* REV69 (N3): the shared client list.
   - ShopTimeline_Clients loads as {spId, name: Title, alias: field_2}.
   - The project Client field is fed by the list, on BOTH the draft and saved project
     pages (the REV49 lesson). v1.53.0 (item 81): a dropdown, no free text.
   - The Clients app (v1.58.0, item 86; was Settings → Clients, then the Clients page)
     manages the list (add/edit/remove, alias uppercased, dupes rejected); saves sync by
     SharePoint item id (POST new / PATCH changed) since the imported list has no appId column.
   - Absent list: Timeline keeps its cached copy, quiet at load; the app edits nothing.
   Skips on builds that predate the client list.
   Run: node test69.js timeline/index.html */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const projects=[
 {appId:'p1',Title:'Hermes Windows',client:'Hermès',jobCode:'HER-2419',deadline:'2026-10-02',
  status:'in-fabrication',projectManager:'Theo',drafter:'Oscar',leadFab:'Milo',
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

  sec('Saved project page: the Client field picks from the list');
  win.location.hash='#/project/p1';
  setTimeout(()=>{
    ok('the Client field is a dropdown of the list (v1.53.0, item 81: was a type-ahead)',E("document.getElementById('pp-client').tagName")==='SELECT');
    ok('all clients offered, after "Pick a client"',E("document.querySelectorAll('#pp-client option').length")===4);
    ok('the stored client is selected (existing value intact)',E("document.getElementById('pp-client').value")==='Hermès');

    sec('Draft page: same field, same list (REV49 lesson)');
    win.location.hash='#/project/new';
    setTimeout(()=>{
      ok('the draft Client field is the same dropdown',E("document.getElementById('pp-client').tagName")==='SELECT');
      ok('all clients offered on the draft too',E("document.querySelectorAll('#pp-client option').length")===4);

      /* v1.58.0 (item 86): the manager is the Clients app (clients/), which owns the list. The
         rules are the same: names trimmed, alias uppercased, duplicates refused, new rows POSTed
         with Title + field_2 and kept by item id. */
      sec('The Clients app manages the list');
      const APP=require('path').join(__dirname,'..','clients','index.html');
      const app=boot(APP,{url:'https://example.github.io/Project-Scheduler/clients/',data:{projects,tasks:[],staff:[],clients},clientsList:true}).window;
      const A=s=>app.eval(s);
      setTimeout(()=>{
        ok('the page opens with the current list',app.document.querySelectorAll('#list .row').length===3);
        ok('the sync pill reads synced while the list is reachable',/synced/.test(app.document.getElementById('sync-pill').textContent));
        A("EDIT={name:' Bergdorf ',alias:'ber',_new:true};saveEdit();");
        ok('save trims, uppercases the alias and lands in CLIENTS',
           A("JSON.stringify(CLIENTS.map(c=>c.name+':'+c.alias))").includes('Bergdorf:BER'));
        setTimeout(()=>{
          const post=A("JSON.stringify((__spCalls||[]).filter(c=>c.url.includes('ShopTimeline_Clients')&&c.method==='POST').map(c=>c.body))");
          ok('the new client POSTs Title + field_2',post.includes('Bergdorf')&&post.includes('field_2'),post);

          sec('Duplicate names are rejected');
          A("EDIT={name:'cartier',alias:'CA2',_new:true};saveEdit();");
          ok('save refuses and keeps the editor open',A("!!EDIT")===true&&
             A("CLIENTS.filter(c=>c.name.toLowerCase()==='cartier').length")===1);

          sec('Offline degrade');
          /* v1.58.0: the app that owns the list edits nothing while it can't reach it (a browser-only
             copy would never reach anyone) and says so. Timeline's dropdown still falls back to
             the copy it cached, as before. */
          const off=boot(APP,{url:'https://example.github.io/Project-Scheduler/clients/',data:{projects,tasks:[],staff:[],clients}}).window;
          setTimeout(()=>{
            ok('with the list unreachable, the app says so and offers no editing',
               /Couldn.t reach SharePoint/.test(off.document.getElementById('main').textContent)&&!off.document.getElementById('add'));
            ok('Timeline keeps its cached copy for the dropdown',E("JSON.parse(localStorage.getItem(CLIENTS_KEY)).length")===3);
            done();
          },1500);
        },400);
      },1500);
    },300);
  },300);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
