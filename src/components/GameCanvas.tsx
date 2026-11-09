import { useEffect, useRef } from "react";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/constants";
import { GameEngine } from "../game/GameEngine";
import { InputController } from "../game/input";
import { renderGame } from "../game/render";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new GameEngine();
    const input = new InputController();
    const detach = input.attach(window);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      engine.update(dt, input.state);
      input.endFrame();
      renderGame(ctx, engine.snapshot());
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      detach();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      tabIndex={0}
      aria-label="Ricochet rogue-like game canvas"
    />
  );
}
