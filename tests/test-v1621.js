/* v1.62.1 — item 52 step 3: the project inspector restyled to the wireframes and the
   application style guide (§4 type, §5 spacing and radii, §6 buttons and dialogs, §9 focus).
   Owner, 2026-11-19: headings stay Title Case ("Project Team", "Project Schedule"), no
   sentence case; 36px fields are fine.
   R1 the inspector's column headings read as written, 13px/600, not small capitals — on a
   saved project and on the New Project draft (the REV49 lesson) · R2 a selected phase reads
   "This Phase" and "On This Phase" · R3 fields are 36px with 6px corners and labels are 12px
   sentence-weight text, not capitals · R4 buttons are 32px; Delete uses the danger text colour ·
   R5 focus is a 2px ring offset 2px, never the faint glow; no inspector field turns the outline
   off · R6 the milestone row's × is readable (muted text, not #CBD6E4) · R7 every modal keeps
   Tab inside it and gives focus back to its opener when it closes · R8 My Dashboard's dock,
   which shares .ins-sec, keeps its headings until its own step.
   Run: node tests/test-v1621.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'WMU004',deadline:'2026-12-20',status:'auto',
  projectManager:'Sam',drafter:'',leadFab:'',fabricators:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-11-01',sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-11-05',endDate:'2026-11-20',
  estimatedDays:10,ticketNodes:'[]',notes:'',pinned:false,label:''}];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["fab"]',ooo:'[]',role:'',admin:'1'};
const URL0='https://example.github.io/Project-Scheduler/timeline/';
const start=hash=>boot(FILE,{url:URL0+hash,data:{projects,tasks,staff:[SAM],todos:[]}}).window;
const heads=w=>[...w.document.querySelectorAll('#pp-insp .ins-sec>h4')].map(h=>h.firstChild.textContent.trim());

sec('R3–R6: the recipes in the source');
ok('R3 fields: 36px, 6px corners, 13px text', /min-height:36px/.test(rule('.ins-f input,.ins-f select,.ins-f textarea'))
  &&/border-radius:var\(--ts-radius-control\)/.test(rule('.ins-f input,.ins-f select,.ins-f textarea'))
  &&/font-size:13px/.test(rule('.ins-f input,.ins-f select,.ins-f textarea')));
ok('R3 …a tick box inside a field keeps its own size', /min-height:0/.test(rule('.ins-f input[type=checkbox],.ins-f input[type=radio]')));
ok('R3 labels: 12px, not capitals', /font-size:12px/.test(rule('.ins-f>label'))&&!/uppercase/.test(rule('.ins-f>label')));
ok('R4 buttons: 32px, 12px padding, 6px corners', /min-height:32px/.test(rule('.ins-btn'))&&/padding:0 12px/.test(rule('.ins-btn'))
  &&/var\(--ts-radius-control\)/.test(rule('.ins-btn')));
ok('R4 …Delete in the danger text colour', /color:var\(--ts-danger-text\)/.test(rule('.ins-btn.dngr')));
ok('R4 …Close is the same 32px secondary button', /min-height:32px/.test(rule('.ins-hd .x')));
ok('R5 focus: a 2px ring offset 2px on the inspector and its popover',
  /#pp-insp :focus-visible,\.npv-pop :focus-visible\{outline:2px solid var\(--ts-action\);outline-offset:2px\}/.test(raw));
const insCss=raw.slice(raw.indexOf('/* --- inspector --- */'),raw.indexOf('/* --- selection --- */'));
ok('R5 …no inspector field turns the outline off or draws the faint glow',
  insCss.length>1000&&!/outline:none/.test(insCss)&&!/rgba\(59,127,214,\.12\)/.test(insCss));
ok('R6 the milestone row × is muted text in a 28px box', /color:var\(--ts-muted\)/.test(rule('.ag-i .del'))&&/width:28px;height:28px/.test(rule('.ag-i .del')));
ok('R1 headings: 13px/600, as written', /font-size:13px/.test(rule('#pp-insp .ins-sec>h4'))&&/text-transform:none/.test(rule('#pp-insp .ins-sec>h4')));
ok('R8 the shared .ins-sec>h4 rule (My Dashboard) is untouched', /text-transform:uppercase/.test(rule('.ins-sec>h4')));

(async()=>{
  sec('R1: a saved project');
  let w=start('#/project/p1');await wait(500);
  let h=heads(w);
  ok('the columns read Setup, Project Team, Project Schedule, Milestones & Notes',
    ['Setup','Project Team','Project Schedule','Milestones & Notes'].every(t=>h.includes(t)),h.join(' | '));
  const h4=w.document.querySelector('#pp-insp .ins-sec>h4');
  ok('…and render without capitals', h4&&w.getComputedStyle(h4).textTransform==='none');

  sec('R2: a selected phase');
  w.ppSelect('t1');await wait(200);
  h=heads(w);
  ok('This Phase · On This Phase · Notes', ['This Phase','On This Phase','Notes'].every(t=>h.includes(t)),h.join(' | '));
  const del=w.document.getElementById('ins-del');
  ok('Delete is still there, styled as danger', del&&del.classList.contains('dngr'));

  sec('R1: the New Project draft');
  const d=start('#/project/new');await wait(500);
  h=heads(d);
  ok('the draft shows the same Title Case columns',
    ['Setup','Project Team','Project Schedule','Milestones & Notes'].every(t=>h.includes(t)),h.join(' | '));
  const dl=d.document.getElementById('pp-deadline');
  ok('…with the target date field at 36px', !!dl&&d.getComputedStyle(dl).minHeight==='36px',dl&&d.getComputedStyle(dl).minHeight);
  const nm=w.document.getElementById('ins-name');
  ok('…as on the saved page (the phase Name field)', !!nm&&w.getComputedStyle(nm).minHeight==='36px');

  sec('R7: modals keep the keyboard and give it back');
  const doc=w.document,opener=doc.getElementById('ins-dup')||doc.querySelector('#pp-insp button');
  opener.focus();
  ok('the opener has focus first', doc.activeElement===opener);
  const ov=doc.getElementById('meet-overlay');
  ov.classList.remove('hidden');await wait(20);
  ok('opening a modal moves focus into it', ov.contains(doc.activeElement),doc.activeElement&&doc.activeElement.id);
  const f=w.modalFocusables(ov);
  f[f.length-1].focus();
  doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
  ok('Tab on the last control wraps to the first', doc.activeElement===f[0]);
  doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
  ok('Shift+Tab on the first wraps to the last', doc.activeElement===f[f.length-1]);
  ov.classList.add('hidden');await wait(20);
  ok('closing it hands focus back to the opener', doc.activeElement===opener,doc.activeElement&&(doc.activeElement.id||doc.activeElement.tagName));
  const tov=doc.getElementById('task-overlay');
  w.openTaskModal('t1');await wait(20);
  ok('the phase editor opens with its own field focused (the opener\'s choice wins)', doc.activeElement&&doc.activeElement.id==='tm-name');
  w.closeTaskModal(true);await wait(20);
  ok('…and closes back to where focus was', tov.classList.contains('hidden')&&doc.activeElement===opener,doc.activeElement.id||doc.activeElement.tagName);
  w.openTaskModal('t1');await wait(20);
  ov.classList.remove('hidden');await wait(20);
  w.closeTaskModal(true);await wait(20);
  ok('a modal closing under another leaves focus in the one still open', ov.contains(doc.activeElement),doc.activeElement.id||doc.activeElement.tagName);
  ov.classList.add('hidden');await wait(20);

  sec('R8: My Dashboard keeps its User Notes look');
  ok('#me-dock .ins-notes keeps its padding, size and halo', rule('#me-dock .ins-notes').includes('padding:7px 9px;font-size:12.5px')
    &&rule('#me-dock .ins-notes:focus').includes('rgba(59,127,214,.12)'));

  done();
})();
