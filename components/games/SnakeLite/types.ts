export type Dir = "up" | "down" | "left" | "right";

export interface Cell {
  x: number;
  y: number;
}

export interface SnakeState {
  cols: number;
  rows: number;
  snake: Cell[];
  dir: Dir;
  queuedDir: Dir;
  food: Cell;
  score: number;
  gameOver: boolean;
  moveCooldownMs: number;
}
