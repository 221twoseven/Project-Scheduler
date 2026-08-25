/* U8 / D2 / Design-Language §2: color-blind regression guard.
   Recomputes the 12-slot palette and every status treatment under a deuteranopia
   simulation (Machado et al. 2009, severity 1.0) and asserts:
     1. every palette fill still supports its computed label after simulation;
     2. every status pill's own text still reads after simulation;
     3. the premise holds — pill hues DO collapse for deutan viewers — so
     4. every status stays distinguishable without hue: a distinct
        opacity/pattern signature on the bar, plus a distinct pill word.
   Run: node tests/test-cb.js index.html */
const fs=require('fs');
const {boot}=require('./harness');
const FILE=process.argv[2]||'index.html';
const src=fs.readFileSync(FILE,'utf8');

/* The frozen REV50 reference predates C3/C4 — same skip convention as test-c3-status. */
if(!/function labelColor/.test(src)||!/data-st="forecast"/.test(src)){
  console.log('test-cb: skipped — pre-C3/C4 build ('+FILE+')');
  process.exit(0);
}

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x?'   ('+x+')':''));}};
const sec=t=>console.log('\n'+t);

/* independent color math — verifies the app, not itself */
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const lin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
const delin=v=>{v=Math.min(1,Math.max(0,v));return Math.round((v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055)*255);};
/* Machado, Oliveira & Fernandes 2009 — deuteranopia, severity 1.0, linear RGB */
const DEUTAN=[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]];
const sim=h=>{const[r,g,b]=rgb(h).map(lin);
  return '#'+DEUTAN.map(m=>delin(m[0]*r+m[1]*g+m[2]*b)).map(v=>v.toString(16).padStart(2,'0')).join('');};
const lum=h=>{const[r,g,b]=rgb(h).map(lin);return .2126*r+.7152*g+.0722*b;};
const con=(a,b)=>{const x=lum(a)+.05,y=lum(b)+.05;return x>y?x/y:y/x;};
const dist=(a,b)=>{const x=rgb(a),y=rgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);};
const r1=v=>Math.round(v*100)/100;

const dom=boot(FILE,{data:{projects:[],tasks:[],todos:[]}});
const E=s=>dom.window.eval(s);
const INK=(src.match(/--ink:(#[0-9A-Fa-f]{6})/)||[])[1];
const resolve=c=>c==='var(--ink)'?INK:c;

sec('1 · the 12-slot palette keeps its labels readable under deuteranopia');
const PCOLS=E('PCOLS');
ok('palette has 12 slots',PCOLS.length===12,PCOLS.length);
for(const bg of PCOLS){
  const fg=resolve(E('labelColor('+JSON.stringify(bg)+')'));
  const c=con(sim(bg),sim(fg));
  /* 4.5:1 is the normal-vision bar (test-contrast); simulation shifts luminance
     a little, so the guard is 4.0 — every current slot clears 4.2. */
  ok(bg+' → '+sim(bg)+' label holds ≥4.0:1',c>=4.0,r1(c)+':1');
}

sec('2 · every status pill\'s own text survives simulation at 4.5:1');
let m,found=0;const rule=/([^{}]+)\{([^{}]*)\}/g;
while((m=rule.exec(src))){
  if(!/-pill/.test(m[1]))continue;
  const bg=(m[2].match(/background:(#[0-9A-Fa-f]{6})/)||[])[1];
  const fg=(m[2].match(/color:(#[0-9A-Fa-f]{6})/)||[])[1];
  if(!bg||!fg)continue;
  found++;
  const c=con(sim(bg),sim(fg));
  ok(m[1].trim()+' '+bg+'/'+fg,c>=4.5,r1(c)+':1 simulated');
}
ok('pill rules were actually found',found>=8,found+' found');

sec('3 · the premise: pill background hues collapse for deutan viewers');
const pillBgs=[...new Set([...src.matchAll(/-pill\[data-st="[^"]+"\]\{background:(#[0-9A-Fa-f]{6})/g)].map(x=>x[1]))];
let collapsed=0;
for(let i=0;i<pillBgs.length;i++)for(let j=i+1;j<pillBgs.length;j++)
  if(dist(sim(pillBgs[i]),sim(pillBgs[j]))<30)collapsed++;
ok('at least one status-hue pair becomes near-identical (why patterns are load-bearing)',
   collapsed>=1,collapsed+' collapsed pairs');

sec('4 · statuses stay distinguishable by pattern/opacity + pill word alone');
const treat=st=>{
  const body=(src.match(new RegExp('\\.job-bar\\[data-st="'+st+'"\\]\\{([^}]*)\\}'))||[])[1]||'';
  return {
    opacity:(body.match(/opacity:(\.\d+)/)||[])[1]||'1',
    hatch:/repeating-linear-gradient/.test(body),
    dashed:/dashed/.test(body),
    check:new RegExp('data-st="'+st+'"[^{]*::before[^{]*\\{content:\'✓').test(src)
          ||(st==='complete'&&/data-st="complete"\]::before\{content:'✓/.test(src)),
  };
};
const ALL=E('ALL_STATUSES'),LBL=E('STATUS_LBL');
const sigs={};
for(const st of ALL){const t=treat(st);sigs[st]=[t.opacity,t.hatch,t.dashed,t.check].join('|');}
/* the four non-active statuses each mute the bar differently */
const muted=['forecast','estimating','on-hold','complete'];
for(const st of muted)
  ok(st+' has a non-color bar treatment (opacity/pattern/✓)',sigs[st]!=='1|false|false|false',sigs[st]);
for(let i=0;i<muted.length;i++)for(let j=i+1;j<muted.length;j++)
  ok(muted[i]+' vs '+muted[j]+' differ without hue',sigs[muted[i]]!==sigs[muted[j]],sigs[muted[i]]);
/* the pill word is the universal non-color channel — unique per status */
const words=ALL.map(s=>LBL[s]);
ok('every status has a distinct pill word',new Set(words).size===ALL.length,words.join(', '));
/* the meeting sheet speaks the same status language (guards the stale-key bug) */
const mf=E('Object.keys(MEET_FILL)');
ok('MEET_FILL keys match ALL_STATUSES',JSON.stringify([...mf].sort())===JSON.stringify([...ALL].sort()),mf.join(','));

console.log('\ncb: '+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
