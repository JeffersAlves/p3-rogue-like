import { describe, expect, it } from "vitest";
import { BattleService } from "./battleService";

describe("BattleService", () => {
  it("creates a stronger enemy for later floors", () => {
    const enemy = BattleService.createEnemy(30);
    expect(enemy.hp).toBeGreaterThan(BattleService.createEnemy(10).hp);
  });

  it("does not let a basic attack instantly defeat the enemy", () => {
    const player = {
      name: "Makoto",
      level: 1,
      stats: { strength: 3, magic: 2, endurance: 2, agility: 2, luck: 1 },
      hp: 100,
      sp: 40,
      gold: 0,
      personas: [],
      equippedPersonaId: null,
      inventory: [],
    };
    const persona = {
      id: "p1",
      name: "Arsene",
      level: 1,
      experience: 0,
      stats: { strength: 2, magic: 1, endurance: 2, agility: 2, luck: 1 },
      hp: 70,
      sp: 35,
      skills: [],
      resistances: [],
      arcana: "Fool",
    };
    const enemy = BattleService.createEnemy(1);
    const result = BattleService.resolveTurn(player, persona, enemy, "attack");

    expect(result.victory).toBe(false);
    expect(result.enemyHp).toBeGreaterThan(0);
  });

  it("does not mark guarding as a victory", () => {
    const player = {
      name: "Makoto",
      level: 1,
      stats: { strength: 3, magic: 2, endurance: 2, agility: 2, luck: 1 },
      hp: 100,
      sp: 40,
      gold: 0,
      personas: [],
      equippedPersonaId: null,
      inventory: [],
    };
    const persona = {
      id: "p1",
      name: "Arsene",
      level: 1,
      experience: 0,
      stats: { strength: 2, magic: 1, endurance: 2, agility: 2, luck: 1 },
      hp: 70,
      sp: 35,
      skills: [],
      resistances: [],
      arcana: "Fool",
    };
    const enemy = BattleService.createEnemy(1);
    const result = BattleService.resolveTurn(player, persona, enemy, "guard");

    expect(result.victory).toBe(false);
    expect(result.playerHp).toBeLessThanOrEqual(100);
  });

  it("keeps the battle active after a normal turn", () => {
    const player = {
      name: "Makoto",
      level: 1,
      stats: { strength: 3, magic: 2, endurance: 2, agility: 2, luck: 1 },
      hp: 100,
      sp: 40,
      gold: 0,
      personas: [],
      equippedPersonaId: null,
      inventory: [],
    };
    const persona = {
      id: "p1",
      name: "Arsene",
      level: 1,
      experience: 0,
      stats: { strength: 2, magic: 1, endurance: 2, agility: 2, luck: 1 },
      hp: 70,
      sp: 35,
      skills: [],
      resistances: [],
      arcana: "Fool",
    };
    const enemy = BattleService.createEnemy(1);
    const result = BattleService.resolveTurn(player, persona, enemy, "attack");

    expect(result.completed).toBe(false);
    expect(result.victory).toBe(false);
  });
});
