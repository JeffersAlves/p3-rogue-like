import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BattleService,
  type BattleAction,
  type Enemy,
} from "../services/battleService";
import { SaveService } from "../services/saveService";
import type {
  BattleSnapshot,
  GameState,
  PlayerState,
  SaveData,
} from "../types/game";

interface GameContextValue {
  saveData: SaveData;
  setPlayer: (player: PlayerState) => void;
  setGame: (game: GameState) => void;
  startNewGame: (name: string, stats: PlayerState["stats"]) => Promise<void>;
  resetGame: () => Promise<void>;
  save: () => void;
  startBattle: (enemy: Enemy) => void;
  resolveBattleAction: (action: BattleAction) => void;
}

const defaultSave: SaveData = {
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
    personas: [],
    equippedPersonaId: null,
    inventory: [],
  },
  game: {
    phase: "menu",
    floor: 1,
    maxFloor: 100,
    actionsTaken: 0,
    events: ["Welcome to Tartarus"],
    saveVersion: 1,
  },
  settings: {
    theme: "dark",
  },
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [saveData, setSaveData] = useState<SaveData>(defaultSave);

  useEffect(() => {
    const loadInitialState = async () => {
      const loaded = SaveService.load();
      if (loaded) {
        setSaveData(loaded);
        return;
      }

      const initial = await SaveService.createInitialSave();
      setSaveData(initial);
    };

    void loadInitialState();
  }, []);

  useEffect(() => {
    SaveService.autosave(saveData);
  }, [saveData]);

  const setPlayer = (player: PlayerState) => {
    setSaveData((prev) => ({ ...prev, player }));
  };

  const setGame = (game: GameState) => {
    setSaveData((prev) => ({ ...prev, game }));
  };

  const startNewGame = async (name: string, stats: PlayerState["stats"]) => {
    const next = await SaveService.createInitialSave();
    next.player.name = name;
    next.player.stats = stats;
    next.player.hp = 80 + stats.endurance * 8;
    next.player.sp = 40 + stats.magic * 6;
    next.game.phase = "exploration";
    next.game.floor = 1;
    next.game.actionsTaken = 0;
    setSaveData(next);
  };

  const resetGame = async () => {
    const reset = await SaveService.reset();
    setSaveData(reset);
  };

  const save = () => {
    SaveService.save(saveData);
  };

  const startBattle = (enemy: Enemy) => {
    const persona = saveData.player.personas.find(
      (entry) => entry.id === saveData.player.equippedPersonaId,
    );
    const initialSnapshot: BattleSnapshot = {
      enemyName: enemy.name,
      enemyHp: enemy.hp,
      enemyMaxHp: enemy.hp,
      playerHp: saveData.player.hp,
      playerMaxHp: 80 + saveData.player.stats.endurance * 8,
      log: [`A wild ${enemy.name} appears.`],
      turn: 1,
      completed: false,
      victory: false,
      escapeSuccess: false,
    };

    setGame({
      ...saveData.game,
      phase: "battle",
      currentEncounter: enemy.name,
      battle: initialSnapshot,
    });

    if (persona) {
      setPlayer({
        ...saveData.player,
        hp: saveData.player.hp,
      });
    }
  };

  const resolveBattleAction = (action: BattleAction) => {
    const persona = saveData.player.personas.find(
      (entry) => entry.id === saveData.player.equippedPersonaId,
    );
    const battle = saveData.game.battle;
    if (!persona || !battle || battle.completed) {
      return;
    }

    const enemy: Enemy = {
      id: "battle-enemy",
      name: battle.enemyName,
      hp: battle.enemyHp,
      strength: 3,
      magic: 2,
      endurance: 3,
      agility: 2,
      luck: 1,
    };

    const result = BattleService.resolveTurn(
      saveData.player,
      persona,
      enemy,
      action,
      undefined,
    );

    const nextSnapshot: BattleSnapshot = {
      enemyName: battle.enemyName,
      enemyHp: result.enemyHp,
      enemyMaxHp: battle.enemyMaxHp,
      playerHp: result.playerHp,
      playerMaxHp: battle.playerMaxHp,
      log: [...battle.log, ...result.log],
      turn: battle.turn + 1,
      completed: result.completed,
      victory: result.victory,
      escapeSuccess: result.escapeSuccess,
    };

    const nextPlayer = {
      ...saveData.player,
      hp: result.playerHp,
      sp: result.playerSp,
    };

    setPlayer(nextPlayer);
    setGame({
      ...saveData.game,
      battle: nextSnapshot,
      phase:
        result.victory || result.escapeSuccess
          ? "exploration"
          : result.playerHp <= 0
            ? "game-over"
            : "battle",
      currentEncounter:
        result.victory || result.escapeSuccess ? undefined : battle.enemyName,
    });
  };

  const value = useMemo(
    () => ({
      saveData,
      setPlayer,
      setGame,
      startNewGame,
      resetGame,
      save,
      startBattle,
      resolveBattleAction,
    }),
    [saveData],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};
