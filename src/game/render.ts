import { GAME_HEIGHT, GAME_WIDTH, UPGRADE_INFO } from "./constants";
import type { GameSnapshot } from "./types";

const COLORS = {
  bgTop: "#1a2332",
  bgBottom: "#0d121c",
  platform: "#3d5a4c",
  platformEdge: "#6f9b7a",
  player: "#e8c468",
  playerGun: "#f0e6d0",
  enemy: "#d65a4a",
  corpse: "#5a3a38",
  bulletPlayer: "#f4d35e",
  bulletEnemy: "#ff6b6b",
  fire: "#ff8c42",
  fireCore: "#ffd166",
  doorClosed: "#2a3344",
  doorOpen: "#4cc9a0",
  pickup: "#7bdff2",
  text: "#e8eef7",
  muted: "#9aa7b8",
  hp: "#4ade80",
  hpBg: "#243041",
  ammo: "#60a5fa",
  panel: "rgba(10, 14, 22, 0.72)",
};

export function renderGame(
  ctx: CanvasRenderingContext2D,
  snap: GameSnapshot,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  g.addColorStop(0, COLORS.bgTop);
  g.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Subtle grid atmosphere
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < GAME_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < GAME_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GAME_WIDTH, y);
    ctx.stroke();
  }

  for (const p of snap.platforms) {
    ctx.fillStyle = COLORS.platform;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = COLORS.platformEdge;
    ctx.fillRect(p.x, p.y, p.w, 3);
  }

  for (const z of snap.burnZones) {
    const flicker = 0.6 + Math.sin(snap.time * 12 + z.x) * 0.25;
    ctx.globalAlpha = Math.min(1, z.ttl / 1.2) * flicker;
    ctx.fillStyle = COLORS.fire;
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.fillStyle = COLORS.fireCore;
    ctx.fillRect(z.x + 4, z.y + 4, z.w - 8, z.h - 8);
    ctx.globalAlpha = 1;
  }

  if (snap.door) {
    ctx.fillStyle = snap.door.open ? COLORS.doorOpen : COLORS.doorClosed;
    ctx.fillRect(snap.door.x, snap.door.y, snap.door.w, snap.door.h);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(
      snap.door.x + 8,
      snap.door.y + 12,
      snap.door.w - 16,
      snap.door.h - 24,
    );
    if (snap.door.open) {
      ctx.fillStyle = COLORS.text;
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("EXIT", snap.door.x - 2, snap.door.y - 6);
    }
  }

  for (const pickup of snap.pickups) {
    const bob = Math.sin(snap.time * 4) * 3;
    ctx.fillStyle = COLORS.pickup;
    ctx.fillRect(pickup.x, pickup.y + bob, pickup.w, pickup.h);
    ctx.fillStyle = "#082029";
    ctx.font = "bold 14px ui-sans-serif, system-ui";
    ctx.fillText("^", pickup.x + 8, pickup.y + bob + 19);
  }

  for (const e of snap.enemies) {
    if (e.corpse) {
      ctx.fillStyle = COLORS.corpse;
      ctx.fillRect(e.x, e.y + e.h * 0.45, e.w, e.h * 0.55);
      ctx.fillRect(e.x + 4, e.y + e.h * 0.25, e.w - 8, e.h * 0.3);
      continue;
    }
    ctx.fillStyle = e.burnTtl > 0 ? COLORS.fire : COLORS.enemy;
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = "#1a1010";
    const eyeX = e.facing > 0 ? e.x + e.w - 10 : e.x + 4;
    ctx.fillRect(eyeX, e.y + 10, 6, 6);
    // HP bar
    const ratio = e.hp / e.maxHp;
    ctx.fillStyle = COLORS.hpBg;
    ctx.fillRect(e.x, e.y - 8, e.w, 4);
    ctx.fillStyle = COLORS.hp;
    ctx.fillRect(e.x, e.y - 8, e.w * ratio, 4);
  }

  const p = snap.player;
  if (p.alive) {
    const flash = p.invuln > 0 && Math.floor(snap.time * 20) % 2 === 0;
    ctx.globalAlpha = flash ? 0.45 : 1;
    ctx.fillStyle = p.burnTtl > 0 ? COLORS.fire : COLORS.player;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = COLORS.playerGun;
    const gunX = p.facing > 0 ? p.x + p.w - 4 : p.x - 14;
    ctx.fillRect(gunX, p.y + 14, 18, 6);
    ctx.fillStyle = "#2b2110";
    const pEye = p.facing > 0 ? p.x + p.w - 10 : p.x + 4;
    ctx.fillRect(pEye, p.y + 10, 5, 5);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "#6b5b3a";
    ctx.fillRect(p.x, p.y + p.h * 0.5, p.w, p.h * 0.5);
  }

  for (const b of snap.bullets) {
    ctx.fillStyle =
      b.owner === "player" ? COLORS.bulletPlayer : COLORS.bulletEnemy;
    if (b.fireTrail) ctx.fillStyle = COLORS.fire;
    ctx.beginPath();
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 1, 0, Math.PI * 2);
    ctx.fill();
    if (b.piercing) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  drawHud(ctx, snap);

  if (snap.phase === "upgrade" && snap.offeredUpgrade) {
    drawOverlay(
      ctx,
      "Room Cleared",
      `${UPGRADE_INFO[snap.offeredUpgrade].name}\n${UPGRADE_INFO[snap.offeredUpgrade].description}\n\nPress Enter to claim & continue`,
    );
  } else if (snap.phase === "dead") {
    drawOverlay(
      ctx,
      "Run Over",
      "You lost everything.\nPress Enter or R to restart from zero.",
    );
  } else if (snap.phase === "cleared") {
    drawOverlay(
      ctx,
      "Vault Cleared",
      `Kills: ${snap.killCount}\nUpgrades: ${snap.upgrades.length}\n\nPress Enter or R for a new run.`,
    );
  }
}

function drawHud(ctx: CanvasRenderingContext2D, snap: GameSnapshot): void {
  const p = snap.player;
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(12, 12, 280, 78);

  ctx.fillStyle = COLORS.text;
  ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(
    `${snap.roomName}  (${snap.roomIndex + 1}/${snap.roomCount})`,
    22,
    32,
  );

  ctx.fillStyle = COLORS.muted;
  ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("HP", 22, 52);
  ctx.fillStyle = COLORS.hpBg;
  ctx.fillRect(48, 42, 140, 10);
  ctx.fillStyle = COLORS.hp;
  ctx.fillRect(48, 42, 140 * (p.hp / p.maxHp), 10);

  ctx.fillStyle = COLORS.muted;
  ctx.fillText("AMMO", 22, 74);
  const mag = p.magazineSize;
  for (let i = 0; i < mag; i += 1) {
    ctx.fillStyle = i < p.ammo ? COLORS.ammo : "#334155";
    ctx.fillRect(62 + i * 12, 64, 9, 10);
  }
  if (p.reloadTimer > 0) {
    ctx.fillStyle = COLORS.fire;
    ctx.fillText("RELOADING", 62 + mag * 12 + 8, 74);
  }

  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(GAME_WIDTH - 220, 12, 208, 78);
  ctx.fillStyle = COLORS.text;
  ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Upgrades", GAME_WIDTH - 208, 32);
  ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
  if (snap.upgrades.length === 0) {
    ctx.fillStyle = COLORS.muted;
    ctx.fillText("None yet", GAME_WIDTH - 208, 54);
  } else {
    snap.upgrades.forEach((id, i) => {
      ctx.fillStyle = COLORS.pickup;
      ctx.fillText(`• ${UPGRADE_INFO[id].name}`, GAME_WIDTH - 208, 52 + i * 14);
    });
  }

  ctx.fillStyle = "rgba(10,14,22,0.55)";
  ctx.fillRect(12, GAME_HEIGHT - 34, GAME_WIDTH - 24, 22);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(snap.message, 22, GAME_HEIGHT - 18);
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  title: string,
  body: string,
): void {
  ctx.fillStyle = "rgba(6, 9, 14, 0.72)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2 - 100, 420, 200);
  ctx.strokeStyle = COLORS.pickup;
  ctx.lineWidth = 2;
  ctx.strokeRect(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2 - 100, 420, 200);

  ctx.fillStyle = COLORS.text;
  ctx.font = "700 28px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 48);
  ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = COLORS.muted;
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8 + i * 22);
  });
  ctx.textAlign = "left";
}
