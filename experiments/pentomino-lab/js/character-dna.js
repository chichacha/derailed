/* Gomasu × DERAILED — continuous geometric treatments, not cell stickers.
 * One graphic family per composition. Draw in the canonical Gomasu posture,
 * transform the entire motif with rotation/reflection, then clip to the shape.
 * Each motif therefore crosses cell boundaries and belongs to the whole piece.
 */
(function(global){
'use strict';
const G=global.GomasuPostures;
if(!G)throw Error('Load Gomasu postures before Character DNA');
const profiles={
 F:{name:'Fidget',idea:'Flow through the bend',edge:'left'},
 I:{name:'In-Line',idea:'Five squares, one continuous rhythm',edge:'right'},
 L:{name:'Longreach',idea:'An arc at the long reach',edge:'top'},
 N:{name:'Nudge',idea:'A cutout across the offset',edge:'bottom'},
 P:{name:'Pack-In',idea:'A bold bite in the compact form',edge:'right'},
 T:{name:'Tidy',idea:'A circle meets the crossbar',edge:'top'},
 U:{name:'U-Hug',idea:'An arc that frames the opening',edge:'top'},
 V:{name:'V-Corner',idea:'A curve against the corner',edge:'left'},
 W:{name:'Wobble-Step',idea:'A circle across the staircase',edge:'bottom'},
 X:{name:'X-Center',idea:'Five colours on five squares',edge:'top'},
 Y:{name:'Y-Not?',idea:'The side branch gets an accent',edge:'right'},
 Z:{name:'Zigzag',idea:'Contrast across the zigzag',edge:'bottom'}
};
const families={
 linear:{label:'Stripes',description:'Broad, continuous horizontal, vertical or diagonal stripes'},
 curves:{label:'Circle cutout',description:'One large accent circle enters the silhouette from its edge'},
 splits:{label:'Clean split',description:'One straight two-tone division across the entire piece'},
 blocks:{label:'Colour blocks',description:'A single wide rectangular overlay, clipped to the silhouette'}
};
const fmt=v=>String(Math.round(v*1000)/1000);
const rect=(x,y,w,h,fill)=>'<rect x="'+fmt(x)+'" y="'+fmt(y)+'" width="'+fmt(w)+'" height="'+fmt(h)+'" fill="'+fill+'"/>';
const circle=(cx,cy,r,fill)=>'<circle cx="'+fmt(cx)+'" cy="'+fmt(cy)+'" r="'+fmt(r)+'" fill="'+fill+'"/>';
const paths=(points,fill)=>'<path d="'+points.map((p,i)=>(i?'L':'M')+fmt(p[0])+' '+fmt(p[1])).join(' ')+' Z" fill="'+fill+'"/>';
function makeTransform(reflected,rotation){
  const point=(x,y)=>{
    if(reflected)x=-x;
    for(let k=0;k<rotation;k++)[x,y]=[-y,x];
    return [x,y];
  };
  const [a,b]=point(1,0),[c,d]=point(0,1);
  return {a,b,c,d,point};
}
function chooseEdge(base,side){
  const centerX=base.reduce((s,p)=>s+p.x+.5,0)/base.length;
  const centerY=base.reduce((s,p)=>s+p.y+.5,0)/base.length;
  const ids=new Set(base.map(p=>p.x+','+p.y));
  const delta={top:[0,-1],bottom:[0,1],left:[-1,0],right:[1,0]}[side]||[0,-1];
  const visible=base.filter(p=>!ids.has((p.x+delta[0])+','+(p.y+delta[1])));
  const position=visible.sort((a,b)=>
     Math.hypot(a.x+.5-centerX,a.y+.5-centerY)-Math.hypot(b.x+.5-centerX,b.y+.5-centerY))[0];
  const midX=position.x+.5,midY=position.y+.5;
  if(side==='top')return [midX,position.y];
  if(side==='bottom')return [midX,position.y+1];
  if(side==='left')return [position.x,midY];
  return [position.x+1,midY];
}
function paint(shape,cells,opt={}){
  const unit=Number(opt.unit)||44;
  const xs=cells.map(p=>p.x),ys=cells.map(p=>p.y);
  const left=Math.min(...xs),top=Math.min(...ys);
  const grid=cells.map(p=>[Math.round((p.x-left)/unit),Math.round((p.y-top)/unit)]);
  const posture=G.resolve(shape,grid),transform=G.matchingTransform(shape,grid);
  const profile=profiles[shape];
  if(!profile)throw Error('Unknown character: '+shape);
  const features=opt.features||['#880D1E','#F26A8D','#DD2D4A','#CBEEF3','#F49CBB'];
  const accent=opt.accent||'#241C29';
  const family=families[opt.family]?opt.family:'curves';
  const scale=Math.max(.6,Math.min(1.5,Number(opt.scale)||1));
  const decorated=opt.decorated!==false;
  // X remains the explicit exception; every cell has its own feature colour.
  if(shape==='X'&&opt.specialX!==false){
    return {svg:cells.map((p,i)=>rect(p.x,p.y,unit,unit,features[transform.indices[i]])).join(''),
            posture,profile,transform};
  }
  if(!decorated)return {svg:'',posture,profile,transform};

  // Canonical coordinates (base pose), independent of where the piece sits.
  const base=G.posePoints(G.ids(shape)[0]);
  const width=(Math.max(...base.map(p=>p.x))+1)*unit;
  const height=(Math.max(...base.map(p=>p.y))+1)*unit;
  let motif='';
  if(family==='linear'){
    const direction=['horizontal','vertical','diagonal'].includes(opt.stripeDirection)?opt.stripeDirection:'diagonal';
    const step=unit*.48*scale,thickness=unit*.205*scale;
    if(direction==='horizontal'){
      for(let y=-step;y<=height+step;y+=step)motif+=rect(-unit,y,width+unit*2,thickness,accent);
    }else if(direction==='vertical'){
      for(let x=-step;x<=width+step;x+=step)motif+=rect(x,-unit,thickness,height+unit*2,accent);
    }else{
      const reach=height+width;
      for(let x=-reach;x<=width+reach;x+=step)
        motif+='<path d="M '+fmt(x)+' '+fmt(-unit)+' L '+fmt(x+height+unit*2)+' '+fmt(height+unit)+'" stroke="'+accent+'" stroke-width="'+fmt(thickness)+'" fill="none"/>';
    }
  }else if(family==='curves'){
    const [ex,ey]=chooseEdge(base,profile.edge);
    // The centre is set just outside an exposed edge. The large disc cuts into
    // multiple neighbouring cells rather than becoming a dot on one cell.
    const dir={top:[0,-.32],bottom:[0,.32],left:[-.32,0],right:[.32,0]}[profile.edge];
    motif=circle((ex+dir[0])*unit,(ey+dir[1])*unit,unit*1.6*scale,accent);
  }else if(family==='splits'){
    const direction=['horizontal','vertical','diagonal'].includes(opt.splitDirection)?opt.splitDirection:'vertical';
    if(direction==='horizontal')motif=rect(-unit,height/2,width+unit*2,height/2+unit,accent);
    else if(direction==='diagonal')motif=paths([[width,0],[width,height],[0,height]],accent);
    else motif=rect(width/2,-unit,width/2+unit,height+unit*2,accent);
  }else if(family==='blocks'){
    const [ex,ey]=chooseEdge(base,profile.edge);
    const box=unit*1.68*scale;
    motif=rect(ex*unit-box/2,ey*unit-box/2,box,box,accent);
  }

  // Map canonical *square corners* to the currently displayed posture. This
  // preserves orientation, reflection and stripe continuity across all cells.
  const {a,b,c,d,point}=makeTransform(transform.reflected,transform.rotation);
  const corners=base.flatMap(p=>[[p.x,p.y],[p.x+1,p.y],[p.x,p.y+1],[p.x+1,p.y+1]])
    .map(([x,y])=>point(x,y));
  const minX=Math.min(...corners.map(p=>p[0])),minY=Math.min(...corners.map(p=>p[1]));
  const e=left-unit*minX,f=top-unit*minY;
  const matrix='matrix('+[a,b,c,d,e,f].map(fmt).join(' ')+')';
  return {svg:'<g transform="'+matrix+'">'+motif+'</g>',posture,profile,transform};
}
global.CharacterDNA=Object.freeze({profiles,families,paint});
})(window);
