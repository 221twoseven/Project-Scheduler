/* REV70 (5b): People & Availability fed from Microsoft Teams.
   - loadTeamMembers() reads the company Team's members (TeamMember.Read.All on its
     own token request) into {name, email, userId}, sorted.
   - The staff editor's name field suggests from the Team (datalist); typing/picking
     an exact member fills the email if empty — never overwrites one.
   - Opening the editor backfills emails where a no-email person matches exactly ONE
     member; ambiguous names stay untouched.
   - Membership is a menu, not a sync: only explicitly saved people join the roster.
   Skips on builds that predate the Teams picker.
   Run: node test70.js index.html */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);

const teamMembers=[
 {displayName:'Milo Barnes',email:'Milo@Example.com',userId:'u1'},
 {displayName:'Ines Woo',email:'kate@example.com',userId:'u2'},
 {displayName:'Ana Diaz',email:'ana@example.com',userId:'u3'},
 {displayName:'Ana Diaz',email:'ana2@example.com',userId:'u4'},   /* ambiguous twin */
 {displayName:'Theo Fields',email:'stan@example.com',userId:'u5'}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[],teamMembers},teamMembers:true});
const win=dom.window;
const E=s=>win.eval(s);

const finish=()=>{
  done();
};

setTimeout(()=>{
  /* Roster: Milo Barnes (no email — should backfill), Ana Diaz (ambiguous — should
     NOT), Ines Woo (has an email already — must not be overwritten). */
  E("PEOPLE=[{id:'a',name:'Milo Barnes',email:'',role:'',depts:['fab'],ooo:[]},{id:'b',name:'Ana Diaz',email:'',role:'',depts:['td'],ooo:[]},{id:'c',name:'Ines Woo',email:'kw@old.example',role:'',depts:['fab'],ooo:[]}];rebuildStaff();");
  if(/renderCompanyPage/.test(src)){
    /* v1.7.0: the staff editor is the People page's per-record edit state. The Team
       datalist is global (#cd-dl); backfill applies to the record being edited. */
    E("location.hash='#/people';applyRoute()");
    E("CD_SEL=PEOPLE.find(p=>p.name==='Milo Barnes').id;cdPaintDetail();document.getElementById('cdd-edit').click();");
    setTimeout(()=>{
      sec('Team members load and feed the name datalist');
      ok('members mapped and sorted',E("TM_MEMBERS.length")===5&&E("TM_MEMBERS[0].name")==='Ana Diaz');
      ok('emails normalized to lowercase',E("TM_MEMBERS.some(m=>m.email==='nick@example.com')"));
      ok('datalist filled',E("document.querySelectorAll('#cd-dl option').length")===5);
      ok('the name input suggests from it',E("document.getElementById('cde-name').getAttribute('list')")==='cd-dl');

      sec('Backfill on edit: exact single match only');
      ok('Milo got his email',E("CD_EDIT.email")==='nick@example.com');
      E("cdSavePerson();");
      E("CD_SEL=PEOPLE.find(p=>p.name==='Ana Diaz').id;cdPaintDetail();document.getElementById('cdd-edit').click();");
      setTimeout(()=>{
        ok('ambiguous Ana stays empty',E("CD_EDIT.email")==='');
        E("CD_EDIT=null;cdPaintDetail();");
        E("CD_SEL=PEOPLE.find(p=>p.name==='Ines Woo').id;cdPaintDetail();document.getElementById('cdd-edit').click();");
        setTimeout(()=>{
          ok('Ines’s existing email untouched',E("CD_EDIT.email")==='kw@old.example');
          E("CD_EDIT=null;cdPaintDetail();");

          sec('Typing an exact member name fills the email live');
          E("document.getElementById('cd-add').click();");
          E("(function(){const nm=document.getElementById('cde-name');nm.value='Theo Fields';nm.dispatchEvent(new (window.Event)('input'));})();");
          ok('a new person picked from the Team gets the email',E("CD_EDIT.email")==='stan@example.com');
          ok('and the email input shows it',E("document.getElementById('cde-email').value")==='stan@example.com');

          sec('Save keeps it all a normal roster save');
          E("cdSavePerson();");
          ok('saved people carry the filled emails',E("PEOPLE.find(p=>p.name==='Milo Barnes').email")==='nick@example.com'&&
             E("PEOPLE.find(p=>p.name==='Theo Fields').email")==='stan@example.com');
          ok('only explicitly added people joined (no auto-import of the Team)',E("PEOPLE.length")===4);
          finish();
        },400);
      },400);
    },500);
    return;
  }
  E("document.getElementById('mi-people').click();");
  setTimeout(()=>{
    sec('Team members load and feed the name datalist');
    ok('members mapped and sorted',E("TM_MEMBERS.length")===5&&E("TM_MEMBERS[0].name")==='Ana Diaz');
    ok('emails normalized to lowercase',E("TM_MEMBERS.some(m=>m.email==='nick@example.com')"));
    ok('datalist filled',E("document.querySelectorAll('#tm-dl option').length")===5);
    ok('name inputs suggest from it',E("document.querySelector('#st-list .st-name').getAttribute('list')")==='tm-dl');

    sec('Backfill on open: exact single match only');
    ok('Milo got his email',E("SM_PEOPLE.find(p=>p.name==='Milo Barnes').email")==='nick@example.com');
    ok('ambiguous Ana stays empty',E("SM_PEOPLE.find(p=>p.name==='Ana Diaz').email")==='');
    ok('Ines’s existing email untouched',E("SM_PEOPLE.find(p=>p.name==='Ines Woo').email")==='kw@old.example');

    sec('Typing an exact member name fills the email live');
    E("document.getElementById('st-add').click();");
    E("(function(){const cards=document.querySelectorAll('#st-list .st-person');const c=cards[cards.length-1];const nm=c.querySelector('.st-name');nm.value='Theo Fields';nm.dispatchEvent(new (window.Event)('input'));})();");
    ok('new person picked from the Team gets the email',E("SM_PEOPLE[SM_PEOPLE.length-1].email")==='stan@example.com');
    ok('and the email input shows it',E("(function(){const cards=document.querySelectorAll('#st-list .st-person');return cards[cards.length-1].querySelector('.st-meta input').value;})()")==='stan@example.com');

    sec('Save keeps it all a normal roster save');
    E("document.getElementById('st-save').click();");
    ok('saved people carry the filled emails',E("PEOPLE.find(p=>p.name==='Milo Barnes').email")==='nick@example.com'&&
       E("PEOPLE.find(p=>p.name==='Theo Fields').email")==='stan@example.com');
    ok('only explicitly added people joined (no auto-import of the Team)',E("PEOPLE.length")===4);
    finish();
  },500);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
