export const SAVE_KEY = "p3-rogue-like-save";
export const SAVE_VERSION = 1;
export const MAX_PERSONAS = 5;
export const MAX_FLOORS = 100;
export const MAX_ACTIONS_PER_FLOOR = 15;
export const CREATE_POINTS = 10;
export const BASE_PLAYER_HP = 80;
export const BASE_PLAYER_SP = 40;
export const BASE_PERSONA_HP = 70;
export const BASE_PERSONA_SP = 35;
export const INITIAL_PERSONAS = [
  {
    id: "persona-arsene",
    name: "Arsene",
    level: 1,
    experience: 0,
    stats: {
      strength: 2,
      magic: 2,
      endurance: 2,
      agility: 2,
      luck: 1,
    },
    hp: BASE_PERSONA_HP,
    sp: BASE_PERSONA_SP,
    skills: ["Aggression"],
    resistances: ["Physical"],
    arcana: "Fool",
  },
];

export const INITIAL_ITEMS = [
  {
    id: "item-potion",
    name: "Healing Potion",
    type: "consumable",
    description: "Restores 20 HP.",
    effect: "heal-20",
    quantity: 3,
  },
  {
    id: "item-magic",
    name: "SP Restore",
    type: "consumable",
    description: "Restores 15 SP.",
    effect: "sp-15",
    quantity: 2,
  },
];
