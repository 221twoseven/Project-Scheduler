/* v1.41.1 — the Projects / Departments switch on a narrow sidebar (owner, 2026-10-06: "what does this button do" —
   the sidebar drags down to 180px and "Departments" was clipped off the switch, leaving only "Projects").
   R1 under about 240px of sidebar the halves read "Proj" / "Dept" (a container query on the sidebar header)
   R2 the full words stay in the button text, the tooltip and the accessible name.
   jsdom cannot evaluate container queries; the widths 180–300px were measured in Chrome (all fit).
   Run: node tests/test-v1411.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();


ok('R1: the sidebar header is a size container', /#sb-head\{container:sbhead\/inline-size\}/.test(src));
ok('R1: a narrow header swaps the labels for their short forms', /@container sbhead \(max-width:\d+px\)\{\s*#sb-head \.sb-lens \.t-btn\{font-size:0;[^}]*\}\s*#sb-head \.sb-lens \.t-btn::after\{content:attr\(data-short\)/.test(src));

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const doc=dom.window.document;
setTimeout(()=>{
  const p=doc.getElementById('btn-lens-proj'),d=doc.getElementById('btn-lens-dept');
  ok('R1: the short forms are Proj and Dept', p.dataset.short==='Proj'&&d.dataset.short==='Dept');
  ok('R2: the button text is still the full word', p.textContent==='Projects'&&d.textContent==='Departments');
  ok('R2: the accessible name and tooltip keep the full word', p.getAttribute('aria-label')==='Projects'&&d.getAttribute('aria-label')==='Departments'&&/by project/.test(p.title)&&/by department/.test(d.title));
  done();
},800);
