/* REV90 — the pre-merge audit fix pass:
     1. failed saves merge into one pending diff; a later success can't mask one;
        the retry pill replays the whole span and clears cleanly;
     2. pmLateList matches PMs through roleList (multi-PM projects prompt);
     3. observed New Year files in the year it lands in (Fri Dec 31 is a holiday);
     4. laneAssign frees a lane the day AFTER a bar ends (no same-day overlap);
     5. grouped sidebar clusters by key — one header per group, right count;
     6. Unit 7 has a Departments-lens section (softgoods/vinyl/othunit7 lanes);
     7. week zebra alternates across 53-ISO-week New Years;
     8. Escape closes the Clients modal; beforeunload guards unsynced saves;
     9. gpageAll follows @odata.nextLink; parseHash survives malformed hashes;
    10. saved views restore an explicitly-empty status set.
   Run: node tests/test90.js index.html */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('gpageAll')<0){
  console.log('test90: skipped — pre-REV90 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x!==undefined?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const click=el=>el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const key=k=>doc.dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));

setTimeout(()=>{
  sec('1 · pure fixes: holidays, lanes, zebra, sections, hash');
  ok('Fri Dec 31 2027 is a holiday (Jan 1 2028 is a Saturday)',E('isWorking(new Date(2027,11,31))')===false);
  ok('Thu Dec 30 2027 stays a workday',E('isWorking(new Date(2027,11,30))')===true);
  ok('the observed day is not filed under the wrong year',E('!holidaysFor(2028).has("2027-12-31")'));
  ok('a bar starting the day another ends gets its own lane',
     E('laneAssign([{id:"a",startDate:"2026-09-01",endDate:"2026-09-10"},{id:"b",startDate:"2026-09-10",endDate:"2026-09-12"}]).count')===2);
  ok('…but the day after shares the lane',
     E('laneAssign([{id:"a",startDate:"2026-09-01",endDate:"2026-09-10"},{id:"b",startDate:"2026-09-11",endDate:"2026-09-12"}]).count')===1);
  ok('week zebra alternates through 20 consecutive Mondays (53-week years included)',
     E('(()=>{let d=new Date(2025,11,1),last=null;for(let i=0;i<20;i++){const p=wkPar(d);if(last!==null&&p===last)return false;last=p;d=addDays(d,7);}return true;})()'));
  ok('Unit 7 is a Departments-lens section covering its whole group',
     E('SECTIONS.some(s=>s.kind==="group"&&s.depts&&["softgoods","vinyl","electrical","othunit7"].every(d=>s.depts.includes(d)))'));
  ok('a malformed hash does not throw out of parseHash',
     E('(()=>{try{location.hash="#/project/%zz";const r=parseHash();location.hash="";return r.view==="project";}catch(e){return false;}})()'));

  sec('2 · pmLateList matches comma-listed PMs');
  E('meName=()=>"Caroline"');
  E('ST={...ST,projects:[{id:"pl1",name:"Late",projectManager:"Stan, Caroline",deadline:"2026-01-01",status:"in-fabrication"},{id:"pl2",name:"Solo",projectManager:"Stan",deadline:"2026-01-01",status:"in-fabrication"}]}');
  ok('a two-PM project prompts the second PM too',E('pmLateList().length')===1,E('pmLateList().length'));
  ok('…and not projects the user is no PM of',E('pmLateList()[0].id')==='pl1');
  E('ST={...ST,projects:[]}');

  sec('3 · saved views restore an explicitly-empty status set');
  E('applyViewState({status:[]})');
  ok('zero statuses restores as zero',E('SHOW_STATUS.size')===0);
  E('SHOW_STATUS=new Set(ALL_STATUSES)');

  sec('4 · grouped sidebar: one header per group, honest counts');
  E('ST={...ST,projects:[{id:"g1",name:"A1",client:"Acme",status:"forecast",sortIndex:1},{id:"g2",name:"B1",client:"Bolt",status:"forecast",sortIndex:2},{id:"g3",name:"A2",client:"Acme",status:"forecast",sortIndex:3}]}');
  E('GROUP_BY="client"');
  ok('two headers for two clients (was three, with a duplicate)',E('buildRows().rows.filter(r=>r.kind==="groupHead").length')===2);
  ok('the split group\'s header carries the full count',E('buildRows().rows.find(r=>r.kind==="groupHead"&&r.groupKey==="Acme").count')===2);
  ok('every Acme row sits under the one Acme header',
     E('(()=>{const rows=buildRows().rows;const iB=rows.findIndex(r=>r.groupKey==="Bolt");return rows.slice(0,iB).filter(r=>r.kind==="projHead").length===2;})()'));
  E('GROUP_BY=null;ST={...ST,projects:[]}');

  sec('5 · Escape closes the Clients modal');
  const co=doc.getElementById('clients-overlay');
  co.classList.remove('hidden');
  key('Escape');
  ok('the Clients overlay hides like every other modal',co.classList.contains('hidden'));

  sec('6 · failed saves merge; success cannot mask a failure');
  E('spSync=async()=>{throw new Error("boom")}');
  E('saveState({projects:[{id:"s1",name:"One",status:"forecast"}],tasks:[]})');
  setTimeout(()=>{
    ok('a failed save parks a pending diff',!!E('PENDING_SYNC'));
    ok('…from the pre-edit snapshot',E('PENDING_SYNC.oldST.projects.length')===0);
    E('saveState({projects:[...ST.projects,{id:"s2",name:"Two",status:"forecast"}],tasks:[]})');
    setTimeout(()=>{
      ok('a second failure keeps the FIRST snapshot (merged, not clobbered)',E('PENDING_SYNC.oldST.projects.length')===0);
      ok('…and the latest state',E('PENDING_SYNC.newST.projects.length')===2);
      E('spSync=async()=>{}');
      click(doc.getElementById('sync-pill'));
      setTimeout(()=>{
        ok('the retry clears the pending diff',E('PENDING_SYNC')===null);
        ok('no save left in flight',E('SYNCING')===0,E('SYNCING'));
        ok('the pill reads synced',/synced/.test(doc.getElementById('sync-pill').textContent));

        sec('7 · beforeunload guards unsynced changes');
        E('SYNCING=1');
        let ev=new win.Event('beforeunload',{cancelable:true});
        win.dispatchEvent(ev);
        ok('an in-flight save arms the are-you-sure',ev.defaultPrevented);
        E('SYNCING=0');
        ev=new win.Event('beforeunload',{cancelable:true});
        win.dispatchEvent(ev);
        ok('a clean session leaves unload alone',!ev.defaultPrevented);

        sec('8 · gpageAll follows @odata.nextLink');
        E('gfetch=async u=>u==="u"?{value:[1,2],"@odata.nextLink":"u2"}:{value:[3]}');
        E('(async()=>{window.__gp=(await gpageAll("u")).length})()');
        setTimeout(()=>{
          ok('both pages concatenate',E('window.__gp')===3,E('window.__gp'));

          sec('9 · structural: bind-once inspector, styled delete');
          ok('the inspector change listener binds once (dataset.bound guard)',src.indexOf('box.dataset.bound')>=0);
          ok('the Delete-project button uses a class that exists (.btn-del)',src.indexOf('btn btn-del" id="pp-del"')>=0&&src.indexOf('btn-danger')<0);

          console.log('\n'+'-'.repeat(46));
          console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
          process.exit(fail?1:0);
        },100);
      },150);
    },150);
  },150);
},1300);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
