export interface CompendiumStats {
  strength: number;
  magic: number;
  endurance: number;
  agility: number;
  luck: number;
}

export interface CompendiumAffinities {
  weak: string[];
  resists: string[];
  reflects: string[];
  absorbs: string[];
  nullifies: string[];
}

export interface CompendiumPersona {
  id: number;
  name: string;
  arcana: string;
  level: number;
  description: string;
  image: string;
  stats: CompendiumStats;
  affinities: CompendiumAffinities;
  dlc: boolean;
  query: string;
}

export interface CompendiumSkill {
  id: string;
  name: string;
  description: string;
}

export interface CompendiumEnemy {
  id: string;
  name: string;
  description: string;
}

export interface CompendiumFusionRecipe {
  id: string;
  name: string;
  ingredients: string[];
}

export interface CompendiumGamePersona {
  id: string;
  name: string;
  level: number;
  experience: number;
  stats: CompendiumStats;
  hp: number;
  sp: number;
  skills: string[];
  resistances: string[];
  arcana: string;
}
