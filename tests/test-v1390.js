/* v1.39.0 — a status on every open report (tracker #29, revised spec 2026-10-02):
   R1 three states read off the ticket by the tracker's poller — `status` empty = PENDING,
      `review` = IN REVIEW, `resolved` = the Resolved column (no extra tag there) · R2 the
      developer page shows PENDING / IN REVIEW / RESOLVED, keeps the developer comments, and
      on a row with a ticket (`ghIssue`) reads "Status follows the ticket" with the link in
      place of Mark resolved / Reopen; a row without a ticket keeps the button · R3 the
      emailed /reply still shows under the report (the email itself is the poller's
      `lastComment` + the Reply email flow; the poller selftest proves a status change never
      touches it) · R4 the flip to `review` is automatic (poller selftest); the app never sets
      a status by hand — there is no Pending / In review control.
   Run: node tests/test-v1390.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function fbStatusTag')<0){
  console.log('  SKIP  test-v1390: pre-v1.39.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const TICKET='https://github.com/221twoseven/Project-Scheduler-issues/issues/29';
const item=(id,created,f)=>({id,createdDateTime:created,lastModifiedDateTime:created,fields:f});
const FEEDBACK=[
  item('1','2026-09-20T10:00:00Z',{Title:'Pending one',kind:'bug',status:'',ghIssue:''}),
  item('2','2026-09-25T10:00:00Z',{Title:'Looked at',kind:'feature',status:'review',ghIssue:TICKET,
    comments:JSON.stringify([{at:'2026-09-26T10:00:00Z',text:'Thanks — looking into it'},{at:'2026-09-27T10:00:00Z',text:'Shop note',kind:'comment'}])}),
  item('3','2026-09-10T10:00:00Z',{Title:'Closed ticket',kind:'bug',status:'resolved',resolvedAt:'2026-09-30T15:00:00Z',ghIssue:TICKET.replace(/29$/,'3')}),
  item('4','2026-09-01T10:00:00Z',{Title:'Pre-bridge resolved',kind:'bug',status:'resolved'}),
  item('5','2026-09-28T10:00:00Z',{Title:'Odd value',kind:'bug',status:'in progress',ghIssue:'javascript:alert(1)'})];
/* Sam is the developer (admin:'dev'), so #/reports renders */
const staff=[{appId:'s1',Title:'Sam',depts:JSON.stringify(['pm']),ooo:'[]',email:'user@example.com',phone:'',role:'PM',admin:'dev'}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const f0=win.fetch;
win.fetch=function(url,init){
  if(String(url).indexOf('ShopTimeline_Feedback')>=0&&(!init||!init.method||init.method==='GET'))
    return Promise.resolve({ok:true,status:200,json:async()=>({value:FEEDBACK}),text:async()=>''});
  return f0.apply(this,arguments);
};

setTimeout(()=>{E("location.hash='#/issues';applyRoute()");setTimeout(open,900);},1300);

const tag=(root,id)=>q(root+' .clog-row[data-spid="'+id+'"] .fb-st');
function open(){
  sec('R1 — Open Issues: a status tag on every open report');
  ok('fbFetch reads ghIssue off the row', E("FB_CACHE.find(r=>r.spId==='2').ghIssue")===TICKET&&E("FB_CACHE.find(r=>r.spId==='1').ghIssue")==='');
  ok('an untouched report (status empty) reads PENDING', tag('#fb-list','1')&&tag('#fb-list','1').textContent==='PENDING', tag('#fb-list','1')&&tag('#fb-list','1').textContent);
  ok('…with the hover title "Not looked at yet", in the muted style', tag('#fb-list','1').title==='Not looked at yet'&&tag('#fb-list','1').classList.contains('fb-pend'));
  ok('a report the team replied on (status review) reads IN REVIEW', tag('#fb-list','2')&&tag('#fb-list','2').textContent==='IN REVIEW', tag('#fb-list','2')&&tag('#fb-list','2').textContent);
  ok('…with the hover title "The team is looking at this report"', tag('#fb-list','2').title==='The team is looking at this report'&&!tag('#fb-list','2').classList.contains('fb-pend'));
  ok('any other status value still reads as open and shows PENDING', tag('#fb-list','5')&&tag('#fb-list','5').textContent==='PENDING');
  ok('the tag sits after the BUG / IDEA chip, before the subject', qa('#fb-list .clog-row').every(r=>{const c=[...r.children];return c[0].classList.contains('fb-kind')&&c[1].classList.contains('fb-st')&&c[2].classList.contains('clog-what');}));
  ok('the Resolved column carries no status tag — the column is the state', qa('#fb-done .clog-row').length===2&&qa('#fb-done .fb-st').length===0, qa('#fb-done .clog-row').length+'/'+qa('#fb-done .fb-st').length);
  ok('the tags share one width (.fb-st is a fixed flex column) and PENDING is one muted colour', /\.fb-st\{flex:0 0 \d+px;text-align:center/.test(src)&&/\.fb-st\.fb-pend\{color:var\(--ts-muted\)/.test(src));

  sec('R3 — the emailed /reply still shows under the report');
  const cm=q('#fb-list .clog-row[data-spid="2"] details.fb-cm');
  ok('the IN REVIEW report folds its reply and the /comment note', !!cm&&/^2 developer comments$/.test(cm.querySelector('summary').textContent)
     &&[...cm.querySelectorAll('.clog-det')].map(d=>d.textContent).join('|')==='Thanks — looking into it|Shop note', cm&&cm.querySelector('summary').textContent);

  E("location.hash='#/reports';applyRoute()");
  setTimeout(dev,900);
}
function dev(){
  sec('R2 — the developer page: the same tags, and the ticket decides');
  ok('the page rendered for the developer', E('ROUTE.view')==='reports'&&qa('#fbr-list .clog-row').length===5, E('ROUTE.view')+' '+qa('#fbr-list .clog-row').length);
  const t=id=>tag('#fbr-list',id)&&tag('#fbr-list',id).textContent;
  ok('PENDING / IN REVIEW / RESOLVED on the three rows', t('1')==='PENDING'&&t('2')==='IN REVIEW'&&t('3')==='RESOLVED', [t('1'),t('2'),t('3')].join());
  ok('a pre-bridge resolved row (no ticket) reads RESOLVED too; an odd value reads PENDING', t('4')==='RESOLVED'&&t('5')==='PENDING', [t('4'),t('5')].join());
  const r2=q('#fbr-list .clog-row[data-spid="2"]'),tk=r2&&r2.querySelector('.fbr-tk');
  ok('a row with a ticket reads "Status follows the ticket" with the link, no button', !!tk&&/^Status follows the ticket · #29$/.test(tk.textContent)&&!r2.querySelector('.fbr-tog'), tk&&tk.textContent);
  const a=tk&&tk.querySelector('a');
  ok('…the link opens the ticket in a new tab', !!a&&a.getAttribute('href')===TICKET&&a.target==='_blank'&&/noopener/.test(a.rel));
  const r3=q('#fbr-list .clog-row[data-spid="3"]');
  ok('a resolved row with a ticket has no Reopen button either', !!r3&&!!r3.querySelector('.fbr-tk')&&!r3.querySelector('.fbr-tog'));
  const r5=q('#fbr-list .clog-row[data-spid="5"]');
  ok('a ghIssue that is not an https link is never rendered as one', !!r5&&!!r5.querySelector('.fbr-tk')&&!r5.querySelector('.fbr-tk a')&&!r5.querySelector('.fbr-tog'));
  const b1=q('#fbr-list .clog-row[data-spid="1"] .fbr-tog'),b4=q('#fbr-list .clog-row[data-spid="4"] .fbr-tog');
  ok('a row without a ticket keeps Mark resolved / Reopen', !!b1&&b1.textContent==='Mark resolved'&&!!b4&&b4.textContent==='Reopen', (b1&&b1.textContent)+'/'+(b4&&b4.textContent));
  ok('the developer comments still show under the report (the comment half of R2)', !!q('#fbr-list .clog-row[data-spid="2"] details.fb-cm')&&q('#fbr-list .clog-row[data-spid="2"] details.fb-cm .clog-det').textContent==='Thanks — looking into it');
  ok('no manual Pending / In review control anywhere (Q4 default: the status is automatic)', !/data-next="review"/.test(src)&&qa('#fbr-list [data-next]').every(b=>b.dataset.next===''||b.dataset.next==='resolved'));

  sec('R4 — the flip is the poller\'s, not the app\'s');
  ok('the app never writes `review` (only the poller does)', !/status:\s*['"]review['"]/.test(src));
  const before=win.__spCalls.length;
  b4.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
  setTimeout(()=>{
    const p=win.__spCalls.slice(before).filter(c=>c.method==='PATCH'&&c.url.indexOf('ShopTimeline_Feedback')>=0);
    ok('Reopen on a ticketless row still PATCHes status (fbSetStatus kept for the pre-bridge history)', p.length===1&&/\/items\/4\/fields$/.test(p[0].url)&&p[0].body.status==='', p.length&&p[0].url);
    console.log('\n'+'-'.repeat(46));
    console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
    process.exit(fail?1:0);
  },400);
}
