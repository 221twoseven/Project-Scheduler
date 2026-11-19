/* v1.62.2 — item 52 step 3, the second surface: My Dashboard's bottom panel, given the
   project inspector's look (v1.62.1). Owner, 2026-11-19: build it with Title Case headings.
   R1 the column headings read Working On, Time Off, Milestones, Notes (and Your Stale
   Projects when there are some), 13px/600, not small capitals · R2 the header: the name 14px/600,
   the line under it 12px · R3 rows 13px and at least 28px, dates 12px sans with aligned
   numerals, the NOW tag in the success tokens with chip corners · R4 User Notes is the
   inspector's notes box (no dashboard-only override, no halo), with the 2px focus ring ·
   R5 the thought popover's fields have a visible edge (control line, 32px).
   Run: node tests/test-v1622.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'H1',deadline:D(45),status:'auto',
  projectManager:'Theo',drafter:'',leadFab:'Milo',activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-30),sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Milo',startDate:D(-2),endDate:D(3),
  estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:'Armature build'}];

sec('R2–R5: the recipes in the source');
ok('R2 header name 14px/600 in the text token', /font-size:14px;line-height:1\.4;font-weight:600;color:var\(--ts-text\)/.test(rule('.md-hd .t')));
ok('R2 the line under it 12px', /font-size:12px/.test(rule('.md-hd .sub')));
ok('R2 collapsed, the header pads 8px so the 27px toggle fits the 45px bar',
  /padding-top:8px;padding-bottom:8px/.test(rule('body.me-dock-col .md-hd'))&&/height:45px/.test(rule('body.me-dock-on.me-dock-col #me-dock')));
ok('R3 rows 13px, at least 28px', /min-height:28px/.test(rule('.md-row'))&&/font-size:13px/.test(rule('.md-row')));
ok('R3 dates 12px, sans, aligned numerals', /font-size:12px;font-variant-numeric:tabular-nums/.test(rule('.md-when'))&&!/--mono/.test(rule('.md-when')));
ok('R3 NOW tag: success tokens, chip corners', /var\(--ts-success-text\)/.test(rule('.md-tag'))&&/var\(--ts-success-bg\)/.test(rule('.md-tag'))
  &&/var\(--ts-radius-chip\)/.test(rule('.md-tag')));
ok('R4 no dashboard-only notes override any more', !rule('#me-dock .ins-notes')&&!rule('#me-dock .ins-notes:focus'));
ok('R4 the 2px focus ring covers the dashboard panel', /#me-dock :focus-visible\{outline:2px solid var\(--ts-action\);outline-offset:2px\}/.test(raw));
ok('R5 thought popover fields: control line, 32px', /min-height:32px/.test(rule('#md-tpop select,#md-tpop input[type=text],#md-tpop input[type=url]'))
  &&/var\(--ts-control-line\)/.test(rule('#md-tpop select,#md-tpop input[type=text],#md-tpop input[type=url]')));

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s);
setTimeout(()=>{
  E("PEOPLE=[{id:'a',name:'Milo',email:'milo@example.com',role:'Lead Fabricator',depts:['fab'],ooo:[{id:'o1',start:'"+D(10)+"',end:'"+D(14)+"',note:'PTO'}]}];rebuildStaff();");
  E("LENS='dept';PERSON='Milo';render();");

  sec('R1: the column headings');
  const hs=[...win.document.querySelectorAll('#me-dock .ins-sec>h4')].map(h=>h.firstChild.textContent.trim());
  ok('Working On · Time Off · Milestones · Notes', ['Working On','Time Off','Milestones','Notes'].every(t=>hs.includes(t)),hs.join(' | '));
  const h4=win.document.querySelector('#me-dock .ins-sec>h4');
  ok('…rendered without capitals, 13px', !!h4&&win.getComputedStyle(h4).textTransform!=='uppercase'&&win.getComputedStyle(h4).fontSize==='13px',
    h4&&win.getComputedStyle(h4).fontSize);
  ok('"Your Stale Projects" is written in Title Case in the source', raw.includes("'<h4>Your Stale Projects<span class=\"n\">'"));

  sec('R3: a row on the panel');
  const row=win.document.querySelector('#me-dock .md-row');
  ok('a Working On row renders at 13px', !!row&&win.getComputedStyle(row).fontSize==='13px',row&&win.getComputedStyle(row).fontSize);
  const tag=win.document.querySelector('#me-dock .md-tag');
  ok('the active bar still carries NOW', !!tag&&tag.textContent==='NOW');

  done();
},600);
