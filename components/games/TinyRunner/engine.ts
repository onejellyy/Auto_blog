import type { Obstacle, RunnerState } from "./types";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createObstacle(width: number, groundY: number): Obstacle {
  const h = rand(24, 56);
  const w = rand(16, 30);
  return { x: width + 10, y: groundY - h, w, h };
}

export function createInitialState(width: number, height: number): RunnerState {
  const groundY = height - 42;
  return {
    width,
    height,
    y: groundY,
    vy: 0,
    gravity: 900,
    jumpPower: 360,
    groundY,
    speed: 190,
    distance: 0,
    spawnCooldownMs: 800,
    obstacles: [],
    gameOver: false,
  };
}

export function jump(state: RunnerState): RunnerState {
  if (state.gameOver) return state;
  if (state.y < state.groundY - 2) return state;
  return { ...state, vy: -state.jumpPower };
}

export function step(state: RunnerState, deltaMs: number): RunnerState {
  if (state.gameOver) return state;
  const dt = deltaMs / 1000;

  let y = state.y + state.vy * dt;
  let vy = state.vy + state.gravity * dt;
  if (y >= state.groundY) {
    y = state.groundY;
    vy = 0;
  }

  const speed = Math.min(420, state.speed + dt * 8);
  const obstacles = state.obstacles
    .map((o) => ({ ...o, x: o.x - speed * dt }))
    .filter((o) => o.x + o.w > -20);

  let spawnCooldownMs = state.spawnCooldownMs - deltaMs;
  while (spawnCooldownMs <= 0) {
    obstacles.push(createObstacle(state.width, state.groundY));
    spawnCooldownMs += rand(620, 1280) - speed * 0.6;
  }

  const player = { x: 56, y: y - 26, w: 24, h: 26 };
  const hit = obstacles.some(
    (o) =>
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y,
  );

  return {
    ...state,
    y,
    vy,
    speed,
    distance: state.distance + speed * dt,
    obstacles,
    spawnCooldownMs,
    gameOver: hit,
  };
}

export function draw(ctx: CanvasRenderingContext2D, state: RunnerState) {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, state.groundY, state.width, state.height - state.groundY);

  ctx.strokeStyle = "rgba(148,163,184,0.24)";
  ctx.beginPath();
  ctx.moveTo(0, state.groundY);
  ctx.lineTo(state.width, state.groundY);
  ctx.stroke();

  ctx.fillStyle = "#f97316";
  state.obstacles.forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });

  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(56, state.y - 26, 24, 26);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`DIST ${Math.floor(state.distance)}m`, 12, 20);

  if (state.gameOver) {
    ctx.fillStyle = "rgba(15,23,42,0.82)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText("GAME OVER", state.width / 2 - 78, state.height / 2 - 8);
  }
}
