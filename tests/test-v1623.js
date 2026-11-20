/* v1.62.3 — item 52 step 3, the third surface: the dialogs (Edit Phase, Print Preview,
   Meeting Sheet, the late-project prompt, sign-in expired, the demo slides), given the
   wireframes' dialog. Owner, 2026-11-20: "Yes, build it" (the mock); titles keep their wording.
   R1 the dialog: 10px corners, a 1px edge, the shared floating shadow, no blur behind · R2 the
   title 17px/600 in the text token · R3 labels 12px, not capitals; fields 36px, white, 6px
   corners, no faint glow · R4 buttons 32px; a plain .btn and .btn-ghost are the white
   secondary button; Delete is red text; a disabled button shows no hover · R5 the 2px focus
   ring covers dialogs · R6 the crew list's names render in normal type beside their tick
   boxes (the .fg label rule no longer outranks it) · R7 milestone rows: 28px fields, a muted ×
   in a 28px box · R8 Meeting Sheet's Orientation is a row of choices like Paper.
   Run: node tests/test-v1623.js timeline/index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,raw,ok,done}=suite();
const sec=t=>console.log('\n'+t);
const rule=sel=>{const i=raw.indexOf('\n'+sel+'{');return i<0?'':raw.slice(i+1,raw.indexOf('}',i));};

sec('R1–R5, R7: the recipes in the source');
ok('R1 the dialog: 10px corners, a 1px edge, the shared shadow', /border:1px solid var\(--ts-line\);border-radius:10px/.test(rule('.modal'))
  &&/box-shadow:0 4px 18px rgba\(13,19,29,\.18\)/.test(rule('.modal')));
ok('R1 …no blur behind it', !/backdrop-filter/.test(rule('.overlay')));
ok('R2 the title: 17px/600, text token', /font-size:17px;line-height:1\.3;font-weight:600;color:var\(--ts-text\)/.test(rule('.modal h3')));
ok('R3 labels: 12px, not capitals', /font-size:12px/.test(rule('.fg label'))&&!/uppercase/.test(rule('.fg label')));
const fld=rule('.fg input,.fg select,.fg textarea');
ok('R3 fields: 36px, white, 6px corners, no outline:none', /min-height:36px/.test(fld)&&/background:#fff/.test(fld)
  &&/var\(--ts-radius-control\)/.test(fld)&&!/outline:none/.test(fld));
ok('R3 …and no faint glow on focus', !/rgba\(47,111,228,\.13\)/.test(raw));
ok('R4 buttons: 32px, 12px padding, white with an edge', /min-height:32px;padding:0 12px/.test(rule('.btn'))&&/border:1px solid var\(--ts-line\);background:#fff/.test(rule('.btn')));
ok('R4 …primary is the action blue', /background:var\(--ts-action\)/.test(rule('.btn-primary')));
ok('R4 …Delete is red text', /color:var\(--ts-danger-text\)/.test(rule('.btn-del')));
ok('R4 …a disabled button shows no hover', raw.includes('\n.btn:hover:not(:disabled){'));
ok('R5 the 2px focus ring covers dialogs', /,\.modal :focus-visible\{outline:2px solid var\(--ts-action\);outline-offset:2px\}/.test(raw));
ok('R7 milestone × is muted in a 28px box', /color:var\(--ts-muted\)/.test(rule('.tn-x'))&&/width:28px;height:28px/.test(rule('.tn-x')));

const projects=[{appId:'p1',Title:'Window Job',client:'Hermes',jobCode:'H1',deadline:'2026-12-20',status:'auto',
  projectManager:'Sam',drafter:'',leadFab:'',activeDepartments:JSON.stringify(['pm','fab']),createdAt:'2026-11-01',sortIndex:0}];
const tasks=[{appId:'t1',projectId:'p1',department:'fab',assignee:'Sam',startDate:'2026-11-05',endDate:'2026-11-20',
  estimatedDays:10,ticketNodes:JSON.stringify([{id:'n1',date:'2026-11-10',target:'Weld check',notes:''}]),notes:'',pinned:false,label:''}];
const SAM={appId:'s1',Title:'Sam',email:'user@example.com',depts:'["fab"]',ooo:'[]',role:'',admin:'1'};
const dom=boot(FILE,{data:{projects,tasks,staff:[SAM],todos:[]}});
const w=dom.window,doc=w.document,cs=e=>w.getComputedStyle(e);
setTimeout(()=>{
  w.openTaskModal('t1');
  setTimeout(()=>{
    sec('Edit Phase, as rendered');
    const h=doc.getElementById('tm-head');
    ok('R2 the title renders 17px', cs(h).fontSize==='17px',cs(h).fontSize);
    const lb=doc.querySelector('#task-overlay .fg>label');
    ok('R3 a label renders 12px, not capitals', cs(lb).fontSize==='12px'&&cs(lb).textTransform!=='uppercase',cs(lb).fontSize+' '+cs(lb).textTransform);
    ok('R3 the Name field is 36px', cs(doc.getElementById('tm-name')).minHeight==='36px');
    const pin=doc.getElementById('tm-pin');
    ok('R3 …a tick box keeps its own size', !!pin&&/min-height:0/.test(rule('.fg input[type=checkbox],.fg input[type=radio]')));
    ok('R4 Save is the primary, Cancel the secondary', doc.getElementById('tm-save').classList.contains('btn-primary')&&cs(doc.getElementById('tm-cancel')).minHeight==='32px');
    /* jsdom settles the cascade by source order, not specificity, so the row is read from the rule */
    const crew=doc.querySelector('#tm-crew label');
    ok('R6 a crew name is in normal type', !!crew&&cs(crew).textTransform!=='uppercase');
    ok('R6 …in a row beside its tick box: the crew rule outranks .fg label', /display:flex;gap:8px;align-items:center;margin:0;min-height:28px;font-size:13px/.test(rule('.crew-list label,.fg .crew-list label')));
    const tn=doc.querySelector('#tm-tnlist .tn-row input');
    ok('R7 a milestone row field is 28px', !!tn&&cs(tn).minHeight==='28px',tn&&cs(tn).minHeight);
    w.closeTaskModal(true);

    sec('R8: Meeting Sheet');
    const mo=doc.getElementById('meet-orient');
    ok('Orientation is a row of choices, as Paper is', mo.classList.contains('pp-pick'));
    const it=mo.querySelector('.sm-item');
    ok('…each choice beside its name, in normal type', !!it&&cs(it).textTransform!=='uppercase'&&/display:inline-flex/.test(rule('.pp-pick .sm-item')));
    done();
  },300);
},600);
