import type {
  CompendiumEnemy,
  CompendiumFusionRecipe,
  CompendiumPersona,
  CompendiumSkill,
} from "../types/compendium";
import type { Persona } from "../types/game";

const COMPENDIUM_TSV_PATH = "/src/compendium/docs/compendium.tsv";

interface CompendiumRow {
  id: string;
  name: string;
  arcana: string;
  level: string;
  description: string;
  image: string;
  strength: string;
  magic: string;
  endurance: string;
  agility: string;
  luck: string;
  weak: string;
  resists: string;
  reflects: string;
  absorbs: string;
  nullifies: string;
  dlc: string;
  query: string;
}

export class CompendiumService {
  private static personaCache: CompendiumPersona[] | null = null;
  private static skillCache: CompendiumSkill[] | null = null;
  private static enemyCache: CompendiumEnemy[] | null = null;
  private static fusionCache: CompendiumFusionRecipe[] | null = null;

  static async getPersonas(): Promise<CompendiumPersona[]> {
    if (this.personaCache) {
      return this.personaCache;
    }

    const response = await fetch(COMPENDIUM_TSV_PATH);
    const text = await response.text();
    const rows = this.parseTsv(text);

    this.personaCache = rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      arcana: row.arcana,
      level: Number(row.level),
      description: row.description,
      image: row.image,
      stats: {
        strength: Number(row.strength),
        magic: Number(row.magic),
        endurance: Number(row.endurance),
        agility: Number(row.agility),
        luck: Number(row.luck),
      },
      affinities: {
        weak: this.parseList(row.weak),
        resists: this.parseList(row.resists),
        reflects: this.parseList(row.reflects),
        absorbs: this.parseList(row.absorbs),
        nullifies: this.parseList(row.nullifies),
      },
      dlc: row.dlc === "1",
      query: row.query,
    }));

    return this.personaCache;
  }

  static async getPersona(query: string): Promise<CompendiumPersona | null> {
    const personas = await this.getPersonas();
    return (
      personas.find((persona) => persona.query === query.toLowerCase()) ?? null
    );
  }

  static async getSkills(): Promise<CompendiumSkill[]> {
    if (this.skillCache) {
      return this.skillCache;
    }

    this.skillCache = [];
    return this.skillCache;
  }

  static async getEnemies(): Promise<CompendiumEnemy[]> {
    if (this.enemyCache) {
      return this.enemyCache;
    }

    this.enemyCache = [];
    return this.enemyCache;
  }

  static async getFusionData(): Promise<CompendiumFusionRecipe[]> {
    if (this.fusionCache) {
      return this.fusionCache;
    }

    this.fusionCache = [];
    return this.fusionCache;
  }

  static async getDefaultPersona(): Promise<CompendiumPersona | null> {
    const personas = await this.getPersonas();
    return (
      personas.find((persona) => persona.query === "arsene") ??
      personas[0] ??
      null
    );
  }

  static async toGamePersona(persona: CompendiumPersona): Promise<Persona> {
    return {
      id: `persona-${persona.query}`,
      name: persona.name,
      level: 1,
      experience: 0,
      stats: {
        strength: persona.stats.strength,
        magic: persona.stats.magic,
        endurance: persona.stats.endurance,
        agility: persona.stats.agility,
        luck: persona.stats.luck,
      },
      hp: 70 + persona.stats.endurance * 2,
      sp: 35 + persona.stats.magic * 2,
      skills: ["Aggression"],
      resistances: persona.affinities.resists,
      arcana: persona.arcana,
      source: persona.query,
      image: persona.image,
    };
  }

  private static parseTsv(text: string): CompendiumRow[] {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);

    const headers = lines[0].split("\t");
    return lines.slice(1).map((line) => {
      const values = line.split("\t");
      return headers.reduce<CompendiumRow>((acc, header, index) => {
        acc[header as keyof CompendiumRow] = values[index] ?? "";
        return acc;
      }, {} as CompendiumRow);
    });
  }

  private static parseList(value: string): string[] {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
}
