/* v1.6.0 — bug report / feature request form (08-31 v2 brief, obj 2).
   v1.20.0: the modal became the left pane of the Open Issues page (#/issues) — same
   fb-* ids, same sendFeedback path; "Report a bug or idea" navigates there. This suite
   asserts the page flow (the pre-v1.20 modal flow is history; pre-v1.6 builds skip).
   Run: node tests/test-v160.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('ShopTimeline_Feedback')<0){
  console.log('test-v160: skipped — pre-v1.6.0 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const q=s=>doc.querySelector(s);
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));

sec('source-level checks');
ok('screenshots route through the site drive, not item attachments',
   src.indexOf("/drive/root:'+encodeURI(path)+':/content")>=0);

setTimeout(()=>{
  sec('the form lives on the Open Issues page and prefills from the account');
  ok('the Help menu offers the report item', !!q('#mi-report'));
  ok('the Help menu offers Open issues and Release notes', !!q('#mi-issues')&&!!q('#mi-relnotes'));
  click(q('#mi-report'));
  ok('the report item lands on the Open Issues page', win.location.hash==='#/issues'&&!!q('#fb-desc'), win.location.hash);
  ok('the issues list pane renders beside the form', !!q('#fb-list'));
  ok('name prefilled from the signed-in account', q('#fb-name').value==='Sam', q('#fb-name').value);
  ok('email prefilled', q('#fb-email').value==='user@example.com', q('#fb-email').value);
  ok('Bug is the default kind', q('#fb-kind input[value="bug"]').checked);

  sec('validation: an empty description never sends');
  const calls=win.__spCalls;
  const posts=()=>calls.filter(c=>c.method==='POST'&&c.url.indexOf('ShopTimeline_Feedback')>=0);
  click(q('#fb-send'));
  setTimeout(()=>{
    ok('no POST left the app', posts().length===0);
    ok('the form is still on screen', !!q('#fb-desc'));

    sec('a filled report posts the right fields');
    q('#fb-kind input[value="feature"]').checked=true;
    q('#fb-desc').value='Please add a dark mode for the night crew';
    click(q('#fb-send'));
    setTimeout(()=>{
      const p=posts();
      ok('exactly one POST to the feedback list', p.length===1, p.length+' posts');
      const f=p.length?p[0].body.fields:{};
      ok('Title carries the kind and the ask', /^Feature — Please add a dark mode/.test(f.Title||''), f.Title);
      ok('kind field says feature', f.kind==='feature');
      ok('name + email ride along', f.name==='Sam'&&f.email==='user@example.com', f.name+'/'+f.email);
      ok('description is the typed text', f.description==='Please add a dark mode for the night crew');
      ok('the build stamps itself', !!f.appVersion&&f.appVersion===win.eval('APP_VER'), f.appVersion);
      ok('an appId is generated', typeof f.appId==='string'&&f.appId.length>5);
      ok('the form cleared on success (the page stays put)', q('#fb-desc').value==='', q('#fb-desc').value);

      sec('Escape leaves the page like every Company Data page');
      doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      ok('Esc routes back to the timeline', win.location.hash==='#/'||win.location.hash==='', win.location.hash);

      sec('Release notes page');
      win.eval("location.hash='#/releases';applyRoute()");
      ok('the page renders with version entries', doc.querySelectorAll('.rn-ver').length>3,
         doc.querySelectorAll('.rn-ver').length+' entries');
      ok('the newest entry matches the running build',
         new RegExp('v'+win.eval('APP_VER').replace(/\./g,'\\.')).test((q('.rn-ver .rn-hd')||{textContent:''}).textContent),
         (q('.rn-ver .rn-hd')||{textContent:''}).textContent);

      sec('dev reports page is guarded');
      ok('the dev menu item exists (hidden by default)', !!q('#mi-reports'));

      console.log('\ntest-v160: '+pass+' passed, '+fail+' failed');
      process.exit(fail?1:0);
    },350);
  },250);
},1300);
