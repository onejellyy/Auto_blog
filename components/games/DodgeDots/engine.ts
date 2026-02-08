import type { DodgeState, Dot, InputState } from "./types";

const BASE_SPAWN_MS = 800;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createDot(width: number, height: number, elapsedMs: number): Dot {
  const side = Math.floor(Math.random() * 4);
  const speedBoost = Math.min(220, elapsedMs * 0.015);
  const speed = rand(90 + speedBoost, 150 + speedBoost);

  if (side === 0) {
    return { x: rand(0, width), y: -10, vx: rand(-40, 40), vy: speed, r: rand(4, 8) };
  }
  if (side === 1) {
    return { x: width + 10, y: rand(0, height), vx: -speed, vy: rand(-40, 40), r: rand(4, 8) };
  }
  if (side === 2) {
    return { x: rand(0, width), y: height + 10, vx: rand(-40, 40), vy: -speed, r: rand(4, 8) };
  }

  return { x: -10, y: rand(0, height), vx: speed, vy: rand(-40, 40), r: rand(4, 8) };
}

export function createInitialState(width: number, height: number): DodgeState {
  return {
    width,
    height,
    player: { x: width / 2, y: height / 2, r: 10, speed: 250 },
    dots: [],
    score: 0,
    elapsedMs: 0,
    spawnCooldownMs: BASE_SPAWN_MS,
    gameOver: false,
  };
}

export function step(state: DodgeState, input: InputState, deltaMs: number): DodgeState {
  if (state.gameOver) return state;

  const dt = deltaMs / 1000;
  const next: DodgeState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    score: Math.floor((state.elapsedMs + deltaMs) / 100),
    dots: state.dots.map((d) => ({ ...d, x: d.x + d.vx * dt, y: d.y + d.vy * dt })),
  };

  const speedScale = Math.min(1.8, 1 + next.elapsedMs / 45000);
  const px =
    state.player.x +
    ((input.right ? 1 : 0) - (input.left ? 1 : 0)) *
      state.player.speed *
      speedScale *
      dt;
  const py =
    state.player.y +
    ((input.down ? 1 : 0) - (input.up ? 1 : 0)) *
      state.player.speed *
      speedScale *
      dt;

  next.player = {
    ...state.player,
    x: Math.max(state.player.r, Math.min(state.width - state.player.r, px)),
    y: Math.max(state.player.r, Math.min(state.height - state.player.r, py)),
  };

  next.dots = next.dots.filter((d) => d.x > -30 && d.x < state.width + 30 && d.y > -30 && d.y < state.height + 30);

  const spawnEvery = Math.max(180, BASE_SPAWN_MS - next.elapsedMs * 0.01);
  next.spawnCooldownMs -= deltaMs;
  while (next.spawnCooldownMs <= 0) {
    next.dots.push(createDot(state.width, state.height, next.elapsedMs));
    next.spawnCooldownMs += spawnEvery;
  }

  for (const dot of next.dots) {
    const dx = dot.x - next.player.x;
    const dy = dot.y - next.player.y;
    const hitDistance = dot.r + next.player.r;
    if (dx * dx + dy * dy <= hitDistance * hitDistance) {
      next.gameOver = true;
      break;
    }
  }

  return next;
}

export function draw(ctx: CanvasRenderingContext2D, state: DodgeState): void {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.strokeStyle = "rgba(125,211,252,0.35)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= state.width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.height);
    ctx.stroke();
  }

  ctx.fillStyle = "#e2e8f0";
  for (const dot of state.dots) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`SCORE ${state.score}`, 12, 20);
  ctx.fillText(`TIME ${(state.elapsedMs / 1000).toFixed(1)}s`, 12, 40);

  if (state.gameOver) {
    ctx.fillStyle = "rgba(2,6,23,0.8)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText("GAME OVER", state.width / 2 - 76, state.height / 2 - 8);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Restart 버튼으로 다시 시작할 수 있습니다.", state.width / 2 - 130, state.height / 2 + 22);
  }
}
