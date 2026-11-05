// DERAILED #16 — a school is an array of independent swimmers.
// Boids is a simplified *model*, not a claim that real sardines follow these exact rules.
import { createSwimmer, resizeSwimmer, stepSwimmer } from "./motion.js";

const TAU = 2 * Math.PI;
const MAX_FISH = 120;
const minMax = (x, min, max) => Math.max(min, Math.min(max, x));

function spawnFish(width, height, index) {
  const fish = createSwimmer(width, height);
  const angle = Math.random() * TAU;
  const radius = Math.sqrt(Math.random()) * Math.min(width * .30, height * .36);
  fish.x = width * .5 + Math.cos(angle) * radius;
  fish.y = height * .5 + Math.sin(angle) * radius;
  fish.heading = Math.random() * TAU - Math.PI;
  fish.wanderHeading = fish.heading;
  fish.wanderCountdown = Math.random() * 2;
  fish.tailPhase = Math.random() * TAU;
  fish.sizeJitter = .8 + Math.random() * .4;
  fish.speedJitter = .83 + Math.random() * .34;
  fish.facing = Math.cos(fish.heading) < 0 ? -1 : 1;
  fish.index = index;
  return fish;
}

export function createSchool(count, bounds) {
  return Array.from({ length: minMax(Math.round(count), 1, MAX_FISH) }, (_, i) =>
    spawnFish(bounds.width, bounds.height, i));
}

export function setSchoolCount(fish, count, bounds) {
  const wanted = minMax(Math.round(count), 1, MAX_FISH);
  if (fish.length > wanted) fish.length = wanted;
  while (fish.length < wanted) fish.push(spawnFish(bounds.width, bounds.height, fish.length));
}

export function resizeSchool(fish, oldBounds, newBounds) {
  fish.forEach(swimmer => resizeSwimmer(swimmer, oldBounds, newBounds));
}

// Compute ALL headings first, using positions from the same simulation instant.
// This avoids updating fish #1 before fish #2 gets to inspect its neighbours.
export function schoolHeadings(fish, settings) {
  const output = new Array(fish.length).fill(null);
  if (!settings.schooling || fish.length < 2) return output;
  // With every rule at zero there is no social steering: revert to free wandering.
  if (settings.separation === 0 && settings.alignment === 0 && settings.cohesion === 0) return output;

  const distance = Math.max(30, settings.neighbourRadius);
  const radiusSq = distance * distance;
  const personal = Math.max(12, settings.personalSpace);
  const personalSq = personal * personal;

  for (let i = 0; i < fish.length; i++) {
    const me = fish[i];
    let n = 0, ax = 0, ay = 0, cx = 0, cy = 0, sx = 0, sy = 0;
    for (let j = 0; j < fish.length; j++) {
      if (i === j) continue;
      const other = fish[j];
      const dx = other.x - me.x, dy = other.y - me.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > radiusSq) continue;
      // Separation is strongest very close to another fish.
      if (d2 < personalSq) {
        const distance = Math.max(Math.sqrt(d2), 1);
        const urgency = (personal - distance) / personal;
        sx -= dx / distance * urgency;
        sy -= dy / distance * urgency;
      }
      n++;
      ax += Math.cos(other.heading);
      ay += Math.sin(other.heading);
      cx += dx;
      cy += dy;
    }
    if (n === 0) continue;
    const unit = (x, y) => {
      const m = Math.hypot(x, y);
      return m > .000001 ? [x / m, y / m] : [0, 0];
    };
    const [sepx, sepy] = unit(sx, sy);
    const [alignx, aligny] = unit(ax / n, ay / n);
    const [cohx, cohy] = unit(cx / n, cy / n);

    // Preserve some of the individual swimmer's direction. There is NO leader.
    let vx = Math.cos(me.heading) * .3, vy = Math.sin(me.heading) * .3;
    vx += settings.separation * sepx * 2.8;
    vy += settings.separation * sepy * 2.8;
    vx += settings.alignment * alignx * 1.25;
    vy += settings.alignment * aligny * 1.25;
    vx += settings.cohesion * cohx * .75;
    vy += settings.cohesion * cohy * .75;

    // Optional destination is an environmental cue for everyone, not a leader fish.
    if (settings.mode === "follow" && settings.target) {
      const [tx, ty] = unit(settings.target.x - me.x, settings.target.y - me.y);
      vx += tx * .75; vy += ty * .75;
    }
    if (Math.hypot(vx, vy) > .000001) output[i] = Math.atan2(vy, vx);
  }
  return output;
}

export function stepSchool(fish, dt, bounds, settings) {
  const headings = schoolHeadings(fish, settings);
  for (let i = 0; i < fish.length; i++) {
    const swimmer = fish[i];
    const size = settings.scale * swimmer.sizeJitter;
    swimmer.mode = settings.mode;
    swimmer.target = settings.mode === "follow" ? settings.target : null;
    stepSwimmer(swimmer, dt, bounds, {
      length: settings.length * size,
      depth: settings.depth * size,
      speed: settings.speed * swimmer.speedJitter,
      turnRate: settings.turnRate,
      recordTrail: i === settings.trackedIndex
    }, headings[i]);
  }
}
