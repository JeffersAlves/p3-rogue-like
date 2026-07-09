import { describe, expect, it } from "vitest";
import { ExplorationGenerator } from "./explorationGenerator";

describe("ExplorationGenerator", () => {
  it("returns a weighted action pool", () => {
    const pool = ExplorationGenerator.getActionPool();
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.find((action) => action.id === "walk-front")?.weight).toBe(30);
  });

  it("creates a strict binary decision tree for a normal floor", () => {
    const tree = ExplorationGenerator.generateFloorTree({
      floor: 3,
    });
    expect(tree).toBeDefined();
    expect(tree.children.length).toBe(2);
    tree.children.forEach((child) => {
      expect(child.children.length).toBe(2);
    });
  });

  it("adds boss shadow and stairs on boss floors", () => {
    const tree = ExplorationGenerator.generateFloorTree({
      floor: 10,
    });
    const visited = [
      tree.action,
      ...tree.children.flatMap((child) => [
        child.action,
        ...child.children.map((grandChild) => grandChild.action),
      ]),
    ];
    expect(visited).toContain("boss-shadow");
    expect(visited).toContain("stairs");
  });
});
