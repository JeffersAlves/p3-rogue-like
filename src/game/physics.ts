import type { Rect, Vec2 } from "./types";

export function aabb(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function expand(rect: Rect, pad: number): Rect {
  return {
    x: rect.x - pad,
    y: rect.y - pad,
    w: rect.w + pad * 2,
    h: rect.h + pad * 2,
  };
}

/** Resolve axis-aligned solid collision for a moving body. */
export function resolveSolid(
  body: Rect & { vx: number; vy: number },
  solids: Rect[],
  dt: number,
): { onGround: boolean } {
  let onGround = false;

  body.x += body.vx * dt;
  for (const solid of solids) {
    if (!aabb(body, solid)) continue;
    if (body.vx > 0) body.x = solid.x - body.w;
    else if (body.vx < 0) body.x = solid.x + solid.w;
    body.vx = 0;
  }

  body.y += body.vy * dt;
  for (const solid of solids) {
    if (!aabb(body, solid)) continue;
    if (body.vy > 0) {
      body.y = solid.y - body.h;
      onGround = true;
    } else if (body.vy < 0) {
      body.y = solid.y + solid.h;
    }
    body.vy = 0;
  }

  return { onGround };
}

/**
 * Bounce a bullet off a solid. Returns true if a bounce happened.
 * Prefer the shallowest penetration axis.
 */
export function bounceBullet(
  bullet: Rect & { vx: number; vy: number },
  solid: Rect,
): boolean {
  if (!aabb(bullet, solid)) return false;

  const overlapLeft = bullet.x + bullet.w - solid.x;
  const overlapRight = solid.x + solid.w - bullet.x;
  const overlapTop = bullet.y + bullet.h - solid.y;
  const overlapBottom = solid.y + solid.h - bullet.y;

  const minX = Math.min(overlapLeft, overlapRight);
  const minY = Math.min(overlapTop, overlapBottom);

  if (minX < minY) {
    if (overlapLeft < overlapRight) bullet.x = solid.x - bullet.w;
    else bullet.x = solid.x + solid.w;
    bullet.vx *= -1;
  } else {
    if (overlapTop < overlapBottom) bullet.y = solid.y - bullet.h;
    else bullet.y = solid.y + solid.h;
    bullet.vy *= -1;
  }

  // Nudge out a bit to avoid sticking.
  bullet.x += Math.sign(bullet.vx) * 0.5;
  bullet.y += Math.sign(bullet.vy) * 0.5;
  return true;
}

export function centerOf(rect: Rect): Vec2 {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
