/* Boot Timeline_XX.html in jsdom with MSAL + fetch stubbed.
   Returns {win,doc,ST-ish accessors} once the app script has run. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');

function boot(file,opts){
  opts=opts||{};
  let html=fs.readFileSync(file,'utf8');
  // strip the external msal script tag; we inject a stub instead
  html=html.replace(/<script src="msal-browser\.min\.js"><\/script>/,'<script>'+msalStub()+'</script>');

  const dom=new JSDOM(html,{
    runScripts:'dangerously',
    pretendToBeVisual:true,
    url:opts.url||'https://example.github.io/shop-timeline/',
    beforeParse(win){
      const f=makeFetch(opts.data||{projects:[],tasks:[],todos:[]},opts);
      win.fetch=f;
      win.__spCalls=f.calls;   /* every Graph request, for round-trip assertions */
      win.requestAnimationFrame=cb=>setTimeout(()=>cb(Date.now()),0);
      win.cancelAnimationFrame=id=>clearTimeout(id);
      win.confirm=()=>true;
      win.alert=()=>{};
      win.scrollTo=()=>{};
      win.getComputedStyle=win.getComputedStyle||(()=>({}));
      /* REV74: the first-run coach-mark tour would otherwise auto-open inside every
         suite and swallow keyboard events. Suites that test it pass coachFirstRun. */
      if(!opts.coachFirstRun)win.localStorage.setItem('shopTimelineCoachSeen','1');
      /* V4: suites can pre-seed localStorage to test what a reload picks up */
      if(opts.localStorage)for(const k in opts.localStorage)win.localStorage.setItem(k,opts.localStorage[k]);
    }
  });
  return dom;
}

function msalStub(){
  return `window.msal={PublicClientApplication:function(cfg){
    this.cfg=cfg;
    this.getAllAccounts=()=>[{username:'user@example.com',name:'Sam'}];
    this.setActiveAccount=()=>{};
    this.loginPopup=async()=>({account:{username:'user@example.com'}});
    this.acquireTokenSilent=async()=>({accessToken:'tok'});
    this.acquireTokenPopup=async()=>({accessToken:'tok'});
  }};`;
}

function makeFetch(data,opts){
  const calls=[];
  const listNames={projects:'ShopTimeline_Projects',tasks:'ShopTimeline_Tasks',
                   staff:'ShopTimeline_Staff',todos:'ShopTimeline_Tasks2',
                   events:'ShopTimeline_Events',clients:'ShopTimeline_Clients'};
  const fn=async function(url,init){
    calls.push({url:String(url),init,
      body:(init&&init.body)?JSON.parse(init.body):null,
      method:(init&&init.method)||'GET'});
    const u=String(url);
    const ok=(body)=>({ok:true,status:200,json:async()=>body,text:async()=>JSON.stringify(body)});
    const fail=(code)=>({ok:false,status:code,json:async()=>({}),text:async()=>'not found'});
    if(/\/sites\/[^/]+:\//.test(u)&&!/\/lists\//.test(u))return ok({id:'SITE1'});
    if(u.includes(listNames.todos)){
      if(opts.todosList)return ok({value:(data.todos||[]).map(toItem)});
      return fail(404);
    }
    if(u.includes(listNames.events)){
      if(opts.eventsList)return ok({value:(data.events||[]).map(toItem)});
      return fail(404);
    }
    if(u.includes(listNames.clients)){
      if(opts.clientsList)return ok({value:(data.clients||[]).map(toItem)});
      return fail(404);
    }
    if(u.includes('/teams/')){
      /* Team membership (5b). Raw Graph member objects, not list items. */
      if(opts.teamMembers)return ok({value:data.teamMembers||[]});
      return fail(403);
    }
    if(u.includes(listNames.staff))return ok({value:(data.staff||[]).map(toItem)});
    if(u.includes(listNames.projects))return ok({value:(data.projects||[]).map(toItem)});
    if(u.includes(listNames.tasks))return ok({value:(data.tasks||[]).map(toItem)});
    return ok({value:[]});
  };
  fn.calls=calls;
  return fn;
  function toItem(f,i){return {id:'sp'+i,fields:f,
    lastModifiedBy:{user:{displayName:'Sam'}},lastModifiedDateTime:'2026-07-30T12:00:00Z'};}
}

module.exports={boot};
