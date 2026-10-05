/* v1.28.0 — tracker #10: Open Issues no longer cuts reports at 80 characters; the form
   gets a Subject.
   R1 the full description is readable on Open Issues (it folds under the subject, the way
   developer comments do) · R2 "public": every signed-in person sees the full text (owner
   default Q1; no anonymous access) · R3 the form gets a required one-line Subject, up to
   120 characters, above the description, stored as the row's Title and shown on the page ·
   plan 4 the email and the GitHub issue carry the subject as their title · plan 5 old
   reports keep their titles.
   A Help page, not a project-page feature: the open and resolved columns stand in for the
   two-pages rule. Part A sends a report on an unseeded list (a successful send refetches
   the list, which the harness answers empty); Part B seeds the list afterwards.
   Run: node tests/test-v1280.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('fb-subject')<0){
  console.log('  SKIP  test-v1280: pre-v1.28.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* Sam is the harness's sign-in; Nick receives bug reports, so the team email is sent. */
const staff=[
 {appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''},
 {appId:'s2',Title:'Nick',email:'nick@example.com',depts:JSON.stringify(['fab']),ooo:'[]',role:'',feedbackRecipient:'1'}];
const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const calls=win.__spCalls;
const posts=()=>calls.filter(c=>c.method==='POST'&&c.url.indexOf('ShopTimeline_Feedback')>=0);
const DESC='Open issues page truncates bug reports and feature requests to 80 characters. List should be public. Add Subject or (single line text) to form that displays in Open Issues table. '+'More words so the text is long enough to matter. '.repeat(3);

setTimeout(()=>{
  E("location.hash='#/issues';applyRoute()");
  setTimeout(partA,300);
},1300);

function partA(){
  sec('R3 — the form has a required Subject above the description');
  const sub=q('#fb-subject'),desc=q('#fb-desc');
  ok('R3: a Subject field exists', !!sub&&sub.type==='text');
  ok('R3 default: it takes up to 120 characters', !!sub&&sub.getAttribute('maxlength')==='120');
  ok('R3: it sits above the description', !!sub&&!!desc&&!!(sub.compareDocumentPosition(desc)&4));
  desc.value=DESC;
  click(q('#fb-send'));
  setTimeout(()=>{
    ok('R3: without a subject nothing is sent', posts().length===0, posts().length);
    ok('R3: and the Subject field takes focus', doc.activeElement===sub);
    sub.value='Lane jumps when I drag';desc.value=DESC;
    click(q('#fb-send'));
    setTimeout(()=>{
      const p=posts();
      ok('a filled report posts once', p.length===1, p.length);
      const f=p.length?p[0].body.fields:{};
      ok('R3: the row Title is the subject with the kind prefix', f.Title==='Bug — Lane jumps when I drag', f.Title);
      ok('R3: the description is stored whole (trimmed, as typed)', f.description===DESC.trim(), f.description&&f.description.length+' vs '+DESC.trim().length);
      ok('R1: the Title no longer carries the description', (f.Title||'').indexOf(DESC.slice(0,20))<0);
      const mail=calls.find(c=>c.method==='POST'&&/sendMail/.test(c.url));
      ok('plan 4: the team email is titled with the subject', !!mail&&mail.body&&mail.body.message&&mail.body.message.subject==='[Shop Timeline] Bug — Lane jumps when I drag', mail&&mail.body&&mail.body.message&&mail.body.message.subject);
      ok('the form cleared, subject included', q('#fb-subject').value===''&&q('#fb-desc').value==='');
      partB();
    },500);
  },300);
}

function partB(){
  const d1=DESC+'\n\nScreenshot: https://x/y.png';
  const t120='A'.repeat(120);
  const oldDesc='O'.repeat(200);
  E('FB_CACHE=['
   +'{spId:"n1",at:"2026-09-29T10:00:00Z",kind:"bug",status:"",title:"Bug — Lane jumps when I drag",description:'+JSON.stringify(d1)+',comments:fbComments(\'[{"at":"2026-09-30T10:00:00Z","text":"On it"}]\')},'
   +'{spId:"n2",at:"2026-09-28T10:00:00Z",kind:"feature",status:"",title:"Feature — '+t120+'",description:"short",comments:[]},'
   +'{spId:"o1",at:"2026-09-24T10:00:00Z",kind:"bug",status:"",title:"Bug — '+oldDesc.slice(0,80)+'",description:"'+oldDesc+'",comments:[]},'
   +'{spId:"r1",at:"2026-09-20T10:00:00Z",kind:"bug",status:"resolved",title:"Bug — Done one",description:"It was fixed.",comments:[]},'
   +'{spId:"e1",at:"2026-09-19T10:00:00Z",kind:"feature",status:"",title:"Feature — Bare",description:"",comments:[]}'
   +'];FB_AT=Date.now()');
  E("location.hash='#/issues';applyRoute()");
  setTimeout(()=>{
    sec('R1 / R3 — the subject shows whole; the full text folds under it');
    const n2=q('#fb-list .clog-row[data-spid="n2"] .clog-what summary b');
    ok('plan 2: a 120-character subject shows in full', !!n2&&n2.textContent.length===120, n2&&n2.textContent.length);
    const d=q('#fb-list .clog-row[data-spid="n1"] details.fb-dd');
    ok('R1: a report with text carries a closed fold under its subject', !!d&&!d.open);
    ok('R1: the fold is titled with the subject', !!d&&d.querySelector('summary b').textContent==='Lane jumps when I drag');
    ok('R1: the fold holds the whole description (more than 80 characters, screenshot line included)', !!d&&d.querySelector('.clog-det').textContent===d1&&d1.length>80);
    click(q('#fb-list .clog-row[data-spid="n1"] details.fb-dd > summary'));
    ok('R1 done-when: clicking the subject expands the full description', !!d&&d.open===true&&d.querySelector('.clog-det').textContent===d1);
    const o1=q('#fb-list .clog-row[data-spid="o1"]');
    ok('plan 5: an old report keeps its stored title (the first 80 characters)', !!o1&&o1.querySelector('summary b').textContent===oldDesc.slice(0,80));
    ok('plan 5: and now unfolds its full text too', !!o1&&o1.querySelector('.clog-det').textContent===oldDesc);
    ok('the Resolved column folds the same way', !!q('#fb-done .clog-row[data-spid="r1"] details.fb-dd'));
    ok('a report with no text has no fold', !q('#fb-list .clog-row[data-spid="e1"] details'));
    ok('R2 default: a plain signed-in user (Sam) sees the full text', E('typeof isDeveloper==="function"?!isDeveloper():true')&&!!q('#fb-list .fb-dd .clog-det'));

    sec('plan 3 — the reply email\'s link opens the report, its text and its replies');
    E("location.hash='#/issues/n1';applyRoute()");
    setTimeout(()=>{
      const r=q('#fb-list .clog-row[data-spid="n1"]');
      ok('the linked report is highlighted', !!r&&r.classList.contains('fb-hit'));
      const ds=r?[...r.querySelectorAll('details')]:[];
      ok('its text and its developer comments are both open', ds.length===2&&ds[0].classList.contains('fb-dd')&&ds[1].classList.contains('fb-cm')&&ds.every(x=>x.open), ds.map(x=>x.className+':'+x.open).join(' '));
      done();
    },300);
  },300);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
