/* C4 / Design-Language §2.5: every colored fill that carries a label must pair
   with labelColor(fill) at ≥4.5:1, and every hand-authored status-pill palette
   entry in the CSS must itself hit ≥4.5:1. Fails when a palette edit regresses.
   Run: node tests/test-contrast.js index.html */
const fs=require('fs'),path=require('path');
const {boot}=require('./harness');
const FILE=process.argv[2]||'index.html';

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

const src=fs.readFileSync(FILE,'utf8');
if(!/function labelColor/.test(src)){
  console.log('test-contrast: skipped — no labelColor() in '+path.basename(FILE)+' (pre-C4 build)');
  process.exit(0);
}

const dom=boot(FILE,{data:{projects:[],tasks:[],todos:[]}});
const win=dom.window,E=s=>win.eval(s);

/* independent WCAG math — verifies the app's implementation, not itself */
function lum(hex){
  const n=parseInt(hex.slice(1),16),f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
  return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255);
}
function contrast(a,b){const x=lum(a)+.05,y=lum(b)+.05;return x>y?x/y:y/x;}
const r1=(v)=>Math.round(v*100)/100;

const INK=(src.match(/--ink:(#[0-9A-Fa-f]{6})/)||[])[1];
sec('the ink token and the label function agree');
ok('--ink found in CSS',!!INK);
const resolve=c=>c==='var(--ink)'?INK:c;
ok('labelColor picks white on black',E('labelColor("#000000")')==='#FFFFFF');
ok('labelColor picks ink on white',E('labelColor("#FFFFFF")')==='var(--ink)');

sec('every palette fill supports its computed label at 4.5:1');
const fills={
  PCOLS:E('PCOLS'),
  DEPT_COLORS:Object.values(E('DEPT_COLORS')),
  INSTALL_RED:[E('INSTALL_RED')],
  fallbacks:['#6B7484'], /* the darkened missing-project/department grey (REV80) */
};
for(const[group,list]of Object.entries(fills)){
  for(const bg of list){
    const fg=resolve(E('labelColor('+JSON.stringify(bg)+')'));
    const c=contrast(bg,fg);
    ok(group+' '+bg+' / '+fg,c>=4.5,r1(c)+':1');
  }
}

sec('every hand-authored status-pill pair in the CSS holds 4.5:1');
let m,found=0;const rule=/([^{}]+)\{([^{}]*)\}/g;
while((m=rule.exec(src))){
  if(!/-pill/.test(m[1]))continue;
  const bg=(m[2].match(/background:(#[0-9A-Fa-f]{6})/)||[])[1];
  const fg=(m[2].match(/color:(#[0-9A-Fa-f]{6})/)||[])[1];
  if(!bg||!fg)continue;
  found++;
  const c=contrast(bg,fg);
  ok(m[1].trim()+' '+bg+' / '+fg,c>=4.5,r1(c)+':1');
  const lc=contrast(bg,resolve(E('labelColor('+JSON.stringify(bg)+')')));
  ok('  …and labelColor('+bg+') would also pass',lc>=4.5,r1(lc)+':1');
}
ok('pill rules were actually found in the CSS',found>=8,found+' found');

console.log('\ncontrast: '+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
