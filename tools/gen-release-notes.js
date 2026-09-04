#!/usr/bin/env node
/* Generates the RELEASE_NOTES const in index.html from CHANGELOG.md.
   Run: npm run notes   (nothing else writes that block — never edit it by hand)

   CHANGELOG.md convention, newest first:
     ## <label> — <date>          e.g. "## v1.20.5 — Sep 3, 2026"
     - one plain-language, shop-facing line per change
   A leading "## Unreleased" section collects lines for the next version and is
   NOT emitted — rename it to the version + date when you ship.
   The label is shown verbatim on the Help ▸ Release notes page, so v-era
   entries carry their own "v" and pre-v1 eras read "Beta · … (REV53–64)".

   Guards: refuses to run if the markers are missing (never clobbers), and if the
   newest emitted entry doesn't name the running APP_VER (a version can't ship
   without a note — test-v160 enforces the same in CI). */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const CHANGELOG=path.join(ROOT,'CHANGELOG.md');
const INDEX=path.join(ROOT,'index.html');
const BEGIN='/* RELEASE_NOTES:BEGIN — generated from CHANGELOG.md by tools/gen-release-notes.js; run `npm run notes`, never edit by hand */';
const END='/* RELEASE_NOTES:END */';

/* "## label — date" → {v,d,n:[…]}; bullets are "- text"; an indented line continues
   the previous bullet (web-editor wrapping). "## Unreleased" is parsed but skipped. */
function parse(md){
  const out=[];let cur=null,skip=false;
  for(const raw of String(md).split(/\r?\n/)){
    if(/^##\s+unreleased\b/i.test(raw)){cur=null;skip=true;continue;}
    const h=raw.match(/^##\s+(.+?)\s+[—–-]\s+(.+?)\s*$/);
    if(h){cur={v:h[1].trim(),d:h[2].trim(),n:[]};out.push(cur);skip=false;continue;}
    if(/^#\s/.test(raw)){cur=null;skip=false;continue;} /* the file title / a non-entry heading */
    if(skip||!cur)continue;
    const b=raw.match(/^-\s+(.+?)\s*$/);
    if(b){cur.n.push(b[1].trim());continue;}
    const c=raw.match(/^\s{2,}(\S.*?)\s*$/);
    if(c&&cur.n.length)cur.n[cur.n.length-1]+=' '+c[1].trim();
  }
  return out.filter(e=>e.n.length);
}

/* The exact block written between the markers. JSON.stringify keeps every quote,
   apostrophe and dash safe inside the JS source. */
function emit(entries,eol){
  eol=eol||'\n';
  const rows=entries.map(e=>' {v:'+JSON.stringify(e.v)+',d:'+JSON.stringify(e.d)+',n:['
    +e.n.map(x=>JSON.stringify(x)).join(','+eol+'   ')+']}');
  return BEGIN+eol+'const RELEASE_NOTES=['+eol+rows.join(','+eol)+eol+'];'+eol+END;
}

function appVer(src){const m=src.match(/const APP_VER='([^']+)'/);return m?m[1]:null;}

function main(){
  const md=fs.readFileSync(CHANGELOG,'utf8');
  const src=fs.readFileSync(INDEX,'utf8');
  const eol=/\r\n/.test(src)?'\r\n':'\n';
  const a=src.indexOf(BEGIN),b=src.indexOf(END);
  if(a<0||b<0||b<a){console.error('gen-release-notes: RELEASE_NOTES markers not found in index.html — refusing to write.');process.exit(1);}
  const entries=parse(md);
  if(!entries.length){console.error('gen-release-notes: CHANGELOG.md has no entries.');process.exit(1);}
  const ver=appVer(src);
  if(ver&&!entries[0].v.includes(ver)){
    console.error('gen-release-notes: index.html is v'+ver+' but the newest CHANGELOG.md entry is "'+entries[0].v+'".'
      +'\n  Add a section "## v'+ver+' — <Mon D, YYYY>" with one shop-facing line per change (or rename "## Unreleased").');
    process.exit(1);
  }
  const block=emit(entries,eol);
  const next=src.slice(0,a)+block+src.slice(b+END.length);
  if(next===src){console.log('gen-release-notes: index.html already up to date ('+entries.length+' entries).');return;}
  fs.writeFileSync(INDEX,next);
  console.log('gen-release-notes: wrote '+entries.length+' entries into index.html (newest '+entries[0].v+').');
}

module.exports={parse,emit,appVer,BEGIN,END,CHANGELOG,INDEX};
if(require.main===module)main();
