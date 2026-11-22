/* Compact verified 6x10 pentomino solutions. Each position names its parent shape.
   Replacing this with an exact-cover solver later won't affect the visual renderer. */
(function(global){
 'use strict';
 const rows=[
 'TVVVIIIIIPTTTVYYYYPPTFFVZYWWPPFFZZZWWXUULFZNNWXXXULLLLNNNXUU',
 'YFFWWLLLLVYYFFWWZZLVYTFPPWZVVVYTPPPZZXUUTTTNNNXXXUIIIIINNXUU',
 'INNVVVLLLLITNNNVLXUUITTTZVXXXUITWFZZZXUUIWWFFYZPPPWWFFYYYYPP',
 'FLLLLWWTTTFFFNLXWWTIYFNNXXXWTIYYNZZXPPVIYUNUZPPPVIYUUUZZVVVI',
 'VPPPXZZUUUVPPXXXZUNUVVVYXFZZNNLYYYYFFWTNLLLLFFWWTNIIIIIWWTTT',
 'TVVVLLLLUUTTTVLYYYYUTNFVZZYXUUNNFFZWXXXPNFFZZWWXPPNIIIIIWWPP',
 'PPUUUTYYYYPPUXUTTTYIFPXXXTVVVIFFFXWWZZVILFNNNWWZVILLLLNNWZZI',
 'LLYYYYNNUUILTYNNNFFUILTTTXFFUUILTWXXXFZVIPPWWXZZZVIPPPWWZVVV',
 'FFWWTTTVVVLFFWWTUUUVLFPPWTUZUVLPPPXNNZZZLLYXXXNNNZYYYYXIIIII',
 'YZZPPPLLLLYYZPPXLTTTYNZZXXXWTVYNFUUXWWTVNNFFUWWVVVNFFUUIIIII',
 'ZZVVVYYYYTIZUUVFYTTTIZZUVFFFXTIPUUWWFXXXIPPWWNNNXLIPPWNNLLLL',
 'LLPPZZFVVVILPPPZFFFVILNNNZZFXVILWWNNTXXXIWWYTTTUXUIWYYYYTUUU',
 'VVVUUUWPPPLNVUXUWWPPLNVXXXFWWTLNNZXFFTTTLLNZZZFFYTIIIIIZYYYY',
 'PPPWWXYYYYPPWWXXXYZZVUWUTXFFZLVUUUTFFZZLVVVTTTFNNLIIIIINNNLL',
 'PPIIIIIVVVPPPTZYYYYVFTTTZZZYXVFFFTWWZXXXUFUWWNNNXLUUUWNNLLLL',
 'FVVVLUUTTTFFFVLUZZTIYFXVLUUZTIYXXXLLWZZIYYXNNWWPPIYNNNWWPPPI'
 ];
 const letters='FILPNTUVWXYZ';
 function decode(str){
   if(str.length!==60)throw Error('Tiling must contain 60 cells');
   const pieces=Object.fromEntries([...letters].map(n=>[n,[]]));
   for(let i=0;i<str.length;i++){if(!pieces[str[i]])throw Error('Unknown pentomino');pieces[str[i]].push(i)}
   for(const n of letters){if(pieces[n].length!==5)throw Error('Each pentomino needs five cells');const seen=new Set([pieces[n][0]]),queue=[pieces[n][0]];
     for(const x of queue){for(const y of [x-10,x+10,x-1,x+1]){
       if(y<0||y>=60||Math.abs(y%10-x%10)+Math.abs(Math.floor(y/10)-Math.floor(x/10))!==1)continue;
       if(pieces[n].includes(y)&&!seen.has(y)){seen.add(y);queue.push(y)}
     }} if(seen.size!==5)throw Error('Piece disconnected: '+n)
   }
   return letters.split('').map(name=>({name,cells:pieces[name]}));
 }
 const solutions=rows.map(decode);
 global.PentominoTilings={width:10,height:6,letters,solutions,decode};
})(window);
