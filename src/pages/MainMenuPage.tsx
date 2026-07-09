import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";

export const MainMenuPage = () => {
  const navigate = useNavigate();
  const { saveData, resetGame } = useGame();

  return (
    <main className="shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Persona 3 • Tartarus</p>
        <h1>Descend into the Abyss</h1>
        <p className="lede">
          A dark, client-side roguelike blending Tartarus exploration,
          turn-based battle, and Persona fusion-inspired progression.
        </p>
        <div className="actions">
          <button type="button" onClick={() => navigate("/create")}>
            Begin Journey
          </button>
          <button type="button" onClick={() => resetGame()}>
            Reset Save
          </button>
        </div>
        <div className="status-card">
          <h2>Current Save</h2>
          <p>Protagonist: {saveData.player.name}</p>
          <p>Floor: {saveData.game.floor}</p>
          <p>Phase: {saveData.game.phase}</p>
        </div>
      </section>
    </main>
  );
};
