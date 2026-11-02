// DERAILED #16 — Movement engine.
// Positions are in canvas pixels; heading is in radians (0 points right).
// No drawing or DOM code here. This module can later update many fish for Boids.
const TAU = Math.PI * 2;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Shortest signed angle from current heading to the desired one.
export function angleDifference(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function createSwimmer(width, height) {
  return {
    x: width * 0.5,
    y: height * 0.52,
    heading: -0.28,
    speedPx: 0,
    tailPhase: 0,
    time: 0,
    mode: "wander", // "wander" or "follow"
    target: null,    // {x,y}, in pixels, set by the UI
    wanderHeading: -0.28,
    wanderCountdown: 0,
    trail: [],
    trailCountdown: 0
  };
}

export function resizeSwimmer(fish, oldSize, newSize) {
  // Keep location, target and path aligned when the responsive canvas resizes.
  const sx = newSize.width / Math.max(oldSize.width, 1);
  const sy = newSize.height / Math.max(oldSize.height, 1);
  fish.x *= sx;
  fish.y *= sy;
  if (fish.target) {
    fish.target.x *= sx;
    fish.target.y *= sy;
  }
  fish.trail.forEach(point => { point.x *= sx; point.y *= sy; });
}

export function setDestination(fish, x, y, bounds) {
  fish.target = {
    x: clamp(x, 12, bounds.width - 12),
    y: clamp(y, 12, bounds.height - 12)
  };
  fish.mode = "follow";
}

// Pure movement update: destination/curiosity -> heading -> velocity -> position.
// dt is measured in seconds so animation speed doesn't depend on monitor refresh.
export function stepSwimmer(fish, dt, bounds, options) {
  dt = clamp(dt, 0, 0.05);
  if (dt === 0) return;
  const { width, height } = bounds;
  const { length, depth, speed, turnRate } = options;
  fish.time += dt;

  let desiredHeading = fish.heading;
  let arrival = 1;

  if (fish.mode === "follow" && fish.target) {
    const dx = fish.target.x - fish.x;
    const dy = fish.target.y - fish.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 14) {
      desiredHeading = Math.atan2(dy, dx);
      // Slow to a stop at the destination instead of orbiting endlessly.
      arrival = clamp((distance - 14) / 55, 0, 1);
    } else {
      arrival = 0;
    }
  } else {
    // Choose a gently different heading every few seconds, then steer to it.
    fish.wanderCountdown -= dt;
    if (fish.wanderCountdown <= 0) {
      fish.wanderCountdown = 1.4 + Math.random() * 2.0;
      fish.wanderHeading = fish.heading + (Math.random() - 0.5) * 1.5;
    }
    desiredHeading = fish.wanderHeading;
  }

  // Soft tank avoidance: turn away before reaching an edge.
  // The centre isn't a leader or target; it is just a wall avoidance cue.
  const zone = Math.min(Math.min(width, height) * 0.42, Math.max(56, length * 0.68));
  let awayX = 0, awayY = 0;
  if (fish.x < zone) awayX += (zone - fish.x) / zone * 2.5;
  if (fish.x > width - zone) awayX -= (fish.x - (width - zone)) / zone * 2.5;
  if (fish.y < zone) awayY += (zone - fish.y) / zone * 2.5;
  if (fish.y > height - zone) awayY -= (fish.y - (height - zone)) / zone * 2.5;
  if (awayX !== 0 || awayY !== 0) {
    const dx = Math.cos(desiredHeading) + awayX;
    const dy = Math.sin(desiredHeading) + awayY;
    desiredHeading = Math.atan2(dy, dx);
  }

  // Turn-rate limit creates arcs rather than instantaneous changes of direction.
  if (arrival > 0) {
    const maxTurn = turnRate * dt;
    fish.heading += clamp(angleDifference(fish.heading, desiredHeading), -maxTurn, maxTurn);
    fish.heading = Math.atan2(Math.sin(fish.heading), Math.cos(fish.heading));
  }

  fish.speedPx = 65 * speed * arrival; // pixels per second
  fish.x += Math.cos(fish.heading) * fish.speedPx * dt;
  fish.y += Math.sin(fish.heading) * fish.speedPx * dt;

  // Final safety constraint. Most turns happen earlier, inside the soft zone.
  // Approximate oriented fish footprint so it stays visible while turning.
  const halfX = Math.min(width * 0.49, length * 0.66 * Math.abs(Math.cos(fish.heading)) + depth * 0.9 * Math.abs(Math.sin(fish.heading)) + 8);
  const halfY = Math.min(height * 0.49, length * 0.66 * Math.abs(Math.sin(fish.heading)) + depth * 0.9 * Math.abs(Math.cos(fish.heading)) + 8);
  fish.x = clamp(fish.x, halfX, width - halfX);
  fish.y = clamp(fish.y, halfY, height - halfY);

  // Tail animation is connected to propulsion, not responsible for movement.
  fish.tailPhase = (fish.tailPhase + dt * (2.5 + 2.4 * speed * arrival)) % TAU;

  fish.trailCountdown -= dt;
  if (fish.trailCountdown <= 0 && fish.speedPx > 0.5) {
    fish.trail.push({ x: fish.x, y: fish.y });
    if (fish.trail.length > 110) fish.trail.shift();
    fish.trailCountdown = 0.065;
  }
}
