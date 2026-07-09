import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CREATE_POINTS } from "../constants/game";
import { useGame } from "../contexts/GameContext";

const initialStats = {
  strength: 1,
  magic: 1,
  endurance: 1,
  agility: 1,
  luck: 1,
};

export const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { startNewGame } = useGame();
  const [name, setName] = useState("Makoto");
  const [stats, setStats] = useState(initialStats);

  const remaining = useMemo(
    () =>
      CREATE_POINTS +
      5 -
      Object.values(stats).reduce((sum, value) => sum + value, 0),
    [stats],
  );

  const adjustStat = (key: keyof typeof stats, delta: number) => {
    setStats((prev) => {
      const nextValue = prev[key] + delta;
      if (nextValue < 1 || nextValue > 5) {
        return prev;
      }
      const currentTotal = Object.values(prev).reduce(
        (sum, value) => sum + value,
        0,
      );
      const nextTotal = currentTotal + delta;
      if (nextTotal > CREATE_POINTS + 5) {
        return prev;
      }
      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  const handleStart = () => {
    startNewGame(name, stats);
    navigate("/explore");
  };

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Character Creation</p>
        <h1>Forge your SEES identity</h1>
        <label className="field">
          <span>Protagonist Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <div className="stat-grid">
          {Object.entries(stats).map(([key, value]) => (
            <div className="stat-card" key={key}>
              <h3>{key}</h3>
              <p>{value}</p>
              <div className="stat-actions">
                <button
                  type="button"
                  onClick={() => adjustStat(key as keyof typeof stats, -1)}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => adjustStat(key as keyof typeof stats, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="hint">
          Distribute exactly 10 points with values between 1 and 5.
        </p>
        <p className="hint">Remaining points: {remaining}</p>
        <button type="button" disabled={remaining !== 0} onClick={handleStart}>
          Enter Tartarus
        </button>
      </section>
    </main>
  );
};
