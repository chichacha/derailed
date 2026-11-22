/* Geometric motif registry. To add an art vocabulary, register one renderer.
   Every renderer receives {x,y,w,h,cells,accent,main,rotation,scale,unit}.
   All output is clipped to the parent pentomino by the app renderer. */
(function(global){
  'use strict';
  const entries=new Map(),fmt=n=>Math.round(n*100)/100;
  const r=(x,y,w,h,fill)=>'<rect x="'+fmt(x)+'" y="'+fmt(y)+'" width="'+fmt(w)+'" height="'+fmt(h)+'" fill="'+fill+'"/>';
  const circle=(x,y,rad,fill)=>'<circle cx="'+fmt(x)+'" cy="'+fmt(y)+'" r="'+fmt(rad)+'" fill="'+fill+'"/>';
  const line=(x1,y1,x2,y2,sw,c)=>'<line x1="'+fmt(x1)+'" y1="'+fmt(y1)+'" x2="'+fmt(x2)+'" y2="'+fmt(y2)+'" stroke="'+c+'" stroke-width="'+fmt(sw)+'"/>';
  function register(id,label,family,render){if(!/^[a-z-]+$/.test(id)||entries.has(id)||typeof render!=='function')throw Error('Invalid or duplicate motif '+id);entries.set(id,{id,label,family,render})}
  const add=(id,label,family,render)=>register(id,label,family,render);
  add('solid','Solid','solid',()=> '');
  add('vertical-split','Vertical split','splits',p=>r(p.x+p.w*.52,p.y,p.w*.48,p.h,p.accent));
  add('horizontal-split','Horizontal split','splits',p=>r(p.x,p.y+p.h*.52,p.w,p.h*.48,p.accent));
  add('diagonal-split','Diagonal split','splits',p=>'<path d="M '+p.x+' '+p.y+' L '+(p.x+p.w)+' '+p.y+' L '+(p.x+p.w)+' '+(p.y+p.h)+' Z" fill="'+p.accent+'"/>');
  add('half-circle','Half-circle','curves',p=>{
    const rr=Math.max(p.w,p.h)*.62*p.scale;
    const cx=p.rotation%2?p.x+p.w:p.x+p.w/2,cy=p.rotation%2?p.y+p.h/2:p.y+p.h;
    return circle(cx,cy,rr,p.accent);
  });
  add('quarter-circle','Quarter-circle','curves',p=>{
    const cx=p.rotation%2?p.x+p.w:p.x,cy=p.rotation>1?p.y+p.h:p.y;
    return circle(cx,cy,Math.max(p.w,p.h)*.83*p.scale,p.accent);
  });
  add('broad-stripes','Broad stripes','stripes',p=>{
    let out='';const step=39*p.scale,th=17*p.scale;
    for(let yy=p.y-step;yy<p.y+p.h+step;yy+=step)out+=r(p.x-1,yy,p.w+2,th,p.accent);
    return out;
  });
  add('fine-stripes','Fine stripes','stripes',p=>{
    let out='';const step=19*p.scale,th=5*p.scale;
    for(let xx=p.x-step;xx<p.x+p.w+step;xx+=step)out+=r(xx,p.y-1,th,p.h+2,p.accent);
    return out;
  });
  add('diagonal-stripes','Diagonal stripes','stripes',p=>{
    let out='';const step=32*p.scale;
    for(let x=p.x-p.h-step;x<p.x+p.w+p.h+step;x+=step)
      out+=line(x,p.y,x+p.h,p.y+p.h,11*p.scale,p.accent);
    return out;
  });
  add('dots','Dots','curves',p=>p.cells.map(c=>circle(c.x+p.unit/2,c.y+p.unit/2,12.5*p.scale,p.accent)).join(''));
  add('rings','Concentric rings','curves',p=>{
    let out='';const cx=p.x+p.w*.42,cy=p.y+p.h*.45;
    for(let rad=11*p.scale;rad<Math.max(p.w,p.h)*1.4;rad+=30*p.scale)
      out+='<circle cx="'+fmt(cx)+'" cy="'+fmt(cy)+'" r="'+fmt(rad)+'" fill="none" stroke="'+p.accent+'" stroke-width="'+fmt(9*p.scale)+'"/>';
    return out;
  });
  add('arches','Arches','curves',p=>p.cells.map(c=>circle(c.x+p.unit/2,p.rotation%2?c.y:c.y+p.unit,26*p.scale,p.accent)).join(''));
  add('checker','Checker blocks','stripes',p=>p.cells.filter((_,i)=>(i+p.rotation)%2===0).map(c=>r(c.x,c.y,p.unit,p.unit,p.accent)).join(''));
  add('sunrise','Sunrise','curves',p=>{
    const cx=p.x+p.w/2,cy=p.y+p.h*.75;
    return circle(cx,cy,Math.min(p.w,p.h)*.6*p.scale,p.accent)+
      [-3,-2,-1,0,1,2,3].map(i=>r(cx+i*24*p.scale,p.y+p.h*.80,8*p.scale,p.h*.3,p.main)).join('');
  });
  // Add another family by registering motifs before the app boots.
  global.PentominoMotifs={
    register,all:()=>Array.from(entries.values()),get:id=>entries.get(id)||entries.get('solid'),
    byFamily:family=>family==='all'?Array.from(entries.values()).filter(e=>e.id!=='solid'):
      Array.from(entries.values()).filter(e=>e.family===family)
  };
})(window);
