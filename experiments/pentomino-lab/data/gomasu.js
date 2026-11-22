/* Gomasu ↔ DERAILED posture crosswalk. Snapshot of 63 source postures
 * and editorial presentation metadata from chichacha/psychic-pento-guacamole,
 * main branch, 2026-11-21. To resync, copy the three named JSON resources
 * and keep their authored posture IDs unchanged.
 * Source: https://github.com/chichacha/psychic-pento-guacamole/tree/main/data
 * No request/network required at runtime. */
(function(global){
 'use strict';
 const postures={"V01":[[0,0,0],[1,0,0],[2,0,0],[0,1,0],[0,2,0]],"P00":[[0,0,0],[1,0,0],[2,0,0],[0,1,0],[1,1,0]],"P07":[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,2,0]],"L01":[[0,0,0],[1,0,0],[0,1,0],[0,2,0],[0,3,0]],"L06":[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[0,1,0]],"P03":[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[1,2,0]],"P04":[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[2,1,0]],"U00":[[0,0,0],[1,0,0],[0,1,0],[0,2,0],[1,2,0]],"U03":[[0,0,0],[1,0,0],[2,0,0],[0,1,0],[2,1,0]],"Y01":[[0,0,0],[0,1,0],[1,1,0],[0,2,0],[0,3,0]],"Y06":[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[1,1,0]],"P01":[[0,0,0],[0,1,0],[1,1,0],[0,2,0],[1,2,0]],"P06":[[0,0,0],[1,0,0],[2,0,0],[1,1,0],[2,1,0]],"T00":[[0,0,0],[1,0,0],[2,0,0],[1,1,0],[1,2,0]],"T01":[[0,0,0],[0,1,0],[1,1,0],[2,1,0],[0,2,0]],"W01":[[0,0,0],[1,0,0],[-1,1,0],[0,1,0],[-1,2,0]],"U01":[[0,0,0],[2,0,0],[0,1,0],[1,1,0],[2,1,0]],"U02":[[0,0,0],[1,0,0],[1,1,0],[0,2,0],[1,2,0]],"F02":[[0,0,0],[1,0,0],[1,1,0],[2,1,0],[1,2,0]],"F03":[[0,0,0],[-1,1,0],[0,1,0],[1,1,0],[-1,2,0]],"F04":[[0,0,0],[1,0,0],[-1,1,0],[0,1,0],[0,2,0]],"F05":[[0,0,0],[0,1,0],[1,1,0],[2,1,0],[1,2,0]],"N01":[[0,0,0],[-1,1,0],[0,1,0],[-1,2,0],[-1,3,0]],"N06":[[0,0,0],[1,0,0],[2,0,0],[-1,1,0],[0,1,0]],"Y00":[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[2,1,0]],"Y07":[[0,0,0],[0,1,0],[0,2,0],[1,2,0],[0,3,0]],"P02":[[0,0,0],[1,0,0],[-1,1,0],[0,1,0],[1,1,0]],"P05":[[0,0,0],[-1,1,0],[0,1,0],[-1,2,0],[0,2,0]],"V00":[[0,0,0],[1,0,0],[2,0,0],[2,1,0],[2,2,0]],"V02":[[0,0,0],[0,1,0],[0,2,0],[1,2,0],[2,2,0]],"N00":[[0,0,0],[1,0,0],[2,0,0],[2,1,0],[3,1,0]],"N02":[[0,0,0],[1,0,0],[1,1,0],[2,1,0],[3,1,0]],"N05":[[0,0,0],[0,1,0],[1,1,0],[1,2,0],[1,3,0]],"N07":[[0,0,0],[0,1,0],[0,2,0],[1,2,0],[1,3,0]],"I00":[[0,0,0],[0,1,0],[0,2,0],[0,3,0],[0,4,0]],"I01":[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[4,0,0]],"Z00":[[0,0,0],[1,0,0],[1,1,0],[1,2,0],[2,2,0]],"Z01":[[0,0,0],[-2,1,0],[-1,1,0],[0,1,0],[-2,2,0]],"Z02":[[0,0,0],[1,0,0],[0,1,0],[-1,2,0],[0,2,0]],"Z03":[[0,0,0],[0,1,0],[1,1,0],[2,1,0],[2,2,0]],"L00":[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[3,1,0]],"L02":[[0,0,0],[0,1,0],[1,1,0],[2,1,0],[3,1,0]],"L05":[[0,0,0],[1,0,0],[1,1,0],[1,2,0],[1,3,0]],"L07":[[0,0,0],[0,1,0],[0,2,0],[0,3,0],[1,3,0]],"X00":[[0,0,0],[-1,1,0],[0,1,0],[1,1,0],[0,2,0]],"W00":[[0,0,0],[1,0,0],[1,1,0],[2,1,0],[2,2,0]],"W02":[[0,0,0],[0,1,0],[1,1,0],[1,2,0],[2,2,0]],"F00":[[0,0,0],[-1,1,0],[0,1,0],[0,2,0],[1,2,0]],"F01":[[0,0,0],[-2,1,0],[-1,1,0],[0,1,0],[-1,2,0]],"F06":[[0,0,0],[0,1,0],[1,1,0],[-1,2,0],[0,2,0]],"F07":[[0,0,0],[-1,1,0],[0,1,0],[1,1,0],[1,2,0]],"N03":[[0,0,0],[0,1,0],[-1,2,0],[0,2,0],[-1,3,0]],"N04":[[0,0,0],[1,0,0],[-2,1,0],[-1,1,0],[0,1,0]],"Y02":[[0,0,0],[-1,1,0],[0,1,0],[1,1,0],[2,1,0]],"Y05":[[0,0,0],[-1,1,0],[0,1,0],[0,2,0],[0,3,0]],"Y03":[[0,0,0],[0,1,0],[-1,2,0],[0,2,0],[0,3,0]],"Y04":[[0,0,0],[-2,1,0],[-1,1,0],[0,1,0],[1,1,0]],"T02":[[0,0,0],[0,1,0],[-1,2,0],[0,2,0],[1,2,0]],"T03":[[0,0,0],[-2,1,0],[-1,1,0],[0,1,0],[0,2,0]],"W03":[[0,0,0],[-1,1,0],[0,1,0],[-2,2,0],[-1,2,0]],"L03":[[0,0,0],[0,1,0],[0,2,0],[-1,3,0],[0,3,0]],"L04":[[0,0,0],[-3,1,0],[-2,1,0],[-1,1,0],[0,1,0]],"V03":[[0,0,0],[0,1,0],[-2,2,0],[-1,2,0],[0,2,0]]};
 const metadata={"X00":{"side":"front","color":"#F0B6DF","comment":"何回まわっても、わしは一人分。人口増加には貢献できんのう。"},"I00":{"side":"front","color":"#FDCFAB","comment":"立っているわしを、一人と数えてくれたかの？"},"I01":{"side":"front","color":"#FDCFAB","comment":"横になっただけで二人目？ ずいぶん気前のいい調査じゃ。"},"T00":{"side":"front","color":"#76E1D7","comment":"人口調査なら、まず全員一列に並びなさい！"},"T01":{"side":"front","color":"#76E1D7"},"T02":{"side":"front","color":"#76E1D7","comment":"逆さまになっただけで追加の一人？ 名簿を確認して！"},"T03":{"side":"front","color":"#76E1D7"},"U00":{"side":"front","color":"#85D7EF","comment":"このすき間に誰か入っても、わたしは一人よね？"},"U01":{"side":"front","color":"#85D7EF"},"U02":{"side":"front","color":"#85D7EF","comment":"入口の向きが変わっただけで、また一人増えたの？"},"U03":{"side":"front","color":"#85D7EF"},"V00":{"side":"front","color":"#A9C7E9","comment":"角を変えるたびに一人増えるなら、四人になるわね。"},"V01":{"side":"front","color":"#A9C7E9"},"V02":{"side":"front","color":"#A9C7E9"},"V03":{"side":"front","color":"#A9C7E9","comment":"ここでも数えられたの？ さっき別の角でも答えたわよ。"},"W00":{"side":"front","color":"#CBBBE8","comment":"一段ずつ進んできたけど、住民票は一枚でいいよね。"},"W01":{"side":"front","color":"#CBBBE8"},"W02":{"side":"front","color":"#CBBBE8","comment":"逆から来ただけで、もう一人に数えられちゃった。"},"W03":{"side":"front","color":"#CBBBE8"},"Z00":{"side":"front","color":"#ECD2C1","comment":"わたしの表と裏、別々に登録するの？"},"Z01":{"side":"front","color":"#ECD2C1"},"Z02":{"side":"back","color":"#C2AC9E","comment":"裏返ったら別人だって。住民票が二枚になっちゃうわ。"},"Z03":{"side":"back","color":"#C2AC9E"},"F00":{"side":"front","color":"#FFADA6","comment":"一回目の点呼！ はーい、わたしです！"},"F01":{"side":"front","color":"#FFADA6","comment":"二回目も、わたし！ えっ、また一人増えた？"},"F02":{"side":"front","color":"#FFADA6"},"F03":{"side":"front","color":"#FFADA6"},"F04":{"side":"back","color":"#D18E88","comment":"顔色が悪いって、別人扱いされた。"},"F05":{"side":"back","color":"#D18E88"},"F06":{"side":"back","color":"#D18E88"},"F07":{"side":"back","color":"#D18E88","comment":"八人目って言われたけど、全部わたしなんだよ！"},"L00":{"side":"front","color":"#FEE1A7","comment":"一人で来たのに、八人分の名簿があるんだって。"},"L01":{"side":"front","color":"#FEE1A7"},"L02":{"side":"front","color":"#FEE1A7"},"L03":{"side":"front","color":"#FEE1A7"},"L04":{"side":"back","color":"#D0B889","comment":"裏返っただけで五人目？ そんなに大家族じゃないよ。"},"L05":{"side":"back","color":"#D0B889"},"L06":{"side":"back","color":"#D0B889"},"L07":{"side":"back","color":"#D0B889"},"N00":{"side":"front","color":"#D2E3AD","comment":"ちょっとずれても、同じ一人として数えてね。"},"N01":{"side":"front","color":"#D2E3AD"},"N02":{"side":"front","color":"#D2E3AD"},"N03":{"side":"front","color":"#D2E3AD"},"N04":{"side":"back","color":"#ACBA8E","comment":"裏返ったら別人扱い？ ずれてるのは数え方じゃない？"},"N05":{"side":"back","color":"#ACBA8E"},"N06":{"side":"back","color":"#ACBA8E"},"N07":{"side":"back","color":"#ACBA8E"},"P00":{"side":"front","color":"#6BB091","comment":"ぎゅっと五マスで一人です。五人じゃありません！"},"P01":{"side":"front","color":"#6BB091"},"P02":{"side":"front","color":"#6BB091"},"P03":{"side":"front","color":"#6BB091"},"P04":{"side":"back","color":"#589077","comment":"裏返っても五マスで一人。……えっ、また数えるの？"},"P05":{"side":"back","color":"#589077"},"P06":{"side":"back","color":"#589077"},"P07":{"side":"back","color":"#589077"},"Y00":{"side":"front","color":"#FFAFD0","comment":"一マスはみ出しても、住民は一人だよ。"},"Y01":{"side":"front","color":"#FFAFD0"},"Y02":{"side":"front","color":"#FFAFD0"},"Y03":{"side":"front","color":"#FFAFD0"},"Y04":{"side":"back","color":"#D190AB","comment":"裏返っただけで五人目？ はみ出しすぎたかな。"},"Y05":{"side":"back","color":"#D190AB"},"Y06":{"side":"back","color":"#D190AB"},"Y07":{"side":"back","color":"#D190AB"}};
 const characters=[{"shape":"X","name_ja":"まんなかおじさん","title_en":"X-Center","color":"#F0B6DF","quote":"「ここにいるよ。」","story":"いつも真ん中にいる、まんなかおじさん。右を向いても、左を向いても、見た目は同じ。本人は毎回ちゃんと向きを変えているのに、誰も気づいてくれません。","orientation_count":1},{"shape":"I","name_ja":"まっすぐおじさん","title_en":"In-Line","color":"#FDCFAB","quote":"「まっすぐ行こう。」","story":"曲がるのが苦手な、まっすぐおじさん。どこへ行くにも一直線。でも、道の先に壁があると、しばらく考えます。横になればいいことには、まだ気づいていません。","orientation_count":2},{"shape":"T","name_ja":"しきりやおばさん","title_en":"Tidy","color":"#76E1D7","quote":"「はい、そこに並んで！」","story":"みんなの位置が気になる、しきりやおばさん。右に一人、左に一人、真ん中にも一人。きれいに並ぶと安心します。でも、誰も頼んでいないのに席替えを始めることがあります。","orientation_count":4},{"shape":"U","name_ja":"ぎゅーおばさん","title_en":"U-Hug","color":"#85D7EF","quote":"「ここ、入っていいよ！」","story":"真ん中に小さなすき間がある、ぎゅーおばさん。いつでも誰かを迎える準備はできています。ただし、入れるのは一マスだけ。Iおじさんには、少し狭すぎるようです。","orientation_count":4},{"shape":"V","name_ja":"かどっこおばさん","title_en":"V-Corner","color":"#A9C7E9","quote":"「この角、いい感じ。」","story":"かどっこが大好きな、かどっこおばさん。部屋に入ると、まず角を探します。角が見つかると、そこから動きません。なぜそんなに角が好きなのか、本人にもよくわかりません。","orientation_count":4},{"shape":"W","name_ja":"こつこつおばさん","title_en":"Wobble-Step","color":"#CBBBE8","quote":"「一段ずつでいいよ。」","story":"一段ずつ進む、こつこつおばさん。急ぐことはありません。右へ一歩、下へ一歩、また右へ。遠回りに見えても、本人にとってはこれが一番まっすぐな道なのです。","orientation_count":4},{"shape":"Z","name_ja":"つなぎおばさん","title_en":"Zigzag","color":"#ECD2C1","quote":"「こっちと、こっちをつなげよう。」","story":"離れたところをつなぐのが得意な、つなぎおばさん。くるっと半回転しても、同じ姿。でも、ひっくり返すと少し違います。本人は『表も裏も、わたしです』と言っています。","orientation_count":4},{"shape":"F","name_ja":"くねくねちゃん","title_en":"Fidget","color":"#FFADA6","quote":"「こっちかな？ あ、やっぱりこっち！」","story":"じっとしているのが苦手な、くねくねちゃん。右を向いて、左を向いて、ひっくり返って、また考えます。八通りの姿を試したあと、最初の姿に戻ることもあります。","orientation_count":8},{"shape":"L","name_ja":"のびのびちゃん","title_en":"Longreach","color":"#FEE1A7","quote":"「あそこまで届くかな？」","story":"遠くのものが気になる、のびのびちゃん。ぐーんと手を伸ばして、あと一マス。高いところにも、低いところにも届きたい。でも、ときどき自分の長さを忘れて、曲がり角で困ります。","orientation_count":8},{"shape":"N","name_ja":"ずらしくん","title_en":"Nudge","color":"#D2E3AD","quote":"「ちょっとずれると、面白いよ。」","story":"みんなと少しだけずれていたい、ずらしくん。まっすぐ並ぶのも悪くないけれど、一マスずらすと景色が変わります。本人はずれているつもりがなく、みんなのほうがずれていると思っています。","orientation_count":8},{"shape":"P","name_ja":"ぎゅっとくん","title_en":"Pack-In","color":"#6BB091","quote":"「もうちょっと近くにおいで。」","story":"四つのマスがぎゅっと集まっている、ぎゅっとくん。残りの一マスだけ、ちょこんとはみ出しています。本人はみんなをまとめているつもりですが、その一マスが誰なのかは秘密です。","orientation_count":8},{"shape":"Y","name_ja":"はみだしくん","title_en":"Y-Not?","color":"#FFAFD0","quote":"「ちょっと違うほうが楽しいよ。」","story":"まっすぐな四マスから、一マスだけ横に出ている、はみだしくん。列に並ぶのは嫌いではありません。ただ、同じ方向を向いていると、つい横が気になります。本人はこれを寄り道と呼んでいます。","orientation_count":8}];
 const byShape=Object.create(null),bySignature=new Map();
 const ORDER='FILPNTUVWXYZ';
 const norm=points=>{
   const raw=points.map(p=>Array.isArray(p)?[Number(p[0]),Number(p[1])]:[Number(p.x),Number(p.y)]);
   const minX=Math.min(...raw.map(p=>p[0])),minY=Math.min(...raw.map(p=>p[1]));
   return raw.map(([x,y])=>[x-minX,y-minY]);
 };
 const signature=points=>norm(points).map(p=>p.join(',')).sort().join('|');
 Object.entries(postures).forEach(([id,pts])=>{
   const name=id[0];(byShape[name]||=([])).push(id);
   const key=name+':'+signature(pts);
   if(bySignature.has(key))throw Error('Duplicate posture signature '+id);
   bySignature.set(key,id);
 });
 Object.values(byShape).forEach(arr=>arr.sort());
 if(Object.keys(postures).length!==63||characters.length!==12)throw Error('Unexpected posture snapshot');
 function resolve(shape,points){
   const id=bySignature.get(shape+':'+signature(points));
   if(!id)throw Error('No Gomasu posture matches '+shape);
   return {id,shape,side:metadata[id]?.side||'front',colour:metadata[id]?.color||null,
           comment:metadata[id]?.comment||'',orientationCount:byShape[shape].length};
 }
 function matchingTransform(shape,points){
   const target=norm(points),base=norm(postures[byShape[shape][0]]);
   const targetKey=signature(target);
   for(const reflected of [false,true])for(let rotation=0;rotation<4;rotation++){
     const transformed=base.map(([a,b])=>{
       let x=reflected?-a:a,y=b;
       for(let i=0;i<rotation;i++)[x,y]=[-y,x];
       return [x,y];
     });
     const normalized=norm(transformed);
     if(signature(normalized)===targetKey){
       const at=new Map(normalized.map((p,i)=>[p.join(','),i]));
       return {indices:target.map(p=>at.get(p.join(','))),reflected,rotation};
     }
   }
   throw Error('Orientation transform not found: '+shape);
 }
 function posePoints(id){
   if(!postures[id])throw Error('Unknown posture '+id);
   return norm(postures[id]).map(([x,y])=>({x,y}));
 }
 global.GomasuPostures=Object.freeze({
   postures,metadata,characters,ORDER,
   ids:shape=>shape?[...(byShape[shape]||[])]:Object.keys(postures).sort(),
   resolve,matchingTransform,posePoints,signature,
   character:shape=>characters.find(x=>x.shape===shape)||null
 });
})(window);
