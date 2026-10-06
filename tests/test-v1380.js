/* v1.38.0 — Name a block (tracker #3, owner "Proceed with fix" 2026-10-05):
   R1 a second block of the same department carries its own name · R2 the name reads on the
   block itself, like the shop's Excel calendar · R3 no more parking the name in the notes ·
   R4 double-click renames: in place on the project page and the draft (bar, band, title), and
   on the dashboard Edit Phase opens with a new Name field focused (its backdrop ignores the
   second click of a double-click). Right-click Rename on the bar menu; New subtask stays a
   plain quick-add; the custom name reaches calendar milestone bands and the Meeting Sheet.
   Run: node tests/test-v1380.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function npvRenameBar(')<0){
  console.log('  SKIP  test-v1380: pre-v1.38.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* dates ride relative to today — the Meeting Sheet's "Phase now" reads the clock */
const D=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const NAME='Possible mock up days';
const projects=[
 {appId:'p1',Title:'Stephanie Temma Hier Madison',client:'Hier',jobCode:'HE275',deadline:D(40),
  status:'in-fabrication',projectManager:'Caroline Bondi',drafter:'Sean Hong',leadFab:'Jeffrey Niles',
  activeDepartments:JSON.stringify(['pm','td','fab','finish','install']),createdAt:D(-40),sortIndex:0},
 {appId:'p2',Title:'Future Job',client:'Acme',jobCode:'AC1',deadline:D(60),
  status:'in-fabrication',projectManager:'Caroline Bondi',drafter:'',leadFab:'',
  activeDepartments:JSON.stringify(['pm','fab']),createdAt:D(-5),sortIndex:1}];
const T=(id,p,dept,who,s,e,extra)=>Object.assign({appId:id,projectId:p,department:dept,assignee:who,
  startDate:D(s),endDate:D(e),estimatedDays:5,ticketNodes:'[]',notes:'',pinned:false,label:''},extra||{});
const tasks=[
 T('pm1','p1','pm','Caroline Bondi',-30,40),
 T('td1','p1','td','Sean Hong',-30,-15),
 T('f1','p1','fab','Jeffrey Niles',-10,20),
 /* the second Main Shop Fab block — Hubert's bar — with a milestone sitting on it */
 T('f2','p1','fab','Jeffrey Niles',-2,5,{ticketNodes:'[{"id":"n1","date":"'+D(1)+'","target":"Client sign-off"}]'}),
 T('pt1','p1','finish','',10,18),
 T('i1','p1','install','[]',25,26),
 T('pm2','p2','pm','Caroline Bondi',-5,60),
 /* a named block that has not started — the Meeting Sheet's "Next:" line */
 T('f3','p2','fab','',10,15,{label:NAME})];

const dom=boot(FILE,{data:{projects,tasks,staff:[],todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));
const change=el=>el&&el.dispatchEvent(new win.Event('change',{bubbles:true}));
const dbl=el=>el&&el.dispatchEvent(new win.MouseEvent('dblclick',{bubbles:true,cancelable:true,clientX:200,clientY:60}));
const rclick=el=>el&&el.dispatchEvent(new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:200,clientY:60}));
const key=(el,k)=>el&&el.dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
const pop=()=>doc.getElementById('npv-pop'),menu=()=>doc.getElementById('npv-menu');
const idx=id=>E("NPV_TASKS.findIndex(t=>t.id==="+JSON.stringify(id)+")");
const barEl=id=>q('#npv-body .npv-bar[data-i="'+idx(id)+'"]');
const bandEl=id=>q('#npv-body .cal-band.ph[data-i="'+idx(id)+'"]');
/* a plain click on a Gantt bar: press on the bar, release on the document, no travel */
const clickBar=bar=>{bar.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,clientX:200,clientY:60,button:0}));
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,cancelable:true,clientX:200,clientY:60,button:0}));};
const clickBand=band=>{band.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,clientX:200,clientY:60,button:0}));
  band.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,clientX:200,clientY:60,button:0}));};
const renameBox=host=>host&&host.querySelector('.npv-rename');
const taskWrites=()=>win.__spCalls.filter(c=>/ShopTimeline_Tasks(\/|$)/.test(c.url.split('?')[0])&&(c.method==='POST'||c.method==='PATCH'));
/* a POST wraps the columns in `fields`; a PATCH to /fields sends them bare */
const wroteLabel=(ws,v)=>ws.some(c=>{const f=c.body&&(c.body.fields||c.body);return !!f&&f.label===v&&!f.notes;});
const fieldsOf=ws=>JSON.stringify(ws.map(c=>c.body&&(c.body.fields||c.body)));
const labelOf=id=>E("(ST.tasks.find(t=>t.id==="+JSON.stringify(id)+")||{}).label");
const gutOf=bar=>bar&&bar.parentElement&&bar.parentElement.querySelector('.npv-gut');

/* NPV_FIT=7: a pinned week, so bars are wide enough to type in on jsdom's 240px chart (at Fit
   they would fall under the narrow-bar threshold and rename on the row title instead) */
setTimeout(()=>{E("NPV_FIT=7;NPV_OPEN=new Set(['fab']);LINK_SUBS=true;location.hash='#/project/p1';applyRoute()");setTimeout(saved1,900);},1300);

/* ---------------- saved project ---------------- */
function saved1(){
  sec('Saved page — R1/R2/R4: double-click the body of the second Main Shop Fab bar renames it in place');
  const bar=barEl('f2');
  ok('the second Main Shop Fab bar is on the chart, reading the department name', !!bar&&bar.textContent.trim()==='Main Shop Fab', bar&&bar.textContent);
  dbl(bar.querySelector('.npv-txt'));
  const inp=renameBox(barEl('f2'));
  ok('R4: the rename box opened on the bar\'s own text, placeholder = department', !!inp&&inp.placeholder==='Main Shop Fab', inp&&inp.placeholder);
  ok('the popover is not open under it', !pop());
  const n0=taskWrites().length;
  inp.value=NAME;key(inp,'Enter');
  setTimeout(()=>{
    ok('R1: Enter stores the name on the block (label)', labelOf('f2')===NAME, labelOf('f2'));
    const w=taskWrites().slice(n0);
    ok('R3: it is the label column that is written, not the notes', wroteLabel(w,NAME), fieldsOf(w));
    ok('R2: the project-page bar reads the name', barEl('f2').textContent.trim()===NAME, barEl('f2').textContent);
    ok('R2: the row title reads the name', (gutOf(barEl('f2'))||{textContent:''}).textContent.indexOf(NAME)>=0, gutOf(barEl('f2'))&&gutOf(barEl('f2')).textContent);
    ok('the first block still reads the department', barEl('f1').textContent.trim()==='Main Shop Fab', barEl('f1').textContent);
    E("NPV_MODE='calendar';NPV_CAL_OPEN.set('fab',2);npvRender()");
    const band=bandEl('f2');
    ok('R2: the Calendar band reads the name', !!band&&band.textContent.trim()===NAME, band&&band.textContent);
    const mk=qa('#npv-body .cal-band.ev').map(b=>b.textContent.trim());
    ok('R2: the Calendar milestone band leads with the block\'s name', mk.indexOf(NAME+': Client sign-off')>=0, mk.join(' | '));
    E("NPV_MODE='gantt';npvRender()");
    sec('Esc cancels with no change');
    dbl(barEl('f2').querySelector('.npv-txt'));
    const i2=renameBox(barEl('f2'));i2.value='Nope';key(i2,'Escape');
    setTimeout(()=>{
      ok('Esc leaves the name as it was', labelOf('f2')===NAME&&barEl('f2').textContent.trim()===NAME, labelOf('f2'));
      ok('the rename box is gone', !renameBox(barEl('f2')));
      saved2();
    },300);
  },400);
}

function saved2(){
  sec('Collision — the first click parks the popover under the pointer; the popover hands the double-click on');
  clickBar(barEl('f2'));
  setTimeout(()=>{
    ok('a single click opens the popover, as before', !!pop()&&!!pop().querySelector('[data-f="label"]'));
    dbl(pop());
    ok('a double-click on the popover closes it', !pop());
    ok('and the rename box is on the bar\'s text', !!renameBox(barEl('f2')));
    key(renameBox(barEl('f2')),'Escape');
    setTimeout(()=>{
      E("NPV_MODE='calendar';NPV_CAL_OPEN.set('fab',2);npvRender()");
      clickBand(bandEl('f2'));
      setTimeout(()=>{
        ok('Calendar: a band click opens the popover', !!pop());
        dbl(pop());
        ok('Calendar: the popover hands the double-click on — closed, rename box on the band', !pop()&&!!renameBox(bandEl('f2')), (pop()?'pop open':'')+(renameBox(bandEl('f2'))?'':' no box'));
        key(renameBox(bandEl('f2')),'Escape');
        setTimeout(()=>{
          clickBand(bandEl('f2'));
          setTimeout(()=>{
            E("NPV_POP.at-=600");
            dbl(pop());
            ok('a double-click more than half a second after the popover opened does nothing special', !!pop()&&!renameBox(bandEl('f2')));
            E("npvPopClose()");clickBand(bandEl('f2'));
            setTimeout(()=>{
              dbl(pop().querySelector('[data-f="label"]'));
              ok('a double-click inside the popover\'s Name field is left alone (word-select)', !!pop()&&!renameBox(bandEl('f2')));
              E("npvPopClose();NPV_MODE='gantt';npvRender()");
              saved3();
            },250);
          },250);
        },250);
      },250);
    },250);
  },250);
}

function saved3(){
  sec('Rename reaches hidden and narrow bars');
  E("NPV_CAL_OPEN.delete('fab');NPV_MODE='calendar';npvRender();npvRenameBar(taskById('f2'))");
  ok('Calendar: renaming a collapsed phase\'s subtask expands it and opens the box on its band', !!renameBox(bandEl('f2')));
  key(renameBox(bandEl('f2')),'Escape');
  E("NPV_MODE='gantt';npvRender()");
  const nb=barEl('f2'),w0=nb.style.width;nb.style.width='30px';
  ok('a Gantt bar too narrow to type in renames on its row title', E("npvRenameHost(document.querySelector('#npv-body .npv-bar[data-i=\"'+NPV_TASKS.findIndex(t=>t.id==='f2')+'\"]'))")===gutOf(nb));
  nb.style.width=w0;
  sec('Right-click → Rename on the bar menu (Q3 default: kept, renames in place)');
  rclick(barEl('f2'));
  const ren=menu()&&menu().querySelector('button[data-act="ren"]');
  ok('the bar menu lists Rename with the R key', !!ren&&/^Rename/.test(ren.textContent)&&ren.querySelector('.k').textContent==='R', ren&&ren.textContent);
  ok('the add actions are still there', !!menu().querySelector('[data-act="sub"]')&&!!menu().querySelector('[data-act="ev"]')&&!!menu().querySelector('[data-act="tk"]'));
  click(ren);
  const inp=renameBox(barEl('f2'));
  ok('Rename opens the same in-place box', !!inp&&!menu());
  inp.value='Mock-up (menu)';key(inp,'Enter');
  setTimeout(()=>{
    ok('the same result: the label is stored', labelOf('f2')==='Mock-up (menu)', labelOf('f2'));
    E("commitPhase('f2','label',"+JSON.stringify(NAME)+");npvRebuild()");
    sec('New subtask stays a plain quick-add (Q2 default, owner ruling 2026-08-28)');
    const n0=E("NPV_TASKS.length");
    rclick(barEl('f1'));click(menu().querySelector('[data-act="sub"]'));
    setTimeout(()=>{
      ok('right-click New subtask adds a bar, selected, with no popover open', E("NPV_TASKS.length")===n0+1&&E("!!ppSelected()&&ppSelected().id!=='f1'")&&!pop(), E("NPV_TASKS.length")+' '+(pop()?'pop open':''));
      E("ppSelect('f1',true)");
      key(doc.body,'s');
      setTimeout(()=>{
        ok('the S key adds a bar, selected, with no popover open', E("NPV_TASKS.length")===n0+2&&E("!!ppSelected()&&ppSelected().id!=='f1'")&&!pop(), E("NPV_TASKS.length")+' '+(pop()?'pop open':''));
        E("location.hash='#/';applyRoute()");
        setTimeout(dash1,900);
      },400);
    },400);
  },400);
}

/* ---------------- dashboard ---------------- */
function dash1(){
  sec('Dashboard — R4: a bar click opens Edit Phase with the new Name field focused and selected');
  E("EXPANDED.add('p1');render()");
  E("commitPhase('f2','label','')"); /* back to the department name — Hubert's starting point */
  E("render()");
  const bar=q('.job-bar[data-tid="f2"]');
  ok('the second Main Shop Fab bar is on the dashboard, reading the department name', !!bar&&bar.querySelector('.bar-lbl')&&bar.querySelector('.bar-lbl').textContent==='Main Shop Fab', bar&&bar.textContent);
  click(bar);
  const ov=doc.getElementById('task-overlay'),nm=doc.getElementById('tm-name');
  ok('Edit Phase is open', !ov.classList.contains('hidden')&&doc.getElementById('tm-head').textContent==='Edit Phase');
  ok('it has a Name field (#tm-name), first in the form, placeholder = department', !!nm&&nm.placeholder==='Main Shop Fab'&&ov.querySelector('.modal-body input,.modal-body select')===nm, nm&&nm.placeholder);
  ok('Name is focused with its text selected', doc.activeElement===nm&&nm.selectionStart===0&&nm.selectionEnd===nm.value.length, doc.activeElement&&doc.activeElement.id);
  setTimeout(()=>{
    /* the second click of a double-click: its press must not move focus off Name, and its
       click must not close the dialog — on the backdrop or on a button under the pointer */
    const md=new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0});
    ov.dispatchEvent(md);
    ok('a press on the dialog 100 ms after opening is swallowed, so Name keeps focus', md.defaultPrevented&&doc.activeElement===nm, md.defaultPrevented+' '+(doc.activeElement&&doc.activeElement.id));
    click(doc.getElementById('tm-cancel'));
    ok('a click on Cancel 100 ms after opening does not close it either', !ov.classList.contains('hidden'));
    click(ov);
    ok('a backdrop click 100 ms after opening does not close it (the second click of a double-click)', !ov.classList.contains('hidden'));
    setTimeout(()=>{
      click(ov);
      ok('a backdrop click 500 ms after opening does', ov.classList.contains('hidden'));
      click(q('.job-bar[data-tid="f2"]'));
      const n0=taskWrites().length;
      nm.value=NAME;
      setTimeout(()=>click(doc.getElementById('tm-save')),450); /* past the 400 ms guard */
      setTimeout(()=>{
        ok('R1: Save writes the label', labelOf('f2')===NAME&&wroteLabel(taskWrites().slice(n0),NAME), labelOf('f2')+' '+fieldsOf(taskWrites().slice(n0)));
        ok('the dialog closed', ov.classList.contains('hidden'));
        const b2=q('.job-bar[data-tid="f2"]');
        ok('R2: the dashboard bar reads the name', !!b2&&b2.querySelector('.bar-lbl').textContent===NAME, b2&&b2.textContent);
        ok('the sidebar phase row reads the name', qa('.sb-row.task-row .sb-name').some(e=>e.textContent===NAME), qa('.sb-row.task-row .sb-name').map(e=>e.textContent).join('|'));
        E("showTooltipTask(taskById('f2'),{clientX:10,clientY:10})");
        ok('the hover card reads "name · department"', doc.getElementById('tooltip').textContent.indexOf(NAME+' · Main Shop Fab')>=0, doc.getElementById('tooltip').textContent.slice(0,120));
        E("hideTooltip()");
        sec('Meeting Sheet — "Phase now" reads the block\'s name (Q4 default)');
        const ph=[...E("buildMeetingSheet()").querySelectorAll('tr')].map(tr=>[(tr.querySelector('.mr-name')||{}).textContent,(tr.querySelector('.mr-phase')||{}).textContent]).filter(r=>r[0]);
        const p1=ph.find(r=>r[0]==='Stephanie Temma Hier Madison'),p2=ph.find(r=>r[0]==='Future Job');
        ok('while the block is active the sheet reads it beside the department', !!p1&&p1[1]==='Main Shop Fab, '+NAME, p1&&p1[1]);
        ok('before a named block starts the sheet reads "Next: <name> <date>"', !!p2&&p2[1].indexOf('Next: '+NAME+' ')===0, p2&&p2[1]);
        /* Edit Phase reopened: the dirty check counts the Name field */
        click(q('.job-bar[data-tid="f2"]'));
        ok('reopened, Name shows the stored name', nm.value===NAME, nm.value);
        E("closeTaskModal(true)");
        E("location.hash='#/project/new';applyRoute()");
        setTimeout(draft1,900);
      },850);
    },400);
  },100);
}

/* ---------------- New Project draft ---------------- */
function draft1(){
  sec('Draft page — the same rename on an unsaved block');
  const dl=q('#pp-deadline');dl.value=D(40);change(dl);
  const ck=q('#pp-depts input[data-dept="fab"]');if(ck&&!ck.checked){ck.checked=true;change(ck);}
  setTimeout(()=>{
    const prim=E("(NPV_TASKS.find(t=>t.department==='fab')||{}).id");
    ok('the draft has a Fabrication bar', !!prim, prim);
    const n0=E("NPV_TASKS.length");
    E("ppSelect("+JSON.stringify(prim)+",true)");
    key(doc.body,'s');
    setTimeout(()=>{
      /* a draft bar's id is derived from its line + name, so it is re-read after each rename
         (the selection key 'l:<line>' is rebuild-stable, so ppSelected() follows it) */
      let sub=E("(ppSelected()||{}).id");
      ok('draft: the S key adds a second bar, selected, with no popover open', E("NPV_TASKS.length")===n0+1&&!!sub&&sub!==prim&&!pop(), sub+' '+(pop()?'pop open':''));
      const bar=barEl(sub);
      ok('the new bar reads its quick-add name', !!bar&&/^Subtask \d+$/.test(bar.textContent.trim()), bar&&bar.textContent);
      dbl(bar.querySelector('.npv-txt'));
      const inp=renameBox(barEl(sub));
      ok('R4 draft: double-click the bar body opens the rename box', !!inp);
      inp.value=NAME;key(inp,'Enter');
      setTimeout(()=>{
        ok('R1 draft: Enter stores the name on the unsaved line', E("NPV_LINES.some(l=>l.name==="+JSON.stringify(NAME)+")"), E("JSON.stringify(NPV_LINES.map(l=>l.name))"));
        sub=E("(ppSelected()||{}).id");
        ok('R2 draft: the bar reads the name', barEl(sub).textContent.trim()===NAME, barEl(sub).textContent);
        ok('R2 draft: the row title reads the name', (gutOf(barEl(sub))||{textContent:''}).textContent.indexOf(NAME)>=0);
        E("NPV_MODE='calendar';NPV_CAL_OPEN.set('fab',2);npvRender()");
        ok('R2 draft: the Calendar band reads the name', !!bandEl(sub)&&bandEl(sub).textContent.trim()===NAME, bandEl(sub)&&bandEl(sub).textContent);
        E("NPV_MODE='gantt';npvRender()");
        dbl(barEl(sub).querySelector('.npv-txt'));
        const i2=renameBox(barEl(sub));i2.value='Nope';key(i2,'Escape');
        setTimeout(()=>{
          ok('draft: Esc cancels with no change', barEl(sub).textContent.trim()===NAME&&!E("NPV_LINES.some(l=>l.name==='Nope')"));
          sec('Draft — collision and right-click Rename');
          clickBar(barEl(sub));
          setTimeout(()=>{
            ok('draft: a bar click opens the popover', !!pop());
            dbl(pop());
            ok('draft: the popover hands the double-click on to the rename box', !pop()&&!!renameBox(barEl(sub)));
            key(renameBox(barEl(sub)),'Escape');
            setTimeout(()=>{
              rclick(barEl(sub));
              const ren=menu()&&menu().querySelector('button[data-act="ren"]');
              ok('draft: the bar menu lists Rename', !!ren);
              click(ren);
              const i3=renameBox(barEl(sub));
              ok('draft: Rename opens the box', !!i3);
              i3.value='Mock-up (draft menu)';key(i3,'Enter');
              setTimeout(()=>{
                ok('draft: the menu rename lands on the line', E("NPV_LINES.some(l=>l.name==='Mock-up (draft menu)')"));
                sub=E("(ppSelected()||{}).id");
                ok('draft: the bar reads the menu rename', !!barEl(sub)&&barEl(sub).textContent.trim()==='Mock-up (draft menu)', barEl(sub)&&barEl(sub).textContent);
                const n1=E("NPV_TASKS.length");
                rclick(barEl(E("npvPrimary('fab').id"))); /* the primary's draft id moved when its line was seeded */
                click(menu().querySelector('[data-act="sub"]'));
                setTimeout(()=>{
                  ok('draft: right-click New subtask adds a bar, selected, with no popover open', E("NPV_TASKS.length")===n1+1&&!pop());
                  done();
                },400);
              },400);
            },250);
          },250);
        },300);
      },400);
    },400);
  },500);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
