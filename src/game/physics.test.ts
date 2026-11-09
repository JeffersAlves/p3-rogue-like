import { describe, expect, it } from "vitest";
import { aabb, bounceBullet } from "./physics";

describe("physics", () => {
  it("detects overlapping rectangles", () => {
    expect(aabb({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(
      true,
    );
    expect(
      aabb({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 10, h: 10 }),
    ).toBe(false);
  });

  it("ricochets horizontally off a wall", () => {
    const bullet = { x: 90, y: 40, w: 8, h: 8, vx: 100, vy: 0 };
    const wall = { x: 95, y: 0, w: 20, h: 100 };
    expect(bounceBullet(bullet, wall)).toBe(true);
    expect(bullet.vx).toBeLessThan(0);
  });

  it("ricochets vertically off a floor", () => {
    const bullet = { x: 40, y: 90, w: 8, h: 8, vx: 0, vy: 100 };
    const floor = { x: 0, y: 95, w: 200, h: 20 };
    expect(bounceBullet(bullet, floor)).toBe(true);
    expect(bullet.vy).toBeLessThan(0);
  });
});
