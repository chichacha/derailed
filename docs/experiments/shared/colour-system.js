/* DERAILED Colour System v1. Portable and independent of any single lab.
   Seven semantic tokens: feature[0..4], neutral.light, neutral.dark.
   Import in ordinary script tags; no bundler, framework, or network required. */
(function(global){
  'use strict';
  const presets={
    berry:{name:'Berry + Ice',features:['#880D1E','#F26A8D','#DD2D4A','#CBEEF3','#F49CBB'],light:'#FAF7F1',dark:'#241C29'},
    coffee:{name:'Roast',features:['#493329','#8B5E48','#C99872','#D7C3AD','#78918B'],light:'#F8F2E9',dark:'#292322'},
    candy:{name:'Gomasu Candy',features:['#F66B96','#FFC47A','#9ADBD2','#AD9BDA','#DAA5D5'],light:'#FFF9F2',dark:'#32263C'},
    modern:{name:'Modernist',features:['#E34A39','#F6C646','#246AA1','#80A89A','#BD84AC'],light:'#FAF7EF',dark:'#232A35'},
    garden:{name:'Garden',features:['#38604D','#91AA70','#C79A64','#D9A6A0','#A6C6C5'],light:'#F5F1E6',dark:'#25362E'},
    sunset:{name:'Sorbet',features:['#BD425A','#EE8563','#F5BA79','#B4B0D7','#E3AAB4'],light:'#FFF5E8',dark:'#3E3044'}
  };
  const HEX=/^#[0-9a-fA-F]{6}$/;
  function clean(hex){if(typeof hex!=='string'||!HEX.test(hex))throw Error('Expected a #RRGGBB colour');return hex.toUpperCase()}
  function validate(value){
    if(!value||!Array.isArray(value.features)||value.features.length!==5)throw Error('A palette must have exactly five feature colours');
    const features=value.features.map(clean),light=clean(value.light),dark=clean(value.dark);
    return {version:1,name:String(value.name||'Untitled').slice(0,80),features,light,dark};
  }
  function load(id){return validate(presets[id]||presets.berry)}
  function colours(p){const v=validate(p);return [...v.features,v.light,v.dark]}
  function css(p,selector=':root'){
    const v=validate(p);return selector+' {\n'+v.features.map((hex,i)=>'  --colour-'+(i+1)+': '+hex+';').join('\n')+
      '\n  --neutral-light: '+v.light+';\n  --neutral-dark: '+v.dark+';\n}';
  }
  function parse(text){const parsed=JSON.parse(text);return validate(parsed.palette||parsed)}
  global.DERAILEDColour={version:1,presets,validate,load,colours,css,parse};
})(window);
