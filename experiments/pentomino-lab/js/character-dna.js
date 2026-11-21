/* Restrained, posture-aware graphic language for Gomasu x DERAILED.
 * One family per composition: linear | curves | splits | blocks.
 * Uses canonical cell identities carried through reflection and rotation. */
(function(global){
 'use strict';
 const G=global.GomasuPostures;
 if(!G)throw Error('Gomasu postures must load before Character DNA');
 const profiles={
 F:{name:'Fidget',idea:'Dancing offset',accent:[0,3]},
 I:{name:'In-Line',idea:'Long rhythm',accent:[0,4]},
 L:{name:'Longreach',idea:'Extended corner',accent:[0,4]},
 N:{name:'Nudge',idea:'Displaced pair',accent:[1,4]},
 P:{name:'Pack-In',idea:'Compact contrast',accent:[0,4]},
 T:{name:'Tidy',idea:'Branch and stem',accent:[0,4]},
 U:{name:'U-Hug',idea:'The welcoming gap',accent:[1,4]},
 V:{name:'V-Corner',idea:'A single turning point',accent:[0,4]},
 W:{name:'Wobble-Step',idea:'One step at a time',accent:[0,4]},
 X:{name:'X-Center',idea:'Five colours, one symmetric shape',accent:[0,1,2,3,4]},
 Y:{name:'Y-Not?',idea:'The wandering branch',accent:[0,4]},
 Z:{name:'Zigzag',idea:'Front and back',accent:[0,4]}
 };
 const families={
  linear:{label:'Linear',description:'One repeated line language, rotated with each posture'},
  curves:{label:'Curved',description:'Circles and arcs only; no stripes'},
  splits:{label:'Split',description:'Simple two-tone geometry'},
  blocks:{label:'Blocky',description:'Small nested squares and rectangular accents'}
 };
 const fmt=x=>Math.round(x*100)/100;
 const attrs=(x,y,w,h,c)=>'x="'+fmt(x)+'" y="'+fmt(y)+'" width="'+fmt(w)+'" height="'+fmt(h)+'" fill="'+c+'"';
 const rect=(x,y,w,h,c)=>'<rect '+attrs(x,y,w,h,c)+'/>';
 const circle=(x,y,r,c)=>'<circle cx="'+fmt(x)+'" cy="'+fmt(y)+'" r="'+fmt(r)+'" fill="'+c+'"/>';
 function paint(shape,cells,opt={}){
  const unit=opt.unit||44;
  const xs=cells.map(p=>p.x),ys=cells.map(p=>p.y),left=Math.min(...xs),top=Math.min(...ys);
  const lattice=cells.map(p=>[(p.x-left)/unit,(p.y-top)/unit].map(Math.round));
  const posture=G.resolve(shape,lattice);
  const trans=G.matchingTransform(shape,lattice);
  const profile=profiles[shape];
  if(!profile)throw Error('Unknown character '+shape);
  const features=opt.features||['#880D1E','#F26A8D','#DD2D4A','#CBEEF3','#F49CBB'];
  const accent=opt.accent||'#241C29',family=families[opt.family]?opt.family:'splits';
  const scale=Math.max(.6,Math.min(1.3,Number(opt.scale)||1));
  const marked=opt.decorated!==false;
  let out='';
  if(shape==='X'&&opt.specialX!==false){
    // Keep the asymmetry intentional: five feature colours on a symmetric silhouette.
    cells.forEach((p,i)=>out+=rect(p.x,p.y,unit,unit,features[trans.indices[i]]));
  } else if(marked){
    let vx=trans.reflected?-1:1,vy=0;
    for(let i=0;i<trans.rotation;i++)[vx,vy]=[-vy,vx];
    cells.forEach((p,i)=>{
      const position=profile.accent.indexOf(trans.indices[i]);if(position<0)return;
      const x=p.x,y=p.y,cx=x+unit/2,cy=y+unit/2,dim=position===0?1:.76;
      if(family==='linear'){
        const length=unit*(.62*scale)*dim,sep=unit*.14*dim;
        const nx=-vy,ny=vx;
        for(const side of [-.5,.5]){
          const ox=nx*sep*side,oy=ny*sep*side;
          out+='<path d="M '+fmt(cx-vx*length/2+ox)+' '+fmt(cy-vy*length/2+oy)+
               ' L '+fmt(cx+vx*length/2+ox)+' '+fmt(cy+vy*length/2+oy)+
               '" fill="none" stroke="'+accent+'" stroke-width="'+fmt(unit*.068*scale)+'" stroke-linecap="round"/>';
        }
      }else if(family==='curves'){
        out+=circle(cx,cy,unit*.22*scale*dim,accent);
      }else if(family==='splits'){
        const side=unit*.48;
        if(Math.abs(vx)>0)out+=rect(vx<0?x:x+unit-side,y,side,unit,accent);
        else out+=rect(x,vy<0?y:y+unit-side,unit,side,accent);
      }else if(family==='blocks'){
        const sz=unit*.48*scale*dim;
        out+=rect(cx-sz/2,cy-sz/2,sz,sz,accent);
      }
    });
  }
  return {svg:out,posture,profile,transform:trans};
 }
 global.CharacterDNA=Object.freeze({profiles,families,paint});
})(window);
