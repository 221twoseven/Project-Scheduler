/* v1.34.0 — Open Issues (owner, 2026-10-05):
   R1 the Resolved column shows the date a report was resolved (`resolvedAt`, stamped by the
      tracker's poller; the row's last change stands in before the column exists), not the
      date it was sent, and lists the most recently resolved first · R2 the BUG / IDEA chips
      share one width so every subject starts on the same line · R3 a `/comment` from the
      ticket (kind:'comment' in the comments JSON) shows as a developer comment like a reply.
   Run: node tests/test-v1340.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('const fbDoneAt=')<0){
  console.log('  SKIP  test-v1340: pre-v1.34.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* the list as Graph returns it — createdDateTime, lastModifiedDateTime and the fields */
const item=(id,created,modified,f)=>({id,createdDateTime:created,lastModifiedDateTime:modified,fields:f});
const FEEDBACK=[
  item('1','2026-09-20T10:00:00Z','2026-09-20T10:00:00Z',{Title:'Open one',kind:'bug',status:''}),
  item('2','2026-09-25T10:00:00Z','2026-10-02T09:00:00Z',{Title:'Stamped',kind:'feature',status:'resolved',resolvedAt:'2026-09-30T15:00:00Z',
    comments:JSON.stringify([{at:'2026-09-26T10:00:00Z',text:'Fixed'},{at:'2026-09-27T10:00:00Z',text:'Shop note',kind:'comment'}])}),
  item('3','2026-09-10T10:00:00Z','2026-10-03T08:00:00Z',{Title:'Unstamped',kind:'bug',status:'resolved'}),
  item('4','2026-09-28T10:00:00Z','2026-09-29T10:00:00Z',{Title:'Early stamp',kind:'bug',status:'resolved',resolvedAt:'2026-09-29T10:00:00Z'})];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
/* the harness answers unknown lists with {value:[]}; wrap it so ShopTimeline_Feedback has rows */
const f0=win.fetch;
win.fetch=function(url,init){
  if(String(url).indexOf('ShopTimeline_Feedback')>=0&&(!init||!init.method||init.method==='GET'))
    return Promise.resolve({ok:true,status:200,json:async()=>({value:FEEDBACK}),text:async()=>''});
  return f0.apply(this,arguments);
};

setTimeout(()=>{E("location.hash='#/issues';applyRoute()");setTimeout(main,900);},1300);

function main(){
  const when=sel=>qa(sel).map(r=>r.querySelector(':scope > .clog-when').textContent);
  const nice=iso=>E("clogWhen('"+iso+"')");
  sec('R1 — the Resolved column dates a report by when it was resolved');
  const done=qa('#fb-done .clog-row');
  ok('three resolved rows, one open', done.length===3&&qa('#fb-list .clog-row').length===1, done.length+'/'+qa('#fb-list .clog-row').length);
  ok('most recently resolved first: Unstamped (last change Oct 3) · Stamped (Sep 30) · Early stamp (Sep 29)',
     done.map(r=>r.dataset.spid).join()==='3,2,4', done.map(r=>r.dataset.spid).join());
  ok('a stamped row shows resolvedAt, not its send date', when('#fb-done .clog-row[data-spid="2"]')[0]===nice('2026-09-30T15:00:00Z'), when('#fb-done .clog-row[data-spid="2"]')[0]);
  ok('an unstamped row shows its last change (the status flip), not its send date', when('#fb-done .clog-row[data-spid="3"]')[0]===nice('2026-10-03T08:00:00Z'), when('#fb-done .clog-row[data-spid="3"]')[0]);
  ok('the date carries a "Resolved on" title', done.every(r=>r.querySelector(':scope > .clog-when').title==='Resolved on'));
  ok('an open row still shows when it was sent', when('#fb-list .clog-row[data-spid="1"]')[0]===nice('2026-09-20T10:00:00Z'), when('#fb-list .clog-row[data-spid="1"]')[0]);
  ok('fbDoneAt falls back resolvedAt → modified → at', E("fbDoneAt({resolvedAt:'a',modified:'b',at:'c'})+fbDoneAt({resolvedAt:'',modified:'b',at:'c'})+fbDoneAt({at:'c'})")==='abc');

  sec('R2 — the kind chips share one width');
  const chips=qa('#fb-list .cd-perm:not(.fb-st), #fb-done .cd-perm:not(.fb-st)'); /* v1.39.0 adds a status tag beside the kind chip */
  ok('every BUG / IDEA chip carries .fb-kind', chips.length===4&&chips.every(c=>c.classList.contains('fb-kind')), chips.length);
  ok('.fb-kind is a fixed flex column, centred', /\.fb-kind\{flex:0 0 \d+px;text-align:center/.test(src));

  sec('R3 — a /comment shows as a developer comment');
  const cm=q('#fb-done .clog-row[data-spid="2"] details.fb-cm');
  ok('the stamped row folds two developer comments', !!cm&&/^2 developer comments$/.test(cm.querySelector('summary').textContent), cm&&cm.querySelector('summary').textContent);
  ok('…the reply and the /comment, in order', cm&&[...cm.querySelectorAll('.clog-det')].map(d=>d.textContent).join('|')==='Fixed|Shop note');
  ok('fbComments keeps a kind-tagged entry', E("fbComments('[{\"at\":\"t\",\"text\":\"x\",\"kind\":\"comment\"}]').length")===1);

  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
