/* v1.55.2 — items 96 and 97, from the owner's review of 2026-11-19.
   96.1 The phase inspector's Pin checkbox sits beside its words (it stretched to a full row
        and floated under the End date, apart from its label).
   96.2 Hovering a milestone diamond on the timeline shows that milestone alone — its name,
        date and project — not the whole phase tooltip; the "?" help cursor is gone.
   97   A milestone can be assigned to a subtask: the saved project page's phase picker lists
        the bars of any department with more than one; picking one moves the milestone onto
        that bar's own row (drawn on it alone), picking the department moves it back to the
        Events list. Asserted on the outgoing Graph requests.
   Run: node tests/test-v1552.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const staff=[{appId:'s1',Title:'Sam',depts:JSON.stringify(['fab']),ooo:'[]',email:'user@example.com',role:'Fabricator',admin:'1'}];
const projects=[{appId:'p1',Title:'Window Job',client:'C',jobCode:'AB123',deadline:D(40),status:'in-fabrication',
  projectManager:'',drafter:'',leadFab:'Sam',fabricators:'',activeDepartments:JSON.stringify(['fab']),createdAt:D(-20),sortIndex:0}];
const tasks=[
  {appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:D(-5),endDate:D(10),estimatedDays:10,
   ticketNodes:JSON.stringify([{id:'n1',date:D(2),target:'Ship crate',notes:'Two pallets'}]),
   notes:'Long phase notes that should not show',pinned:false,label:''},
  {appId:'t2',projectId:'p1',department:'fab',assignee:'Sam',startDate:D(-2),endDate:D(3),estimatedDays:4,
   ticketNodes:'[]',notes:'',pinned:false,label:'Sample Set 1'}];
const events=[{appId:'e1',projectId:'p1',department:'fab',Title:'To production',date:D(3),notes:''}];
const dom=boot(FILE,{data:{projects,tasks,staff,todos:[],events},eventsList:true});
const win=dom.window,doc=win.document,E=s=>win.eval(s),q=s=>doc.querySelector(s);
const calls=()=>win.__spCalls||[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const pick=id=>q('.ag-i[data-ag-id="'+id+'"] select[data-f="dept"]');

setTimeout(()=>{main().catch(e=>{console.error(e);process.exit(1);});},1300);

async function main(){
  sec('96.2 milestone hover — the milestone alone');
  ok('no "?" help cursor on the diamond',!/\.tick-node\{[^}]*cursor:help/.test(src));
  ok('the diamond hands its milestone id to the tip',
    /tn\.addEventListener\('mouseenter',ev=>\{[^}]*showTooltipTask\(t,ev,n\.id\)/.test(src));
  E("showTooltipTask(taskById('t1'),{clientX:40,clientY:40},'n1')");
  const tip=q('#tooltip');
  const txt=tip?tip.textContent:'';
  ok('the tip is showing',!!tip&&!tip.classList.contains('hidden'));
  ok('its title is the milestone name',/Ship crate/.test((q('#tooltip .tt-title')||{}).textContent||''),txt);
  ok('it names the project and keeps the milestone note',/Window Job/.test(txt)&&/Two pallets/.test(txt),txt);
  ok('the phase notes are not in it',!/Long phase notes/.test(txt),txt);
  E("showTooltipTask(taskById('t1'),{clientX:40,clientY:40})");
  const full=q('#tooltip').textContent;
  ok('the bar tip still shows the phase notes and lists the milestone',/Long phase notes/.test(full)&&/Ship crate/.test(full),full);

  E("location.hash='#/project/p1';applyRoute()");
  await wait(400);
  sec('96.1 pin checkbox — beside its words (saved page)');
  E("ppSelect('t1')");
  const pin=doc.getElementById('ins-pin');
  ok('the Pin checkbox shows on the saved page',!!pin);
  const lbl=pin&&pin.closest('label');
  ok('it sits inside its label',!!lbl&&/Pin dates/.test(lbl.textContent));
  ok('the label lays the box and the words out in a row',!!lbl&&win.getComputedStyle(lbl).display==='flex',
    lbl&&win.getComputedStyle(lbl).display);
  ok('the checkbox is box-sized, not a full-width row',!!pin&&win.getComputedStyle(pin).width==='13px',
    pin&&win.getComputedStyle(pin).width);

  sec('97 milestones on subtasks (saved page)');
  let s=pick('e1');
  ok('the milestone has a phase picker',!!s);
  const opts=s?[...s.options].map(o=>o.value+'='+o.textContent.trim()):[];
  ok('it lists the department and both of its bars',
    opts.includes('fab='+E("deptById('fab').name"))&&opts.some(o=>o.startsWith('sub:t2=')&&/Sample Set 1/.test(o))
    &&opts.some(o=>o.startsWith('sub:t1=')),opts.join(' | '));
  ok('a department-wide milestone has the department selected',!!s&&s.value==='fab',s&&s.value);
  ok('a milestone already on a bar has that bar selected',!!pick('n1')&&pick('n1').value==='sub:t1',pick('n1')&&pick('n1').value);

  let n0=calls().length;
  s.value='sub:t2';change(s);
  await wait(400);
  ok('the milestone leaves the Events list',!E("ST.events.some(e=>e.id==='e1')"));
  ok('…and rides on the subtask\'s row, same id and name',
    E("JSON.stringify(taskById('t2').ticketNodes)").includes('"id":"e1"')&&E("taskById('t2').ticketNodes[0].target")==='To production');
  let cs=calls().slice(n0);
  ok('Graph: the Events row is deleted',cs.some(c=>c.method==='DELETE'&&/ShopTimeline_Events/.test(c.url)),cs.map(c=>c.method+' '+c.url.split('/lists/')[1]).join(' ; '));
  ok('Graph: the subtask\'s row is written with the milestone',
    cs.some(c=>/ShopTimeline_Tasks\b/.test(c.url)&&c.body&&String((c.body.fields||c.body).ticketNodes||'').includes('e1')));
  ok('the timeline draws it on the subtask\'s bar only',
    E("barNodes(taskById('t2')).some(n=>n.id==='e1')")&&!E("barNodes(taskById('t1')).some(n=>n.id==='e1')"));
  ok('the picker now reads the subtask',!!pick('e1')&&pick('e1').value==='sub:t2',pick('e1')&&pick('e1').value);

  n0=calls().length;
  s=pick('e1');s.value='fab';change(s);
  await wait(400);
  ok('back to the department: it is an Events row again',E("ST.events.some(e=>e.id==='e1'&&e.dept==='fab')"));
  ok('…and off the subtask\'s row',!E("(taskById('t2').ticketNodes||[]).some(n=>n.id==='e1')"));
  cs=calls().slice(n0);
  ok('Graph: the Events row is created again',cs.some(c=>c.method==='POST'&&/ShopTimeline_Events/.test(c.url)));

  sec('97 My Dashboard lists a milestone that rides on a bar');
  E("location.hash='';applyRoute();LENS='project';enterDash('Sam')");
  const dock=[...doc.querySelectorAll('#me-dock .md-row .md-main')].map(e=>e.textContent);
  ok('the bar\'s milestone is in the Milestones list',dock.some(t=>/Ship crate/.test(t)),JSON.stringify(dock));
  ok('…beside the Events-list one',dock.some(t=>/To production/.test(t)),JSON.stringify(dock));

  sec('97 the new-project draft keeps the department picker');
  ok('a draft milestone picks a department only (no subtasks until the job is saved)',
    /NPV_LIVE\?msHostOptions\(p,r\.dept,r\.host\):deptOptions\(r\.dept\)/.test(src));
  done();
}
