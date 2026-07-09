import { describe, expect, it } from "vitest";
import { CompendiumService } from "./compendiumService";
import type { CompendiumPersona } from "../types/compendium";

describe("CompendiumService", () => {
  it("preserves persona artwork when converting to game personas", async () => {
    const persona: CompendiumPersona = {
      id: 3,
      name: "Arsène",
      arcana: "Fool",
      level: 23,
      description: "A famous Persona.",
      image: "https://example.com/arsene.png",
      stats: {
        strength: 17,
        magic: 17,
        endurance: 14,
        agility: 18,
        luck: 11,
      },
      affinities: {
        weak: ["Light"],
        resists: ["Dark"],
        reflects: [],
        absorbs: [],
        nullifies: [],
      },
      dlc: true,
      query: "arsene",
    };

    const gamePersona = await CompendiumService.toGamePersona(persona);

    expect(gamePersona.image).toBe(persona.image);
    expect(gamePersona.source).toBe(persona.query);
  });
});
