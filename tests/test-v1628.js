/* v1.62.8 — item 52 step 5: the project page to the wireframes. Owner, 2026-11-20: "Yes, build it"
   (the mock). R1 the summary line's labels are as written (no micro-caps) and its values 13px ·
   R2 the Schedule heading as written · R3 the chart's Milestones and Notes rows upright · R4 the
   Kickoff line 12px. Asserted on a saved project and on the new-project draft (the REV49 lesson).
   Run: node tests/test-v1628.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

sec('R1–R4: the recipes in the source');
ok('R1 summary labels are as written, 12px', !/uppercase/.test(rule('.dash-meta .k'))&&/font-size:12px/.test(rule('.dash-meta .k')));
ok('R1 …values 13px in the text token', /font-size:13px/.test(rule('.dash-meta .v'))&&/var\(--ts-text\)/.test(rule('.dash-meta .v')));
ok('R2 Schedule is 13px/600 as written', !/uppercase/.test(rule('.npv-ttl'))&&/font-size:13px/.test(rule('.npv-ttl'))&&/font-weight:600/.test(rule('.npv-ttl')));
ok('R3 Milestones and Notes are upright', !/italic/.test(rule('.npv-row.extra .npv-gut')));
ok('R4 the Kickoff line is 12px', /font-size:12px/.test(rule('.npv-foot')));

const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["pm"]',ooo:'[]',role:'',admin:'1'};
const P={appId:'p1',Title:'Lobby wall',client:'Alder Studio',jobCode:'ALD-1',deadline:D(40),status:'auto',projectManager:'Sam',
  drafter:'',leadFab:'',fabricators:'',activeDepartments:'["pm","td","fab"]',createdAt:D(-5),sortIndex:0};
const T=(id,dept,s,e)=>({appId:id,projectId:'p1',department:dept,assignee:'',startDate:s,endDate:e,estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''});
const URL0='https://example.github.io/Project-Scheduler/timeline/';
const start=hash=>boot(FILE,{url:URL0+hash,data:{projects:[P],tasks:[T('t1','td',D(1),D(10)),T('t2','fab',D(11),D(30))],staff:[SAM],todos:[]}}).window;

(async()=>{
  for(const [name,hash] of [['saved project','#/project/p1'],['new-project draft','#/project/new']]){
    sec('as rendered: the '+name);
    const w=start(hash);await wait(1200);const d=w.document;
    const ks=[...d.querySelectorAll('#pp-meta .k')].map(e=>e.textContent);
    ok('R1 '+name+': the labels read Client and Cost code', ks.includes('Client')&&ks.includes('Cost code'),ks.join(', '));
    ok('R2 '+name+': the chart heading reads Schedule', (d.getElementById('npv-nums')||{}).textContent==='Schedule');
    ok('R4 '+name+': the Kickoff line is there', /Kickoff/.test((d.getElementById('npv-foot')||{}).textContent||''));
  }
  done();
})();
