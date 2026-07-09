import { SAVE_KEY, SAVE_VERSION } from "../constants/game";
import { CompendiumService } from "./compendiumService";
import type { SaveData } from "../types/game";

type PersistedSaveData = SaveData & {
  saveVersion?: number;
};

export class SaveService {
  static save(data: SaveData): void {
    const payload = {
      ...data,
      saveVersion: SAVE_VERSION,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }

  static load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedSaveData;
      return parsed.saveVersion === SAVE_VERSION ? parsed : null;
    } catch {
      return null;
    }
  }

  static autosave(data: SaveData): void {
    this.save(data);
  }

  static delete(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  static async reset(): Promise<SaveData> {
    this.delete();
    return this.createInitialSave();
  }

  static async createInitialSave(): Promise<SaveData> {
    const persona = await CompendiumService.getDefaultPersona();
    const gamePersona = persona
      ? await CompendiumService.toGamePersona(persona)
      : null;

    return {
      player: {
        name: "Makoto",
        level: 1,
        stats: {
          strength: 1,
          magic: 1,
          endurance: 1,
          agility: 1,
          luck: 1,
        },
        hp: 80,
        sp: 40,
        gold: 0,
        personas: [
          gamePersona
            ? {
                ...gamePersona,
                id: `persona-${gamePersona.source ?? "arsene"}`,
              }
            : {
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
                hp: 70,
                sp: 35,
                skills: ["Aggression"],
                resistances: ["Physical"],
                arcana: "Fool",
              },
        ],
        equippedPersonaId: gamePersona
          ? `persona-${gamePersona.source ?? "arsene"}`
          : "persona-arsene",
        inventory: [
          {
            id: "item-potion",
            name: "Healing Potion",
            type: "consumable",
            description: "Restores 20 HP.",
            effect: "heal-20",
            quantity: 3,
          },
        ],
      },
      game: {
        phase: "menu",
        floor: 1,
        maxFloor: 100,
        actionsTaken: 0,
        events: ["Welcome to Tartarus"],
        saveVersion: SAVE_VERSION,
      },
      settings: {
        theme: "dark",
      },
    };
  }
}
