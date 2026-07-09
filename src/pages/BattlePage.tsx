import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";

const battleActions = [
  { key: "attack", label: "Attack" },
  { key: "guard", label: "Guard" },
  { key: "skill", label: "Skill" },
  { key: "item", label: "Item" },
  { key: "escape", label: "Escape" },
] as const;

export const BattlePage = () => {
  const navigate = useNavigate();
  const { saveData, resolveBattleAction } = useGame();
  const [showSkills, setShowSkills] = useState(false);
  const battle = saveData.game.battle;
  const equippedPersona = saveData.player.personas.find(
    (persona) => persona.id === saveData.player.equippedPersonaId,
  );

  if (!battle) {
    return (
      <main className="shell">
        <section className="panel">
          <h1>No battle active</h1>
          <button type="button" onClick={() => navigate("/explore")}>
            Return to exploration
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Battle • Turn {battle.turn}</p>
        <h1>{battle.enemyName}</h1>
        <p className="lede">{battle.log[battle.log.length - 1]}</p>
        <div className="status-card">
          <h2>Combat Status</h2>
          <p>
            Player HP: {battle.playerHp}/{battle.playerMaxHp}
          </p>
          <p>Player MP: {saveData.player.sp}</p>
          <p>
            Enemy HP: {battle.enemyHp}/{battle.enemyMaxHp}
          </p>
          <p>
            Active Persona: {equippedPersona?.name ?? "No persona equipped"}
          </p>
          <p>Victory: {battle.victory ? "Yes" : "No"}</p>
        </div>
        {showSkills ? (
          <div className="vertical">
            <div className="battle-actions-row">
              <button
                type="button"
                className="battle-action-square"
                onClick={() => setShowSkills(false)}
              >
                Back
              </button>
            </div>
            <div className="battle-skill-list">
              {equippedPersona && equippedPersona.skills.length > 0 ? (
                equippedPersona.skills.map((skill, index) => (
                  <button
                    type="button"
                    key={`${equippedPersona.id}-${skill}-${index}`}
                    className="battle-skill-card"
                    onClick={() => {
                      resolveBattleAction("skill");
                      setShowSkills(false);
                    }}
                  >
                    <strong>{skill}</strong>
                    <span>MP 5</span>
                  </button>
                ))
              ) : (
                <p>No skills available for the current persona.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="battle-actions-row">
            {battleActions.map((action) => (
              <button
                type="button"
                key={action.key}
                className="battle-action-square"
                onClick={() => {
                  if (action.key === "skill") {
                    setShowSkills(true);
                    return;
                  }
                  resolveBattleAction(action.key);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="status-card">
          <h2>Personas</h2>
          {saveData.player.personas.length > 0 ? (
            <div className="vertical">
              {saveData.player.personas.map((persona) => (
                <div key={persona.id} className="status-card">
                  {persona.image ? (
                    <img
                      src={persona.image}
                      alt={persona.name}
                      style={{
                        width: 96,
                        height: 96,
                        objectFit: "contain",
                        display: "block",
                        marginBottom: "0.5rem",
                      }}
                    />
                  ) : null}
                  <p>
                    {persona.name} • Lv {persona.level}
                  </p>
                  <p className="eyebrow">{persona.arcana}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No personas available yet.</p>
          )}
        </div>
        <button
          type="button"
          className="secondary"
          onClick={() => navigate("/explore")}
        >
          Back to exploration
        </button>
      </section>
    </main>
  );
};
