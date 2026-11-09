import { describe, expect, it } from "vitest";
import { createInputState, type InputState } from "./input";
import { GameEngine } from "./GameEngine";

function idle(): InputState {
  return createInputState();
}

describe("GameEngine", () => {
  it("starts a fresh run with ammo and living player", () => {
    const engine = new GameEngine();
    const snap = engine.snapshot();
    expect(snap.phase).toBe("playing");
    expect(snap.player.alive).toBe(true);
    expect(snap.player.ammo).toBeGreaterThan(0);
    expect(snap.enemies.length).toBeGreaterThan(0);
  });

  it("bullets ricochet instead of vanishing on platforms", () => {
    const engine = new GameEngine();
    engine.bullets = [
      {
        id: "b1",
        x: 100,
        y: 490,
        w: 8,
        h: 8,
        vx: 0,
        vy: 400,
        damage: 10,
        owner: "player",
        life: 3,
        piercing: false,
        stopOnEnemy: false,
        fireTrail: false,
        hitIds: new Set(),
        lastTrailAt: 0,
      },
    ];
    engine.update(1 / 60, idle());
    expect(engine.bullets.length).toBe(1);
    expect(engine.bullets[0].vy).toBeLessThan(0);
  });

  it("turns killed enemies into corpse solids for bullets", () => {
    const engine = new GameEngine();
    const enemy = engine.enemies[0];
    enemy.hp = 1;
    engine.bullets = [
      {
        id: "b2",
        x: enemy.x,
        y: enemy.y,
        w: 8,
        h: 8,
        vx: 200,
        vy: 0,
        damage: 50,
        owner: "player",
        life: 3,
        piercing: false,
        stopOnEnemy: false,
        fireTrail: false,
        hitIds: new Set(),
        lastTrailAt: 0,
      },
    ];
    engine.update(1 / 60, idle());
    expect(enemy.corpse || enemy.dead).toBe(true);

    engine.bullets = [
      {
        id: "b3",
        x: enemy.x - 6,
        y: enemy.y + 4,
        w: 8,
        h: 8,
        vx: 300,
        vy: 0,
        damage: 10,
        owner: "player",
        life: 3,
        piercing: false,
        stopOnEnemy: false,
        fireTrail: false,
        hitIds: new Set(),
        lastTrailAt: 0,
      },
    ];
    const beforeVx = engine.bullets[0].vx;
    engine.update(1 / 60, idle());
    expect(engine.bullets.length).toBe(1);
    expect(engine.bullets[0].vx).toBe(-beforeVx);
  });

  it("wipes the run on death and restarts from zero", () => {
    const engine = new GameEngine();
    engine.upgrades = ["magazine", "fireTrail"];
    engine.player.hp = 1;
    engine.player.invuln = 0;
    engine.bullets = [
      {
        id: "ff",
        x: engine.player.x,
        y: engine.player.y,
        w: 8,
        h: 8,
        vx: 0,
        vy: 0,
        damage: 80,
        owner: "enemy",
        life: 1,
        piercing: false,
        stopOnEnemy: false,
        fireTrail: false,
        hitIds: new Set(),
        lastTrailAt: 0,
      },
    ];
    engine.update(1 / 60, idle());
    expect(engine.phase).toBe("dead");

    const input = idle();
    input.restartPressed = true;
    engine.update(1 / 60, input);
    expect(engine.phase).toBe("playing");
    expect(engine.upgrades).toEqual([]);
    expect(engine.roomIndex).toBe(0);
  });
});
