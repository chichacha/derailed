// DERAILED #16 — Sardine Lab: generator + movement engine + local schooling.
// The drawing, motion engine and Boids calculations are intentionally separate.
import { resizeSchool, createSchool, setSchoolCount, stepSchool } from "./school.js";

const canvas = document.getElementById("sardine-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sardine Lab requires a 2D canvas.");
  const $ = id => document.getElementById(id);
  const defaults = {
    length: 120, depth: 32, scale: .38, count: 48,
    speed: 1.1, turnRate: 2.5,
    separation: 1.4, alignment: 1.0, cohesion: 1.0,
    neighbourRadius: 108, personalSpace: 26,
    schooling: true, mode: "wander", target: null, trackedIndex: 0
  };
  const settings = { ...defaults };
  let width = 600, height = 340;
  let fish = createSchool(settings.count, { width, height });
  let showTrail = true;
  let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTime = 0, raf = 0, telemetryAt = 0;
  let waterTime = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const old = { width, height };
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resizeSchool(fish, old, { width, height });
    if (settings.target) {
      settings.target = {
        x: settings.target.x * width / old.width,
        y: settings.target.y * height / old.height
      };
    }
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
    if (!showTrail || !fish.length) return;
    const tracked = fish[Math.min(settings.trackedIndex, fish.length - 1)];
    if (tracked.trail.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(252, 205, 125, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(tracked.trail[0].x, tracked.trail[0].y);
    tracked.trail.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.restore();
  }

  function drawDestination() {
    if (settings.mode !== "follow" || !settings.target) return;
    const { x, y } = settings.target;
    ctx.save();
    ctx.strokeStyle = "rgba(240, 221, 169, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 17, y); ctx.lineTo(x - 7, y);
    ctx.moveTo(x + 7, y); ctx.lineTo(x + 17, y);
    ctx.moveTo(x, y - 17); ctx.lineTo(x, y - 7);
    ctx.moveTo(x, y + 7); ctx.lineTo(x, y + 17);
    ctx.stroke();
    ctx.restore();
  }

  function uprightPose(heading, previousFacing) {
    const horizontal = Math.cos(heading);
    const vertical = Math.sin(heading);
    // Hysteresis stops rapid left/right flipping when swimming nearly vertically.
    const facing = horizontal > 0.16 ? 1 : horizontal < -0.16 ? -1 : previousFacing;
    // Gentle body pitch, not a full rotation. Positive canvas Y points down.
    const rawPitch = Math.atan2(vertical * facing, Math.max(Math.abs(horizontal), 0.1));
    const pitch = Math.max(-0.30, Math.min(0.30, rawPitch));
    // Slight foreshortening suggests a turn through the page, without vanishing.
    const widthScale = 0.42 + 0.58 * Math.abs(horizontal);
    return { facing, pitch, widthScale };
  }


  function render() {
    drawWater(waterTime);
    drawTrail();
    drawDestination();
    for (const swimmer of fish) {
      const pose = uprightPose(swimmer.heading, swimmer.facing);
      swimmer.facing = pose.facing;
      const size = settings.scale * swimmer.sizeJitter;
      ctx.save();
      ctx.translate(swimmer.x, swimmer.y);
      ctx.rotate(pose.pitch + Math.sin(swimmer.tailPhase) * .012);
      ctx.scale(pose.facing * pose.widthScale, 1);
      drawSardine(settings.length * size, settings.depth * size, swimmer.tailPhase);
      ctx.restore();
    }
    // Observe one fish, not a leader: highlight only the fish whose path is traced.
    if (showTrail && fish.length > 1) {
      const tracked = fish[Math.min(settings.trackedIndex, fish.length - 1)];
      ctx.save();
      ctx.strokeStyle = "#f0cd8e";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(tracked.x, tracked.y, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function telemetry() {
    const average = fish.reduce((sum, item) => sum + item.speedPx, 0) / fish.length;
    $("motion-data").textContent = fish.length + (fish.length === 1 ? " FISH" : " FISH") +
      " · AVG " + Math.round(average) + " PX/S";
  }

  function tick(timestamp) {
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
    lastTime = timestamp;
    if (playing) {
      waterTime += dt;
      stepSchool(fish, dt, { width, height }, settings);
    }
    render();
    if (timestamp - telemetryAt > 250) {
      telemetry();
      telemetryAt = timestamp;
    }
    raf = requestAnimationFrame(tick);
  }

  function syncControls() {
    const controls = [
      ["length", "fish-length", "length-value", 0],
      ["depth", "fish-depth", "depth-value", 0],
      ["scale", "fish-scale", "scale-value", 2],
      ["count", "fish-count", "count-value", 0],
      ["speed", "fish-speed", "speed-value", 1],
      ["turnRate", "fish-turn", "turn-value", 1],
      ["separation", "rule-separation", "separation-value", 1],
      ["alignment", "rule-alignment", "alignment-value", 1],
      ["cohesion", "rule-cohesion", "cohesion-value", 1]
    ];
    for (const [key, input, output, digits] of controls) {
      $(input).value = settings[key];
      $(output).textContent = key === "scale"
        ? Math.round(settings.scale * 100) + "%"
        : Number(settings[key]).toFixed(digits);
    }
    document.querySelectorAll("[data-swim-mode]").forEach(button => {
      const active = button.dataset.swimMode === settings.mode;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-school-mode]").forEach(button => {
      const active = (button.dataset.schoolMode === "school") === settings.schooling;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $("show-path").checked = showTrail;
    $("toggle-swim").textContent = playing ? "Pause swimming" : "Resume swimming";
    $("toggle-swim").setAttribute("aria-pressed", String(!playing));
    $("fish-status").textContent = !playing
      ? "Paused · " + fish.length + " fish"
      : settings.schooling && fish.length > 1
        ? "No leader. Just neighbours."
        : "Every fish swims independently.";
    $("motion-hint").textContent = settings.mode === "follow"
      ? "Tap the tank to move the shared destination. Each fish steers for itself."
      : "The fish choose where to go themselves, turning gently away from the edges.";
    $("school-hint").textContent = settings.schooling
      ? "Each fish pays attention only to nearby neighbours. Change one rule and watch what happens."
      : "Nobody looks at their neighbours. Turn schooling on to see the difference.";
    $("school-rules").disabled = !settings.schooling;
    $("fish-count-label").textContent = fish.length + (fish.length === 1 ? " SARDINE" : " SARDINES");
    $("path-note").textContent = fish.length > 1 ? "Trace one fish (not the leader)" : "Show swim path";
    render();
    telemetry();
  }

  [
    ["length", "fish-length"], ["depth", "fish-depth"],
    ["scale", "fish-scale"], ["speed", "fish-speed"], ["turnRate", "fish-turn"],
    ["separation", "rule-separation"], ["alignment", "rule-alignment"],
    ["cohesion", "rule-cohesion"]
  ].forEach(([key, id]) => $(id).addEventListener("input", event => {
    settings[key] = Number(event.target.value);
    syncControls();
  }));

  $("fish-count").addEventListener("input", event => {
    settings.count = Number(event.target.value);
    setSchoolCount(fish, settings.count, { width, height });
    syncControls();
  });

  $("randomize-fish").addEventListener("click", () => {
    settings.length = Math.round(75 + Math.random() * 100);
    settings.depth = Math.round(18 + Math.random() * 34);
    syncControls();
  });
  $("reseed-school").addEventListener("click", () => {
    fish = createSchool(settings.count, { width, height });
    syncControls();
  });

  document.querySelectorAll("[data-swim-mode]").forEach(button => {
    button.addEventListener("click", () => {
      settings.mode = button.dataset.swimMode;
      if (settings.mode === "follow" && !settings.target) {
        settings.target = { x: width * .73, y: height * .41 };
      }
      if (settings.mode === "wander") settings.target = null;
      syncControls();
    });
  });

  document.querySelectorAll("[data-school-mode]").forEach(button => {
    button.addEventListener("click", () => {
      settings.schooling = button.dataset.schoolMode === "school";
      syncControls();
    });
  });

  function newDestination() {
    settings.target = {
      x: width * (.2 + Math.random() * .6),
      y: height * (.22 + Math.random() * .56)
    };
    settings.mode = "follow";
    syncControls();
  }
  $("new-destination").addEventListener("click", newDestination);
  canvas.addEventListener("pointerdown", event => {
    const rect = canvas.getBoundingClientRect();
    settings.target = {
      x: Math.max(12, Math.min(width - 12, event.clientX - rect.left)),
      y: Math.max(12, Math.min(height - 12, event.clientY - rect.top))
    };
    settings.mode = "follow";
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
    Object.assign(settings, defaults);
    fish = createSchool(settings.count, { width, height });
    showTrail = true;
    waterTime = 0;
    syncControls();
  });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { lastTime = 0; });
  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
  resize();
  syncControls();
  raf = requestAnimationFrame(tick);
}
