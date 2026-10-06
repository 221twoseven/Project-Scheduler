/* v1.40.1 — Open Issues column labels (owner, 2026-10-06): "add column labels. Main issue is whether
   the date shown is clearly submission date or resolution date, or date of last interaction. Make
   date meaning transparent and clear."
   R1 each list has a label row: Type · Status · Report · Submitted (Open), Type · Report · Resolved
      (Resolved) · R2 the column subtitles say which date the list shows and how it is sorted ·
   R3 every date's hover tip names it in full — submitted, resolved (or, unstamped, "not recorded"
      plus the last change it stands in for) and the latest developer comment.
   Run: node tests/test-v1401.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/function fbWhenTip\(/.test(src)){
  console.log('  SKIP  test-v1401: pre-v1.40.1 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const item=(id,created,modified,f)=>({id,createdDateTime:created,lastModifiedDateTime:modified,fields:f});
const FEEDBACK=[
  item('1','2026-09-20T10:00:00Z','2026-09-20T10:00:00Z',{Title:'Open, no comments',kind:'bug',status:''}),
  item('2','2026-09-21T10:00:00Z','2026-09-22T10:00:00Z',{Title:'Open with a reply',kind:'feature',status:'review',
    comments:JSON.stringify([{at:'2026-09-23T10:00:00Z',text:'Looking'},{at:'2026-09-24T12:00:00Z',text:'Note',kind:'comment'}])}),
  item('3','2026-09-25T10:00:00Z','2026-10-02T09:00:00Z',{Title:'Stamped',kind:'bug',status:'resolved',resolvedAt:'2026-09-30T15:00:00Z'}),
  item('4','2026-09-10T10:00:00Z','2026-10-03T08:00:00Z',{Title:'Unstamped',kind:'bug',status:'resolved'})];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const f0=win.fetch;
win.fetch=function(url,init){
  if(String(url).indexOf('ShopTimeline_Feedback')>=0&&(!init||!init.method||init.method==='GET'))
    return Promise.resolve({ok:true,status:200,json:async()=>({value:FEEDBACK}),text:async()=>''});
  return f0.apply(this,arguments);
};

setTimeout(()=>{E("location.hash='#/issues';applyRoute()");setTimeout(main,900);},1300);

function main(){
  const full=iso=>E("fbFullWhen('"+iso+"')");
  const labels=sel=>{const h=q(sel+' > .fb-colhd');return h?[...h.children].map(c=>c.textContent):null;};
  const tip=(list,id)=>{const r=q(list+' .clog-row[data-spid="'+id+'"] > .clog-when');return r?r.title:'';};

  sec('R1 — each list says what its columns are');
  ok('R1: Open issues reads Type · Status · Report · Submitted', (labels('#fb-list')||[]).join('|')==='Type|Status|Report|Submitted', labels('#fb-list'));
  ok('R1: Resolved reads Type · Report · Resolved (no Status: the column is the state)', (labels('#fb-done')||[]).join('|')==='Type|Report|Resolved', labels('#fb-done'));
  ok('R1: the label row sits first, above the reports', q('#fb-list').firstElementChild.classList.contains('fb-colhd')&&q('#fb-done').firstElementChild.classList.contains('fb-colhd'));
  ok('R1: the label row is not a report row (counts and clicks skip it)', !q('.fb-colhd').classList.contains('clog-row')&&qa('#fb-list .clog-row').length===2&&qa('#fb-done .clog-row').length===2);
  ok('R1: labels line up with the cells below (same width classes)', ['fb-kind','fb-st','clog-what','clog-when'].every((c,i)=>q('#fb-list > .fb-colhd').children[i].classList.contains(c)));
  ok('R1: the label row stays put while the list scrolls', /\.fb-colhd\{[^}]*position:sticky;top:0/.test(src));

  sec('R2 — the subtitles say which date and which order');
  const subs=qa('.fb-3col .cd-head .cd-sub').map(e=>e.textContent);
  ok('R2: Open issues — dated when submitted, newest first', subs.some(s=>/Dated when submitted, newest first/.test(s)), subs.join(' | '));
  ok('R2: Resolved — dated when resolved, newest first', subs.some(s=>/Dated when resolved, newest first/.test(s)), subs.join(' | '));

  sec('R3 — the hover tip names every date in full');
  ok('R3: an open report: "Submitted <date, year, time>"', tip('#fb-list',1)==='Submitted '+full('2026-09-20T10:00:00Z'), tip('#fb-list',1));
  ok('R3: an open report with comments adds the latest developer comment', tip('#fb-list',2)==='Submitted '+full('2026-09-21T10:00:00Z')+' · Last developer comment '+full('2026-09-24T12:00:00Z'), tip('#fb-list',2));
  ok('R3: a resolved report leads with Resolved, then Submitted', tip('#fb-done',3)==='Resolved '+full('2026-09-30T15:00:00Z')+' · Submitted '+full('2026-09-25T10:00:00Z'), tip('#fb-done',3));
  ok('R3: an unstamped one says the resolution date is not recorded and names what stands in', tip('#fb-done',4)==='Resolution date not recorded; shown is the report’s last change, '+full('2026-10-03T08:00:00Z')+' · Submitted '+full('2026-09-10T10:00:00Z'), tip('#fb-done',4));
  ok('R3: the full date carries the year', /2026/.test(full('2026-09-20T10:00:00Z')), full('2026-09-20T10:00:00Z'));
  ok('the visible date is unchanged (the short form, v1.34.0)', q('#fb-done .clog-row[data-spid="3"] > .clog-when').textContent===E("clogWhen('2026-09-30T15:00:00Z')"));

  sec('empty lists carry no label row');
  E("FB_CACHE=[];FB_AT=Date.now();fbPaintList()");
  setTimeout(()=>{
    ok('no reports → the empty note, no orphan labels', !q('#fb-list .fb-colhd')&&!!q('#fb-list .clog-empty')&&!q('#fb-done .fb-colhd'));
    console.log('\n'+'-'.repeat(46));
    console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
    process.exit(fail?1:0);
  },300);
}
