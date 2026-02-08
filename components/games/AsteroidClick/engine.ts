import type { AsteroidState, Target } from "./types";

const ROUND_MS = 60000;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function newTarget(width: number, height: number): Target {
  const r = rand(16, 32);
  return {
    x: rand(r + 10, width - r - 10),
    y: rand(r + 10, height - r - 10),
    r,
    ttlMs: rand(700, 1300),
    alive: true,
  };
}

export function createInitialState(width: number, height: number): AsteroidState {
  return {
    width,
    height,
    timeLeftMs: ROUND_MS,
    score: 0,
    hits: 0,
    misses: 0,
    combo: 0,
    target: null,
    spawnCooldownMs: 350,
    gameOver: false,
  };
}

export function step(state: AsteroidState, deltaMs: number): AsteroidState {
  if (state.gameOver) return state;

  const next: AsteroidState = {
    ...state,
    timeLeftMs: Math.max(0, state.timeLeftMs - deltaMs),
  };

  if (next.timeLeftMs <= 0) {
    next.gameOver = true;
    next.target = null;
    return next;
  }

  next.spawnCooldownMs -= deltaMs;
  if (!next.target && next.spawnCooldownMs <= 0) {
    next.target = newTarget(next.width, next.height);
    next.spawnCooldownMs = rand(120, 320);
  }

  if (next.target) {
    next.target = { ...next.target, ttlMs: next.target.ttlMs - deltaMs };
    if (next.target.ttlMs <= 0) {
      next.target = null;
      next.combo = 0;
      next.misses += 1;
      next.score = Math.max(0, next.score - 2);
    }
  }

  return next;
}

export function onHit(state: AsteroidState): AsteroidState {
  if (state.gameOver || !state.target) return state;

  const combo = state.combo + 1;
  const gain = 8 + Math.min(12, combo);

  return {
    ...state,
    score: state.score + gain,
    hits: state.hits + 1,
    combo,
    target: null,
    spawnCooldownMs: 80,
  };
}

export function onMissTap(state: AsteroidState): AsteroidState {
  if (state.gameOver) return state;
  return {
    ...state,
    misses: state.misses + 1,
    combo: 0,
    score: Math.max(0, state.score - 1),
  };
}

export function draw(ctx: CanvasRenderingContext2D, state: AsteroidState) {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`TIME ${(state.timeLeftMs / 1000).toFixed(1)}s`, 12, 22);
  ctx.fillText(`SCORE ${state.score}`, 12, 42);
  ctx.fillText(`COMBO x${state.combo}`, 12, 62);

  if (state.target) {
    const pulse = 1 + Math.sin(performance.now() / 130) * 0.06;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(state.target.x, state.target.y, state.target.r * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fed7aa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(state.target.x, state.target.y, state.target.r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.gameOver) {
    ctx.fillStyle = "rgba(15,23,42,0.82)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText("RESULT", state.width / 2 - 46, state.height / 2 - 10);
    ctx.font = "14px system-ui, sans-serif";
    const total = state.hits + state.misses;
    const acc = total > 0 ? ((state.hits / total) * 100).toFixed(1) : "0.0";
    ctx.fillText(`Score ${state.score} / Accuracy ${acc}%`, state.width / 2 - 108, state.height / 2 + 18);
  }
}
