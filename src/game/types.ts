export type UpgradeId =
  | "magazine"
  | "piercing"
  | "stopOnEnemy"
  | "fireTrail";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Platform extends Rect {
  id: string;
}

export interface BurningZone extends Rect {
  id: string;
  ttl: number;
  damagePerSecond: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  damage: number;
  owner: "player" | "enemy";
  life: number;
  piercing: boolean;
  stopOnEnemy: boolean;
  fireTrail: boolean;
  hitIds: Set<string>;
  lastTrailAt: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  dead: boolean;
  corpse: boolean;
  patrolLeft: number;
  patrolRight: number;
  facing: 1 | -1;
  shootCooldown: number;
  burnTtl: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  ammo: number;
  magazineSize: number;
  reloadTimer: number;
  shootCooldown: number;
  invuln: number;
  burnTtl: number;
  alive: boolean;
}

export interface Pickup {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  upgrade: UpgradeId;
}

export interface Door {
  x: number;
  y: number;
  w: number;
  h: number;
  open: boolean;
}

export interface RoomDef {
  id: string;
  name: string;
  width: number;
  height: number;
  platforms: Platform[];
  spawn: Vec2;
  enemies: Array<{
    x: number;
    y: number;
    patrolLeft: number;
    patrolRight: number;
    hp?: number;
  }>;
  upgrade?: UpgradeId;
  isExit?: boolean;
}

export type RunPhase = "playing" | "upgrade" | "cleared" | "dead";

export interface GameSnapshot {
  phase: RunPhase;
  roomIndex: number;
  roomName: string;
  roomCount: number;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  platforms: Platform[];
  burnZones: BurningZone[];
  pickups: Pickup[];
  door: Door | null;
  upgrades: UpgradeId[];
  offeredUpgrade: UpgradeId | null;
  message: string;
  killCount: number;
  time: number;
}
