export interface Player {
  x: number;
  y: number;
  r: number;
  speed: number;
}

export interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export interface DodgeState {
  width: number;
  height: number;
  player: Player;
  dots: Dot[];
  score: number;
  elapsedMs: number;
  spawnCooldownMs: number;
  gameOver: boolean;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
