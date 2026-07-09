export type ExplorationActionType =
  | "walk-front"
  | "walk-back"
  | "walk-left"
  | "walk-right"
  | "shadow"
  | "red-shadow"
  | "boss-shadow"
  | "chest"
  | "rare-chest"
  | "elevator"
  | "return-point"
  | "stairs";

export interface ExplorationAction {
  id: ExplorationActionType;
  label: string;
  weight: number;
  minFloor?: number;
  maxFloor?: number;
  uniquePerFloor?: boolean;
  bossOnly?: boolean;
  description: string;
}

export interface ExplorationNode {
  id: string;
  action: ExplorationActionType;
  label: string;
  description: string;
  children: ExplorationNode[];
}

interface ExplorationGeneratorOptions {
  floor: number;
}

export class ExplorationGenerator {
  private static readonly actionPool: ExplorationAction[] = [
    {
      id: "walk-front",
      label: "Walk Front",
      weight: 30,
      description: "Advance through the corridor.",
    },
    {
      id: "walk-back",
      label: "Walk Back",
      weight: 30,
      description: "Double back and explore a different route.",
    },
    {
      id: "walk-left",
      label: "Walk Left",
      weight: 30,
      description: "Follow a side passage to the left.",
    },
    {
      id: "walk-right",
      label: "Walk Right",
      weight: 30,
      description: "Follow a side passage to the right.",
    },
    {
      id: "shadow",
      label: "Shadow",
      weight: 20,
      description: "A normal shadow appears.",
    },
    {
      id: "red-shadow",
      label: "Red Shadow",
      weight: 5,
      description: "A stronger shadow lurks nearby.",
    },
    {
      id: "chest",
      label: "Chest",
      weight: 10,
      description: "A treasure chest is waiting.",
    },
    {
      id: "rare-chest",
      label: "Rare Chest",
      weight: 2,
      description: "A rare chest glimmers with treasure.",
    },
    {
      id: "elevator",
      label: "Elevator",
      weight: 3,
      uniquePerFloor: true,
      description: "A service elevator hums in the distance.",
    },
    {
      id: "return-point",
      label: "Return Point",
      weight: 2,
      uniquePerFloor: true,
      description: "A familiar return point appears.",
    },
    {
      id: "boss-shadow",
      label: "Boss Shadow",
      weight: 0,
      bossOnly: true,
      uniquePerFloor: true,
      description: "A towering shadow blocks the way.",
    },
    {
      id: "stairs",
      label: "Stairs",
      weight: 0,
      uniquePerFloor: true,
      description: "A stairwell leads upward.",
    },
  ];

  static generateFloorTree(
    options: ExplorationGeneratorOptions,
  ): ExplorationNode {
    const floor = Math.max(1, options.floor);
    const isBossFloor = floor % 10 === 0;
    const usedActions = new Set<ExplorationActionType>();

    const root: ExplorationNode = {
      id: `${floor}-root`,
      action: "walk-front",
      label: "Choose your next path",
      description: "The path ahead splits into two options.",
      children: [],
    };

    if (isBossFloor) {
      root.children = [
        this.createBossChoice(floor, usedActions),
        this.createChoiceNode(floor, usedActions, []),
      ];
    } else {
      const firstChoice = this.createChoiceNode(floor, usedActions, []);
      const secondChoice = this.createChoiceNode(floor, usedActions, [
        firstChoice.action,
      ]);
      root.children = [firstChoice, secondChoice];
    }

    if (!this.containsAction(root, "stairs")) {
      this.forceStairs(root);
    }

    return root;
  }

  static getActionPool(): ExplorationAction[] {
    return this.actionPool.map((action) => ({ ...action }));
  }

  static generateNewChildren(
    node: ExplorationNode,
    floor: number,
  ): ExplorationNode[] {
    const usedActions = new Set<ExplorationActionType>();
    const firstChild = this.createLeafNode(floor, usedActions, [node.action]);
    const secondChild = this.createLeafNode(floor, usedActions, [
      node.action,
      firstChild.action,
    ]);
    return [firstChild, secondChild];
  }

  private static createBossChoice(
    floor: number,
    usedActions: Set<ExplorationActionType>,
  ): ExplorationNode {
    const bossAction = this.getActionDefinition("boss-shadow");
    usedActions.add("boss-shadow");
    const bossNode: ExplorationNode = {
      id: `${floor}-boss-shadow`,
      action: bossAction.id,
      label: bossAction.label,
      description: bossAction.description,
      children: [],
    };

    const stairsNode = this.createForcedNode(floor, "stairs");
    const preview = this.createLeafNode(floor, usedActions, ["boss-shadow"]);
    bossNode.children = [stairsNode, preview];
    return bossNode;
  }

  private static createChoiceNode(
    floor: number,
    usedActions: Set<ExplorationActionType>,
    excludeActions: ExplorationActionType[],
  ): ExplorationNode {
    const action = this.selectAction({
      floor,
      isBossFloor: false,
      usedActions,
      excludeActions,
    });

    const node: ExplorationNode = {
      id: `${floor}-${action.id}`,
      action: action.id,
      label: action.label,
      description: action.description,
      children: [],
    };

    node.children = [
      this.createLeafNode(floor, usedActions, [action.id, ...excludeActions]),
      this.createLeafNode(floor, usedActions, [action.id, ...excludeActions]),
    ];

    return node;
  }

  private static createLeafNode(
    floor: number,
    usedActions: Set<ExplorationActionType>,
    excludeActions: ExplorationActionType[],
  ): ExplorationNode {
    const action = this.selectAction({
      floor,
      isBossFloor: false,
      usedActions,
      excludeActions,
    });
    return this.createNodeFromAction(floor, action);
  }

  private static selectAction(params: {
    floor: number;
    isBossFloor: boolean;
    usedActions: Set<ExplorationActionType>;
    excludeActions: ExplorationActionType[];
  }): ExplorationAction {
    const excludeSet = new Set(params.excludeActions);
    const pool = this.actionPool.filter((action) => {
      if (action.bossOnly && !params.isBossFloor) {
        return false;
      }
      if (action.id === "stairs") {
        return false;
      }
      if (action.id === "boss-shadow") {
        return false;
      }
      if (excludeSet.has(action.id)) {
        return false;
      }
      if (action.minFloor && params.floor < action.minFloor) {
        return false;
      }
      if (action.maxFloor && params.floor > action.maxFloor) {
        return false;
      }
      if (action.uniquePerFloor && params.usedActions.has(action.id)) {
        return false;
      }
      return true;
    });

    const totalWeight = pool.reduce((sum, action) => sum + action.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const action of pool) {
      roll -= action.weight;
      if (roll <= 0) {
        if (action.uniquePerFloor) {
          params.usedActions.add(action.id);
        }
        return action;
      }
    }

    const fallback =
      pool[0] ?? this.actionPool.find((item) => item.id === "walk-front")!;
    if (fallback.uniquePerFloor) {
      params.usedActions.add(fallback.id);
    }
    return fallback;
  }

  private static createNodeFromAction(
    floor: number,
    action: ExplorationAction,
  ): ExplorationNode {
    return {
      id: `${floor}-${action.id}-${Math.random().toString(36).slice(2, 8)}`,
      action: action.id,
      label: action.label,
      description: action.description,
      children: [],
    };
  }

  private static createForcedNode(
    floor: number,
    actionId: ExplorationActionType,
  ): ExplorationNode {
    const action = this.getActionDefinition(actionId);
    return this.createNodeFromAction(floor, action);
  }

  private static getActionDefinition(
    actionId: ExplorationActionType,
  ): ExplorationAction {
    const action = this.actionPool.find((item) => item.id === actionId);
    if (!action) {
      throw new Error(`Unknown action type: ${actionId}`);
    }
    return action;
  }

  private static containsAction(
    node: ExplorationNode,
    actionId: ExplorationActionType,
  ): boolean {
    if (node.action === actionId) {
      return true;
    }
    return node.children.some((child) => this.containsAction(child, actionId));
  }

  private static forceStairs(root: ExplorationNode): void {
    const leaves = this.collectLeaves(root).filter(
      (leaf) => leaf.action !== "stairs" && leaf.action !== "boss-shadow",
    );
    if (leaves.length === 0) {
      return;
    }
    const replacement = leaves[Math.floor(Math.random() * leaves.length)];
    replacement.action = "stairs";
    replacement.label = "Stairs";
    replacement.description = "A stairwell leads upward.";
  }

  private static collectLeaves(node: ExplorationNode): ExplorationNode[] {
    if (node.children.length === 0) {
      return [node];
    }
    return node.children.flatMap((child) => this.collectLeaves(child));
  }
}
