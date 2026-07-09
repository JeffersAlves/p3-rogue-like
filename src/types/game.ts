export interface PlayerStats {
  strength: number;
  magic: number;
  endurance: number;
  agility: number;
  luck: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: "consumable" | "weapon" | "armor" | "accessory";
  description: string;
  effect?: string;
  quantity?: number;
}

export interface Persona {
  id: string;
  name: string;
  level: number;
  experience: number;
  stats: PlayerStats;
  hp: number;
  sp: number;
  skills: string[];
  resistances: string[];
  arcana: string;
  source?: string;
  image?: string;
}

export interface PlayerState {
  name: string;
  level: number;
  stats: PlayerStats;
  hp: number;
  sp: number;
  gold: number;
  personas: Persona[];
  equippedPersonaId: string | null;
  inventory: InventoryItem[];
}

export interface BattleSnapshot {
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  playerMaxHp: number;
  log: string[];
  turn: number;
  completed: boolean;
  victory: boolean;
  escapeSuccess: boolean;
}

export interface GameState {
  phase:
    | "menu"
    | "character-creation"
    | "exploration"
    | "battle"
    | "rewards"
    | "game-over";
  floor: number;
  maxFloor: number;
  actionsTaken: number;
  events: string[];
  currentEncounter?: string;
  rewardChoice?: string;
  battle?: BattleSnapshot;
  saveVersion: number;
}

export interface SaveData {
  player: PlayerState;
  game: GameState;
  settings: {
    theme: "dark";
  };
}
