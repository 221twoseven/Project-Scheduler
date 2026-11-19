/* v1.61.0 — item 94, the Clients app is renamed Office (owner, 2026-11-19: "let's use what we
   have now as Office, since it is a more comprehensive name"; the wording: "Wording OK").
   R1 the app lives in office/ and calls itself Office · R2 clients/ forwards old links there,
   keeping the rest of the address · R3 the Systems page and the Apps menu list Office, not
   Clients · R4 nothing still links to clients/ except the forward from Timeline's old #/clients.
   The renamed checks live in the suites that pinned them (v1560, v1570, v1580).
   Run: node tests/test-v1610.js timeline/index.html  (or via tests/run.js) */
const fs=require('fs'),path=require('path');
const {boot,suite}=require('./harness');
const {raw,ok,done}=suite();
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n');
const sec=t=>console.log('\n'+t);
const office=read('office/index.html'),fwd=read('clients/index.html'),portal=read('index.html'),common=read('common/common.js');

sec('R1: office/');
ok('the app is office/index.html, and boots signed in', (()=>{const W=boot(path.join(ROOT,'office','index.html'),
  {url:'https://example.github.io/Project-Scheduler/office/',clientsList:true,data:{clients:[{Title:'Alder Studio'}],staff:[]}}).window;
  return W.document.title==='Office — TWOSEVEN INC.'&&W.document.querySelector('.ts-top .ts-app').textContent.trim()==='Office';})());
ok('its page heading is still Clients (the client list is a part of Office)', /<h1>Clients<\/h1>/.test(office));

sec('R2: old Clients links');
ok('clients/ forwards to ../office/, keeping ?… and #…', fwd.includes("location.replace('../office/'+location.search+location.hash);"));
ok('…with a plain link when scripts are off', fwd.includes('<a href="../office/">Open Office</a>'));
ok('…and loads nothing else', !/\ssrc=/.test(fwd));

sec('R3: Office on the Systems page and in the Apps menu');
ok('the Systems page has an Office card that opens office/, and no Clients card',
  /<a class="app-link" href="office\/">/.test(portal)&&!/href="clients\/"/.test(portal)&&!/app-name">Clients</.test(portal));
ok('the Apps menu lists Office at office/, admins only, and no Clients',
  common.includes("{name:'Office',href:'office/',note:'admins only'}")&&!/name:'Clients'/.test(common));

sec('R4: nothing else points at clients/');
const links=t=>[...t.matchAll(/(?:href="|replace\(')(?:\.\.\/)?clients\//g)].length;
ok('Timeline: only the old #/clients route forwards, to office/', links(raw)===0&&raw.includes("location.replace('../office/')"));
ok('Office and the Systems page link nowhere into clients/', links(office)===0&&links(portal)===0);

done();
