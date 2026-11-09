import type { InputState } from "./GameEngine";

export type { InputState };

export function createInputState(): InputState {
  return {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    shoot: false,
    shootPressed: false,
    confirm: false,
    confirmPressed: false,
    restart: false,
    restartPressed: false,
  };
}

export class InputController {
  state = createInputState();
  private pressed = new Set<string>();

  attach(target: Window | HTMLElement = window): () => void {
    const onKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      const key = ke.key.toLowerCase();
      if (
        [
          "arrowleft",
          "arrowright",
          "arrowup",
          " ",
          "a",
          "d",
          "w",
          "j",
          "enter",
          "r",
        ].includes(key)
      ) {
        ke.preventDefault();
      }
      if (this.pressed.has(key)) return;
      this.pressed.add(key);
      this.applyKey(key, true, true);
    };

    const onKeyUp = (e: Event) => {
      const ke = e as KeyboardEvent;
      const key = ke.key.toLowerCase();
      this.pressed.delete(key);
      this.applyKey(key, false, false);
    };

    const onBlur = () => {
      this.pressed.clear();
      this.state = createInputState();
    };

    const onMouseDown = (e: Event) => {
      const me = e as MouseEvent;
      if (me.button === 0) {
        this.state.shoot = true;
        this.state.shootPressed = true;
      }
    };
    const onMouseUp = (e: Event) => {
      const me = e as MouseEvent;
      if (me.button === 0) this.state.shoot = false;
    };

    target.addEventListener("keydown", onKeyDown);
    target.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    target.addEventListener("mousedown", onMouseDown);
    target.addEventListener("mouseup", onMouseUp);

    return () => {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      target.removeEventListener("mousedown", onMouseDown);
      target.removeEventListener("mouseup", onMouseUp);
    };
  }

  private applyKey(key: string, down: boolean, edge: boolean): void {
    switch (key) {
      case "arrowleft":
      case "a":
        this.state.left = down;
        break;
      case "arrowright":
      case "d":
        this.state.right = down;
        break;
      case "arrowup":
      case "w":
      case " ":
        this.state.jump = down;
        if (down && edge) this.state.jumpPressed = true;
        break;
      case "j":
      case "k":
        this.state.shoot = down;
        if (down && edge) this.state.shootPressed = true;
        break;
      case "enter":
        this.state.confirm = down;
        if (down && edge) this.state.confirmPressed = true;
        break;
      case "r":
        this.state.restart = down;
        if (down && edge) this.state.restartPressed = true;
        break;
      default:
        break;
    }
  }

  /** Clear one-frame edge triggers after the engine consumes them. */
  endFrame(): void {
    this.state.jumpPressed = false;
    this.state.shootPressed = false;
    this.state.confirmPressed = false;
    this.state.restartPressed = false;
  }
}
