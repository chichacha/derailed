/* Puffer Lab — one parameter-driven SVG fish, no rendering framework.
   Geometry + seeded marks are separate from UI state and scrolly narration. */
const SVG_NS = "http://www.w3.org/2000/svg";
const defaults = Object.freeze({ boxiness: 64, eye: 72, spots: 56, seed: 7390, palette: "classic" });
const fallbackData = {
  palettes: {
    classic: { body:"#fff1d2", shade:"#dbe7dd", patch:"#3c292a", fin:"#f9d66e", water:"#9bdcf8", ink:"#1e283c" },
    golden:  { body:"#ffe5a0", shade:"#f5bb70", patch:"#815035", fin:"#ffad54", water:"#fee7af", ink:"#52342c" },
    dreamy:  { body:"#fae4fa", shade:"#c6e4fb", patch:"#6b6295", fin:"#e7a7d7", water:"#b7c4ff", ink:"#3f4974" },
    night:   { body:"#bde9ed", shade:"#7cb3c9", patch:"#234d6e", fin:"#8ae0b8", water:"#8fbbd6", ink:"#14304c" }
  },
  gallery: [
    { label:"Classic", boxiness:64, eye:72, spots:56, seed:7390, palette:"classic" },
    { label:"Boxy", boxiness:99, eye:90, spots:22, seed:45, palette:"golden" },
    { label:"Spotty", boxiness:42, eye:60, spots:94, seed:301, palette:"classic" },
    { label:"Dreamy", boxiness:74, eye:89, spots:50, seed:1717, palette:"dreamy" }
  ]
};
let data = fallbackData;
let current = { ...defaults };
let scene = "silhouette";
let drawIndex = 0;

function clamp(value, low, high) { return Math.max(low, Math.min(high, Number(value))); }
function randomFromSeed(seed) {
  let value = (Math.floor(seed) >>> 0) || 1;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
function circle(x, y, radius, fill, extra="") {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="' + fill + '" ' + extra + '/>';
}
function drawFish(svg, spec) {
  if (!svg) return;
  const p = { ...defaults, ...spec };
  const colour = data.palettes[p.palette] || data.palettes.classic;
  const rand = randomFromSeed(p.seed);
  const box = clamp(p.boxiness, 0, 100) / 100;
  const eye = 25 + clamp(p.eye, 0, 100) * .29;
  const count = Math.round(clamp(p.spots, 0, 100) * .68);
  const top = 244 - 39 * box;
  const bottom = 426 + 34 * box;
  const path = [
    'M 213 358',
    'C 203 ' + (305 - box * 9) + ' 230 ' + (top + 35) + ' 294 ' + (top + 12),
    'Q 385 ' + (top - 18 * box) + ' 495 ' + top,
    'C 580 ' + (top + 8) + ' 639 ' + (top + 17) + ' 676 258',
    'Q 693 264 701 277 Q 708 288 692 291',
    'L 678 292 Q 701 304 694 315',
    'C 653 345 637 381 566 ' + (bottom - 12),
    'Q 442 ' + (bottom + 15 * box) + ' 343 ' + bottom,
    'Q 240 ' + (bottom + 2) + ' 218 408 Q 203 379 213 358 Z'
  ].join(" ");
  const id = "puffer-clip-" + (++drawIndex);
  let spineShapes = "";
  for (let i=0; i<16; i++) {
    const t = i / 15, x = 255 + t * 340;
    const y = top + 18 - 28 * Math.sin(t * Math.PI) + 9 * t;
    const length = 9 + rand() * 14;
    spineShapes += '<path d="M ' + x.toFixed(1) + ' ' + (y+7).toFixed(1) + ' L ' + (x-4).toFixed(1) + ' ' + (y-length).toFixed(1) +
      ' L ' + (x+8).toFixed(1) + ' ' + (y+5).toFixed(1) + ' Z" fill="' + colour.body + '" stroke="' + colour.ink + '" stroke-width="2"/>';
  }
  let dots = "";
  for (let i=0; i<count; i++) {
    const x = 245 + rand()*345, y=318+rand()*154, r=1.5 + rand()*5.4;
    dots += circle(x.toFixed(1), y.toFixed(1), r.toFixed(1), colour.patch, 'opacity="' + (.47+rand()*.42).toFixed(2) + '"');
  }
  // Eye and broad cheek patch are deliberate artistic exaggerations of the reference photo.
  const irisR = eye*.65;
  svg.innerHTML = [
    '<defs><clipPath id="' + id + '"><path d="' + path + '"/></clipPath></defs>',
    '<g opacity=".76" fill="none" stroke="#dcf8ff" stroke-width="3">',
       '<circle cx="162" cy="185" r="8"/><circle cx="190" cy="148" r="14"/><circle cx="724" cy="184" r="7"/>',
       '<path d="M 108 232 q 7 -9 14 0 M 130 213 q 7 -9 14 0"/>',
    '</g>',
    '<g stroke="' + colour.ink + '" stroke-width="3" stroke-linejoin="round">',
      '<path d="M 233 345 Q 172 294 112 300 Q 153 360 122 424 Q 204 420 233 385 Z" fill="' + colour.fin + '"/>',
      '<path d="M 199 358 L 129 314 M 200 369 L 132 351 M 199 378 L 134 396" fill="none" stroke="#ffffff" opacity=".62"/>',
      spineShapes,
      '<path d="' + path + '" fill="' + colour.body + '" stroke-width="5"/>',
    '</g>',
    '<g clip-path="url(#' + id + ')">',
      '<path d="M 210 402 Q 345 436 460 409 Q 585 394 684 316 L 703 460 L 200 490 Z" fill="' + colour.shade + '" opacity=".66"/>',
      '<path d="M 488 257 C 500 225 546 216 579 234 C 610 251 635 288 625 322 Q 615 365 562 385 Q 506 367 515 327 Z" fill="' + colour.patch + '"/>',
      '<path d="M 360 329 Q 405 296 433 327 Q 454 369 413 398 Q 369 385 360 329 Z" fill="' + colour.patch + '" opacity=".86"/>',
      '<path d="M 322 264 Q 357 243 382 255 L 370 292 L 340 291 Z" fill="' + colour.patch + '" opacity=".84"/>',
      dots,
    '</g>',
    '<g stroke="' + colour.ink + '" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M 345 340 Q 302 355 281 425 Q 319 451 359 423 Q 395 385 345 340 Z" fill="' + colour.fin + '" stroke-width="4"/>',
      '<path d="M 343 352 Q 330 389 297 421 M 349 363 Q 344 401 320 432 M 357 370 Q 363 403 341 426" fill="none" stroke="#fffbe6" stroke-width="3" opacity=".8"/>',
      circle(567,283,eye+7,colour.ink),
      circle(567,283,eye+1,"#fff9e7"),
      circle(570,285,irisR,"#90b5b9", 'stroke="' + colour.ink + '" stroke-width="3"'),
      circle(577,288,irisR*.72,"#0e1826"),
      circle(559,270,Math.max(5,eye*.24),"#ffffff"),
      circle(589,305,Math.max(2.5,eye*.08),"#ffffff", 'opacity=".65"'),
      '<path d="M 685 279 Q 711 274 705 289 L 683 299 Z" fill="' + colour.patch + '" stroke-width="3"/>',
      '<path d="M 681 309 Q 690 314 697 312" fill="none" stroke-width="3"/>',
      '<path d="M 247 293 Q 271 279 291 279" fill="none" stroke-width="4" opacity=".28"/>',
    '</g>',
    '<g fill="none" stroke="#ffda73" stroke-linecap="round" stroke-width="7">',
      '<path d="M 725 233 l 25 -26"/><path d="M 740 256 l 33 -12"/><path d="M 732 280 l 38 6"/>',
    '</g>'
  ].join("");
}
function renderAll() {
  drawFish(document.getElementById("puffer-hero-svg"), defaults);
  drawFish(document.getElementById("puffer-lab-svg"), current);
  const storyPresets = {
    silhouette: { ...defaults, boxiness: 82, eye: 32, spots: 0 },
    eye: { ...defaults, boxiness: 74, eye: 100, spots: 12 },
    pattern: { ...defaults, boxiness: 64, eye: 72, spots: 94 }
  };
  drawFish(document.getElementById("puffer-story-svg"), storyPresets[scene]);
}
function syncControlValues() {
  const ids = { boxiness:"fish-boxiness", eye:"fish-eye", spots:"fish-spots" };
  Object.entries(ids).forEach(([key,id]) => {
    const input = document.getElementById(id);
    if (input) input.value = current[key];
    const output = document.getElementById(key + "-value");
    if (output) output.textContent = current[key] + "%";
  });
  const select = document.getElementById("puffer-preset");
  if (select) select.value = current.palette;
  document.getElementById("puffer-seed-label").textContent = "SEED " + current.seed;
}
function updateLab(message) {
  syncControlValues();
  drawFish(document.getElementById("puffer-lab-svg"), current);
  document.getElementById("puffer-status").textContent = message;
}
function initControls() {
  ["boxiness","eye","spots"].forEach(key => {
    document.getElementById("fish-" + key).addEventListener("input", e => {
      current[key] = Number(e.target.value);
      updateLab("One slider. One new personality.");
    });
  });
  document.getElementById("puffer-preset").addEventListener("change", e => {
    if (data.palettes[e.target.value]) current.palette = e.target.value;
    updateLab("Same fish. A completely different mood.");
  });
  document.getElementById("puffer-randomize").addEventListener("click", () => {
    const newSeed = Math.floor(Math.random() * 999999) + 1;
    const rand = randomFromSeed(newSeed);
    const choices = Object.keys(data.palettes);
    current = {
      boxiness: Math.round(24 + rand()*76),
      eye: Math.round(28 + rand()*72),
      spots: Math.round(rand()*100),
      seed: newSeed,
      palette: choices[Math.floor(rand()*choices.length)]
    };
    updateLab("Meet fish #" + current.seed + ". Its expression was not negotiated.");
  });
  document.getElementById("puffer-reset").addEventListener("click", () => {
    current = { ...defaults };
    updateLab("Back to the original-inspired fish. Boxiness restored.");
  });
}
function initStoryScroll() {
  const scenes = {
    silhouette: ["02 / SILHOUETTE","START WITH A SHAPE."],
    eye: ["03 / EXPRESSION","ONE VERY LARGE EYE."],
    pattern: ["04 / VARIATION","LET RANDOMNESS IN."]
  };
  const steps = [...document.querySelectorAll(".puffer-step")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const next = visible[0].target.dataset.scene;
      if (next !== scene) {
        scene = next;
        drawFish(document.getElementById("puffer-story-svg"), {
          ...defaults,
          ...(scene === "silhouette" ? { boxiness:82, eye:32, spots:0 } :
              scene === "eye" ? { boxiness:74, eye:100, spots:12 } : { boxiness:64, eye:72, spots:94 })
        });
        document.getElementById("puffer-scene-count").textContent = scenes[scene][0];
        document.getElementById("puffer-scene-title").textContent = scenes[scene][1];
      }
    }, { rootMargin:"-12% 0px -12% 0px", threshold:[0,.25,.5,.75,1] });
    steps.forEach(step => observer.observe(step));
  }
  let pending = false;
  window.addEventListener("scroll", () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(window.scrollY / max * 100, 0, 100) : 0;
      document.getElementById("puffer-progress-fill").style.width = progress + "%";
      pending = false;
    });
  }, { passive:true });
}
function renderGallery() {
  const figures = [...document.querySelectorAll(".puffer-mini-fish")];
  data.gallery.slice(0, figures.length).forEach((item,index) => {
    drawFish(figures[index].querySelector("svg"), item);
    figures[index].querySelector("strong").textContent = item.label;
    figures[index].querySelector("svg").setAttribute("aria-label", item.label + " porcupinefish illustration");
  });
}
async function init() {
  try {
    const url = new URL("./fish-presets.json", import.meta.url);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Presets unavailable");
    const loaded = await response.json();
    if (!loaded.palettes || !Array.isArray(loaded.gallery)) throw new Error("Unexpected preset format");
    data = loaded;
  } catch (error) {
    console.warn("Puffer Lab: using built-in palette fallback", error);
  }
  renderAll();
  renderGallery();
  syncControlValues();
  initControls();
  initStoryScroll();
}
init();