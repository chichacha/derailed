// DERAILED #16 · Sardine Lab: geometry first, schooling later.
// A single model for fish state, a renderer for its shape, and an animation loop.
(() => {
  "use strict";
  const canvas = document.getElementById("sardine-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const $ = id => document.getElementById(id);
  const defaults = { length: 120, depth: 32, speed: 1 };
  const fish = { ...defaults, x: 0.5, y: 0.52, direction: 1, phase: 0, time: 0 };
  let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTime = 0, width = 600, height = 340, raf = 0;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const previousWidth = width, previousHeight = height;
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!previousWidth || !previousHeight) { fish.x = .5; fish.y = .52; }
    render();
  }

  function drawWater(t) {
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#164b61"); bg.addColorStop(1, "#062536");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 1;
    for (let i = 0; i < 13; i++) {
      const bx = (i * 79 + 31) % width, by = (i * 47 + 61 + t * (3 + i % 4)) % (height + 40);
      ctx.strokeStyle = "rgba(187,230,232,0.11)";
      ctx.beginPath(); ctx.arc(bx, height - by + 20, 2 + i % 3, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // Draw in local coordinates: head points right, body centered at (0, 0).
  function drawSardine(length, depth, phase) {
    const L = length, D = depth, tail = Math.sin(phase) * D * .23;
    // Tail stalk and forked tail.
    ctx.fillStyle = "#83abb8";
    ctx.beginPath();
    ctx.moveTo(-L*.43, -D*.10); ctx.lineTo(-L*.65, -D*.58 + tail);
    ctx.lineTo(-L*.57, tail); ctx.lineTo(-L*.65, D*.58 + tail);
    ctx.lineTo(-L*.43, D*.10); ctx.closePath(); ctx.fill();
    // Dorsal fin.
    ctx.fillStyle = "#6f9ba9";
    ctx.beginPath(); ctx.moveTo(-L*.17,-D*.43);ctx.lineTo(-L*.27,-D*.83);ctx.lineTo(L*.11,-D*.44);ctx.closePath();ctx.fill();
    // Body silhouette.
    ctx.beginPath();
    ctx.moveTo(-L*.48,0);
    ctx.bezierCurveTo(-L*.31,-D*.43,L*.12,-D*.62,L*.47,-D*.12);
    ctx.quadraticCurveTo(L*.53,0,L*.47,D*.15);
    ctx.bezierCurveTo(L*.12,D*.62,-L*.31,D*.45,-L*.48,0);
    const silver=ctx.createLinearGradient(0,-D*.55,0,D*.6);
    silver.addColorStop(0,"#4d8194");silver.addColorStop(.32,"#9bbcc5");silver.addColorStop(.53,"#f0eeee");silver.addColorStop(.81,"#bbd0d2");silver.addColorStop(1,"#658f9c");
    ctx.fillStyle=silver;ctx.fill();
    ctx.strokeStyle="rgba(238,249,249,.5)";ctx.lineWidth=1;ctx.stroke();
    // Lateral stripe, gill and eye.
    ctx.strokeStyle="rgba(49,100,123,.48)";ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(-L*.42,-D*.08);ctx.quadraticCurveTo(0,-D*.15,L*.43,-D*.045);ctx.stroke();
    ctx.beginPath();ctx.arc(L*.29,0,D*.22,-1.4,1.35);ctx.stroke();
    ctx.fillStyle="#f7f8ed";ctx.beginPath();ctx.arc(L*.38,-D*.12,Math.max(2,D*.095),0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#102b39";ctx.beginPath();ctx.arc(L*.395,-D*.12,Math.max(1.5,D*.055),0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#446b79";ctx.beginPath();ctx.moveTo(L*.45,D*.065);ctx.lineTo(L*.49,D*.08);ctx.stroke();
    // Pectoral fin.
    ctx.fillStyle="rgba(79,128,144,.5)";ctx.beginPath();ctx.moveTo(L*.20,D*.10);ctx.lineTo(-L*.04,D*.42);ctx.lineTo(L*.13,D*.18);ctx.fill();
  }

  function render() {
    drawWater(fish.time);
    ctx.save();
    const px = fish.x * width, py = fish.y * height;
    ctx.translate(px, py);
    if (fish.direction < 0) ctx.scale(-1,1);
    // Subtle body yaw makes the tail movement read as swimming.
    ctx.rotate(Math.sin(fish.phase)*.018);
    drawSardine(fish.length,fish.depth,fish.phase);
    ctx.restore();
  }

  function tick(timestamp) {
    const dt = lastTime ? clamp((timestamp-lastTime)/1000,0,.05) : 0;
    lastTime=timestamp;
    if (playing) {
      fish.time += dt;
      fish.phase += dt*(7 + fish.speed * 2);
      fish.x += fish.direction * fish.speed * dt * (75/width);
      // Change course at the tank edge, allowing the fish to turn fully within view.
      const margin = Math.min(.3,(fish.length*.55)/width);
      if (fish.x > 1-margin) {fish.x=1-margin;fish.direction=-1;}
      if (fish.x < margin) {fish.x=margin;fish.direction=1;}
    }
    render();
    raf=requestAnimationFrame(tick);
  }

  function sync() {
    for (const [name,id,out] of [["length","fish-length","length-value"],["depth","fish-depth","depth-value"],["speed","fish-speed","speed-value"]]) {
      $(id).value=fish[name];$(out).textContent=name==="speed"?fish[name].toFixed(1):String(fish[name]);
    }
    $("toggle-swim").textContent=playing?"Pause swimming":"Resume swimming";
    $("toggle-swim").setAttribute("aria-pressed",String(!playing));
    $("fish-status").textContent=playing?"One fish, no leader.":"Swimming paused.";
    render();
  }
  for (const [name,id] of [["length","fish-length"],["depth","fish-depth"],["speed","fish-speed"]]) {
    $(id).addEventListener("input",e=>{fish[name]=Number(e.target.value);sync();});
  }
  $("randomize-fish").addEventListener("click",()=>{
    fish.length=Math.round(70+Math.random()*105);
    fish.depth=Math.round(18+Math.random()*33);
    fish.speed=+(0.4+Math.random()*2).toFixed(1);
    sync();
  });
  $("toggle-swim").addEventListener("click",()=>{playing=!playing;lastTime=0;sync();});
  $("reset-fish").addEventListener("click",()=>{
    Object.assign(fish,defaults,{x:.5,y:.52,direction:1,phase:0,time:0});
    sync();
  });
  window.addEventListener("resize",resize);
  resize();sync();raf=requestAnimationFrame(tick);
  window.addEventListener("pagehide",()=>cancelAnimationFrame(raf),{once:true});
})();
