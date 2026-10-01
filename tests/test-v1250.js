/* v1.25.0 — team replies on reports (owner, 2026-09-30): the tracker's poller copies
   each GitHub comment that starts with /reply into the Feedback row's `comments` column
   (JSON [{at,text}]); Open Issues folds them open under the report, #/issues/<spId>
   (the reply email's link) opens that one, and a new report stamps `reporterUpn`.
   Run: node tests/test-v1250.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function fbComments')<0){
  console.log('test-v1250: skipped — pre-v1.25.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s);

setTimeout(main,1300);

function main(){
  sec('parsing the comments column');
  ok('JSON replies parse', E(`fbComments('[{"at":"2026-09-30T10:00:00Z","text":"Fixed"}]').length`)===1);
  ok('missing / junk / non-array / empty text read as none',
     E(`[fbComments(undefined),fbComments('nope'),fbComments('{"a":1}'),fbComments('[{"at":"x"}]')].every(a=>a.length===0)`));

  sec('Open Issues folds replies under the report');
  E(`FB_CACHE=[
    {spId:'5',at:'2026-09-29T10:00:00Z',kind:'bug',title:'Bug — Lane jumps',status:'',comments:fbComments('[{"at":"2026-09-30T10:00:00Z","text":"Fixed in <b>1.25</b>"}]')},
    {spId:'6',at:'2026-09-28T10:00:00Z',kind:'feature',title:'Feature — Dark mode',status:'',comments:[]}];FB_AT=Date.now()`);
  E(`location.hash='#/issues';applyRoute()`);
  setTimeout(()=>{
    const d=q('#fb-list .clog-row[data-spid="5"] details.fb-cm');
    ok('a report with a reply carries a closed toggle', !!d&&!d.open);
    ok('the toggle says how many', d&&/^1 developer comment$/.test(d.querySelector('summary').textContent), d&&d.querySelector('summary').textContent);
    ok('reply text is escaped', d&&d.querySelector('.clog-det').textContent==='Fixed in <b>1.25</b>');
    ok('a report without replies has no toggle', !q('#fb-list .clog-row[data-spid="6"] details'));

    sec('the email link opens that report');
    E(`location.hash='#/issues/5';applyRoute()`);
    setTimeout(()=>{
      const r=q('#fb-list .clog-row[data-spid="5"]');
      ok('#/issues/<spId> routes to Open Issues', E('ROUTE.view')==='issues'&&E('ROUTE.id')==='5');
      ok('…with that report highlighted and its replies open', r&&r.classList.contains('fb-hit')&&r.querySelector('details').open);

      sec('a new report stamps who sent it');
      E(`location.hash='#/issues';applyRoute()`);
      q('#fb-desc').value='Something broke';
      q('#fb-email').value='someone-else@example.com';
      q('#fb-send').dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
      setTimeout(()=>{
        const p=win.__spCalls.filter(c=>c.method==='POST'&&c.url.indexOf('ShopTimeline_Feedback')>=0);
        const f=p.length?p[0].body.fields:{};
        ok('reporterUpn is the sign-in, not the typed email', f.reporterUpn==='user@example.com'&&f.email==='someone-else@example.com', f.reporterUpn);
        console.log('\ntest-v1250: '+pass+' passed, '+fail+' failed');
        process.exit(fail?1:0);
      },400);
    },300);
  },300);
}
