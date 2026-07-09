import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BattleService } from "../services/battleService";
import { useGame } from "../contexts/GameContext";
import {
  ExplorationGenerator,
  type ExplorationNode,
  type ExplorationActionType,
} from "../services/explorationGenerator";

const getActionIcon = (action: ExplorationActionType) => {
  switch (action) {
    case "walk-front":
      return "🡆";
    case "walk-back":
      return "🡄";
    case "walk-left":
      return "⬅️";
    case "walk-right":
      return "➡️";
    case "shadow":
      return "👤";
    case "red-shadow":
      return "🔥";
    case "boss-shadow":
      return "👹";
    case "chest":
      return "📦";
    case "rare-chest":
      return "💎";
    case "elevator":
      return "🛗";
    case "return-point":
      return "🔁";
    case "stairs":
      return "🪜";
    default:
      return "❓";
  }
};

export const ExplorationPage = () => {
  const navigate = useNavigate();
  const { saveData, setGame, setPlayer, startBattle } = useGame();
  const [message, setMessage] = useState("You step into Tartarus.");
  const [tree, setTree] = useState<ExplorationNode | null>(() =>
    ExplorationGenerator.generateFloorTree({ floor: saveData.game.floor }),
  );
  const [currentChoices, setCurrentChoices] = useState<ExplorationNode[]>(
    () => tree?.children ?? [],
  );

  const chooseAction = (node: ExplorationNode) => {
    const newChildren = ExplorationGenerator.generateNewChildren(
      node,
      saveData.game.floor,
    );
    node.children = newChildren;
    setCurrentChoices(newChildren);
    setMessage(`${node.label} — the path shifts ahead.`);

    if (
      node.action === "shadow" ||
      node.action === "red-shadow" ||
      node.action === "boss-shadow"
    ) {
      const enemy = BattleService.createEnemy(saveData.game.floor);
      startBattle(enemy);
      navigate("/battle");
      return;
    }

    if (node.action === "stairs") {
      const nextFloor = saveData.game.floor + 1;
      const nextActions = saveData.game.actionsTaken + 1;
      setGame({
        ...saveData.game,
        phase: "exploration",
        floor: nextFloor,
        actionsTaken: nextActions,
        events: [...saveData.game.events, node.label],
      });
      const nextTree = ExplorationGenerator.generateFloorTree({
        floor: nextFloor,
      });
      setTree(nextTree);
      setCurrentChoices(nextTree.children);
      setMessage(`${node.label} — a new step forward.`);
      return;
    }

    if (node.action === "chest" || node.action === "rare-chest") {
      setPlayer({
        ...saveData.player,
        gold: saveData.player.gold + 10,
      });
      setMessage(`${node.label} — treasure found.`);
      return;
    }

    if (node.action === "elevator" || node.action === "return-point") {
      setMessage(`${node.label} — a special landmark is revealed.`);
      return;
    }

    setPlayer({
      ...saveData.player,
      gold: saveData.player.gold + 5,
    });

    setMessage(`${node.label} — a new step forward.`);
  };

  const refreshFloor = () => {
    const nextTree = ExplorationGenerator.generateFloorTree({
      floor: saveData.game.floor,
    });
    setTree(nextTree);
    setCurrentChoices(nextTree.children);
  };

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Tartarus • Floor {saveData.game.floor}</p>
        <h1>Exploration</h1>
        <p className="lede">{message}</p>

        <div className="status-card exploration-pairs">
          <h2>Current Choice and Future Paths</h2>
          <div className="exploration-pairs-grid">
            {currentChoices.map((option) => (
              <div key={option.id} className="exploration-pair">
                <div className="exploration-preview-list">
                  {option.children.map((child) => (
                    <div key={child.id} className="exploration-option preview">
                      <span className="exploration-icon">
                        {getActionIcon(child.action)}
                      </span>
                      <div>
                        <strong>{child.label}</strong>
                        <span>{child.description}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="exploration-option current-choice"
                  onClick={() => chooseAction(option)}
                >
                  <span className="exploration-icon">
                    {getActionIcon(option.action)}
                  </span>
                  <div>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="status-card">
          <h2>Current Status</h2>
          <p>{saveData.player.name}</p>
          <p>HP {saveData.player.hp}</p>
          <p>SP {saveData.player.sp}</p>
          <p>Gold {saveData.player.gold}</p>
          <p>Personas {saveData.player.personas.length}</p>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={refreshFloor}>
            Regenerate Choices
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/")}
          >
            Return to Menu
          </button>
        </div>
      </section>
    </main>
  );
};
