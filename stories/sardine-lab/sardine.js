// DERAILED #16 · Sardine Lab.
// Geometry lives in drawSardine; swimming behaviour lives in motion.js.
// This separation lets us add more fish without rebuilding the renderer.
import { createSwimmer, resizeSwimmer, setDestination, stepSwimmer } from "./motion.js";

const canvas = document.getElementById("sardine-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sardine Lab needs a 2D canvas.");
  const $ = id => document.getElementById(id);
  const defaults = { length: 120, depth: 32, speed: 1, turnRate: 2.0 };
  const shape = { length: defaults.length, depth: defaults.depth };
  const motion = { speed: defaults.speed, turnRate: defaults.turnRate };
  let width = 600, height = 340;
  let swimmer = createSwimmer(width, height);
  let showTrail = true;
  let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTime = 0, raf = 0, telemetryAt = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const old = { width, height };
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resizeSwimmer(swimmer, old, { width, height });
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

  function drawTrail() {
    if (!showTrail || swimmer.trail.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(176, 224, 226, 0.34)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    const first = swimmer.trail[0];
    ctx.moveTo(first.x, first.y);
    swimmer.trail.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();
    ctx.restore();
  }

  function drawDestination() {
    if (swimmer.mode !== "follow" || !swimmer.target) return;
    const { x, y } = swimmer.target;
    ctx.save();
    ctx.strokeStyle = "rgba(240, 221, 169, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 17, y); ctx.lineTo(x - 7, y);
    ctx.moveTo(x + 7, y); ctx.lineTo(x + 17, y);
    ctx.moveTo(x, y - 17); ctx.lineTo(x, y - 7);
    ctx.moveTo(x, y + 7); ctx.lineTo(x, y + 17);
    ctx.stroke();
    ctx.restore();
  }

  function render() {
    drawWater(swimmer.time);
    drawTrail();
    drawDestination();
    ctx.save();
    ctx.translate(swimmer.x, swimmer.y);
    ctx.rotate(swimmer.heading + Math.sin(swimmer.tailPhase) * 0.016);
    drawSardine(shape.length, shape.depth, swimmer.tailPhase);
    ctx.restore();
  }

  function telemetry() {
    const angle = (swimmer.heading * 180 / Math.PI + 360) % 360;
    $("motion-data").textContent = "HEADING " + Math.round(angle) +
      "° · " + Math.round(swimmer.speedPx) + " PX/S";
  }

  function tick(timestamp) {
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
    lastTime = timestamp;
    if (playing) {
      stepSwimmer(swimmer, dt, { width, height }, {
        length: shape.length,
        depth: shape.depth,
        speed: motion.speed,
        turnRate: motion.turnRate
      });
    }
    render();
    if (timestamp - telemetryAt > 200) { telemetry(); telemetryAt = timestamp; }
    raf = requestAnimationFrame(tick);
  }

  function syncControls() {
    for (const [name, input, output, source] of [
      ["length", "fish-length", "length-value", shape],
      ["depth", "fish-depth", "depth-value", shape],
      ["speed", "fish-speed", "speed-value", motion],
      ["turnRate", "fish-turn", "turn-value", motion]
    ]) {
      $(input).value = source[name];
      $(output).textContent = ["speed", "turnRate"].includes(name)
        ? source[name].toFixed(1) : String(source[name]);
    }
    document.querySelectorAll("[data-swim-mode]").forEach(button => {
      const selected = button.dataset.swimMode === swimmer.mode;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("selected", selected);
    });
    $("show-path").checked = showTrail;
    $("toggle-swim").textContent = playing ? "Pause swimming" : "Resume swimming";
    $("toggle-swim").setAttribute("aria-pressed", String(!playing));
    $("fish-status").textContent = !playing
      ? "Swimming paused."
      : swimmer.mode === "follow" ? "Following a destination." : "Exploring the tank.";
    $("motion-hint").textContent = swimmer.mode === "follow"
      ? "Tap or click anywhere in the tank to choose a new destination. Or use 'New destination'."
      : "The fish picks a new heading now and then. Walls gently steer it away from the edge.";
    render();
    telemetry();
  }

  [["length", "fish-length", shape], ["depth", "fish-depth", shape],
   ["speed", "fish-speed", motion], ["turnRate", "fish-turn", motion]]
    .forEach(([name, input, source]) => {
      $(input).addEventListener("input", event => {
        source[name] = Number(event.target.value);
        syncControls();
      });
    });

  $("randomize-fish").addEventListener("click", () => {
    shape.length = Math.round(70 + Math.random() * 105);
    shape.depth = Math.round(18 + Math.random() * 33);
    syncControls();
  });

  document.querySelectorAll("[data-swim-mode]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.swimMode === "wander") {
        swimmer.mode = "wander";
        swimmer.target = null;
        swimmer.wanderCountdown = 0;
      } else {
        if (!swimmer.target) {
          setDestination(swimmer, width * .72, height * .37, { width, height });
        } else {
          swimmer.mode = "follow";
        }
      }
      syncControls();
    });
  });

  function newDestination() {
    setDestination(swimmer, width * (.2 + Math.random() * .6),
      height * (.22 + Math.random() * .56), { width, height });
    syncControls();
  }
  $("new-destination").addEventListener("click", newDestination);
  canvas.addEventListener("pointerdown", event => {
    const rect = canvas.getBoundingClientRect();
    setDestination(swimmer, event.clientX - rect.left, event.clientY - rect.top,
      { width, height });
    syncControls();
  });
  $("show-path").addEventListener("change", event => {
    showTrail = event.target.checked;
    syncControls();
  });
  $("toggle-swim").addEventListener("click", () => {
    playing = !playing;
    lastTime = 0;
    syncControls();
  });
  $("reset-fish").addEventListener("click", () => {
    shape.length = defaults.length;
    shape.depth = defaults.depth;
    motion.speed = defaults.speed;
    motion.turnRate = defaults.turnRate;
    swimmer = createSwimmer(width, height);
    showTrail = true;
    syncControls();
  });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { lastTime = 0; });
  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
  resize();
  syncControls();
  raf = requestAnimationFrame(tick);
}
