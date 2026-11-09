import type { UpgradeId } from "./types";

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GRAVITY = 2200;
export const PLAYER_SPEED = 280;
export const PLAYER_JUMP = 620;
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 40;
export const PLAYER_MAX_HP = 100;

export const BULLET_SIZE = 8;
export const BULLET_SPEED = 520;
export const BULLET_DAMAGE = 25;
export const BULLET_LIFE = 4.5;
export const BASE_MAGAZINE = 6;
export const RELOAD_TIME = 1.1;
export const SHOOT_COOLDOWN = 0.22;

export const ENEMY_WIDTH = 30;
export const ENEMY_HEIGHT = 36;
export const ENEMY_SPEED = 70;
export const ENEMY_HP = 50;
export const ENEMY_SHOOT_COOLDOWN = 1.6;
export const ENEMY_BULLET_SPEED = 340;

export const FIRE_ZONE_TTL = 2.8;
export const FIRE_ZONE_SIZE = 18;
export const FIRE_DPS = 18;
export const BURN_TTL = 1.6;

export const INVULN_TIME = 0.55;

export const UPGRADE_INFO: Record<
  UpgradeId,
  { name: string; description: string }
> = {
  magazine: {
    name: "Extended Mag",
    description: "+4 magazine capacity",
  },
  piercing: {
    name: "Piercing Rounds",
    description: "Bullets pass through living enemies (still damage)",
  },
  stopOnEnemy: {
    name: "Hollow Points",
    description: "Bullets stop on living enemies instead of ricocheting",
  },
  fireTrail: {
    name: "Incendiary",
    description: "Bullets leave burning ground on contact",
  },
};
