/* Colour Lab: Curate — a personal palette library.
 * Seed palettes remain immutable; personal versions + favourites stay local.
 * Seven-token JSON interoperates with Colour Lab: Generate and Pentomino Lab. */
(function(){
'use strict';
const C=window.DERAILEDColour,SEED=window.DERAILEDCuratedPalettes;
if(!C||!SEED)throw Error('Load shared colour system and curated palettes first');
const $=id=>document.getElementById(id);
const key='derailed.colour-lab-curate/v1',labels=['01','02','03','04','05','LIGHT','DARK'];
const HEX=/^#[0-9A-F]{6}$/i;
const seeds=SEED.palettes.map(p=>({...p,features:[...p.features],tags:[...p.tags]}));
const categoryFor=Object.fromEntries((SEED.collections||[]).flatMap(group=>group.names.map(name=>[name,group.category])));
function buildCollectionFilter(){
 const dropdown=$('collection');
 for(const group of SEED.collections||[]){
   const section=document.createElement('optgroup');section.label=group.category;
   for(const name of group.names){
     const opt=document.createElement('option');opt.value=name;opt.textContent=name;section.append(opt);
   }
   dropdown.append(section);
 }
}
let custom=[],stars=new Set(),selected=seeds[0].id,storageOK=true,showFav=false;
function idNow(){return 'mine-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function cleanTags(value){return Array.isArray(value)?value.map(String).map(x=>x.trim()).filter(Boolean).slice(0,12):String(value||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,12)}
function normalize(p){
 const v=C.validate(p);
 return {id:String(p.id||idNow()).slice(0,80),name:v.name,features:v.features,light:v.light,dark:v.dark,
  collection:'My palettes',note:String(p.note||'').slice(0,300),tags:cleanTags(p.tags)};
}
function readStorage(){
 try{
  const data=JSON.parse(localStorage.getItem(key)||'null');
  if(!data)return;
  custom=(Array.isArray(data.custom)?data.custom:[]).slice(0,200).map(normalize);
  stars=new Set(Array.isArray(data.stars)?data.stars.filter(x=>typeof x==='string') :[]);
 }catch(err){storageOK=false;}
}
function persist(){
 try{localStorage.setItem(key,JSON.stringify({version:1,custom,stars:[...stars]}));storageOK=true}
 catch(err){storageOK=false;notice('Browser storage unavailable; export your collection JSON to keep your edits.');}
}
function all(){return [...seeds,...custom]}
function get(id){return all().find(p=>p.id===id)||seeds[0]}
function current(){return get(selected)}
function notice(v){$('notice').textContent=v}
function swatches(p){return [...p.features,p.light,p.dark]}
function make(tag,cls,text){
 const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;
}
function showGallery(){
 const filter=$('collection').value,needle=$('search').value.trim().toLowerCase(),root=$('gallery');
 const matching=all().filter(p=>(filter==='all'||filter===p.collection)&&(!showFav||stars.has(p.id))&&
   (!needle||[p.name,p.note,p.collection,categoryFor[p.collection]||'',...p.tags].join(' ').toLowerCase().includes(needle)));
 root.replaceChildren();
 for(const p of matching){
  const card=make('article','palette-card'+(p.id===selected?' is-selected':''));
  const art=make('button','card-palette');
  art.type='button';art.setAttribute('aria-label','Select '+p.name);
  art.dataset.select=p.id;
  swatches(p).slice(0,5).forEach(col=>{const bar=make('span');bar.style.backgroundColor=col;art.append(bar)});
  const info=make('div','card-info');
  const title=make('button');title.type='button';title.dataset.select=p.id;
  const name=make('strong',null,p.name),
        group=make('small',null,(categoryFor[p.collection]&&p.collection!=='My palettes'?categoryFor[p.collection]+' / ':'')+p.collection);
  title.append(name,group);
  const star=make('button','star',stars.has(p.id)?'♥':'♡');
  star.type='button';star.dataset.favorite=p.id;
  star.setAttribute('aria-label',(stars.has(p.id)?'Remove '+p.name+' from':'Add '+p.name+' to')+' favourites');
  star.setAttribute('aria-pressed',String(stars.has(p.id)));
  info.append(title,star);card.append(art,info);
  card.append(make('p','card-note',p.note));
  const tags=make('div','tags');p.tags.slice(0,3).forEach(t=>tags.append(make('span',null,t)));
  card.append(tags);root.append(card);
 }
 $('resultCount').textContent=matching.length+' / '+all().length+' palettes';
 $('empty').hidden=matching.length!==0;
}
function updatePreview(p){
 const root=$('preview'),hex=swatches(p);
 ['a','b','c','d','e','light','dark'].forEach((k,i)=>root.style.setProperty('--'+k,hex[i]));
}
function showDetail(){
 const p=current(),own=p.collection==='My palettes';
 $('detailName').textContent=p.name;
 $('detailCollection').textContent=p.collection;
 $('editName').value=p.name;$('editNote').value=p.note;$('editTags').value=p.tags.join(', ');
 $('editHint').textContent=own?'Your palette: edit colours or notes and the library saves your changes locally.':
   'Reference palette: make your own version to edit it. These originals stay intact.';
 for(const id of ['editName','editNote','editTags'])$(id).disabled=!own;
 const root=$('detailSwatches');root.replaceChildren();
 swatches(p).forEach((hex,i)=>{
  const wrapper=make('div','chip');
  const colour=document.createElement('input');colour.type='color';colour.value=hex;colour.disabled=!own;
  colour.setAttribute('aria-label','Choose colour '+labels[i]);
  colour.dataset.color=i;
  const label=make('label',null,labels[i]);
  const field=document.createElement('input');field.type='text';field.maxLength=7;field.value=hex;field.disabled=!own;
  field.setAttribute('aria-label','Hex colour '+labels[i]);field.dataset.hex=i;
  wrapper.append(colour,label,field);root.append(wrapper);
 });
 $('duplicate').textContent=own?'Duplicate palette':'Make my version ↗';
 $('delete').hidden=!own;
 $('favoriteSelected').textContent=stars.has(p.id)?'♥ In favourites':'♡ Save to favourites';
 updatePreview(p);
}
function select(id){selected=id;showGallery();showDetail();}
function star(id){
 if(stars.has(id))stars.delete(id);else stars.add(id);
 persist();showGallery();showDetail();
}
function makeVersion(){
 const p=current(),v=normalize({...p,id:idNow(),name:p.name+(p.collection==='My palettes'?' (copy)':' — my version')});
 custom.push(v);persist();
 $('collection').value='all';showFav=false;$('onlyFavorites').setAttribute('aria-pressed','false');
 select(v.id);notice('Your own editable copy is ready.');
}
function newPalette(){
 const v=normalize({name:'Untitled palette',features:['#FFD831','#55B66A','#52A9DA','#BF318C','#F36D50'],
   light:'#FFF9EC',dark:'#302B43',note:'',tags:[]});
 custom.unshift(v);persist();$('collection').value='all';$('search').value='';
 showFav=false;$('onlyFavorites').setAttribute('aria-pressed','false');select(v.id);
 notice('New palette created. Make it yours.');
}
function modify(fn){
 const p=current();if(p.collection!=='My palettes')return;
 fn(p);const validated=C.validate(p);
 p.features=validated.features;p.light=validated.light;p.dark=validated.dark;p.name=validated.name;
 persist();showGallery();showDetail();
}
function updateHex(index,value){
 const hex=String(value||'').trim().toUpperCase();
 if(!HEX.test(hex)){notice('Colour values need six hex digits, for example #A1B2C3.');showDetail();return;}
 modify(p=>{if(index<5)p.features[index]=hex;else if(index===5)p.light=hex;else p.dark=hex;});
 notice('');
}
function updateInfo(){
 const p=current();if(p.collection!=='My palettes')return;
 p.name=String($('editName').value||'Untitled').slice(0,80);
 p.note=$('editNote').value.slice(0,300);
 p.tags=cleanTags($('editTags').value);
 persist();showGallery();
 $('detailName').textContent=p.name;
}
function deleteVersion(){
 const p=current();if(p.collection!=='My palettes')return;
 if(!window.confirm('Delete your version of “'+p.name+'”? This only removes the copy saved in this browser.'))return;
 custom=custom.filter(x=>x.id!==p.id);stars.delete(p.id);persist();select(seeds[0].id);
 notice('Deleted your local version.');
}
function slug(s){return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'palette'}
function download(name,text,mime){
 const u=URL.createObjectURL(new Blob([text],{type:mime}));
 const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function exportSelected(){
 const p=current();const valid=C.validate(p);
 download(slug(p.name)+'.json',JSON.stringify(valid,null,2)+'\n','application/json');
}
function exportLibrary(){
 const payload={schema:'derailed.curated-palettes/1',version:1,
    custom:custom.map(p=>({...p})),stars:[...stars]};
 download('derailed-my-colour-collection.json',JSON.stringify(payload,null,2)+'\n','application/json');
}
function css(){return C.css(C.validate(current()))}
async function copyCss(){
 const text=css();
 try{
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}
  else{const t=document.createElement('textarea');t.value=text;document.body.append(t);t.select();
    if(!document.execCommand('copy'))throw Error('Copy is unavailable');t.remove();}
  notice('CSS tokens copied.');
 }catch(err){notice('Clipboard unavailable; use the CSS download button instead.')}
}
async function importFile(file){
 if(!file)return;
 try{
  if(file.size>1500000)throw Error('File is too large.');
  const data=JSON.parse(await file.text());
  if(data.schema==='derailed.curated-palettes/1'){
   if(!Array.isArray(data.custom)||data.custom.length>200)throw Error('Invalid collection file.');
   const incoming=data.custom.map(x=>normalize({...x,id:idNow()}));
   custom.push(...incoming);if(custom.length>200)custom=custom.slice(-200);
   const favouriteNames=new Set((data.stars||[]).map(String));
   incoming.forEach((p,i)=>{if(favouriteNames.has(data.custom[i]?.id))stars.add(p.id)});
   // Seed favourites have stable IDs and can be restored directly.
   seeds.forEach(p=>{if(favouriteNames.has(p.id))stars.add(p.id)});
   persist();$('collection').value='all';$('search').value='';showFav=false;
   $('onlyFavorites').setAttribute('aria-pressed','false');
   select(incoming[0]?.id||selected);notice('Imported '+incoming.length+' personal palettes.');
  }else{
   const p=C.parse(JSON.stringify(data)),v=normalize({...p,id:idNow(),note:'Imported seven-token palette',tags:['imported']});
   custom.push(v);persist();$('collection').value='all';$('search').value='';showFav=false;
   $('onlyFavorites').setAttribute('aria-pressed','false');select(v.id);notice('Imported '+v.name+'.');
  }
 }catch(err){notice('Import failed: '+err.message)}
 $('importFile').value='';
}
function wire(){
 $('gallery').addEventListener('click',ev=>{
  const button=ev.target.closest('button');if(!button)return;
  if(button.dataset.favorite)star(button.dataset.favorite);
  else if(button.dataset.select)select(button.dataset.select);
 });
 $('search').addEventListener('input',showGallery);
 $('collection').addEventListener('change',showGallery);
 $('onlyFavorites').addEventListener('click',()=>{
  showFav=!showFav;$('onlyFavorites').setAttribute('aria-pressed',String(showFav));showGallery();
 });
 $('newPalette').addEventListener('click',newPalette);
 $('duplicate').addEventListener('click',makeVersion);
 $('delete').addEventListener('click',deleteVersion);
 $('favoriteSelected').addEventListener('click',()=>star(current().id));
 $('detailSwatches').addEventListener('change',ev=>{
   if(ev.target.dataset.color!==undefined)updateHex(Number(ev.target.dataset.color),ev.target.value);
 });
 $('detailSwatches').addEventListener('change',ev=>{
   if(ev.target.dataset.hex!==undefined)updateHex(Number(ev.target.dataset.hex),ev.target.value);
 });
 for(const id of ['editName','editNote','editTags'])$(id).addEventListener('change',updateInfo);
 $('copyCSS').addEventListener('click',copyCss);
 $('downloadCSS').addEventListener('click',()=>download(slug(current().name)+'.css',css()+'\n','text/css'));
 $('downloadJSON').addEventListener('click',exportSelected);
 $('downloadLibrary').addEventListener('click',exportLibrary);
 $('import').addEventListener('click',()=>$('importFile').click());
 $('importFile').addEventListener('change',()=>importFile($('importFile').files[0]));
}
readStorage();buildCollectionFilter();wire();select(selected);
if(!storageOK)notice('Storage not available here. Export your collection JSON to preserve edits.');
})();
