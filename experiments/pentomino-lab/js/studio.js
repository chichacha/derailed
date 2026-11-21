/* Filterable 63-posture gallery. All data is bundled and works offline. */
(function(){
'use strict';
const G=window.GomasuPostures,C=window.DERAILEDColour,P=window.CharacterPortrait,D=window.CharacterDNA;
const $=id=>document.getElementById(id);
let selected='X00';
const all=G.ids();
function currentPalette(){return C.load($('palette').value)}
function filters(){
 const shape=$('shape').value,side=$('side').value,n=$('countFilter').value;
 return all.filter(id=>(shape==='all'||id[0]===shape)&&
   (side==='all'||G.metadata[id].side===side)&&
   (n==='all'||G.ids(id[0]).length===Number(n)));
}
function drawFocus(){
 const id=selected,name=id[0],person=G.character(name),pose=G.metadata[id],count=G.ids(name).length;
 const palette=currentPalette(),family=$('family').value;
 $('focusArt').innerHTML=P.portrait(name,id,palette,family,{size:260,height:260,unit:48});
 $('focusId').textContent=id+' / '+pose.side.toUpperCase();
 $('focusName').textContent=person.title_en;
 $('focusJa').textContent=person.name_ja;
 $('focusStory').textContent=person.quote;
 $('focusComment').textContent=pose.comment||'';
 $('focusMeta').replaceChildren();
 for(const text of [count+' distinct posture'+(count===1?'':'s'),pose.side,D.families[family].label]){
   const span=document.createElement('span');span.className='chip';span.textContent=text;$('focusMeta').append(span);
 }
}
function render(){
 const matching=filters();
 $('count').textContent=matching.length+' of 63 postures';
 if(!matching.length){
   selected=null;$('gallery').replaceChildren();$('focusArt').replaceChildren();
   $('focusId').textContent='NO MATCH';$('focusName').textContent='No posture found';
   $('focusJa').textContent='';$('focusStory').textContent='Try a different resident, face or symmetry filter.';
   $('focusComment').textContent='';$('focusMeta').replaceChildren();
   $('next').disabled=true;$('download').disabled=true;
   return;
 }
 if(!matching.includes(selected))selected=matching[0];
 $('next').disabled=false;$('download').disabled=false;
 const fragment=document.createDocumentFragment();
 for(const id of matching){
   const name=id[0],face=G.metadata[id].side,button=document.createElement('button');
   button.type='button';button.className='pose'+(id===selected?' active':'');button.dataset.pose=id;
   button.setAttribute('aria-pressed',id===selected?'true':'false');
   const image=document.createElement('span');image.className='pose-art';
   image.innerHTML=P.portrait(name,id,currentPalette(),$('family').value);
   const caption=document.createElement('span');caption.className='pose-info';
   const strong=document.createElement('strong');strong.textContent=id;
   const side=document.createElement('span');side.textContent=face;
   caption.append(strong,side);button.append(image,caption);fragment.append(button);
 }
 $('gallery').replaceChildren(fragment);drawFocus();
}
const picker=$('palette');
Object.entries(C.presets).forEach(([id,p])=>{const option=document.createElement('option');option.value=id;option.textContent=p.name;picker.append(option)});
picker.value='berry';
for(const shape of G.ORDER){
 const person=G.character(shape),option=document.createElement('option');option.value=shape;option.textContent=shape+' · '+person.title_en;
 $('shape').append(option);
}
for(const id of ['palette','family','shape','countFilter','side'])$(id).addEventListener('change',render);
$('gallery').addEventListener('click',event=>{
 const pose=event.target.closest('button[data-pose]');if(!pose)return;
 selected=pose.dataset.pose;render();
});
$('next').addEventListener('click',()=>{const choices=filters();if(!choices.length)return;
 selected=choices[(choices.indexOf(selected)+1)%choices.length];render();
 const button=$('gallery').querySelector('[data-pose="'+selected+'"]');
 if(button)button.scrollIntoView({block:'nearest',behavior:'smooth'});
});
$('download').addEventListener('click',()=>{
 const svg=P.portrait(selected[0],selected,currentPalette(),$('family').value,{size:260,height:260,unit:48});
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');
 a.href=url;a.download='gomasu-'+selected+'-'+$('family').value+'.svg';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1400);
});
render();
})();
