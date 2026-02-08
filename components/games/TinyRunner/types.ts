export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RunnerState {
  width: number;
  height: number;
  y: number;
  vy: number;
  gravity: number;
  jumpPower: number;
  groundY: number;
  speed: number;
  distance: number;
  spawnCooldownMs: number;
  obstacles: Obstacle[];
  gameOver: boolean;
}
