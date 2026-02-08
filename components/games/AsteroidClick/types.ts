export interface Target {
  x: number;
  y: number;
  r: number;
  ttlMs: number;
  alive: boolean;
}

export interface AsteroidState {
  width: number;
  height: number;
  timeLeftMs: number;
  score: number;
  hits: number;
  misses: number;
  combo: number;
  target: Target | null;
  spawnCooldownMs: number;
  gameOver: boolean;
}
