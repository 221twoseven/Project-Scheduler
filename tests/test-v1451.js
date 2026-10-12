/* v1.45.1 — TODO item 58 (owner, 2026-10-09): replies work like comments on both trackers. A reporter's
   emailed answer (a **Reply from the reporter** comment on the ticket, copied to the row by the poller as
   kind:'reporter') shows in the Open Issues thread beside the team's /reply and /comment notes, each
   labelled Team or Reporter; the summary counts comments, not "developer comments".
   Run: node tests/test-v1451.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf("reporter:c.kind==='reporter'")<0){
  console.log('  SKIP  test-v1451: pre-v1.45.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const item=(id,created,f)=>({id,createdDateTime:created,lastModifiedDateTime:created,fields:f});
const FEEDBACK=[
  item('5','2026-10-01T10:00:00Z',{Title:'Bug — Drag jumps',kind:'bug',status:'review',
    comments:JSON.stringify([
      {at:'2026-10-02T10:00:00Z',text:'Which browser?'},                      /* a /reply */
      {at:'2026-10-02T12:00:00Z',text:'It was Chrome.',kind:'reporter'},       /* the reporter, by email */
      {at:'2026-10-03T09:00:00Z',text:'Shop note',kind:'comment'}])}),         /* a /comment */
  item('6','2026-10-04T10:00:00Z',{Title:'Feature — One',kind:'feature',status:'',
    comments:JSON.stringify([{at:'2026-10-05T10:00:00Z',text:'Thanks',kind:'reporter'}])})];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const f0=win.fetch;
win.fetch=function(url,init){
  if(String(url).indexOf('ShopTimeline_Feedback')>=0&&(!init||!init.method||init.method==='GET'))
    return Promise.resolve({ok:true,status:200,json:async()=>({value:FEEDBACK}),text:async()=>''});
  return f0.apply(this,arguments);
};

setTimeout(()=>{E("location.hash='#/issues/5';applyRoute()");setTimeout(main,900);},1300);

function main(){
  sec('the thread on Open Issues');
  const cm=q('#fb-list .clog-row[data-spid="5"] details.fb-cm');
  ok('the report folds three comments', !!cm&&cm.querySelector('summary').textContent==='3 comments', cm&&cm.querySelector('summary').textContent);
  const ones=cm?[...cm.querySelectorAll('.fb-cm-one')]:[];
  const who=ones.map(o=>o.querySelector('.clog-when').textContent.split(' · ')[0]);
  ok('each says who wrote it: Team, Reporter, Team (in ticket order)', who.join()==='Team,Reporter,Team', who.join());
  ok('the reporter\'s answer shows its text', ones[1]&&ones[1].querySelector('.clog-det').textContent==='It was Chrome.');
  ok('the reporter\'s answer is marked apart (.rep)', ones[1]&&ones[1].classList.contains('rep')&&!ones[0].classList.contains('rep'));
  ok('names stay off the public page: the label is "Reporter", never a name', !/Kate|@/.test(cm?cm.textContent:''));
  ok('the email link (#/issues/5) opens that thread', !!cm&&cm.open);
  const one=q('#fb-list .clog-row[data-spid="6"] details.fb-cm');
  ok('a single comment reads "1 comment"', !!one&&one.querySelector('summary').textContent==='1 comment', one&&one.querySelector('summary').textContent);

  sec('the date tip');
  const tip=q('#fb-list .clog-row[data-spid="5"] > .clog-when').title;
  ok('it names the latest comment (the reporter\'s or the team\'s alike)', /Last comment /.test(tip)&&!/developer/.test(tip), tip);

  sec('older rows without a kind still read as the team');
  ok('fbComments: no kind → Team, kind reporter → Reporter', E("JSON.stringify(fbComments(JSON.stringify([{at:'a',text:'x'},{at:'b',text:'y',kind:'reporter'},{at:'c',text:'z',kind:'comment'}])).map(c=>c.reporter))")==='[false,true,false]');

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
