/* v1.48.2 — item 48, PR 8: the one error rule. store.explain(err) turns a failed call into one
   sentence (wording: owner, 2026-10-14); error messages read "<what failed>: <why> <next step>",
   the raw error under the toast's Details. Panels (no Details link) drop the "Click Details" part.
   Run: node tests/test-v1482.js index.html  (or via tests/run.js) */
const {boot,suite}=require('./harness');
const {FILE,src,ok,done}=suite();

const sec=t=>console.log('\n'+t);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

const dom=boot(FILE,{data:{projects:[],tasks:[],staff:[],todos:[]}});
const win=dom.window;
const E=s=>win.eval(s);
const X=(m,panel)=>E("store.explain(new Error("+JSON.stringify(m)+"),"+!!panel+")");

setTimeout(async()=>{
  sec('store.explain: one sentence per kind of failure');
  ok('no network', X('Failed to fetch')==='This computer looks offline. Check your internet connection.', X('Failed to fetch'));
  ok('no network (Firefox wording)', X('NetworkError when attempting to fetch resource.').startsWith('This computer looks offline.'));
  ok('401', X('SharePoint 401: x')==='Your Microsoft account doesn’t have access to that list.');
  ok('403', X('SharePoint 403: x')==='Your Microsoft account doesn’t have access to that list.');
  ok('404', X('SharePoint 404: x')==='The list isn’t on the TWOSEVENINC site.');
  ok('400 points at Details', X('SharePoint 400: Field \'foo\' is not recognized')==='A column is missing from the list. Click Details below to see which one.');
  ok('a staff sync error (wrapped) still reads its status', X('2 staff rows didn\'t save — Sam: SharePoint 400: Field \'foo\' is not recognized').startsWith('A column is missing'));
  ok('a 404 on a deleted row is not "list missing"', X('SharePoint 404: {"error":{"code":"itemNotFound"}}').startsWith('SharePoint returned an error.'));
  ok('a 400 for a bad value is not "column missing"', X('SharePoint 400: {"error":{"code":"invalidRequest","message":"Invalid date"}}').startsWith('SharePoint returned an error.'));
  ok('MSAL offline at sign-in', X('endpoints_resolution_error: could not resolve endpoints').startsWith('This computer looks offline.'));
  ok('429', X('SharePoint 429: x')==='SharePoint is busy right now.');
  ok('503', X('SharePoint 503: x')==='SharePoint is busy right now.');
  ok('anything else', X('SharePoint 409: x')==='SharePoint returned an error. Click Details below for the full message.');
  ok('a non-SharePoint error', X('popup_window_error').startsWith('SharePoint returned an error.'));
  sec('panels have no Details link');
  ok('400 in a panel', X('SharePoint 400: Field \'foo\' is not recognized',true)==='A column is missing from the list.');
  ok('anything else in a panel', X('SharePoint 409: x',true)==='SharePoint returned an error.');

  sec('a failed save reads "<what failed>: <why>", the raw error under Details');
  E("window.__f=fetch;fetch=async()=>{throw new TypeError('Failed to fetch');}");
  await E("fbSetStatus('9','resolved',null)");
  await wait(100);
  const t=E("[...document.querySelectorAll('#toasts .toast')].map(x=>x.textContent).pop()||''");
  ok('the status toast names what failed and why', t.indexOf('Couldn’t save the status: This computer looks offline. Check your internet connection.')===0, t);
  ok('Details carries the raw error', /Failed to fetch/.test(E("(document.querySelector('#toasts .toast:last-child .toast-tech')||{}).textContent||''")));
  E("fetch=window.__f");

  done();
},1500);
