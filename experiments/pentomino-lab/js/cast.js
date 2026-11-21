/* Cast of Twelve: one visual family, actual Gomasu IDs and official names. */
(function(){
 'use strict';
 const C=window.DERAILEDColour,G=window.GomasuPostures,D=window.CharacterDNA,P=window.CharacterPortrait;
 const $=id=>document.getElementById(id),order='FILPNTUVWYZ',ids=Object.create(null);
 const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 let palette=C.load('berry'),family='curves',xColors=[0,1,2,3,4];
 for(const name of order)ids[name]=0;
 function download(name,source){
   const u=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');
   a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
 }
 const xLayout=[[1,0],[0,1],[1,1],[2,1],[1,2]];
 function xMarkup(interactive){
   const unit=80;
   const cells=xLayout.map(([cx,cy],i)=>{
     const attrs=interactive?' data-cell="'+i+'" role="button" tabindex="0" aria-label="Change colour of '+['top','left','centre','right','bottom'][i]+' square"':'';
     return '<rect'+attrs+' x="'+(30+cx*unit)+'" y="'+(15+cy*unit)+'" width="78" height="78" rx="4" fill="'+palette.features[xColors[i]]+'"/>';
   }).join('');
   return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 285" aria-label="The five-colour X pentomino" role="img">'+cells+'</svg>';
 }
 function renderX(){
   $('xArtwork').innerHTML=xMarkup(true);
   $('heroPalette').replaceChildren(...palette.features.map(hex=>{const s=document.createElement('span');s.style.background=hex;return s}));
   $('xStage').style.setProperty('--light',palette.light);
 }
 function changeX(i){
   const j=xColors.indexOf((xColors[i]+1)%5);[xColors[i],xColors[j]]=[xColors[j],xColors[i]];renderX();
 }
 function portraitOptions(){return {stripeDirection:$('stripeDirection').value,splitDirection:$('splitDirection').value}}
 function syncDirectionUI(){
   $('castStripes').hidden=family!=='linear';
   $('castSplits').hidden=family!=='splits';
 }
 // Keep each card and its button mounted. Replacing the entire grid on each
 // click made the browser lose focus/scroll anchoring on rows below the first.
 const cardSlots=Object.create(null);
 function makeCard(letter){
   const person=G.character(letter),poseIds=G.ids(letter);
   const card=document.createElement('article');card.className='card';card.dataset.character=letter;
   const art=document.createElement('div');art.className='card-art';
   const copy=document.createElement('div');copy.className='card-copy';
   const title=document.createElement('div');title.className='card-title';
   const strong=document.createElement('strong');strong.textContent=letter;
   const count=document.createElement('span');count.textContent=poseIds.length+' postures';
   title.append(strong,count);
   const ja=document.createElement('h3');ja.lang='ja';ja.textContent=person.name_ja;
   const story=document.createElement('p');story.textContent=person.story;
   const motif=document.createElement('div');motif.className='motif';motif.textContent=D.profiles[letter].idea;
   const poseMeta=document.createElement('p');poseMeta.className='pose-meta';
   const button=document.createElement('button');button.type='button';button.dataset.next=letter;
   button.textContent='↻ Next posture';
   copy.append(title,ja,story,motif,poseMeta,button);
   card.append(art,copy);
   $('cast').append(card);
   return {card,art,poseMeta,button};
 }
 function updateCard(letter){
   const slot=cardSlots[letter]||(cardSlots[letter]=makeCard(letter));
   const poseIds=G.ids(letter),poseId=poseIds[ids[letter]%poseIds.length];
   const meta=G.metadata[poseId];
   slot.art.innerHTML=P.portrait(letter,poseId,palette,family,portraitOptions());
   slot.poseMeta.textContent=poseId+' · '+meta.side+' · '+D.families[family].label;
   slot.button.setAttribute('aria-label','Next posture for '+letter+' (current '+poseId+', '+poseIds.length+' orientations)');
   return poseId;
 }
 function renderCast(){
   for(const letter of order)updateCard(letter);
 }
 function render(){renderX();renderCast()}
 function sheetFile(){
   const cols=3,w=260,h=258,drawWidth=220,drawHeight=190;
   const shapes=[...order,'X'];let body='';
   shapes.forEach((shape,i)=>{
     const x=(i%cols)*w,y=Math.floor(i/cols)*h;
     const id=shape==='X'?'X00':G.ids(shape)[ids[shape]%G.ids(shape).length];
     const portrait=shape==='X'?xMarkup(false):P.portrait(shape,id,palette,family,{...portraitOptions(),idSuffix:'-sheet'});
     const person=G.character(shape);
     body+='<g transform="translate('+x+' '+y+')"><rect width="252" height="248" rx="13" fill="'+palette.light+'"/>'+
       '<svg x="16" y="9" width="'+drawWidth+'" height="'+drawHeight+'" viewBox="0 0 '+(shape==='X'?'300 285':'220 190')+'">'+portrait+'</svg>'+
       '<text x="17" y="222" font-size="16" font-family="sans-serif" font-weight="bold" fill="'+palette.dark+'">'+shape+' · '+id+'</text></g>';
   });
   return '<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="2064" viewBox="0 0 780 1032"><rect width="780" height="1032" fill="'+palette.dark+'"/>'+body+'</svg>';
 }
 const preset=$('paletteSelect');
 Object.entries(C.presets).forEach(([id,p])=>{const o=document.createElement('option');o.value=id;o.textContent=p.name;preset.append(o)});
 preset.value='berry';preset.addEventListener('change',()=>{palette=C.load(preset.value);render()});
 $('styleFamily').addEventListener('change',()=>{family=$('styleFamily').value;syncDirectionUI();render()});
 $('stripeDirection').addEventListener('change',render);
 $('splitDirection').addEventListener('change',render);
 $('cycleCast').addEventListener('click',()=>{for(const name of order)ids[name]=(ids[name]+1)%G.ids(name).length;renderCast()});
 $('cast').addEventListener('click',e=>{const button=e.target.closest('button[data-next]');if(!button)return;
   const name=button.dataset.next;if(!Object.prototype.hasOwnProperty.call(ids,name))return;
   ids[name]=(ids[name]+1)%G.ids(name).length;
   updateCard(name); // Only repaint the clicked portrait; preserve the grid and scroll position.
 });
 $('shuffleX').addEventListener('click',()=>{for(let i=4;i>0;i--){const j=Math.floor(Math.random()*(i+1));[xColors[i],xColors[j]]=[xColors[j],xColors[i]]}renderX()});
 $('resetX').addEventListener('click',()=>{xColors=[0,1,2,3,4];renderX()});
 $('downloadX').addEventListener('click',()=>download('pentomino-X-five-colours.svg',xMarkup(false).replace('viewBox=', 'width="900" height="855" viewBox=')));
 $('downloadSheet').addEventListener('click',()=>download('pentomino-cast-of-twelve.svg',sheetFile()));
 $('xArtwork').addEventListener('click',e=>{const el=e.target.closest('[data-cell]');if(el)changeX(Number(el.dataset.cell))});
 $('xArtwork').addEventListener('keydown',e=>{const el=e.target.closest('[data-cell]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();changeX(Number(el.dataset.cell))}});
 syncDirectionUI();render();
})();
