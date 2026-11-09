import {
  BASE_MAGAZINE,
  BULLET_DAMAGE,
  BULLET_LIFE,
  BULLET_SIZE,
  BULLET_SPEED,
  BURN_TTL,
  ENEMY_BULLET_SPEED,
  ENEMY_HEIGHT,
  ENEMY_HP,
  ENEMY_SHOOT_COOLDOWN,
  ENEMY_SPEED,
  ENEMY_WIDTH,
  FIRE_DPS,
  FIRE_ZONE_SIZE,
  FIRE_ZONE_TTL,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  INVULN_TIME,
  PLAYER_HEIGHT,
  PLAYER_JUMP,
  PLAYER_MAX_HP,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  RELOAD_TIME,
  SHOOT_COOLDOWN,
} from "./constants";
import { ROOMS } from "./levels";
import { aabb, bounceBullet, clamp, resolveSolid } from "./physics";
import type {
  Bullet,
  BurningZone,
  Door,
  Enemy,
  GameSnapshot,
  Pickup,
  Platform,
  Player,
  RunPhase,
  UpgradeId,
} from "./types";

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  shoot: boolean;
  shootPressed: boolean;
  confirm: boolean;
  confirmPressed: boolean;
  restart: boolean;
  restartPressed: boolean;
}

let nextId = 1;
function uid(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

export class GameEngine {
  phase: RunPhase = "playing";
  roomIndex = 0;
  player!: Player;
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  platforms: Platform[] = [];
  burnZones: BurningZone[] = [];
  pickups: Pickup[] = [];
  door: Door | null = null;
  upgrades: UpgradeId[] = [];
  offeredUpgrade: UpgradeId | null = null;
  message = "";
  killCount = 0;
  time = 0;
  private pendingUpgrade: UpgradeId | null = null;
  private roomCleared = false;

  constructor() {
    this.startRun();
  }

  startRun(): void {
    this.phase = "playing";
    this.roomIndex = 0;
    this.upgrades = [];
    this.offeredUpgrade = null;
    this.pendingUpgrade = null;
    this.killCount = 0;
    this.time = 0;
    this.bullets = [];
    this.burnZones = [];
    this.message = "WASD/Arrows move · Space jump · J/Click shoot";
    this.player = this.createPlayer(64, 420);
    this.loadRoom(0);
  }

  private createPlayer(x: number, y: number): Player {
    const mag = BASE_MAGAZINE + this.magazineBonus();
    return {
      x,
      y,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      ammo: mag,
      magazineSize: mag,
      reloadTimer: 0,
      shootCooldown: 0,
      invuln: 0,
      burnTtl: 0,
      alive: true,
    };
  }

  private magazineBonus(): number {
    return this.upgrades.filter((u) => u === "magazine").length * 4;
  }

  private hasUpgrade(id: UpgradeId): boolean {
    return this.upgrades.includes(id);
  }

  private loadRoom(index: number): void {
    const room = ROOMS[index];
    this.roomIndex = index;
    this.platforms = room.platforms.map((p) => ({ ...p }));
    this.enemies = room.enemies.map((e) => ({
      id: uid("enemy"),
      x: e.x,
      y: e.y,
      w: ENEMY_WIDTH,
      h: ENEMY_HEIGHT,
      vx: ENEMY_SPEED,
      vy: 0,
      hp: e.hp ?? ENEMY_HP,
      maxHp: e.hp ?? ENEMY_HP,
      dead: false,
      corpse: false,
      patrolLeft: e.patrolLeft,
      patrolRight: e.patrolRight,
      facing: 1 as const,
      shootCooldown: 0.4 + Math.random() * 0.8,
      burnTtl: 0,
    }));
    this.bullets = [];
    this.burnZones = [];
    this.pickups = [];
    this.pendingUpgrade = room.upgrade ?? null;
    this.offeredUpgrade = null;
    this.roomCleared = false;
    this.door = {
      x: GAME_WIDTH - 70,
      y: GAME_HEIGHT - 24 - 72,
      w: 36,
      h: 72,
      open: false,
    };
    this.player.x = room.spawn.x;
    this.player.y = room.spawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invuln = 0.4;
    this.message = `${room.name} — clear the room`;
    this.phase = "playing";
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      roomIndex: this.roomIndex,
      roomName: ROOMS[this.roomIndex]?.name ?? "",
      roomCount: ROOMS.length,
      player: { ...this.player },
      enemies: this.enemies.map((e) => ({ ...e })),
      bullets: this.bullets.map((b) => ({
        ...b,
        hitIds: new Set(b.hitIds),
      })),
      platforms: this.platforms.map((p) => ({ ...p })),
      burnZones: this.burnZones.map((z) => ({ ...z })),
      pickups: this.pickups.map((p) => ({ ...p })),
      door: this.door ? { ...this.door } : null,
      upgrades: [...this.upgrades],
      offeredUpgrade: this.offeredUpgrade,
      message: this.message,
      killCount: this.killCount,
      time: this.time,
    };
  }

  update(dt: number, input: InputState): void {
    const step = Math.min(dt, 1 / 30);
    this.time += step;

    if (input.restartPressed) {
      this.startRun();
      return;
    }

    if (this.phase === "dead" || this.phase === "cleared") {
      if (input.confirmPressed || input.restartPressed) this.startRun();
      return;
    }

    if (this.phase === "upgrade") {
      if (input.confirmPressed && this.offeredUpgrade) {
        this.applyUpgrade(this.offeredUpgrade);
        this.offeredUpgrade = null;
        this.advanceOrFinish();
      }
      return;
    }

    this.updatePlayer(step, input);
    this.updateEnemies(step);
    this.updateBullets(step);
    this.updateBurnZones(step);
    this.updatePickups();
    this.checkRoomClear();
    this.checkDoor(input);
  }

  private applyUpgrade(id: UpgradeId): void {
    this.upgrades.push(id);
    if (id === "magazine") {
      this.player.magazineSize = BASE_MAGAZINE + this.magazineBonus();
      this.player.ammo = this.player.magazineSize;
    }
    this.message = `Upgrade acquired: ${id}`;
  }

  private advanceOrFinish(): void {
    const room = ROOMS[this.roomIndex];
    if (room.isExit || this.roomIndex >= ROOMS.length - 1) {
      this.phase = "cleared";
      this.message = "Run cleared! Press Enter / R to restart from zero.";
      return;
    }
    this.loadRoom(this.roomIndex + 1);
  }

  private solids(): Platform[] {
    const corpses = this.enemies
      .filter((e) => e.corpse)
      .map((e) => ({
        id: `corpse-${e.id}`,
        x: e.x,
        y: e.y,
        w: e.w,
        h: e.h,
      }));
    return [...this.platforms, ...corpses];
  }

  private updatePlayer(dt: number, input: InputState): void {
    const p = this.player;
    if (!p.alive) return;

    p.shootCooldown = Math.max(0, p.shootCooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);

    if (p.reloadTimer > 0) {
      p.reloadTimer -= dt;
      if (p.reloadTimer <= 0) {
        p.ammo = p.magazineSize;
        p.reloadTimer = 0;
      }
    }

    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;
    p.vx = move * PLAYER_SPEED;
    if (move !== 0) p.facing = move > 0 ? 1 : -1;

    if (input.jumpPressed && p.onGround) {
      p.vy = -PLAYER_JUMP;
      p.onGround = false;
    }

    p.vy += GRAVITY * dt;
    const { onGround } = resolveSolid(p, this.solids(), dt);
    p.onGround = onGround;
    p.x = clamp(p.x, 24, GAME_WIDTH - 24 - p.w);
    p.y = clamp(p.y, 24, GAME_HEIGHT - p.h);

    if ((input.shootPressed || input.shoot) && p.shootCooldown <= 0) {
      this.tryShootPlayer();
    }

    if (p.burnTtl > 0) {
      p.burnTtl -= dt;
      this.damagePlayer(FIRE_DPS * dt, false);
    }
  }

  private tryShootPlayer(): void {
    const p = this.player;
    if (p.reloadTimer > 0) return;
    if (p.ammo <= 0) {
      p.reloadTimer = RELOAD_TIME;
      return;
    }

    p.ammo -= 1;
    p.shootCooldown = SHOOT_COOLDOWN;
    const muzzleX = p.facing > 0 ? p.x + p.w : p.x - BULLET_SIZE;
    const muzzleY = p.y + p.h * 0.35;
    this.spawnBullet({
      x: muzzleX,
      y: muzzleY,
      vx: p.facing * BULLET_SPEED,
      vy: 0,
      owner: "player",
      damage: BULLET_DAMAGE,
    });

    if (p.ammo <= 0) p.reloadTimer = RELOAD_TIME;
  }

  private spawnBullet(opts: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    owner: "player" | "enemy";
    damage: number;
  }): void {
    const piercing = opts.owner === "player" && this.hasUpgrade("piercing");
    const stopOnEnemy =
      opts.owner === "player" && this.hasUpgrade("stopOnEnemy");
    const fireTrail =
      opts.owner === "player" && this.hasUpgrade("fireTrail");

    // Hollow points override piercing when both are owned.
    const effectiveStop = stopOnEnemy;
    const effectivePierce = piercing && !stopOnEnemy;

    this.bullets.push({
      id: uid("bullet"),
      x: opts.x,
      y: opts.y,
      w: BULLET_SIZE,
      h: BULLET_SIZE,
      vx: opts.vx,
      vy: opts.vy,
      damage: opts.damage,
      owner: opts.owner,
      life: BULLET_LIFE,
      piercing: effectivePierce,
      stopOnEnemy: effectiveStop,
      fireTrail,
      hitIds: new Set(),
      lastTrailAt: 0,
    });
  }

  private updateEnemies(dt: number): void {
    const solids = this.platforms;
    for (const e of this.enemies) {
      if (e.corpse) continue;

      if (e.dead) {
        e.corpse = true;
        e.vx = 0;
        e.vy = 0;
        continue;
      }

      e.shootCooldown = Math.max(0, e.shootCooldown - dt);

      if (e.x <= e.patrolLeft) {
        e.facing = 1;
        e.vx = ENEMY_SPEED;
      } else if (e.x + e.w >= e.patrolRight) {
        e.facing = -1;
        e.vx = -ENEMY_SPEED;
      }

      e.vy += GRAVITY * dt;
      resolveSolid(e, solids, dt);

      if (e.burnTtl > 0) {
        e.burnTtl -= dt;
        this.damageEnemy(e, FIRE_DPS * dt);
      }

      // Contact damage
      if (this.player.alive && aabb(this.player, e) && this.player.invuln <= 0) {
        this.damagePlayer(15, true);
      }

      if (e.shootCooldown <= 0 && this.player.alive) {
        const dx = this.player.x + this.player.w / 2 - (e.x + e.w / 2);
        const dy = this.player.y + this.player.h / 2 - (e.y + e.h / 2);
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 520) {
          e.shootCooldown = ENEMY_SHOOT_COOLDOWN;
          e.facing = dx >= 0 ? 1 : -1;
          this.spawnBullet({
            x: e.facing > 0 ? e.x + e.w : e.x - BULLET_SIZE,
            y: e.y + e.h * 0.35,
            vx: (dx / dist) * ENEMY_BULLET_SPEED,
            vy: (dy / dist) * ENEMY_BULLET_SPEED * 0.35,
            owner: "enemy",
            damage: 12,
          });
        }
      }
    }
  }

  private updateBullets(dt: number): void {
    const solids = this.solids();
    const remaining: Bullet[] = [];

    for (const b of this.bullets) {
      b.life -= dt;
      if (b.life <= 0) continue;

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      let destroyed = false;

      // Terrain / corpse ricochet — bullets never stop on terrain.
      for (const solid of solids) {
        if (!aabb(b, solid)) continue;
        bounceBullet(b, solid);
        if (b.fireTrail) this.leaveFire(b.x + b.w / 2, b.y + b.h / 2);
        break;
      }

      // Living enemies
      for (const e of this.enemies) {
        if (e.dead || e.corpse) continue;
        if (!aabb(b, e)) continue;
        if (b.hitIds.has(e.id)) continue;

        b.hitIds.add(e.id);
        this.damageEnemy(e, b.damage);
        if (b.fireTrail) {
          this.leaveFire(e.x + e.w / 2, e.y + e.h / 2);
          e.burnTtl = Math.max(e.burnTtl, BURN_TTL);
        }

        if (b.stopOnEnemy) {
          destroyed = true;
          break;
        }

        if (b.piercing) {
          // Pass through — no bounce, keep damaging via hitIds.
          continue;
        }

        // Default: ricochet off living enemies.
        bounceBullet(b, e);
        break;
      }

      if (destroyed) continue;

      // Friendly fire — all bullets hurt the player (including own).
      if (
        this.player.alive &&
        aabb(b, this.player) &&
        !b.hitIds.has("player")
      ) {
        // Small grace right after muzzle for own shots.
        const isOwn = b.owner === "player";
        const justFired = b.life > BULLET_LIFE - 0.08;
        if (!(isOwn && justFired)) {
          b.hitIds.add("player");
          this.damagePlayer(b.damage * (isOwn ? 0.6 : 1), true);
          if (b.fireTrail) {
            this.leaveFire(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
            this.player.burnTtl = Math.max(this.player.burnTtl, BURN_TTL);
          }
          if (b.stopOnEnemy) {
            continue;
          }
          if (!b.piercing) {
            bounceBullet(b, this.player);
          }
        }
      }

      if (
        b.x < -40 ||
        b.y < -40 ||
        b.x > GAME_WIDTH + 40 ||
        b.y > GAME_HEIGHT + 40
      ) {
        continue;
      }

      remaining.push(b);
    }

    this.bullets = remaining;
  }

  private leaveFire(cx: number, cy: number): void {
    const size = FIRE_ZONE_SIZE;
    this.burnZones.push({
      id: uid("fire"),
      x: cx - size / 2,
      y: cy - size / 2,
      w: size,
      h: size,
      ttl: FIRE_ZONE_TTL,
      damagePerSecond: FIRE_DPS,
    });
    if (this.burnZones.length > 40) this.burnZones.shift();
  }

  private updateBurnZones(dt: number): void {
    const next: BurningZone[] = [];
    for (const z of this.burnZones) {
      z.ttl -= dt;
      if (z.ttl <= 0) continue;

      if (this.player.alive && aabb(this.player, z)) {
        this.damagePlayer(z.damagePerSecond * dt, false);
        this.player.burnTtl = Math.max(this.player.burnTtl, 0.4);
      }
      for (const e of this.enemies) {
        if (e.dead || e.corpse) continue;
        if (aabb(e, z)) {
          this.damageEnemy(e, z.damagePerSecond * dt);
          e.burnTtl = Math.max(e.burnTtl, 0.4);
        }
      }
      next.push(z);
    }
    this.burnZones = next;
  }

  private updatePickups(): void {
    const kept: Pickup[] = [];
    for (const p of this.pickups) {
      if (aabb(this.player, p)) {
        this.applyUpgrade(p.upgrade);
        this.message = `Picked up upgrade`;
        continue;
      }
      kept.push(p);
    }
    this.pickups = kept;
  }

  private damageEnemy(e: Enemy, amount: number): void {
    if (e.dead || e.corpse) return;
    e.hp -= amount;
    if (e.hp <= 0) {
      e.hp = 0;
      e.dead = true;
      e.corpse = true;
      e.vx = 0;
      e.vy = 0;
      this.killCount += 1;
    }
  }

  private damagePlayer(amount: number, useInvuln: boolean): void {
    const p = this.player;
    if (!p.alive) return;
    if (useInvuln && p.invuln > 0) return;
    p.hp -= amount;
    if (useInvuln) p.invuln = INVULN_TIME;
    if (p.hp <= 0) {
      p.hp = 0;
      p.alive = false;
      this.phase = "dead";
      this.message =
        "You died — run wiped. Press Enter / R to restart from zero.";
    }
  }

  private checkRoomClear(): void {
    if (this.roomCleared) return;
    const living = this.enemies.some((e) => !e.dead && !e.corpse);
    if (living) return;

    this.roomCleared = true;
    if (this.door) this.door.open = true;

    if (this.pendingUpgrade && !this.upgrades.includes(this.pendingUpgrade)) {
      // Spawn pickup near door as mid-run choice, and also gate on confirm.
      this.pickups.push({
        id: uid("pickup"),
        x: GAME_WIDTH - 140,
        y: GAME_HEIGHT - 24 - 40,
        w: 28,
        h: 28,
        upgrade: this.pendingUpgrade,
      });
      this.offeredUpgrade = this.pendingUpgrade;
      this.phase = "upgrade";
      this.message = "Room cleared! Press Enter to take the upgrade and proceed.";
      this.pendingUpgrade = null;
    } else {
      this.message = "Room cleared! Walk into the open door.";
    }
  }

  private checkDoor(input: InputState): void {
    if (!this.door?.open || this.phase !== "playing") return;
    if (!aabb(this.player, this.door)) return;
    if (input.confirmPressed || true) {
      this.advanceOrFinish();
    }
  }
}
