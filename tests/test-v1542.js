/* v1.54.2 — item 84: a long changelog detail (a bulk change lists every record it touched)
   shows its first four lines and folds the rest under a native <details> ("N more"), the
   way a feedback report's comments fold. Checked on the Changelog page and the project
   page's Changelog dock (the draft page has no dock).
   Run: node tests/test-v1542.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',deadline:D(40),status:'in-fabrication',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-20),sortIndex:0}];
const tasks=Array.from({length:25},(_,i)=>({appId:'t'+i,projectId:'p1',department:'fab',assignee:'Sam',
  startDate:D(-5),endDate:D(10),estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}));
const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s),calls=()=>win.__spCalls;

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

const lines=el=>el?el.textContent.split('\n').length:0;
function folded(root,n,label){
  const det=root&&root.querySelector('.clog-what > .clog-det');
  const more=root&&root.querySelector('.clog-what > details.clog-more');
  ok(label+': the first four lines show',lines(det)===4,lines(det));
  ok(label+': the rest folds, closed',!!more&&!more.open);
  ok(label+': the fold reads "'+(n-4)+' more"',!!more&&more.querySelector('summary').textContent===(n-4)+' more',more&&more.querySelector('summary').textContent);
  ok(label+': every line is still there',lines(det)+lines(more&&more.querySelector('.clog-det'))===n);
}

async function main(){
  sec('a bulk change folds on the Changelog page');
  const n0=calls().length;
  E("saveState({projects:ST.projects,tasks:ST.tasks.map(t=>({...t,assignee:'Dana'}))})");
  await wait(500);
  const row=calls().slice(n0).filter(c=>c.method==='POST'&&/ShopTimeline_Changelog/.test(c.url)).map(c=>c.body.fields)[0]||{};
  ok('25 phase edits write one "Bulk change" row',row.Title==='Bulk change'&&row.field==='25 records',row.Title+' / '+row.field);
  const bulk={...row,title:row.Title,at:row.at||new Date().toISOString()};
  /* a short multi-field edit on p1, for the dock */
  const long={title:'Phase “Fab”',projectId:'p1',who:'Sam',at:new Date().toISOString(),field:'a, b, c, d, e, f, g',
    detail:['a','b','c','d','e','f','g'].map(k=>k+': 1 → 2').join('\n')};
  const short={...long,field:'a, b, c, d, e, f',detail:long.detail.split('\n').slice(0,6).join('\n')};
  E("clogFetch=async()=>"+JSON.stringify([bulk,long,short]));
  win.location.hash='#/changelog';await wait(500);
  const rows=doc.querySelectorAll('#clog-list .clog-row');
  folded(rows[0],25,'bulk row');
  folded(rows[1],7,'7-line edit');
  ok('six lines or fewer stay as they were, no fold',!rows[2].querySelector('details')&&lines(rows[2].querySelector('.clog-det'))===6);
  const qi=q('#clog-q');
  qi.value='g: 1'; /* the 7-line edit's last line, inside its fold */qi.dispatchEvent(new win.Event('input',{bubbles:true}));
  ok('the filter still finds a line inside the fold',doc.querySelectorAll('#clog-list .clog-row').length===1);
  win.location.hash='#/';await wait(300);

  sec('the project page Changelog dock folds the same way');
  win.location.hash='#/project/p1';await wait(600);
  E("ppClogShow(true)");await wait(200);
  const dock=doc.querySelectorAll('#pp-clog-list .clog-row');
  ok('the dock lists the two p1 rows, not the bulk row',dock.length===2,dock.length);
  folded(dock[0],7,'dock');
  E("ppClogShow(false)");win.location.hash='#/';await wait(300);

  sec('style');
  ok('the fold summary uses the .fb-cm muted look',/\.fb-cm summary,\.clog-more summary\{[^}]*color:var\(--ts-muted\)/.test(src));
  ok('the fold summary keeps the 24px hit box (§9)',/\.fb-dd summary,\.clog-more summary\{[^}]*padding:5px 0;margin:-5px 0/.test(src));
  done();
}
