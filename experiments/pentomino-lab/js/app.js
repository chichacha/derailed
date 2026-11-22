/* Pentomino Lab application — UI/state/export glue only.
   Data: data/tilings.js and data/gomasu.js,
   shape design grammar: js/character-dna.js,
   shared design tokens: ../shared/colour-system.js.
   Classic scripts intentionally work from file:// without a local server. */
(function(){
  'use strict';
  const C=window.DERAILEDColour,T=window.PentominoTilings,G=window.GomasuPostures,D=window.CharacterDNA;
  if(!C||!T||!G||!D){document.getElementById('board').textContent='Missing lab modules. Check the relative script paths.';return}
  const $=id=>document.getElementById(id), pick=arr=>arr[Math.floor(Math.random()*arr.length)];
  const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const n=(value,min,max,fallback=min)=>{const v=Number(value);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback};
  const letters=[...T.letters],labels=['Feature 1','Feature 2','Feature 3','Feature 4','Feature 5','Light neutral','Dark neutral'];
  let palette=C.load('berry'),solution=0,selected='F',styles=Object.create(null);
  const colors=()=>C.colours(palette);
  const accentFor=main=>{
    const pool=$('pairing').value==='neutral'?[5,6]:
      $('pairing').value==='feature'?[0,1,2,3,4]:[0,1,2,3,4,5,5,6,6];
    return pick(pool.filter(i=>i!==main));
  };
  function assignColors(){
    const mains=shuffle([0,1,2,3,4,0,1,2,3,4,0,3]);
    letters.forEach((name,i)=>{
      const old=styles[name]||{};styles[name]={...old,main:mains[i],accent:accentFor(mains[i]),motif:old.motif||'solid',rotation:old.rotation||0,decorated:old.decorated!==false};
    });
  }
  // Manual choices are still *whole-piece* treatments, never per-cell stickers.
  const manualGroups={
    linear:[{id:'horizontal-stripes',label:'Horizontal stripes'},{id:'vertical-stripes',label:'Vertical stripes'},{id:'diagonal-stripes',label:'Diagonal stripes'}],
    curves:[{id:'circle-cutout',label:'Large circle cutout'}],
    splits:[{id:'vertical-split',label:'Vertical half'},{id:'horizontal-split',label:'Horizontal half'},{id:'diagonal-split',label:'Diagonal half'}],
    blocks:[{id:'colour-block',label:'Large colour block'}]
  };
  const configFor={
    'horizontal-stripes':{family:'linear',stripeDirection:'horizontal'},
    'vertical-stripes':{family:'linear',stripeDirection:'vertical'},
    'diagonal-stripes':{family:'linear',stripeDirection:'diagonal'},
    'circle-cutout':{family:'curves'},
    'vertical-split':{family:'splits',splitDirection:'vertical'},
    'horizontal-split':{family:'splits',splitDirection:'horizontal'},
    'diagonal-split':{family:'splits',splitDirection:'diagonal'},
    'colour-block':{family:'blocks'}
  };
  function manualPool(){return manualGroups[$('family').value]||manualGroups.curves}
  function refillMotifChoices(){
    const picker=$('pieceMotif'),available=[{id:'solid',label:'Solid (no accent)'},...manualPool()];
    picker.replaceChildren();
    for(const m of available){
      const opt=document.createElement('option');opt.value=m.id;opt.textContent=m.label;picker.add(opt);
    }
  }
  function updateModeUI(){
    const manual=$('designMode').value==='free';
    $('motifInspectorRow').hidden=!manual;
    $('rotateMotif').hidden=!manual;
    $('stripeControls').hidden=manual||$('family').value!=='linear';
    $('splitControls').hidden=manual||$('family').value!=='splits';
    refillMotifChoices();
  }
  function remix(){
    const pool=manualPool();
    const count=Math.round(Number($('density').value)*letters.length/100);
    const decorated=new Set(shuffle(letters).slice(0,count));
    letters.forEach(name=>{
      styles[name].decorated=decorated.has(name);
      styles[name].motif=decorated.has(name)&&pool.length?pick(pool).id:'solid';
      styles[name].rotation=0; // Stable circle-edge placement; rotate manually when desired.
    });
  }
  function initControls(){
    const preset=$('preset');
    for(const [id,p] of Object.entries(C.presets)){
      const o=document.createElement('option');o.value=id;o.textContent=p.name;preset.add(o);
    }
    const custom=document.createElement('option');custom.value='custom';custom.textContent='Custom palette';preset.add(custom);
    refillMotifChoices();
    for(let i=0;i<7;i++){
      if(i<5){const o=document.createElement('option');o.value=i;o.textContent=labels[i];$('pieceMain').add(o)}
      const a=document.createElement('option');a.value=i;a.textContent=labels[i];$('pieceAccent').add(a);
    }
    for(const letter of letters){
      const b=document.createElement('button');b.type='button';b.textContent=letter;b.dataset.name=letter;b.setAttribute('aria-label','Select pentomino '+letter);
      b.addEventListener('click',()=>selectPiece(letter));$('pieceChips').append(b);
    }
    preset.addEventListener('change',()=>{
      if(preset.value==='custom')return;
      palette=C.load(preset.value);refreshSwatches();render();
    });
    $('background').addEventListener('change',render);
    $('mood').addEventListener('change',()=>{
      $('density').value={quiet:20,graphic:45,playful:60,maximal:75}[$('mood').value]||45;
      remix();render();syncInspector();
    });
    $('designMode').addEventListener('change',()=>{updateModeUI();remix();syncInspector();render()});
    $('family').addEventListener('change',()=>{updateModeUI();remix();render();syncInspector()});
    $('stripeDirection').addEventListener('change',render);
    $('splitDirection').addEventListener('change',render);
    $('pairing').addEventListener('change',()=>{
      letters.forEach(name=>{styles[name].accent=accentFor(styles[name].main)});render();syncInspector();
    });
    $('density').addEventListener('input',()=>{remix();render();syncInspector()});
    for(const id of ['gap','radius','scale'])$(id).addEventListener('input',render);
    $('pieceMotif').addEventListener('change',()=>{
      if($('designMode').value!=='free')return;
      styles[selected].motif=$('pieceMotif').value;styles[selected].decorated=styles[selected].motif!=='solid';render();syncInspector();
    });
    $('toggleDecoration').addEventListener('click',()=>{styles[selected].decorated=!styles[selected].decorated;syncInspector();render()});
    $('pieceMain').addEventListener('change',()=>{styles[selected].main=Number($('pieceMain').value);if(styles[selected].main===styles[selected].accent)styles[selected].accent=accentFor(styles[selected].main);syncInspector();render()});
    $('pieceAccent').addEventListener('change',()=>{styles[selected].accent=Number($('pieceAccent').value);render()});
    $('rotateMotif').addEventListener('click',()=>{
      const s=styles[selected],pool=manualPool(),ids=pool.map(m=>m.id);
      if(ids.length>1){
        s.motif=ids[(Math.max(0,ids.indexOf(s.motif))+1)%ids.length];s.decorated=true;
      }else{s.rotation=(s.rotation+1)%4}
      syncInspector();render();
    });
    $('newTiling').addEventListener('click',()=>{
      solution=(solution+1+Math.floor(Math.random()*(T.solutions.length-1)))%T.solutions.length;render();syncInspector();
    });
    $('remix').addEventListener('click',()=>{remix();render();syncInspector()});
    $('shuffle').addEventListener('click',()=>{assignColors();render();syncInspector()});
    $('board').addEventListener('click',event=>{
      const element=event.target.closest('[data-piece]');
      if(element&&letters.includes(element.dataset.piece))selectPiece(element.dataset.piece);
    });
    $('exportSvg').addEventListener('click',()=>download('pentomino-pattern.svg',new Blob([buildSVG(false)],{type:'image/svg+xml;charset=utf-8'})));
    $('exportPng').addEventListener('click',exportPNG);
    $('exportPalette').addEventListener('click',()=>download('derailed-palette.json',new Blob([JSON.stringify(C.validate(palette),null,2)],{type:'application/json'})));
    $('exportCss').addEventListener('click',()=>download('derailed-colours.css',new Blob([C.css(palette)+'\n'],{type:'text/css'})));
    $('exportDesign').addEventListener('click',()=>download('pentomino-design.json',new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'})));
    $('importDesign').addEventListener('click',()=>$('designFile').click());
    $('designFile').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      try{const obj=JSON.parse(await file.text());restore(obj)}catch(e){alert('Unable to open this design: '+e.message)}
      finally{event.target.value=''}
    });
  }
  function refreshSwatches(){
    const parent=$('paletteSwatches');parent.replaceChildren();
    colors().forEach((hex,i)=>{
      const label=document.createElement('label');label.className='swatch'+(i>=5?' neutral':'');label.title=labels[i]+': '+hex;
      const face=document.createElement('span');face.className='swatch-face';face.style.background=hex;
      const input=document.createElement('input');input.type='color';input.value=hex;input.setAttribute('aria-label','Change '+labels[i]);
      input.addEventListener('input',()=>{
        if(i<5)palette.features[i]=input.value.toUpperCase();
        else if(i===5)palette.light=input.value.toUpperCase();else palette.dark=input.value.toUpperCase();
        $('preset').value='custom';face.style.background=input.value;label.title=labels[i]+': '+input.value;render();
      });
      const caption=document.createElement('small');caption.textContent=i<5?'C'+(i+1):i===5?'LIGHT':'DARK';
      label.append(face,input,caption);parent.append(label);
    });
  }
  function selectPiece(letter){selected=letter;syncInspector();render()}
  function syncInspector(){
    $('selectedLabel').textContent='Piece '+selected;
    for(const b of $('pieceChips').children)b.classList.toggle('active',b.dataset.name===selected);
    const s=styles[selected],tile=T.solutions[solution].find(t=>t.name===selected);
    const pose=G.resolve(selected,tile.cells.map(z=>[z%10,Math.floor(z/10)]));
    const character=G.character(selected);
    $('postureInfo').textContent=pose.id+' · '+pose.side+' · '+pose.orientationCount+' posture'+(pose.orientationCount!==1?'s':'');
    $('dnaTrait').textContent=(character?.name_ja||selected)+' — '+D.profiles[selected].idea;
    $('toggleDecoration').textContent=selected==='X'?'X keeps its five-colour signature':s.decorated?'Turn decoration off':'Turn decoration on';
    $('toggleDecoration').disabled=selected==='X';
    $('pieceMotif').value=manualPool().some(m=>m.id===s.motif)?s.motif:'solid';
    $('pieceMain').value=s.main;$('pieceAccent').value=s.accent;
  }
  const f=x=>Math.round(x*100)/100;
  function buildSVG(showSelected){
    const unit=60,pad=36,W=672,H=432,gap=n($('gap').value,0,12),radius=n($('radius').value,0,24),scale=n($('scale').value,55,150)/100;
    const colorsNow=colors(),bg=colorsNow[n($('background').value,0,6,5)];
    let defs='',body='';
    for(const tile of T.solutions[solution]){
      const piece=styles[tile.name],cells=tile.cells.map(z=>({x:(z%10)*unit+pad,y:Math.floor(z/10)*unit+pad}));
      const x=Math.min(...cells.map(c=>c.x)),y=Math.min(...cells.map(c=>c.y)),w=Math.max(...cells.map(c=>c.x))-x+unit,h=Math.max(...cells.map(c=>c.y))-y+unit;
      const clipId='clip-'+tile.name;
      defs+='<clipPath id="'+clipId+'">'+cells.map(c=>'<rect x="'+f(c.x+gap/2)+'" y="'+f(c.y+gap/2)+'" width="'+f(unit-gap)+'" height="'+f(unit-gap)+'" rx="'+f(radius)+'"/>').join('')+'</clipPath>';
      const p={x,y,w,h,cells,unit,rotation:piece.rotation,scale,main:colorsNow[piece.main],accent:colorsNow[piece.accent]};
      const useManual=$('designMode').value==='free';
      const requested=useManual?(configFor[piece.motif]||{family:$('family').value}):{};
      const direction=useManual?requested.stripeDirection:$('stripeDirection').value;
      const split=useManual?requested.splitDirection:$('splitDirection').value;
      const dna=D.paint(tile.name,cells,{
        unit,features:colorsNow.slice(0,5),accent:p.accent,
        family:useManual?(requested.family||$('family').value):$('family').value,
        stripeDirection:direction,splitDirection:split,
        curveEdge:useManual&&requested.family==='curves'?['top','right','bottom','left'][piece.rotation%4]:undefined,
        decorated:piece.decorated&&(!useManual||piece.motif!=='solid'),scale
      });
      body+='<g data-piece="'+tile.name+'" data-posture="'+dna.posture.id+'" aria-label="Pentomino '+tile.name+', posture '+dna.posture.id+'">';
      body+='<g clip-path="url(#'+clipId+')"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+p.main+'"/>';
      body+=dna.svg;
      body+='</g>';
      if(showSelected&&tile.name===selected){
        body+='<g pointer-events="none">'+cells.map(c=>'<rect x="'+f(c.x+gap/2+1)+'" y="'+f(c.y+gap/2+1)+'" width="'+f(unit-gap-2)+'" height="'+f(unit-gap-2)+'" rx="'+f(radius)+'" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="5 5"/>').join('')+'</g>';
      }
      body+='</g>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="2016" height="1296" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Pentomino geometric composition"><title>Pentomino Pattern Lab — DERAILED</title><desc>Valid twelve-piece pentomino tiling with geometric motifs and seven shared palette tokens</desc><rect width="'+W+'" height="'+H+'" fill="'+bg+'"/><defs>'+defs+'</defs>'+body+'</svg>';
  }
  function render(){
    for(const id of ['density','gap','radius','scale'])$(id+'Value').textContent=$(id).value+(id==='density'||id==='scale'?'%':'');
    $('board').innerHTML=buildSVG(true);
    $('tilingLabel').textContent='Tiling '+String(solution+1).padStart(2,'0')+' / '+T.solutions.length;
    $('pieceStats').textContent='12 shapes / 60 squares / '+letters.filter(n=>styles[n].decorated).length+' decorated / 63 possible postures';
  }
  function download(filename,blob){
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function exportPNG(){
    const url=URL.createObjectURL(new Blob([buildSVG(false)],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=Math.round(2400*432/672);
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>{if(blob)download('pentomino-pattern.png',blob);else alert('PNG export failed; try SVG.')},'image/png');
      URL.revokeObjectURL(url);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);alert('PNG could not be rendered. SVG export remains available.')};img.src=url;
  }
  function snapshot(){
    return {schema:'derailed.pentomino/1',palette:C.validate(palette),solution,settings:{
      background:Number($('background').value),mood:$('mood').value,family:$('family').value,pairing:$('pairing').value,designMode:$('designMode').value,
      stripeDirection:$('stripeDirection').value,splitDirection:$('splitDirection').value,
      density:Number($('density').value),gap:Number($('gap').value),radius:Number($('radius').value),scale:Number($('scale').value)
    },pieces:styles};
  }
  function restore(input){
    // A standalone palette JSON can also be imported: same colour contract, different product.
    palette=C.validate(input.palette||input);
    if(input.schema&&input.schema!=='derailed.pentomino/1')throw Error('Unknown design format');
    if(input.schema){
      solution=n(input.solution,0,T.solutions.length-1,0)|0;
      const s=input.settings||{};
      for(const id of ['background','density','gap','radius','scale']){
        const bounds={background:[0,6],density:[0,100],gap:[0,12],radius:[0,24],scale:[55,150]};
        $(id).value=n(s[id],bounds[id][0],bounds[id][1],Number($(id).value));
      }
      for(const id of ['mood','pairing','designMode','stripeDirection','splitDirection'])if([...$(id).options].some(o=>o.value===s[id]))$(id).value=s[id];
      // Legacy designs used "all" and "stripes"; map them to a disciplined grammar.
      const familyAliases={all:'splits',stripes:'linear'};
      $('family').value=familyAliases[s.family]||s.family||'curves';
      updateModeUI();
      for(const name of letters){
        const p=input.pieces?.[name]||{};
        styles[name]={
          main:n(p.main,0,4,0)|0,accent:n(p.accent,0,6,5)|0,
          motif:configFor[p.motif]?p.motif:
            ({'broad-stripes':'horizontal-stripes','fine-stripes':'vertical-stripes','half-circle':'circle-cutout',
              'quarter-circle':'circle-cutout','dots':'circle-cutout','rings':'circle-cutout','arches':'circle-cutout',
              'checker':'colour-block','sunrise':'circle-cutout'}[p.motif]||'solid'),
          rotation:n(p.rotation,0,3,0)|0,
          decorated:p.decorated!==undefined?Boolean(p.decorated):p.motif!=='solid'
        };
      }
    }
    $('preset').value='custom';refreshSwatches();syncInspector();render();
  }
  initControls();updateModeUI();assignColors();remix();refreshSwatches();syncInspector();render();
})();
