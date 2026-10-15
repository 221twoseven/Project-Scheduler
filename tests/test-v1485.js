/* v1.48.5 — item 19 (the code edge case): "Away until" reads back-to-back and overlapping time-off
   ranges as one absence. A range that starts by the next workday after the current one ends extends
   it, so a weekend or holiday in between still counts; a real working day in between stops it.
   Fixture dates are relative to today.
   Run: node tests/test-v1485.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s);

setTimeout(()=>{
  /* d(n) = today+n as ISO; nw(iso) = the next workday after iso, in the app's own calendar */
  E("window.d=n=>fmtDate(addDays(today(),n));window.nw=iso=>{let x=addDays(parseDate(iso),1);while(!isWorking(x))x=addDays(x,1);return fmtDate(x);};"
   +"window.av=ooo=>cdAvail({ooo:ooo.map((o,i)=>({id:'o'+i,...o}))}).txt;");
  const A=s=>E(s);

  sec('one absence, however it was typed');
  ok('a single range reads its own end', A("av([{start:d(-1),end:d(2)}])")===A("'Away until '+fmtNice(d(2))"));
  ok('a range starting the next workday extends it',
     A("(()=>{const e=d(2),s2=nw(e),e2=fmtDate(addDays(parseDate(s2),3));return av([{start:d(-1),end:e},{start:s2,end:e2}])==='Away until '+fmtNice(e2);})()")===true);
  ok('a chain of three extends to the last',
     A("(()=>{const e=d(1),s2=nw(e),e2=fmtDate(addDays(parseDate(s2),1)),s3=nw(e2),e3=fmtDate(addDays(parseDate(s3),2));"
      +"return av([{start:s3,end:e3},{start:d(-2),end:e},{start:s2,end:e2}])==='Away until '+fmtNice(e3);})()")===true);
  ok('an overlapping range extends it', A("av([{start:d(-3),end:d(3)},{start:d(1),end:d(9)}])")===A("'Away until '+fmtNice(d(9))"));
  ok('a range inside the current one changes nothing', A("av([{start:d(-3),end:d(9)},{start:d(1),end:d(2)}])")===A("'Away until '+fmtNice(d(9))"));

  sec('a working day back in between keeps them apart');
  ok('a gap with a workday stops the chain',
     A("(()=>{const e=d(2),back=nw(e),s2=nw(back),e2=fmtDate(addDays(parseDate(s2),2));return av([{start:d(-1),end:e},{start:s2,end:e2}])==='Away until '+fmtNice(e);})()")===true);
  ok('upcoming time off still reads as upcoming', /^OOO /.test(A("av([{start:d(5),end:d(7)}])")));
  ok('nobody away reads Available', A("av([])")==='Available');

  done();
},1500);
