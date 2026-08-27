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
const {boot}=require('./harness');
const fs=require('fs');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

if(!/TEAM_GROUP_ID/.test(src)){
  console.log('  SKIP  build predates the Teams picker (no TEAM_GROUP_ID) — nothing to assert');
  console.log('\n'+'-'.repeat(46));
  console.log('  0 passed, 0 failed   ['+FILE+']');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const teamMembers=[
 {displayName:'Nick Barnes',email:'Nick@Twoseven.net',userId:'u1'},
 {displayName:'Kate Woo',email:'kate@twoseven.net',userId:'u2'},
 {displayName:'Ana Diaz',email:'ana@twoseven.net',userId:'u3'},
 {displayName:'Ana Diaz',email:'ana2@twoseven.net',userId:'u4'},   /* ambiguous twin */
 {displayName:'Stan Fields',email:'stan@twoseven.net',userId:'u5'}];

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[],teamMembers},teamMembers:true});
const win=dom.window;
const E=s=>win.eval(s);

setTimeout(()=>{
  /* Roster: Nick Barnes (no email — should backfill), Ana Diaz (ambiguous — should
     NOT), Kate Woo (has an email already — must not be overwritten). */
  E("PEOPLE=[{id:'a',name:'Nick Barnes',email:'',role:'',depts:['fab'],ooo:[]},{id:'b',name:'Ana Diaz',email:'',role:'',depts:['td'],ooo:[]},{id:'c',name:'Kate Woo',email:'kw@old.example',role:'',depts:['fab'],ooo:[]}];rebuildStaff();");
  E("document.getElementById('mi-people').click();");
  setTimeout(()=>{
    sec('Team members load and feed the name datalist');
    ok('members mapped and sorted',E("TM_MEMBERS.length")===5&&E("TM_MEMBERS[0].name")==='Ana Diaz');
    ok('emails normalized to lowercase',E("TM_MEMBERS.some(m=>m.email==='nick@twoseven.net')"));
    ok('datalist filled',E("document.querySelectorAll('#tm-dl option').length")===5);
    ok('name inputs suggest from it',E("document.querySelector('#st-list .st-name').getAttribute('list')")==='tm-dl');

    sec('Backfill on open: exact single match only');
    ok('Nick got his email',E("SM_PEOPLE.find(p=>p.name==='Nick Barnes').email")==='nick@twoseven.net');
    ok('ambiguous Ana stays empty',E("SM_PEOPLE.find(p=>p.name==='Ana Diaz').email")==='');
    ok('Kate’s existing email untouched',E("SM_PEOPLE.find(p=>p.name==='Kate Woo').email")==='kw@old.example');

    sec('Typing an exact member name fills the email live');
    E("document.getElementById('st-add').click();");
    E("(function(){const cards=document.querySelectorAll('#st-list .st-person');const c=cards[cards.length-1];const nm=c.querySelector('.st-name');nm.value='Stan Fields';nm.dispatchEvent(new (window.Event)('input'));})();");
    ok('new person picked from the Team gets the email',E("SM_PEOPLE[SM_PEOPLE.length-1].email")==='stan@twoseven.net');
    ok('and the email input shows it',E("(function(){const cards=document.querySelectorAll('#st-list .st-person');return cards[cards.length-1].querySelector('.st-meta input').value;})()")==='stan@twoseven.net');

    sec('Save keeps it all a normal roster save');
    E("document.getElementById('st-save').click();");
    ok('saved people carry the filled emails',E("PEOPLE.find(p=>p.name==='Nick Barnes').email")==='nick@twoseven.net'&&
       E("PEOPLE.find(p=>p.name==='Stan Fields').email")==='stan@twoseven.net');
    ok('only explicitly added people joined (no auto-import of the Team)',E("PEOPLE.length")===4);

    console.log('\n'+'-'.repeat(46));
    console.log('  '+pass+' passed, '+fail+' failed   ['+FILE+']');
    process.exit(fail?1:0);
  },500);
},1500);
setTimeout(()=>{console.log('TIMEOUT');process.exit(1);},20000);
