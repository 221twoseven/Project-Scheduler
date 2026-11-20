/* v1.62.5 — item 52 step 5, the first business page: Open Issues to the wireframes. Owner,
   2026-11-20: "Yes, with wording" (the mock, with the wording change).
   R1 each column's heading sits above its line, in Title Case: "Report a Bug or Request a
   Feature", "Open Issues", "Resolved" · R2 the column labels are the wireframes' soft table
   header, as written (no capitals, no code font), and the date column shows its order (↓) ·
   R3 the chips read as written — Bug, Idea, Pending, In review — in the page's type · R4 rows
   are 13px · R5 the reply email's link (#/issues/<id>) still opens and marks that report.
   Run: node tests/test-v1625.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};

sec('R1–R4: the recipes in the source');
ok('R1 a column heading sits above its line', /flex-direction:column/.test(rule('.fb-3col .cd-head')));
ok('R1 …17px, 600, the text token', /font-size:17px/.test(rule('.fb-3col .cd-head h2'))&&/font-weight:600/.test(rule('.fb-3col .cd-head h2')));
ok('R2 the label row is not capitals and not the code font', !/uppercase|--mono/.test(rule('.fb-colhd'))&&/font-size:11px/.test(rule('.fb-colhd')),rule('.fb-colhd'));
ok('R3 chips use the page type, 11px, the chip corner', /font-family:inherit;font-size:11px/.test(rule('.cd-perm.fb-kind,.cd-perm.fb-st'))&&/--ts-radius-chip/.test(rule('.cd-perm.fb-kind,.cd-perm.fb-st')));
ok('R4 rows are 13px', /font-size:13px/.test(rule('.fb-3col .clog-row')));

const item=(id,created,f)=>({id,createdDateTime:created,lastModifiedDateTime:created,fields:f});
const FEEDBACK=[
  item('1','2026-11-18T10:00:00Z',{Title:'Bug — A bug',kind:'bug',status:''}),
  item('2','2026-11-12T10:00:00Z',{Title:'Feature — An idea',kind:'feature',status:'review',description:'More detail'}),
  item('3','2026-11-02T10:00:00Z',{Title:'Bug — Fixed one',kind:'bug',status:'resolved',resolvedAt:'2026-11-09T10:00:00Z'})];
const dom=boot(FILE,{url:'https://example.github.io/Project-Scheduler/timeline/#/issues/2',data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const f0=win.fetch;
win.fetch=function(url,init){
  if(String(url).indexOf('ShopTimeline_Feedback')>=0&&(!init||!init.method||init.method==='GET'))
    return Promise.resolve({ok:true,status:200,json:async()=>({value:FEEDBACK}),text:async()=>''});
  return f0.apply(this,arguments);
};
setTimeout(()=>{E('applyRoute()');setTimeout(main,900);},1300);

function main(){
  sec('R1: the column headings, as rendered');
  const hs=qa('.fb-3col .cd-head h2').map(h=>h.textContent);
  ok('R1 the three headings in Title Case', hs.join('|')==='Report a Bug or Request a Feature|Open Issues|Resolved', hs.join('|'));
  const h=q('.fb-3col .cd-head');
  ok('R1 …the heading above its line (rendered)', !!h&&win.getComputedStyle(h).flexDirection==='column');

  sec('R2: the label row');
  const lab=q('#fb-list > .fb-colhd');
  ok('R2 the label row renders as written', !!lab&&win.getComputedStyle(lab).textTransform!=='uppercase');
  const when=lab&&lab.querySelector('.clog-when');
  ok('R2 the date column shows its order, hidden from screen readers (the line says it)', !!when&&/Submitted ↓/.test(when.textContent)&&when.querySelector('[aria-hidden="true"]').textContent==='↓');

  sec('R3: the chips');
  const kinds=qa('#fb-list .clog-row .fb-kind, #fb-done .clog-row .fb-kind').map(c=>c.textContent),st=qa('#fb-list .clog-row .fb-st').map(c=>c.textContent);
  ok('R3 kind chips read Bug and Idea', kinds.join('|')==='Bug|Idea|Bug', kinds.join('|'));
  ok('R3 status chips read Pending and In review', st.join('|')==='Pending|In review', st.join('|'));
  ok('R3 …Pending keeps its muted style', q('#fb-list .fb-st.fb-pend')&&q('#fb-list .fb-st.fb-pend').textContent==='Pending');

  sec('R5: the reply email\'s link');
  const hit=q('.clog-row.fb-hit');
  ok('R5 #/issues/2 marks that report and opens its text', !!hit&&hit.dataset.spid==='2'&&!!hit.querySelector('details.fb-dd[open]'));
  done();
}
