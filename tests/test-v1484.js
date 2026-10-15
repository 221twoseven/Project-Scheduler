/* v1.48.4 — item 59 (owner, 2026-10-14, option (c)): the Meeting Sheet progress bar measures the
   work done, not the time passed — each block's workdays before today over all blocks' workdays —
   so a gap between blocks never fills it. "Lead time" on the project page is unchanged.
   Fixture dates are relative to today, so the expected numbers are computed the same way.
   Run: node tests/test-v1484.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const iso=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const proj=(id,name)=>({appId:id,Title:name,client:'C',jobCode:id.toUpperCase(),deadline:iso(120),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',activeDepartments:'["td","fab"]',createdAt:'2026-07-01'});
const task=(id,pid,dept,s,e)=>({appId:id,projectId:pid,department:dept,assignee:'',startDate:iso(s),endDate:iso(e),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const DATA={projects:[proj('p1','Gap Job'),proj('p2','Future Job'),proj('p3','Done Job'),proj('p4','Mid Job')],
  tasks:[task('a','p1','td',-40,-30),task('b','p1','fab',30,32),   /* done block, a long gap, a future block */
         task('c','p2','fab',10,20),                                  /* nothing started */
         task('d','p3','fab',-20,-10),                                /* all done */
         task('e','p4','fab',-7,7)],                                  /* today is inside the block */
  staff:[],todos:[]};

const dom=boot(FILE,{data:DATA});
const win=dom.window,E=s=>win.eval(s);

setTimeout(()=>{
  const pct=name=>{const w=E("buildMeetingSheet()");
    const tr=[...w.querySelectorAll('tr.meet-row')].find(r=>(r.querySelector('.mr-name')||{}).textContent===name);
    return tr?parseInt(tr.querySelector('.mm-fill').style.width,10):NaN;};
  const wd=(s,e)=>E("wdCount(parseDate('"+iso(s)+"'),parseDate('"+iso(e)+"'),0)");

  sec('progress is work done over all the work, and a gap never fills it');
  const nA=wd(-40,-30),nB=wd(30,32),want=Math.round(nA/(nA+nB)*100);
  ok('a done block then a gap: the bar shows the done block\'s share', pct('Gap Job')===want, pct('Gap Job')+' vs '+want);
  const timeShare=Math.round(40/72*100); /* the old rule: the share of the calendar span that has passed */
  ok('…not the time passed across the gap', pct('Gap Job')!==timeShare&&want>timeShare);
  ok('nothing started reads 0%', pct('Future Job')===0);
  ok('everything finished reads 100%', pct('Done Job')===100);
  const nE=wd(-7,7),dE=wd(-7,-1),wantE=Math.round(dE/nE*100);
  ok('today inside a block counts its workdays before today', pct('Mid Job')===wantE, pct('Mid Job')+' vs '+wantE);

  sec('the dates under the bar still span first start → last end');
  const w=E("buildMeetingSheet()");
  const row=[...w.querySelectorAll('tr.meet-row')].find(r=>r.querySelector('.mr-name').textContent==='Gap Job');
  ok('the date range is unchanged', row.querySelector('.mm-dates').textContent===
     E("fmtNice('"+iso(-40)+"')")+' → '+E("fmtNice('"+iso(32)+"')"));

  sec('a bar\'s own length still never reads 0');
  ok('wdCount keeps its floor of 1 by default', E("(()=>{const s=new Date(2026,9,17);return wdCount(s,s);})()")===1); /* a Saturday */
  ok('…and counts 0 when asked', E("(()=>{const s=new Date(2026,9,17);return wdCount(s,s,0);})()")===0);

  done();
},1500);
