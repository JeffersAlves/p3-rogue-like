import { Link } from "react-router-dom";
import { GameCanvas } from "../components/GameCanvas";

export function PlayPage() {
  return (
    <main className="shell play-shell">
      <header className="play-header">
        <Link to="/" className="back">
          ← Menu
        </Link>
        <h1 className="play-title">Ricochet Run</h1>
        <p className="hint">Friendly fire is on. Corpses become cover.</p>
      </header>
      <div className="canvas-wrap">
        <GameCanvas />
      </div>
    </main>
  );
}
