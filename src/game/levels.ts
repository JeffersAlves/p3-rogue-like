import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import type { RoomDef } from "./types";

function floor(id: string, x: number, y: number, w: number, h = 24) {
  return { id, x, y, w, h };
}

function plat(id: string, x: number, y: number, w: number) {
  return { id, x, y, w, h: 18 };
}

export const ROOMS: RoomDef[] = [
  {
    id: "room-1",
    name: "Entry Hall",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    spawn: { x: 64, y: 420 },
    platforms: [
      floor("f1", 0, 500, GAME_WIDTH),
      floor("wall-l", 0, 0, 24, GAME_HEIGHT),
      floor("wall-r", GAME_WIDTH - 24, 0, 24, GAME_HEIGHT),
      floor("ceil", 0, 0, GAME_WIDTH, 24),
      plat("p1", 180, 390, 140),
      plat("p2", 420, 320, 160),
      plat("p3", 680, 390, 140),
    ],
    enemies: [
      { x: 360, y: 460, patrolLeft: 280, patrolRight: 520 },
      { x: 720, y: 350, patrolLeft: 680, patrolRight: 800 },
    ],
    upgrade: "magazine",
  },
  {
    id: "room-2",
    name: "Bounce Chamber",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    spawn: { x: 64, y: 420 },
    platforms: [
      floor("f1", 0, 500, GAME_WIDTH),
      floor("wall-l", 0, 0, 24, GAME_HEIGHT),
      floor("wall-r", GAME_WIDTH - 24, 0, 24, GAME_HEIGHT),
      floor("ceil", 0, 0, GAME_WIDTH, 24),
      plat("p1", 120, 360, 120),
      plat("p2", 320, 280, 100),
      plat("p3", 520, 360, 120),
      plat("p4", 720, 280, 120),
      floor("pillar", 450, 380, 40, 120),
    ],
    enemies: [
      { x: 220, y: 320, patrolLeft: 120, patrolRight: 220, hp: 60 },
      { x: 560, y: 320, patrolLeft: 520, patrolRight: 620, hp: 60 },
      { x: 780, y: 240, patrolLeft: 720, patrolRight: 820, hp: 70 },
    ],
    upgrade: "piercing",
  },
  {
    id: "room-3",
    name: "Crossfire Alcove",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    spawn: { x: 80, y: 200 },
    platforms: [
      floor("f1", 0, 500, GAME_WIDTH),
      floor("wall-l", 0, 0, 24, GAME_HEIGHT),
      floor("wall-r", GAME_WIDTH - 24, 0, 24, GAME_HEIGHT),
      floor("ceil", 0, 0, GAME_WIDTH, 24),
      plat("p1", 60, 260, 180),
      plat("p2", 360, 220, 180),
      plat("p3", 680, 300, 180),
      plat("p4", 220, 400, 140),
      plat("p5", 540, 400, 140),
    ],
    enemies: [
      { x: 400, y: 180, patrolLeft: 360, patrolRight: 500, hp: 70 },
      { x: 740, y: 260, patrolLeft: 680, patrolRight: 820, hp: 70 },
      { x: 280, y: 360, patrolLeft: 220, patrolRight: 340, hp: 55 },
      { x: 600, y: 360, patrolLeft: 540, patrolRight: 660, hp: 55 },
    ],
    upgrade: "fireTrail",
  },
  {
    id: "room-4",
    name: "Final Vault",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    spawn: { x: 64, y: 420 },
    platforms: [
      floor("f1", 0, 500, GAME_WIDTH),
      floor("wall-l", 0, 0, 24, GAME_HEIGHT),
      floor("wall-r", GAME_WIDTH - 24, 0, 24, GAME_HEIGHT),
      floor("ceil", 0, 0, GAME_WIDTH, 24),
      plat("p1", 160, 400, 100),
      plat("p2", 360, 320, 100),
      plat("p3", 560, 240, 100),
      plat("p4", 740, 360, 120),
      floor("block-a", 280, 420, 48, 80),
      floor("block-b", 480, 360, 48, 140),
    ],
    enemies: [
      { x: 300, y: 280, patrolLeft: 200, patrolRight: 360, hp: 80 },
      { x: 520, y: 200, patrolLeft: 420, patrolRight: 560, hp: 80 },
      { x: 780, y: 320, patrolLeft: 740, patrolRight: 860, hp: 90 },
      { x: 420, y: 460, patrolLeft: 320, patrolRight: 600, hp: 100 },
    ],
    upgrade: "stopOnEnemy",
    isExit: true,
  },
];
