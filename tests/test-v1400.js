/* v1.40.0 — Print designed for paper (tracker #8 + #9, Revised specs 2026-10-02, owner "Proceed with fix"):
   R1 a PDF export of every view · R2 Letter or Tabloid, both offered (a page-size rule per choice,
   the choice remembered per browser, Portrait for the Meeting Sheet) · R3 pages designed for paper:
   app-built page boxes with the house header, footer and "Page X of Y", tinted bars with a colour
   edge and ink text, outlined chips, stripes in colour, the progress bar as a track, the screen's
   chrome hidden · R4 the Gantt, the Calendar (one month per page, from a project's page) and the
   List · R5 the Meeting Sheet is the model and honours Status, Client and Person (Q5: search and
   spotlight fade, named in the header) · R6 #8 and #9 close together (the CHANGELOG line, test-v160).
   Q7 Laser shares install's red and the Team legend names it. Step 15: the preview's Close button
   is no longer a second `pp-cancel`. jsdom cannot lay out, so the page cuts run on fixed row heights
   (PR_FIXED_H) and the checks are structural; the sample PDFs on the PR prove the paper.
   Run: node tests/test-v1400.js index.html  (or via tests/run.js) */
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(src.indexOf('function prPaginate(')<0){
  console.log('  SKIP  test-v1400: pre-v1.40.0 build ('+FILE+')');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* ---- the demo: twenty projects over Jul 2026 – Jan 2027, every status, Laser + install, a three-month job ---- */
const P=(id,name,client,code,pm,depts,extra)=>Object.assign({appId:id,Title:name,client,jobCode:code,deadline:'2026-12-01',status:'auto',
  projectManager:pm,drafter:'Peter',leadFab:'Nick',fabricators:'',activeDepartments:JSON.stringify(depts),createdAt:'2026-07-01',sortIndex:0},extra||{});
const T=(id,pid,dept,who,s,e,d)=>({appId:id,projectId:pid,department:dept,assignee:who,startDate:s,endDate:e,estimatedDays:d,ticketNodes:'[]',notes:'',pinned:false,label:''});
const projects=[
  P('p1','Hermès Windows','Hermès','H1','Sam',['pm','td','laser','fab','install']),
  P('p2','Atrium','Dior','D2','Sam',['pm','td','fab','install'],{status:'forecast'}),
  P('p3','Lobby desk','Hermès','H3','Kim',['pm','td','cnc','finish','install'],{status:'estimating'}),
  P('p4','Trade show booth','Tiffany','T4','Kim',['pm','fab','shipping'],{status:'on-hold'}),
  P('p5','Holiday Windows','Dior','D5','Sam',['pm','td','fab','install']),
  P('p6','Three Month Job','Tiffany','T6','Kim',['pm','td','fab','install'])];
const tasks=[
  T('t1a','p1','td','Peter','2026-09-07','2026-09-18',10),T('t1b','p1','laser','','2026-09-21','2026-09-25',5),T('t1c','p1','fab','Nick','2026-09-28','2026-10-16',15),T('t1d','p1','install','[]','2026-10-19','2026-10-21',3),
  T('t2a','p2','td','Peter','2026-10-12','2026-10-23',10),T('t2b','p2','fab','Nick','2026-11-02','2026-11-20',15),T('t2c','p2','install','[]','2026-12-07','2026-12-09',3),
  T('t3a','p3','td','Peter','2026-10-19','2026-10-30',10),T('t3b','p3','cnc','','2026-11-02','2026-11-06',5),T('t3c','p3','finish','','2026-11-09','2026-11-13',5),T('t3d','p3','install','[]','2026-11-16','2026-11-17',2),
  T('t4a','p4','fab','Nick','2026-10-05','2026-10-23',15),T('t4b','p4','shipping','[]','2026-11-02','2026-11-03',2),
  T('t5a','p5','td','Peter','2026-08-03','2026-08-14',10),T('t5b','p5','fab','Nick','2026-08-17','2026-09-18',25),T('t5c','p5','install','[]','2026-09-28','2026-09-30',3),
  T('t6a','p6','td','Peter','2026-10-12','2026-10-30',15),T('t6b','p6','fab','Nick','2026-11-02','2026-11-27',20),T('t6c','p6','install','[]','2026-12-14','2026-12-16',3)];
const clients=['Hermès','Dior','Tiffany','Cartier'],pms=['Sam','Kim'];
for(let i=7;i<=20;i++){
  const m=String(7+Math.floor((i-7)/3)).padStart(2,'0'),d=String(1+((i*3)%20)).padStart(2,'0');
  projects.push(P('p'+i,'Job '+i,clients[i%4],'J'+i,pms[i%2],['pm','td','fab','install']));
  tasks.push(T('t'+i+'a','p'+i,'td','Peter','2026-'+m+'-'+d,'2026-'+m+'-'+String(Math.min(28,+d+9)).padStart(2,'0'),8));
  tasks.push(T('t'+i+'b','p'+i,'install','[]','2026-12-'+String(1+(i%20)).padStart(2,'0'),'2026-12-'+String(2+(i%20)).padStart(2,'0'),2));
}
const staff=[{appId:'s1',Title:'Sam',email:'user@example.com',depts:JSON.stringify(['pm']),ooo:'[]',role:''},
  {appId:'s2',Title:'Peter',email:'',depts:JSON.stringify(['td']),ooo:'[]',role:''},
  {appId:'s3',Title:'Nick',email:'',depts:JSON.stringify(['fab']),ooo:'[]',role:''},
  {appId:'s4',Title:'Kim',email:'',depts:JSON.stringify(['pm']),ooo:'[]',role:''}];

const dom=boot(FILE,{data:{projects,tasks,staff,todos:[]}});
const win=dom.window,doc=win.document,E=s=>win.eval(s);
const q=s=>doc.querySelector(s),qa=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true}));
const change=el=>el.dispatchEvent(new win.Event('change',{bubbles:true}));
const txt=(pg,sel)=>{const e=pg.querySelector(sel);return e?e.textContent:'';};
const styleText=()=>{const s=doc.getElementById('print-page-size');return s?s.textContent:'';};
const inRule=re=>re.test(src);

sec('R2 — the four page-size rules in the source, no fixed landscape rule');
ok('R2: Letter landscape 11in 8.5in with .5in margins', inRule(/@page\{size:11in 8\.5in;margin:\.5in\}/));
ok('R2: Tabloid landscape 17in 11in with .5in margins', inRule(/@page\{size:17in 11in;margin:\.5in\}/));
ok('R2: Letter portrait 8.5in 11in with .5in margins', inRule(/@page\{size:8\.5in 11in;margin:\.5in\}/));
ok('R2: Tabloid portrait 11in 17in with .5in margins', inRule(/@page\{size:11in 17in;margin:\.5in\}/));
ok('R2: the old @page{size:landscape} rule is gone', src.indexOf('size:landscape')<0);

sec('R3 — the paper rules in the source');
const pr=(src.match(/@media print\{[\s\S]*?\n\}/)||[''])[0];
ok('R3: the print block hides the toolbar, timeline, project page, tooltip, dialogs, toasts and tour', /#toolbar,#main,#page,#tooltip,\.overlay,#toasts,#coach\{display:none!important\}/.test(pr));
ok('R3: …and the sidebar eye, edit and grip icons, drag handles and hover guides', /\.pr-page \.sb-eye,\.pr-page \.sb-edit,\.pr-page \.sb-grip,\.pr-page \.bar-handle,\.pr-page \.hover-guide,\.pr-page \.hover-tag/.test(pr));
ok('R3: …and the scroll boxes', /::-webkit-scrollbar\{display:none!important\}/.test(pr)&&/html,body\{overflow:visible!important/.test(pr));
ok('R3: a paper bar is a light tint of its colour with a solid 3px left edge and ink text', /\.pr-page \.job-bar\{background-color:color-mix\(in srgb,var\(--c\) 22%,#fff\)!important;border-left:3px solid var\(--c\);color:var\(--ink\)!important/.test(src));
ok('R3: status chips print outlined — white, 1px border in the status colour, mono caps', /\.pr-page \.sum-pill,\.pr-page \.mr-pill\{background:#fff!important;border:1px solid currentColor;font-family:var\(--mono\);font-size:11px;font-weight:700;text-transform:uppercase\}/.test(src));
ok('R3: Estimating stripes are drawn in the bar\'s own colour, not white', /\.pr-page \.bar-stripe\{background:linear-gradient\(45deg,var\(--c\) 15%,transparent 15%,transparent 50%,var\(--c\) 50%,var\(--c\) 65%,transparent 65%\) 0 0\/10px 10px;opacity:\.3\}/.test(src));
ok('R3: On hold hatch in the bar\'s colour; Forecast dashed; Complete dimmed', /\.pr-page \.job-bar\[data-st="on-hold"\]::before\{content:"";position:absolute;inset:0;background:linear-gradient\(135deg,var\(--c\) 20%/.test(src)&&/\.pr-page \.job-bar\[data-st="on-hold"\]\{opacity:1;background-image:none\}/.test(src)&&/\.pr-page \.job-bar\[data-st="forecast"\]\{outline:1\.5px dashed var\(--c\)/.test(src)&&/\.pr-page \.job-bar\[data-st="complete"\]\{opacity:\.55\}/.test(src));
ok('R5: the progress bar prints as a hairline grey track with a 1px outline on the fill in the status colour', /\.pr-page \.meet-mini\{height:8px;background:#fff;border:1px solid #CBD5E1/.test(src)&&/\.pr-page \.mm-fill\{outline:1px solid var\(--sc,#64748B\);outline-offset:-1px\}/.test(src));
ok('R3: no paper rule uses repeating-linear-gradient (it prints as a shading type pdf.js viewers paint pink)', (src.match(/^\.pr-[^\n]*\{[^}]*repeating-linear-gradient/gm)||[]).length===0&&!/repeating-linear-gradient/.test(pr));
ok('step 12: the today line prints thin', /\.pr-page \.today-line\{border-left-width:1px;background:none\}/.test(src));
ok('step 9: the calendar month strip is ink on white over a 2px rule and no longer pinned', /\.pr-page \.cal-mon\{position:static;background:#fff;color:var\(--ink\);border-bottom:2px solid var\(--ink\)/.test(src)&&/\.pr-page \.cal-dow\{position:static\}/.test(src));
ok('step 15: the preview\'s Close button is pp-close — pp-cancel is the project page\'s alone', (src.match(/id="pp-cancel"/g)||[]).length===1&&src.indexOf('id="pp-close"')>0);
ok('step 14: the preview and the sheet dialog name Save as PDF', (src.match(/choose Save as PDF there for a file/g)||[]).length===2);
ok('step 10: the sheet dialog note says to pick the paper in the Print menu, not 11×17', src.indexOf('Pick Letter or Tabloid in the Print menu')>0&&src.indexOf('Print on 11×17 landscape')<0);

let pagesLetter;
setTimeout(stage1,1500);

function stage1(){
  /* v1.37.0 (#6) opens on Active and hides the seed's completed job; this suite counts all 20,
     so it prints with the switch on All — and checks the header names the switch either way. */
  if(/function doneStatuses\(/.test(src)){
    sec('#6 × #8 — the print header names the Active / Completed / All switch');
    ok('on Active (the default) line two reads "Active projects"', E('prFiltersText(false)')==='Active projects', E('prFiltersText(false)'));
    E("SHOW_STATUS=doneStatuses('completed');render()");
    ok('on Completed it reads "Completed projects", not a status filter', E('prFiltersText(false)')==='Completed projects', E('prFiltersText(false)'));
    E("SHOW_STATUS=doneStatuses('all');render()");
    ok('on All it reads "All projects"', E('prFiltersText(false)')==='All projects', E('prFiltersText(false)'));
  }
  sec('R2 — the Print menu: paper remembered per browser, Letter on first use (Q6)');
  ok('Q6: Letter on first use', E('PAPER')==='letter'&&q('input[name=paper-pick][value=letter]').checked);
  ok('the menu offers Print Timeline…, Meeting Sheet…, Timeline + Meeting Sheet and the paper choice', !!q('#mi-print-timeline')&&!!q('#mi-meeting')&&!!q('#mi-print-both')&&qa('input[name=paper-pick]').length===2);
  ok('the first entry reads Print Timeline… off a project page and Print this project… on one', q('#mi-print-timeline .pr-lbl-tl').textContent==='Print Timeline…'&&q('#mi-print-timeline .pr-lbl-pp').textContent==='Print this project…'&&/body\.pp-route \.pr-lbl-pp\{display:inline\}/.test(src));
  ok('R2: the page-size style is written on load for the remembered paper', styleText()==='@page{size:11in 8.5in;margin:.5in}', styleText());
  const tab=q('input[name=paper-pick][value=tabloid]');tab.checked=true;change(tab);
  ok('R2: picking Tabloid writes 17in 11in and remembers it', styleText()==='@page{size:17in 11in;margin:.5in}'&&E("localStorage.getItem('shopTimelinePaper')")==='tabloid', styleText());
  const let_=q('input[name=paper-pick][value=letter]');let_.checked=true;change(let_);
  ok('R2: back to Letter writes 11in 8.5in', styleText()==='@page{size:11in 8.5in;margin:.5in}', styleText());
  E("prMount(prBuild('sheet'),true)");
  ok('R2/Q4: Portrait on the sheet yields 8.5in 11in', styleText()==='@page{size:8.5in 11in;margin:.5in}', styleText());
  ok('Q4: landscape on first use for the sheet, Portrait offered and remembered', E('SHEET_PORTRAIT')===false&&qa('input[name=sheet-orient]').length===2);
  const por=q('input[name=sheet-orient][value=portrait]');por.checked=true;change(por);
  ok('Q4: the Portrait pick is remembered', E('SHEET_PORTRAIT')===true&&E("localStorage.getItem('shopTimelineSheetPortrait')")==='1');
  const lan=q('input[name=sheet-orient][value=landscape]');lan.checked=true;change(lan);

  sec('R1/R3 — the Letter Gantt: pages, headers, footers (fixed Compact rows, 26-week range)');
  E("EXPANDED.add('p1');render()");
  pagesLetter=E("prBuild('timeline','2026-07-06','2027-01-03')");
  const pg=pagesLetter;
  ok('R1: the demo prints to pages', pg.length>=2, pg.length);
  ok('R3: every page has the header: TWOSEVEN INC., the title, the date range', pg.every(p=>txt(p,'.pr-co')==='TWOSEVEN INC.'&&/^Shop Timeline · Projects/.test(txt(p,'.pr-title'))&&/to \w+ \d+, 20\d\d$/.test(txt(p,'.pr-range'))), pg.map(p=>txt(p,'.pr-range')).join(' / '));
  ok('R3: every page\'s line two carries the version, "printed", the project count, the filters line and Color by', pg.every(p=>{const t=txt(p,'.pr-h2');return t.indexOf('v'+E('APP_VER'))===0&&/printed \w{3}, \w{3} \d+, 20\d\d/.test(t)&&/· 20 projects ·/.test(t)&&/All projects · Color by: Project$/.test(t);}), txt(pg[0],'.pr-h2'));
  ok('R3: every page\'s footer reads Page N of T with T the real page count', pg.every((p,i)=>txt(p,'.pr-pageno')==='Page '+(i+1)+' of '+pg.length), pg.map(p=>txt(p,'.pr-pageno')).join(' / '));
  ok('R3: the footer legend carries the status marks and the red-edge note on every page', pg.every(p=>{const l=txt(p,'.pr-legend');return /Forecast/.test(l)&&/Estimating/.test(l)&&/On hold/.test(l)&&/Complete/.test(l)&&/red edge = install or shipping \(Laser shares the red\)/.test(l);}));
  ok('step 6: a 26-week Letter range makes two slices, weeks 1 to 13 of 26 and weeks 14 to 26 of 26', pg.some(p=>/weeks 1 to 13 of 26$/.test(txt(p,'.pr-title')))&&pg.some(p=>/weeks 14 to 26 of 26$/.test(txt(p,'.pr-title'))), pg.map(p=>txt(p,'.pr-title')).join(' / '));
  ok('step 6: pages run across time first, then down the rows', /weeks 1 to 13/.test(txt(pg[0],'.pr-title'))&&/weeks 14 to 26/.test(txt(pg[1],'.pr-title'))&&pg.length%2===0);
  ok('step 6: the slice is a whole-week range, Monday to Sunday', txt(pg[0],'.pr-range')==='Jul 6 to Oct 4, 2026'&&txt(pg[1],'.pr-range')==='Oct 5 to Jan 3, 2027', txt(pg[0],'.pr-range'));
  ok('step 6: every page repeats the sidebar names and the date axis', pg.every(p=>p.querySelectorAll('.pr-side .sb-row').length>0&&p.querySelectorAll('.pr-hdr .hdr-m-cell').length>0&&p.querySelector('.pr-side-head').textContent==='Shop Schedule'));
  ok('Done-when: no month label is cut at the page edge — a grazing month shortens or drops its name', pg.every(p=>[...p.querySelectorAll('.pr-hdr .hdr-m-cell')].every(mc=>{const l=parseFloat(mc.style.left)||0,room=Math.min(744,l+parseFloat(mc.style.width))-Math.max(0,l)-18;return mc.textContent.length*8<=room;}))
    &&[...pg[0].querySelectorAll('.pr-hdr .hdr-m-cell')].map(m=>m.textContent).join('|')==='July 2026|August 2026|September 2026|',
    [...pg[0].querySelectorAll('.pr-hdr .hdr-m-cell')].map(m=>m.textContent).join('|'));
  ok('step 1/3: a Letter page box is 960 by 720 px', pg[0].style.width==='960px'&&pg[0].style.height==='720px', pg[0].style.width+' x '+pg[0].style.height);
  const slice1=pg.filter(p=>/weeks 1 to 13/.test(txt(p,'.pr-title')));
  const keys=slice1.flatMap(p=>[...p.querySelectorAll('.pr-side .sb-row')].map(r=>r.dataset.key));
  ok('step 13: every sidebar row is on exactly one page (per slice)', keys.length===24&&new Set(keys).size===24, keys.length+' rows, '+new Set(keys).size+' unique');
  const headPage=slice1.find(p=>p.querySelector('.pr-side .sb-row[data-key="Pp1"]'));
  ok('step 13: a project head and its expanded phase lanes print on the same page', !!headPage&&['Tt1a','Tt1b','Tt1c','Tt1d'].every(k=>!!headPage.querySelector('.pr-side .sb-row[data-key="'+k+'"]')));
  ok('step 7: rows are 32px — Compact — whatever the screen density (Comfortable here)', E('DENSITY')==='comfortable'&&slice1.every(p=>[...p.querySelectorAll('.pr-side .sb-row.proj-head,.pr-side .sb-row.task-row')].every(r=>r.style.height==='32px')));
  ok('step 7: bars are 24px', slice1.every(p=>[...p.querySelectorAll('.pr-canvas .job-bar')].every(b=>b.style.height==='24px')));
  ok('step 7: about 17 rows fit a Letter page under the axis', slice1[0].querySelectorAll('.pr-side .sb-row').length===17, slice1[0].querySelectorAll('.pr-side .sb-row').length);
  ok('step 8: every bar carries its colour on --c for the tint-and-edge rule', slice1.every(p=>[...p.querySelectorAll('.pr-canvas .job-bar')].every(b=>b.style.getPropertyValue('--c')!=='')));
  ok('the screen\'s geometry is restored after the build', E('BAR_H')===32&&E('BAR_PAD')===12&&E('TOTAL_H')>0&&E('TL_S.getTime()')!==new Date(2026,6,6).getTime());

  sec('R1/Q7 — the legend names the set Color by is using');
  E("CLIENT_FILTER=new Set(['Hermès']);render()");
  const pp=E("prBuild('timeline','2026-09-07','2026-12-06')");
  const lp=txt(pp[0],'.pr-legend');
  ok('Project mode: the legend names the page\'s projects', /Hermès Windows/.test(lp)&&/Lobby desk/.test(lp)&&pp[0].querySelectorAll('.pr-legend .pr-sw').length===6, lp);
  ok('…and the header names the setting and the Client filter', /Filters · Client: Hermès · Color by: Project$/.test(txt(pp[0],'.pr-h2')), txt(pp[0],'.pr-h2'));
  E("setColorMode('entity')");
  const pt=E("prBuild('timeline','2026-09-07','2026-12-06')");
  const lt=txt(pt[0],'.pr-legend');
  ok('Team mode: the legend names the departments present, Laser among them, beside the red-edge note', /Lasercutting/.test(lt)&&/Technical Design/.test(lt)&&/Main Shop Fab/.test(lt)&&/Installation/.test(lt)&&!/Hermès Windows/.test(lt)&&/Laser shares the red/.test(lt), lt);
  ok('Q7: the Laser swatch is install\'s red', [...pt[0].querySelectorAll('.pr-legend .pr-sw')].some(s=>s.textContent==='Lasercutting'&&s.querySelector('i').style.getPropertyValue('--c').toUpperCase()===E('INSTALL_RED').toUpperCase()));
  ok('Team mode: Installation\'s swatch is the red its bars print in, not the department blue', [...pt[0].querySelectorAll('.pr-legend .pr-sw')].some(s=>s.textContent==='Installation'&&s.querySelector('i').style.getPropertyValue('--c').toUpperCase()===E('INSTALL_RED').toUpperCase()));
  ok('…and the header names Color by: Team', /Color by: Team$/.test(txt(pt[0],'.pr-h2')), txt(pt[0],'.pr-h2'));
  E("setColorMode('project');CLIENT_FILTER.clear();render()");

  sec('step 13 — the page cutter on its own');
  const G=(head,n,h)=>({head:head?{h:26,label:head}:null,units:Array.from({length:n},(_,i)=>({rows:[{h:h||32,i}]}))});
  const cut=E('prPaginate')([G('A',5),G('B',8)],300);
  ok('a group that would split starts a new page instead', cut.length===2&&cut[0].length===6&&cut[1].length===9&&cut[1][0].label==='B'&&!cut[1][0].cont, cut.map(p=>p.length).join(','));
  const tall=E('prPaginate')([G('Big',20)],300);
  ok('a group taller than a page flows, its heading repeated on the continuation', tall.length===3&&tall[1][0].label==='Big'&&tall[1][0].cont===true&&tall.flat().filter(r=>r.i!==undefined).length===20, tall.map(p=>p.length).join(','));
  const unit=E('prPaginate')([{head:null,units:[{rows:[{h:32},{h:32}]},{rows:[{h:32},{h:32},{h:32},{h:32}]}]}],160);
  ok('a unit (a project with its lanes) moves whole to the next page', unit.length===2&&unit[0].length===2&&unit[1].length===4, unit.map(p=>p.length).join(','));
  const orphan=E('prPaginate')([{head:null,units:[{rows:[{h:100}]}]},{head:{h:26,label:'D'},units:[{rows:Array.from({length:17},()=>({h:32}))}]}],559);
  ok('review: a heading is never left alone on a page, and no page overflows, when a project just fits a page but not under its heading',
    orphan.every(p=>p.reduce((a,r)=>a+r.h,0)<=559)&&orphan.every(p=>p.some(r=>!r.label)), orphan.map(p=>p.reduce((a,r)=>a+r.h,0)+'px/'+p.length).join(' '));
  sec('review — one time scale across slices; search fades by the screen\'s own rule');
  const sc15=E("prBuild('timeline','2026-09-07','2026-12-20')").filter(p=>/weeks/.test(txt(p,'.pr-title')));
  const vw=p=>parseFloat(p.querySelector('.pr-view').style.width);
  ok('review: a 15-week Letter range draws its 2-week second slice at the first slice\'s scale, not stretched', sc15.length===4&&vw(sc15[0])===744&&vw(sc15[2])===744&&vw(sc15[3])===vw(sc15[1])&&vw(sc15[1])===Math.round(14*744/91)&&/weeks 14 to 15 of 15$/.test(txt(sc15[1],'.pr-title')), sc15.map(vw).join(','));
  E("FILTER='lasercutting';render()");
  const sf=E("prBuild('timeline','2026-09-07','2026-12-06')");
  const tb=id=>sf.map(p=>p.querySelector('.pr-canvas .job-bar[data-tid="'+id+'"]')).find(Boolean);
  ok('review: a search that matches a phase (its department) keeps that phase bright and fades the rest, as on screen', !!tb('t1b')&&!tb('t1b').classList.contains('dim')&&!!tb('t1a')&&tb('t1a').classList.contains('dim'), tb('t1b')&&tb('t1b').className);
  E("FILTER='';render()");

  sec('R4/R5/Q5 — the Meeting Sheet');
  E('PR_FIXED_H=40'); /* jsdom cannot measure — fixed demo row heights */
  const sh=E("prBuild('sheet')");
  ok('R1: the sheet prints to pages with the house header and Page N of T', sh.length===2&&sh.every((p,i)=>txt(p,'.pr-title')==='Shop Meeting Sheet'&&txt(p,'.pr-pageno')==='Page '+(i+1)+' of '+sh.length), sh.length);
  ok('step 10: about 14 rows fit on Letter; a PM group that would split starts a new page', sh[0].querySelectorAll('tbody tr').length===11&&sh[1].querySelectorAll('tbody tr').length===11&&sh[1].querySelector('tbody tr').classList.contains('meet-pm'), sh.map(p=>p.querySelectorAll('tbody tr').length).join(','));
  ok('step 10: every page break falls between rows — each row on exactly one page', sh.flatMap(p=>[...p.querySelectorAll('tbody .meet-row .mr-name')].map(e=>e.textContent)).length===20&&new Set(sh.flatMap(p=>[...p.querySelectorAll('tbody .meet-row .mr-name')].map(e=>e.textContent))).size===20);
  ok('step 10: the column heads repeat on every page; Notes stays blank', sh.every(p=>p.querySelector('thead .meet-cols')&&[...p.querySelectorAll('.mr-notes')].every(td=>td.textContent==='')));
  ok('step 11: the sheet\'s footer carries Shop Timeline and the version, no legend', sh.every(p=>txt(p,'.pr-legend')==='Shop Timeline v'+E('APP_VER')));
  ok('step 5: the sheet\'s line two names the version, printed date and count, and no Color by', /^v\d.*printed .*· 20 projects · All projects$/.test(txt(sh[0],'.pr-h2')), txt(sh[0],'.pr-h2'));
  E("CLIENT_FILTER=new Set(['Dior']);render()");
  const sc=E("prBuild('sheet')");
  const names=sc.flatMap(p=>[...p.querySelectorAll('.meet-row .mr-name')].map(e=>e.textContent));
  ok('Q5: with a Client filter the sheet lists only that client\'s projects', names.length===5&&names.every(n=>/Atrium|Holiday Windows|Job (9|13|17)/.test(n)), names.join(', '));
  ok('Q5: …and the header names the filter', /Filters · Client: Dior$/.test(txt(sc[0],'.pr-h2')), txt(sc[0],'.pr-h2'));
  E("CLIENT_FILTER.clear();PERSON='Nick';render()");
  const spn=E("prBuild('sheet')");
  ok('Q5: the Person filter drops the projects without that person, as the screen does', spn.flatMap(p=>[...p.querySelectorAll('.meet-row')]).length===E("buildRows().rows.filter(r=>r.kind==='projHead').length")&&/Person: Nick/.test(txt(spn[0],'.pr-h2')), txt(spn[0],'.pr-h2'));
  E("PERSON=null;FILTER='windows';render()");
  const ss=E("prBuild('sheet')");
  const rows=ss.flatMap(p=>[...p.querySelectorAll('.meet-row')]);
  ok('Q5: a search term leaves the non-matching rows on the sheet, faded', rows.length===20&&rows.filter(r=>r.classList.contains('dim')).length===18&&rows.filter(r=>!r.classList.contains('dim')).every(r=>/Windows/.test(r.querySelector('.mr-name').textContent)), rows.filter(r=>r.classList.contains('dim')).length);
  ok('Q5: …and the header names the term', /Search: windows/.test(txt(ss[0],'.pr-h2')), txt(ss[0],'.pr-h2'));
  E("FILTER='';SPOT.add('p1');render()");
  const sp=E("prBuild('sheet')");
  ok('Q5: a spotlight fades the same way and the header names the spotlit project', sp.flatMap(p=>[...p.querySelectorAll('.meet-row:not(.dim)')]).length===1&&/Spotlight: Hermès Windows/.test(txt(sp[0],'.pr-h2')), txt(sp[0],'.pr-h2'));
  E("SPOT.clear();render()");
  E("setPaper('tabloid')");
  const st=E("prBuild('sheet')");
  ok('step 10: on Tabloid the extra width goes to Notes (26% to 37%)', st[0].style.width==='1536px'&&st[0].querySelector('.meet-cols th:last-child').style.width==='37%'&&st.length===2&&st[0].querySelectorAll('tbody tr').length===11, st.map(p=>p.querySelectorAll('tbody tr').length).join(',')); /* Kim's 11 rows would split the 20-row page, so they start page 2 */
  E("setPaper('letter');setSheetPortrait(true)");
  const sq=E("prBuild('sheet')");
  const colPx=(pg,n)=>parseFloat(pg.querySelector('.meet-cols th:nth-child('+n+')').style.width)/100*parseFloat(pg.style.width);
  ok('step 10: portrait narrows Phase and Timeline (in inches on the page) and keeps Notes', sq[0].style.width==='720px'&&sq[0].style.height==='960px'
    &&colPx(sq[0],3)<colPx(sh[0],3)&&colPx(sq[0],4)<colPx(sh[0],4)&&sq[0].querySelector('.meet-cols th:last-child').textContent==='Notes'&&parseFloat(sq[0].querySelector('.meet-cols th:last-child').style.width)>=25,
    [3,4,7].map(n=>Math.round(colPx(sq[0],n))+' vs '+Math.round(colPx(sh[0],n))).join(', '));
  ok('step 10: the sheet\'s dates never wrap on paper', /\.pr-page \.mm-dates\{white-space:nowrap\}/.test(src));
  E("setSheetPortrait(false)");
  const both=E("prBuild('both','2026-09-07','2026-12-06')");
  ok('step 2: Timeline + Meeting Sheet is one set of pages, timeline first, one numbering', both.length===4&&both.slice(0,2).every(p=>/^Shop Timeline · Projects$/.test(txt(p,'.pr-title')))&&both.slice(2).every(p=>txt(p,'.pr-title')==='Shop Meeting Sheet')&&txt(both[3],'.pr-pageno')==='Page 4 of 4', both.map(p=>txt(p,'.pr-title')).join(' / '));
  ok('step 2: the combined set prints landscape even with Portrait chosen for the sheet alone', (()=>{E("setSheetPortrait(true)");const b=E("prBuild('both','2026-09-07','2026-12-06')");E("setSheetPortrait(false)");return b[2].style.width==='960px';})());
  E('PR_FIXED_H=null');

  sec('step 2/14 — the preview dialog');
  click(q('#mi-print-timeline'));
  ok('Print Timeline… opens the preview on the app-built pages, From/To prefilled', !q('#print-overlay').classList.contains('hidden')&&qa('#pp-zoom-inner .pr-page').length>0&&!!q('#pp-start').value&&!q('#print-overlay').classList.contains('no-range'));
  const pvBar=q('#pp-zoom-inner .job-bar[data-tid]'),pvSum=q('#pp-zoom-inner .job-bar.summary'),h0=win.location.hash;
  pvBar.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0,clientX:50,clientY:5}));
  click(pvBar);click(pvSum);
  ok('review: preview bars are inert copies — a press or click starts no drag, opens no task, leaves the page', E('DRAG')===null&&E('EDIT_TASK_ID')==null&&win.location.hash===h0);
  doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,button:0}));
  q('#print-root').innerHTML='';
  const ps=q('#pp-start').value;q('#pp-start').value='2026-12-01';q('#pp-end').value='2026-11-01';click(q('#pp-print'));
  ok('review: Print refuses a To before From', q('#print-root').children.length===0);
  q('#pp-start').value=ps;q('#pp-end').value='2026-12-06';click(q('#pp-print'));
  ok('Print mounts the pages into #print-root for the browser dialog', q('#print-root').querySelectorAll('.pr-page').length>0);
  q('#print-root').innerHTML='';
  click(q('#pp-close'));
  ok('step 15: Close (pp-close) closes it', q('#print-overlay').classList.contains('hidden'));
  click(q('#mi-print-both'));
  ok('Timeline + Meeting Sheet previews both', qa('#pp-zoom-inner .pr-page').length>=2&&[...qa('#pp-zoom-inner .pr-title')].some(e=>e.textContent==='Shop Meeting Sheet'));
  click(q('#pp-close'));

  win.location.hash='#/project/p6';E('applyRoute()');
  setTimeout(saved,900);
}

function saved(){
  sec('R4 — a saved project\'s page: the Calendar, one month per page, and the project Gantt');
  E("NPV_MODE='calendar';npvRender()");
  const c=E("prBuild('project')");
  ok('R4: a three-month project prints three calendar page boxes', c.length===3, c.length);
  ok('R4: one month header each, in order', c.map(p=>p.querySelectorAll('.cal-mon').length).join(',')==='1,1,1'&&c.map(p=>txt(p,'.cal-mon')).join('/')==='October 2026/November 2026/December 2026', c.map(p=>txt(p,'.cal-mon')).join('/'));
  ok('R4: the project is named in the header', c.every(p=>txt(p,'.pr-title')==='Shop Calendar · Three Month Job'&&txt(p,'.pr-co')==='TWOSEVEN INC.'));
  ok('R4: line two carries the cost code, client, PM and deadline', c.every(p=>txt(p,'.pr-h2')==='T6 · Tiffany · PM Kim · Due Dec 16, 2026'), txt(c[0],'.pr-h2'));
  ok('step 9: only the weeks the job touches, each month\'s weeks sharing the page height', c.every(p=>p.querySelectorAll('.cal-wk').length>=3&&[...p.querySelectorAll('.cal-wk')].every(w=>/^\d+px$/.test(w.style.height))));
  ok('step 9: bands carry their colour on --c; seven day columns a week', c.every(p=>[...p.querySelectorAll('.cal-band.ph')].every(b=>b.style.getPropertyValue('--c')!=='')&&p.querySelector('.cal-wk').querySelectorAll('.cal-col').length===7));
  ok('step 11: the calendar\'s footer lists the job\'s departments as plain chips', txt(c[0],'.pr-legend')==='Technical DesignMain Shop FabInstallation', txt(c[0],'.pr-legend'));
  ok('step 5: Page N of T', c.map(p=>txt(p,'.pr-pageno')).join('/')==='Page 1 of 3/Page 2 of 3/Page 3 of 3');
  E("NPV_MODE='gantt';npvRender()");
  const g=E("prBuild('project')");
  ok('R4: the project Gantt prints with its own title and the same line two', g.length===1&&txt(g[0],'.pr-title')==='Shop Timeline · Three Month Job'&&txt(g[0],'.pr-h2')==='T6 · Tiffany · PM Kim · Due Dec 16, 2026', txt(g[0],'.pr-title')+' | '+txt(g[0],'.pr-h2'));
  ok('step 9: the phase gutter stands in for the sidebar, one 32px row per department, bars 24px', g[0].querySelectorAll('.pr-gut').length===3&&g[0].querySelectorAll('.pr-canvas .job-bar').length===3&&[...g[0].querySelectorAll('.pr-canvas .job-bar')].every(b=>b.style.height==='24px'), g[0].querySelectorAll('.pr-gut').length);
  ok('step 9: the span is whole weeks, Monday to Sunday', /^Oct 12 to Dec 20, 2026$/.test(txt(g[0],'.pr-range')), txt(g[0],'.pr-range'));
  ok('step 9: no phase apart from its project — one page, every department of the job on it', [...g[0].querySelectorAll('.pr-gut')].map(e=>e.textContent).join('|')==='Technical Design · Peter|Main Shop Fab · Nick|Installation', [...g[0].querySelectorAll('.pr-gut')].map(e=>e.textContent).join('|'));
  click(q('#mi-print-timeline'));
  ok('step 2: on a project\'s page the first entry opens the preview without From/To', !q('#print-overlay').classList.contains('hidden')&&q('#print-overlay').classList.contains('no-range')&&qa('#pp-zoom-inner .pr-page').length===1&&txt(q('#pp-zoom-inner'),'.pr-title')==='Shop Timeline · Three Month Job');
  click(q('#pp-close'));
  ok('step 2: Timeline + Meeting Sheet from a project\'s page prints the whole-shop timeline plus the sheet', (()=>{E('PR_FIXED_H=40');const b=E("prBuild('both')");E('PR_FIXED_H=null');return b.length>=3&&txt(b[0],'.pr-title').indexOf('Shop Timeline · Projects')===0&&txt(b[b.length-1],'.pr-title')==='Shop Meeting Sheet';})());

  win.location.hash='#/project/new';E('applyRoute()');
  setTimeout(draft,900);
}

function draft(){
  sec('R4 — the New Project draft page prints too (default: as shown, "Draft, not yet created", no cost code)');
  q('#pp-name').value='Soho Holiday';change(q('#pp-name'));
  q('#pp-client').value='Bulgari';change(q('#pp-client'));
  q('#pp-code').value='B9';change(q('#pp-code'));
  const pm=qa('#pp-r-pm input').find(i=>i.value==='Kim');if(pm){pm.checked=true;change(pm);}
  E('npvRebuild()');
  ok('the draft has a schedule to print', E('NPV_TASKS.length')>0&&E('ROUTE.creating')===true);
  E("NPV_MODE='calendar';npvRender()");
  const c=E("prBuild('project')");
  ok('R4 draft: the Calendar prints, the draft named in the header', c.length>=1&&c.every(p=>txt(p,'.pr-title')==='Shop Calendar · Soho Holiday'), txt(c[0],'.pr-title'));
  ok('R4 draft: line two reads Draft, not yet created with the client, PM and deadline typed so far', /^Draft, not yet created · Bulgari · PM Kim · Due \w{3} \d+, 20\d\d$/.test(txt(c[0],'.pr-h2')), txt(c[0],'.pr-h2'));
  ok('R4 draft: no cost code on a draft', txt(c[0],'.pr-h2').indexOf('B9')<0);
  ok('R4 draft: one month per page, a month header each', c.every(p=>p.querySelectorAll('.cal-mon').length===1));
  E("NPV_MODE='gantt';npvRender()");
  const g=E("prBuild('project')");
  ok('R4 draft: the Gantt prints with the same lines', g.length===1&&txt(g[0],'.pr-title')==='Shop Timeline · Soho Holiday'&&txt(g[0],'.pr-h2')===txt(c[0],'.pr-h2')&&g[0].querySelectorAll('.pr-gut').length===E("NPV_TASKS.filter(t=>t.department!=='pm').length"), g[0].querySelectorAll('.pr-gut').length);
  ok('R4 draft: the print leaves the draft untouched', E('ROUTE.creating')===true&&q('#pp-name').value==='Soho Holiday');

  sec('R2 — a reload remembers the paper (a second boot with the stored choice)');
  const dom2=boot(FILE,{data:{projects,tasks,staff,todos:[]},localStorage:{shopTimelinePaper:'tabloid',shopTimelineSheetPortrait:'1'}});
  const w2=dom2.window;
  setTimeout(()=>{
    const s2=w2.document.getElementById('print-page-size');
    ok('R2: Tabloid comes back after a reload and the menu shows it', w2.eval('PAPER')==='tabloid'&&w2.document.querySelector('input[name=paper-pick][value=tabloid]').checked&&!!s2&&s2.textContent==='@page{size:17in 11in;margin:.5in}', s2&&s2.textContent);
    ok('Q4: the sheet\'s Portrait choice comes back too', w2.eval('SHEET_PORTRAIT')===true&&w2.document.querySelector('input[name=sheet-orient][value=portrait]').checked);
    if(/function doneStatuses\(/.test(src))w2.eval("SHOW_STATUS=doneStatuses('all');render()"); /* #6: count all 20, as above */
    const tp=w2.eval("prBuild('timeline','2026-08-03','2027-01-03')");
    ok('step 3: a Tabloid page box is 1536 by 960 px and a 22-week range is one slice', tp[0].style.width==='1536px'&&tp[0].style.height==='960px'&&tp.every(p=>!/weeks/.test(p.querySelector('.pr-title').textContent)), tp[0].style.width);
    ok('step 7: about 25 rows fit a Tabloid page', tp[0].querySelectorAll('.pr-side .sb-row').length===20, tp[0].querySelectorAll('.pr-side .sb-row').length);
    done();
  },1500);
}

function done(){
  console.log('\n'+'-'.repeat(46));
  console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
  process.exit(fail?1:0);
}
