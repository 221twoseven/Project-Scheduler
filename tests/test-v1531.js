/* v1.53.1 — item 83: on the project-page Gantt, a selected bar, milestones, notes, Today,
   the deadline and holiday pills slid OVER the sticky name column once the chart scrolled.
   Each row was its own z1 stacking layer, so inside it a selected bar (z4) beat the name
   cell (z3), and every marker drawn beside the rows (z4-6) beat all of them. jsdom has no
   layout, so this checks the stylesheet: the name column outranks every chart layer, and
   no rule makes a row its own layer again.
   Run: node tests/test-v1531.js index.html  (or via tests/run.js) */
const {suite}=require('./harness');
const {src,ok,done}=suite();

/* Every z-index a class gets from a rule whose last compound is that class (".npv-bar.pick",
   "#npv-body .npv-ev", ".npv-today::after"), not one aimed at a child (".npv-bar .npv-hdl"). */
const css=src.slice(0,src.indexOf('<script'));
const rules=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
const zOf=cls=>rules.flatMap(([,sel,body])=>{
  const z=/z-index:\s*(-?\d+)/.exec(body);
  if(!z)return [];
  return sel.split(',').map(s=>s.trim().split(/[\s>+~]+/).pop())
    .filter(s=>s.startsWith(cls)&&!/^[\w-]/.test(s.slice(cls.length))).map(()=>+z[1]);
});
const max=a=>Math.max(...a);

console.log('\nthe name column is the top layer of the chart');
const gut=zOf('.npv-gut');
ok('.npv-gut has a z-index',gut.length>0);
const layers=['.npv-bar','.npv-ev','.npv-tk','.npv-today','.npv-dl','.hol-tag','.npv-hov','.npv-hint','.npv-env'];
for(const c of layers){
  const z=zOf(c);
  ok(c+' stays under the name column',z.length&&max(z)<Math.min(...gut),c+' '+z+' vs gut '+gut);
}
/* The pre-83 order under the names is kept: selected/dragged bars stay under every marker. */
const bars=zOf('.npv-bar');
for(const c of ['.npv-today','.npv-dl','.npv-tk','.npv-ev','.hol-tag'])
  ok('every bar, selected or dragged, stays under '+c,max(bars)<Math.min(...zOf(c)),bars+' vs '+zOf(c));
ok('the hover crosshair is not under a selected bar',max(zOf('.npv-hov'))>=max(bars),zOf('.npv-hov')+' vs '+bars);
ok('the reorder drop line still crosses the name column',max(zOf('.npv-drop'))>max(gut),zOf('.npv-drop')+' vs '+gut);

console.log('\nrows are not their own layers');
ok('no rule gives .npv-row a z-index',zOf('.npv-row').length===0,String(zOf('.npv-row')));
ok('no rule gives a body row a z-index',!/\.npv-body \.npv-row\{[^}]*z-index/.test(css));
ok('#npv-body is one stacking context',/\.npv-body\{[^}]*isolation:isolate/.test(css));
ok('the tint layer sits under the rows',max(zOf('.npv-tintl'))<0,String(zOf('.npv-tintl')));
done();
