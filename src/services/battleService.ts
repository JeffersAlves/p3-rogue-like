import type { Persona, PlayerState } from "../types/game";

export type BattleAction =
  | "attack"
  | "guard"
  | "skill"
  | "item"
  | "escape"
  | "persona";

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  strength: number;
  magic: number;
  endurance: number;
  agility: number;
  luck: number;
}

export interface BattleTurnResult {
  playerHp: number;
  enemyHp: number;
  playerSp: number;
  log: string[];
  completed: boolean;
  victory: boolean;
  escapeSuccess: boolean;
  usedItem: boolean;
}

export class BattleService {
  static createEnemy(floor: number): Enemy {
    const level = Math.max(1, Math.floor(floor / 10) + 1);
    return {
      id: `enemy-${floor}`,
      name: `Shadow ${level}`,
      hp: 20 + floor * 4,
      strength: 2 + level,
      magic: 1 + level,
      endurance: 2 + level,
      agility: 2 + level,
      luck: 1,
    };
  }

  static calculateCombatStats(player: PlayerState, persona: Persona) {
    return {
      strength: player.stats.strength + persona.stats.strength,
      magic: player.stats.magic + persona.stats.magic,
      endurance: player.stats.endurance + persona.stats.endurance,
      agility: player.stats.agility + persona.stats.agility,
      luck: player.stats.luck + persona.stats.luck,
    };
  }

  static resolveTurn(
    player: PlayerState,
    persona: Persona,
    enemy: Enemy,
    action: BattleAction,
    previousAction?: BattleAction,
  ): BattleTurnResult {
    const stats = this.calculateCombatStats(player, persona);
    const log: string[] = [];
    let playerHp = player.hp;
    let playerSp = persona.sp;
    let enemyHp = enemy.hp;
    let usedItem = false;
    let escapeSuccess = false;

    if (action === "guard") {
      log.push(`${player.name} guards.`);
      const incoming = Math.max(1, enemy.strength - stats.endurance);
      const damage = Math.round(incoming * 0.1);
      playerHp = Math.max(0, playerHp - damage);
      log.push(`The enemy strikes for ${damage} damage.`);
      return {
        playerHp,
        enemyHp,
        playerSp,
        log,
        completed: playerHp <= 0,
        victory: false,
        escapeSuccess,
        usedItem,
      };
    }

    if (action === "escape") {
      escapeSuccess = Math.random() < 0.9;
      log.push(`${player.name} attempts to escape.`);
      return {
        playerHp,
        enemyHp,
        playerSp,
        log,
        completed: true,
        victory: false,
        escapeSuccess,
        usedItem,
      };
    }

    if (action === "item") {
      usedItem = true;
      log.push(`${player.name} opens the item bag.`);
      return {
        playerHp,
        enemyHp,
        playerSp,
        log,
        completed: false,
        victory: false,
        escapeSuccess,
        usedItem,
      };
    }

    if (action === "persona") {
      log.push(`${player.name} switches to ${persona.name}.`);
      return {
        playerHp,
        enemyHp,
        playerSp,
        log,
        completed: false,
        victory: false,
        escapeSuccess,
        usedItem,
      };
    }

    if (action === "skill") {
      const skillName = persona.skills[0] ?? "Skill";
      const skillCost = 5;
      if (playerSp < skillCost) {
        log.push(`${persona.name} does not have enough MP.`);
        return {
          playerHp,
          enemyHp,
          playerSp,
          log,
          completed: false,
          victory: false,
          escapeSuccess,
          usedItem,
        };
      }

      playerSp = Math.max(0, playerSp - skillCost);
      const skillDamage = Math.max(6, stats.magic + 4);
      enemyHp = Math.max(0, enemyHp - skillDamage);
      log.push(
        `${persona.name} uses ${skillName} for ${skillDamage} damage (-${skillCost} MP).`,
      );

      if (enemyHp <= 0) {
        return {
          playerHp,
          enemyHp,
          playerSp,
          log: [...log, "Victory!"],
          completed: true,
          victory: true,
          escapeSuccess,
          usedItem,
        };
      }

      const enemyDamage = Math.max(
        2,
        enemy.strength + 2 - Math.floor(stats.endurance / 2),
      );
      playerHp = Math.max(0, playerHp - enemyDamage);
      log.push(`The enemy retaliates for ${enemyDamage} damage.`);

      return {
        playerHp,
        enemyHp,
        playerSp,
        log,
        completed: playerHp <= 0,
        victory: false,
        escapeSuccess,
        usedItem,
      };
    }

    const weaponDamage = Math.max(4, stats.strength + 2);
    let damage = weaponDamage;

    if (previousAction === "item") {
      damage = Math.round(damage * 0.5);
      log.push("The item buffed the next attack.");
    }

    enemyHp = Math.max(0, enemyHp - damage);
    log.push(`${player.name} attacks for ${damage} damage.`);

    if (enemyHp <= 0) {
      return {
        playerHp,
        enemyHp,
        playerSp,
        log: [...log, "Victory!"],
        completed: true,
        victory: true,
        escapeSuccess,
        usedItem,
      };
    }

    const enemyDamage = Math.max(
      2,
      enemy.strength + 2 - Math.floor(stats.endurance / 2),
    );
    playerHp = Math.max(0, playerHp - enemyDamage);
    log.push(`The enemy retaliates for ${enemyDamage} damage.`);

    return {
      playerHp,
      enemyHp,
      playerSp,
      log,
      completed: playerHp <= 0,
      victory: false,
      escapeSuccess,
      usedItem,
    };
  }
}
