/* One test per reported issue, on the page where it was reported.
   Run: node tests/run.js  (or: node tests/test50.js reference/Timeline_50.html) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'reference/Timeline_50.html';
const src=fs.readFileSync(FILE,'utf8');
/* REV57 / N11: bar menus are add-only — rename lives in the inspector/popover. (The old
   inline name field is retired; a New action opens the edit popover, sniffed here.) */
const N11=/npvEditPop/.test(src);

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window,doc=win.document;
const E=s=>win.eval(s);
const q=s=>doc.querySelector(s);
const qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
/* Real-browser key: dispatched FROM the focused element, so ev.target is the input the
   way it is in Chrome — this is exactly what jsdom hid last time. */
const keyOn=(el,k,o)=>el.dispatchEvent(new win.KeyboardEvent('keydown',
  Object.assign({key:k,bubbles:true,cancelable:true},o||{})));

setTimeout(()=>{
  win.location.hash='#/project/new';
  win.dispatchEvent(new win.Event('hashchange'));
  setTimeout(stage1,800);
},1300);

function stage1(){
  const set=(id,v)=>{const e=doc.getElementById(id);e.value=v;
    e.dispatchEvent(new win.Event('input',{bubbles:true}));
    e.dispatchEvent(new win.Event('change',{bubbles:true}));};
  set('pp-name','Cartier Vitrine'); set('pp-deadline','2026-09-16');

  setTimeout(()=>{
    sec('ISSUE: meta strip showed literal &mdash;');
    const mt=doc.getElementById('pp-meta').textContent;
    ok('no raw entity anywhere in the strip', mt.indexOf('&mdash;')<0, mt.slice(0,60));
    ok('a real em dash stands in for missing fields', /\u2014/.test(mt));

    sec('ISSUE: departments panel garbled');
    const dd=doc.getElementById('pp-depts');
    ok('the panel uses the compact inspector markup', dd.classList.contains('ins-depts'));
    ok('no wide-grid dept-item elements remain in it', !dd.querySelector('.dept-item'));
    ok('group headings render', qa('#pp-depts .idg').length>=6, qa('#pp-depts .idg').length+' groups');
    ok('one row per department', qa('#pp-depts .idr').length>=15, qa('#pp-depts .idr').length+' rows');
    ok('rows keep the data attributes the draft reader needs',
       !!dd.querySelector('input[type=checkbox][data-dept]')&&!!dd.querySelector('.ddays'));
    ok('PM is ticked and locked', (()=>{
      const pm=dd.querySelector('input[data-dept="pm"]');return pm&&pm.checked&&pm.disabled;})());
    ok('unticked rows show disabled day inputs', (()=>{
      const off=qa('#pp-depts .idr.off .ddays');return off.length>0&&off.every(i=>i.disabled);})());
    const bars0=qa('#npv-body .npv-bar').length;
    ok('the preview drew bars', bars0>0, bars0+'');

    sec('ISSUE: hotkeys did nothing (focus was living in an input)');
    const nameEl=doc.getElementById('pp-name');
    nameEl.focus();
    ok('focus starts in the name field (the real-browser condition)',
       doc.activeElement===nameEl);
    const e0=E('NPV_EVENTS.length');
    keyOn(nameEl,'e');
    ok('E while typing rightly does nothing', E('NPV_EVENTS.length')===e0);
    /* the fix: touching the canvas releases focus */
    const host=doc.getElementById('npv-body');
    host.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:400,clientY:300,button:0}));
    ok('a mousedown on the canvas releases the field', doc.activeElement!==nameEl,
       (doc.activeElement||{}).id||'(body)');
    keyOn(doc.activeElement===doc.body?doc.body:doc.activeElement||doc.body,'e');
    setTimeout(()=>{
      ok('now E creates an event', E('NPV_EVENTS.length')===e0+1,
         E('NPV_EVENTS.length')+' vs '+(e0+1));

      sec('ISSUE: events landed "randomly" (created undated, never drawn)');
      ok('the keyboard event got a real date', E('NPV_EVENTS.slice(-1)[0].date')!=='',
         JSON.stringify(E('NPV_EVENTS.slice(-1)[0].date')));
      ok('the date is inside the visible span', (()=>{
        const d=E('NPV_EVENTS.slice(-1)[0].date');
        return d>=E('fmtDate(NPV_GEO.lo)')&&d<=E('fmtDate(NPV_GEO.hi)');})());
      setTimeout(()=>{
        ok('its diamond is drawn on the chart', qa('#npv-body .npv-ev').length>=1,
           qa('#npv-body .npv-ev').length+' markers');
        stage2();
      },250);
    },250);
  },600);
}

function stage2(){
  sec('ISSUE: events were black — now a yellow diamond, black outline');
  const evCss=src.match(/\.npv-ev\{[^}]*\}/)[0];
  ok('fill is yellow', /F7C948/i.test(evCss), evCss.slice(0,90));
  ok('outline is black', /border:\s*2px solid #16202E/.test(evCss));
  ok('no black-fill rule survives anywhere', !/npv-ev\{[^}]*#3F4E66/.test(src));
  ok('the legend diamond matches', /\.npv-leg \.lg i\.ev\{[^}]*F7C948/i.test(src));
  ok('the agenda diamond matches', /\.ag-i \.ic\.ev\{[^}]*F7C948/i.test(src));
  ok('the menu diamond matches', /\.npv-menu \.mi\.ev\{[^}]*F7C948/i.test(src));

  sec('events are visible: named ones print a label chip');
  E("NPV_EVENTS[NPV_EVENTS.length-1].name='Client review';npvRebuild();");
  setTimeout(()=>{
    const lbl=q('#npv-body .npv-evlbl');
    /* v1.4.0 (08-31 obj 4): label chips retired — the name lives in the hover title. */
    if(/\.npv-evlbl\{/.test(src))
      ok('a label chip renders beside the diamond', !!lbl&&/Client review/.test(lbl.textContent),
         lbl?lbl.textContent:'(none)');
    else{
      ok('no label chip renders (v1.4.0 obj 4)', !lbl);
      ok('the diamond title carries the name', /Client review/.test((q('#npv-body .npv-ev')||{title:''}).title));
    }
    ok('the diamond carries its id, kind and date',
       (()=>{const m=q('#npv-body .npv-ev');
         return m&&m.dataset.mkId&&m.dataset.mkK==='ev'&&m.dataset.mkDate;})());

    sec('ISSUE: events could not be moved — drag the diamond');
    const mk=q('#npv-body .npv-ev');
    const d0=mk.dataset.mkDate;
    const dw=E('NPV_GEO.dw');
    mk.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:20,button:0}));
    doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:300+dw*3,clientY:20}));
    doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:300+dw*3,clientY:20}));
    setTimeout(()=>{
      const d1=E("NPV_EVENTS.find(e=>e.name==='Client review').date");
      ok('dragging moved its date', d1!==d0, d0+' -> '+d1);
      ok('by exactly the dragged distance',
         Math.round((new Date(d1)-new Date(d0))/86400000)===3,
         Math.round((new Date(d1)-new Date(d0))/86400000)+'d');

      sec('clicking a diamond renames it in place');
      const mk2=q('#npv-body .npv-ev');
      mk2.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:20,button:0}));
      doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:300,clientY:20}));
      setTimeout(()=>{
        /* The checkpoint-editor agenda (post-REV50) renders a permanent name input;
           the reference build opens one on click. */
        const NEWAG=src.indexOf('<input class="nm"')>=0; /* the new agenda's name is a permanent INPUT; the reference renders a span */
        const inp=NEWAG?q('#pp-insp .ag-i input.nm'):q('#pp-insp .ag-i input');
        ok('the agenda opened with an inline editor', !!inp);
        if(inp){
          inp.value='Kickoff';
          if(NEWAG)inp.dispatchEvent(new win.Event('change',{bubbles:true}));
          else inp.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
        }
        setTimeout(()=>{
          ok('the rename stuck', E("NPV_EVENTS.some(e=>e.name==='Kickoff')"));
          stage3();
        },250);
      },300);
    },300);
  },300);
}

function stage3(){
  sec('ISSUE: could not add subtasks (draft wrote to a dead surface)');
  const before=qa('#npv-body .npv-bar:not(.sum)').length;
  const host=doc.getElementById('npv-body');
  host.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:400,clientY:300,button:0}));
  keyOn(doc.body,'s');
  setTimeout(()=>{
    ok('S created a line pair', E('NPV_LINES.length')>=2, E('NPV_LINES.length')+' lines');
    const after=qa('#npv-body .npv-bar:not(.sum)').length;
    ok('the chart shows more bars than before', after>before, before+' -> '+after);
    ok('the new bar is visibly named', /Subtask 2/.test(host.textContent));
    ok('its department expanded to show it', qa('#npv-body .npv-row.child').length>0);

    const CONV=/ppDraftResolve/.test(src); /* REV82: the popover retired — the inspector serves drafts */
    sec(CONV?'clicking a draft bar selects into the shared inspector (REV82)'
            :'clicking a draft bar opens its editor (inspector cannot hold drafts)');
    const kid=q('#npv-body .npv-bar.kid')||qa('#npv-body .npv-bar:not(.sum)')[0];
    kid.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:300,clientY:20,button:0}));
    doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:300,clientY:20}));
    setTimeout(()=>{
      if(CONV){
        ok('the phase inspector opened', !!doc.getElementById('ins-name'));
        ok('the edit popover opened on the draft bar too', !!doc.getElementById('npv-pop'));
        ok('the retired bar-pop is gone', !doc.getElementById('bar-pop'));
        ok('draft dates are editable in the panel',
           (()=>{const s=q('#pp-insp [data-f="startDate"]');return !!s&&!s.readOnly&&!s.disabled;})());
        E('ppSelect(null,true);');
      }else{
        ok('the bar editor opened', !!doc.getElementById('bar-pop'));
        ok('it has a name field', !!doc.getElementById('bp-name'));
        /* REV61 made draft popover dates editable (they commit like a drag would);
           pre-REV61 builds keep the read-only assertion. */
        if(/ppPopDate/.test(src))
          ok('draft dates are editable (REV61)',
             (()=>{const s=doc.getElementById('bp-s');return s&&!s.readOnly;})());
        else
          ok('draft dates are read-only, as the note says',
             (()=>{const s=doc.getElementById('bp-s');return s&&s.readOnly;})());
        E('ppClosePop();');
      }

      sec('right-click a draft bar');
      const bar=qa('#npv-body .npv-bar:not(.sum)')[0];
      const ev=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:250,clientY:20,button:2});
      bar.dispatchEvent(ev);
      setTimeout(()=>{
        const menu=doc.getElementById('npv-menu');
        ok('a menu opened', !!menu);
        if(N11)ok('it offers the three creates (add-only, N11)',
           !!menu.querySelector('[data-act="sub"]')&&!!menu.querySelector('[data-act="ev"]')
           &&!!menu.querySelector('[data-act="tk"]')&&!menu.querySelector('[data-act="ren"]'));
        else ok('it offers rename and the three creates',
           !!menu.querySelector('[data-act="ren"]')&&!!menu.querySelector('[data-act="sub"]'));
        ok('duplicate and delete are absent on a draft (they need ST)',
           !menu.querySelector('[data-act="dup"]')&&!menu.querySelector('[data-act="del"]'));
        E('npvCloseMenu();');
        stage4();
      },250);
    },350);
  },400);
}

function stage4(){
  sec('ISSUE: menus garbled / overflowing');
  const menuCss=src.match(/\.npv-menu\{[^}]*\}/)[0];
  ok('menus cap their height and scroll', /max-height/.test(menuCss)&&/overflow-y:auto/.test(menuCss),
     menuCss.slice(0,120));
  ok('menus cap their width', /max-width/.test(menuCss));

  sec('agenda works on drafts: delete');
  const n0=E('NPV_EVENTS.length');
  const del=q('#pp-insp .ag-i .del');
  ok('agenda rows show a delete', !!del);
  click(del);
  setTimeout(()=>{
    ok('deleting removes it from the draft', E('NPV_EVENTS.length')===n0-1,
       E('NPV_EVENTS.length')+' vs '+(n0-1));

    sec('create still works end to end with everything above in the draft');
    click(doc.getElementById('pp-save'));
    setTimeout(()=>{
      ok('the project was created', E('ST.projects.length')===1);
      ok('the draft subtasks became real phases',
         E("ST.tasks.filter(t=>t.department!=='pm').length")>=5,
         E("ST.tasks.filter(t=>t.department!=='pm').length")+' phases');
      ok('the subtask names carried over', E("ST.tasks.some(t=>t.label==='Subtask 2')"));
      ok('the surviving draft events carried over',
         E("ST.tasks.reduce((n,t)=>n+(t.ticketNodes||[]).length,0)")===E('0')+ (n0-1>0?n0-1:0),
         E("ST.tasks.reduce((n,t)=>n+(t.ticketNodes||[]).length,0)")+'');
      stage5();
    },800);
  },300);
}

function stage5(){
  sec('hotkeys on the saved project too (same focus rule)');
  setTimeout(()=>{
    const c=doc.getElementById('pp-client');
    if(c){c.focus();
      ok('focus in a field again', doc.activeElement===c);}
    const host=doc.getElementById('npv-body');
    host.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:400,clientY:300,button:0}));
    ok('canvas mousedown releases it', doc.activeElement!==c);
    const t0=E('(ST.todos||[]).length');
    keyOn(doc.body,'t');
    setTimeout(()=>{
      ok('T makes a task on the saved project', E('(ST.todos||[]).length')===t0+1);
      ok('it has a date', E('(ST.todos||[]).slice(-1)[0].due')!=='');
      done();
    },300);
  },400);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},40000);

