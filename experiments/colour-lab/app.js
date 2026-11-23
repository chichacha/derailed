/* DERAILED Colour Lab — no libraries, no bundler, no storage.
   The seven-token contract lives in ../shared/colour-system.js. */
(function(){
'use strict';
const C=window.DERAILEDColour;
if(!C)throw Error('Colour Lab requires DERAILEDColour');
const $=id=>document.getElementById(id);
const names=['Feature 01','Feature 02','Feature 03','Feature 04','Feature 05','Light neutral','Dark neutral'];
const pairs=[['Ink on light',6,5],['Light on ink',5,6],['Feature 1 on light',0,5],['Light on feature 1',5,0],['Feature 3 on light',2,5],['Light on feature 3',5,2]];
let palette=C.load('coffee'),mode='light',swatchInputs=[];
function hexValid(s){return /^#[a-f\d]{6}$/i.test(s||'')}
function normal(s){return s.trim().toUpperCase()}
function colors(){return C.colours(palette)}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))}
function toHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase()}
function hsvToRgb(h,s,v){
 const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
 const t=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return toHex(...t.map(a=>(a+m)*255));
}
function rgbToHsv(hex){
 const [r,g,b]=rgb(hex).map(x=>x/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 let h=0;if(d){if(max===r)h=60*((g-b)/d%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4)}
 return [(h+360)%360,max?d/max:0,max];
}
function lum(hex){
 return rgb(hex).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4})
 .reduce((sum,value,i)=>sum+value*[.2126,.7152,.0722][i],0);
}
function contrast(a,b){
 const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function setFromArray(values){
 palette=C.validate({name:palette.name,features:values.slice(0,5),light:values[5],dark:values[6]});
 draw();
}
function setColour(i,value){
 if(!hexValid(value)){notice('Use a six-digit colour such as #A1B2C3.');draw();return}
 const next=colors();next[i]=normal(value);setFromArray(next);
 $('preset').value='custom';notice('');
}
function makeSwatches(){
 const host=$('swatches');
 names.forEach((name,i)=>{
  const card=document.createElement('div');card.className='swatch';
  const picker=document.createElement('input');picker.className='swatch-surface';picker.type='color';picker.setAttribute('aria-label','Pick '+name);
  const details=document.createElement('div');details.className='swatch-details';
  const title=document.createElement('span');title.className='swatch-label';title.textContent=name;
  const hex=document.createElement('input');hex.type='text';hex.className='hex';hex.maxLength=7;hex.spellcheck=false;hex.setAttribute('aria-label',name+' hexadecimal value');
  picker.addEventListener('input',()=>setColour(i,picker.value));
  hex.addEventListener('change',()=>setColour(i,hex.value));
  details.append(title,hex);card.append(picker,details);host.append(card);
  swatchInputs.push({picker,hex});
 });
}
function setMode(next){
 mode=next;$('preview').dataset.mode=mode;
 $('lightMode').setAttribute('aria-pressed',String(mode==='light'));
 $('darkMode').setAttribute('aria-pressed',String(mode==='dark'));
}
function drawPreview(){
 const p=$('preview'),cols=colors();
 ['p1','p2','p3','p4','p5','pl','pd'].forEach((key,i)=>p.style.setProperty('--'+key,cols[i]));
}
function drawContrast(){
 const host=$('contrast');host.replaceChildren();
 const cols=colors();
 for(const [label,fg,bg] of pairs){
  const ratio=contrast(cols[fg],cols[bg]),aa=ratio>=4.5,large=ratio>=3;
  const card=document.createElement('div');card.className='contrast-card';
  const sample=document.createElement('div');sample.className='contrast-example';sample.textContent='Aa  The quick brown fox';
  sample.style.backgroundColor=cols[bg];sample.style.color=cols[fg];
  const meta=document.createElement('div');meta.className='contrast-meta';
  const desc=document.createElement('span');desc.textContent=label;
  const score=document.createElement('span');score.className=aa?'pass':'fail';
  score.textContent=ratio.toFixed(2)+':1 · '+(aa?'AA text':large?'Large only':'Low contrast');
  meta.append(desc,score);card.append(sample,meta);host.append(card);
 }
}
function draw(){
 const cols=colors();swatchInputs.forEach(({picker,hex},i)=>{picker.value=cols[i];hex.value=cols[i]});
 $('paletteName').value=palette.name;
 drawPreview();drawContrast();
 const count=pairs.filter(([,a,b])=>contrast(cols[a],cols[b])>=4.5).length;
 $('summary').textContent=palette.name+'  ·  '+count+' of '+pairs.length+' sample text combinations pass WCAG AA (4.5:1).';
 $('cssPreview').textContent=C.css(palette);
}
function notice(message){$('notice').textContent=message}
function presetOptions(){
 const picker=$('preset');
 for(const [id,definition] of Object.entries(C.presets)){
  const option=document.createElement('option');option.value=id;option.textContent=definition.name;picker.append(option);
 }
 const custom=document.createElement('option');custom.value='custom';custom.textContent='Custom / in progress';picker.append(custom);
 picker.value='coffee';
 picker.addEventListener('change',()=>{
  if(picker.value==='custom')return;
  palette=C.load(picker.value);draw();notice('');
 });
}
function generate(){
 const seed=normal($('seedHex').value);
 if(!hexValid(seed)){notice('Please enter a valid starting colour first.');return}
 const [base]=rgbToHsv(seed),s=Number($('vibrancy').value)/100,v=Number($('lightness').value)/100;
 const harmony=$('harmony').value;
 const rotations={
  analogous:[-40,-18,0,18,40],
  complementary:[-26,0,23,160,190],
  triadic:[0,24,120,144,240],
  monochromatic:[0,0,0,0,0],
  split:[-24,0,26,145,215]
 }[harmony]||[0,30,60,90,120];
 const features=rotations.map((angle,i)=>{
   let light=v,ss=s;
   if(harmony==='monochromatic'){light=Math.max(.25,Math.min(.85,v+[-.19,-.09,0,.11,.21][i]));ss=Math.max(.24,Math.min(.95,s+[-.1,.07,0,-.1,.08][i]));}
   else {light=Math.max(.28,Math.min(.78,v+[.05,-.045,0,.075,-.065][i]));ss=Math.max(.25,Math.min(.96,s+[0,.06,-.06,-.04,.04][i]));}
   return hsvToRgb((base+angle+360)%360,ss,light);
 });
 palette=C.validate({name:'Untitled detour',features,light:palette.light,dark:palette.dark});
 $('preset').value='custom';draw();notice('Generated from '+seed+'. Edit any colour to make it yours.');
}
function download(filename,contents,type){
 const url=URL.createObjectURL(new Blob([contents],{type}));
 const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function filename(){
 return (palette.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'my-colour-palette');
}
function exportJson(){download(filename()+'.json',JSON.stringify(palette,null,2)+'\n','application/json')}
function exportCss(){download(filename()+'.css',C.css(palette)+'\n','text/css')}
async function copyCss(){
 const css=C.css(palette);
 try{
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(css);notice('CSS tokens copied.');return;}
  const textarea=document.createElement('textarea');textarea.value=css;document.body.append(textarea);textarea.select();
  const success=document.execCommand('copy');textarea.remove();if(!success)throw Error('Clipboard unavailable');
  notice('CSS tokens copied.');
 }catch(e){notice('Clipboard unavailable here. Select the CSS in the preview or download the file instead.');}
}
async function importFile(file){
 if(!file)return;
 try{
  if(file.size>200000)throw Error('This JSON file is too large.');
  palette=C.parse(await file.text());$('preset').value='custom';draw();notice('Imported '+palette.name+'.');
 }catch(error){notice('Import failed: '+error.message)}
 $('jsonFile').value='';
}
function remix(){
 const c=colors(),step=[1,3,4,0,2],features=step.map(i=>c[i]);
 palette=C.validate({...palette,features});$('preset').value='custom';draw();
 notice('Rearranged the five feature colours. Neutrals stay unchanged.');
}
function init(){
 makeSwatches();presetOptions();draw();setMode('light');
 $('preset').value='coffee';
 $('lightMode').addEventListener('click',()=>setMode('light'));
 $('darkMode').addEventListener('click',()=>setMode('dark'));
 $('generate').addEventListener('click',generate);
 $('shuffle').addEventListener('click',remix);
 $('vibrancy').addEventListener('input',()=>{$('vibrancyValue').textContent=$('vibrancy').value+'%'});
 $('lightness').addEventListener('input',()=>{$('lightnessValue').textContent=$('lightness').value+'%'});
 $('seed').addEventListener('input',()=>{$('seedHex').value=normal($('seed').value)});
 $('seedHex').addEventListener('change',()=>{if(hexValid($('seedHex').value))$('seed').value=normal($('seedHex').value);else notice('Starting colour must be #RRGGBB.');});
 $('paletteName').addEventListener('input',()=>{palette.name=$('paletteName').value.slice(0,80);$('summary').textContent=palette.name||'Untitled detour';});
 $('copyCss').addEventListener('click',copyCss);
 $('exportCss').addEventListener('click',exportCss);
 $('exportJson').addEventListener('click',exportJson);
 $('importJson').addEventListener('click',()=>$('jsonFile').click());
 $('jsonFile').addEventListener('change',()=>importFile($('jsonFile').files[0]));
}
init();
})();
