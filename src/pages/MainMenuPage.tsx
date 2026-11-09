import { useNavigate } from "react-router-dom";

export function MainMenuPage() {
  const navigate = useNavigate();

  return (
    <main className="shell">
      <section className="hero">
        <p className="brand">Ricochet Run</p>
        <h1>Bounce. Burn. Don&apos;t shoot yourself.</h1>
        <p className="lede">
          A 2D platformer rogue-like where bullets ricochet off walls, living
          enemies, and corpses — including your own fire.
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => navigate("/play")}
          >
            Start Run
          </button>
        </div>
        <ul className="controls">
          <li>
            <kbd>A</kbd>/<kbd>D</kbd> or arrows — move
          </li>
          <li>
            <kbd>W</kbd>/<kbd>Space</kbd> — jump
          </li>
          <li>
            <kbd>J</kbd> or click — shoot
          </li>
          <li>
            <kbd>Enter</kbd> — claim upgrade / continue
          </li>
          <li>
            <kbd>R</kbd> — restart run from zero
          </li>
        </ul>
      </section>
    </main>
  );
}
