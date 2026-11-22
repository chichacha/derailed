/* Reusable SVG portraits for Cast and Posture Studio. No remote assets. */
(function(global){
'use strict';
const G=global.GomasuPostures,D=global.CharacterDNA,C=global.DERAILEDColour;
function escape(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function portrait(shape,id,palette,family,options={}){
 const size=options.size||220,height=options.height||190,unit=options.unit||34,gap=options.gap??2;
 const p=C.validate(palette),colors=C.colours(p);
 const source=G.posePoints(id);
 if(id[0]!==shape)throw Error('Posture does not belong to '+shape);
 const maxX=Math.max(...source.map(pt=>pt.x)),maxY=Math.max(...source.map(pt=>pt.y));
 const ox=(size-(maxX+1)*unit)/2,oy=(height-(maxY+1)*unit)/2;
 const cells=source.map(pt=>({x:ox+pt.x*unit,y:oy+pt.y*unit}));
 const index=G.ORDER.indexOf(shape),main=colors[(index*3+1)%5];
 const side=G.metadata[id]?.side||'front';
 const accent=options.accent||colors[6];
 const clip='p-'+shape+'-'+id.replace(/[^A-Za-z0-9]/g,'')+(options.idSuffix||'');
 const cuts=cells.map(c=>'<rect x="'+(c.x+gap/2)+'" y="'+(c.y+gap/2)+'" width="'+(unit-gap)+'" height="'+(unit-gap)+'" rx="'+Math.min(3,unit*.08)+'"/>').join('');
 const marks=D.paint(shape,cells,{
   unit,features:colors.slice(0,5),accent,family,
   stripeDirection:options.stripeDirection||'diagonal',
   splitDirection:options.splitDirection||'vertical',
   decorated:options.decorated!==false,scale:options.scale||1
 }).svg;
 let drawing='<defs><clipPath id="'+clip+'">'+cuts+'</clipPath></defs>';
 drawing+='<g clip-path="url(#'+clip+')"><rect width="'+size+'" height="'+height+'" fill="'+main+'"/>'+marks+'</g>';
 const label=escape(shape+' '+id+', '+side+', '+D.families[family].label+' graphic style');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+height+'" viewBox="0 0 '+size+' '+height+'" role="img" aria-label="'+label+'">'+drawing+'</svg>';
}
global.CharacterPortrait=Object.freeze({portrait});
})(window);
