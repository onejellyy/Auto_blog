import type { Cell, Dir, SnakeState } from "./types";

const BASE_STEP_MS = 160;

function randomCell(cols: number, rows: number): Cell {
  return { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
}

function isOpposite(a: Dir, b: Dir): boolean {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

function nextHead(head: Cell, dir: Dir): Cell {
  if (dir === "up") return { x: head.x, y: head.y - 1 };
  if (dir === "down") return { x: head.x, y: head.y + 1 };
  if (dir === "left") return { x: head.x - 1, y: head.y };
  return { x: head.x + 1, y: head.y };
}

function respawnFood(state: SnakeState): Cell {
  let candidate = randomCell(state.cols, state.rows);
  while (state.snake.some((seg) => seg.x === candidate.x && seg.y === candidate.y)) {
    candidate = randomCell(state.cols, state.rows);
  }
  return candidate;
}

export function createInitialState(cols = 24, rows = 16): SnakeState {
  const snake = [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
  ];

  const base: SnakeState = {
    cols,
    rows,
    snake,
    dir: "right",
    queuedDir: "right",
    food: { x: 2, y: 2 },
    score: 0,
    gameOver: false,
    moveCooldownMs: BASE_STEP_MS,
  };

  return { ...base, food: respawnFood(base) };
}

export function queueDirection(state: SnakeState, dir: Dir): SnakeState {
  if (isOpposite(state.dir, dir)) return state;
  return { ...state, queuedDir: dir };
}

export function step(state: SnakeState, deltaMs: number): SnakeState {
  if (state.gameOver) return state;

  let next = { ...state, moveCooldownMs: state.moveCooldownMs - deltaMs };
  const stepMs = Math.max(70, BASE_STEP_MS - state.score * 4);

  if (next.moveCooldownMs > 0) return next;

  next = {
    ...next,
    dir: isOpposite(next.dir, next.queuedDir) ? next.dir : next.queuedDir,
    moveCooldownMs: stepMs,
  };

  const head = nextHead(next.snake[0], next.dir);
  if (head.x < 0 || head.y < 0 || head.x >= next.cols || head.y >= next.rows) {
    return { ...next, gameOver: true };
  }

  const hitsBody = next.snake.some((seg) => seg.x === head.x && seg.y === head.y);
  if (hitsBody) return { ...next, gameOver: true };

  const nextSnake = [head, ...next.snake];
  const ateFood = head.x === next.food.x && head.y === next.food.y;
  if (!ateFood) nextSnake.pop();

  const updated: SnakeState = {
    ...next,
    snake: nextSnake,
    score: ateFood ? next.score + 1 : next.score,
  };

  if (ateFood) updated.food = respawnFood(updated);
  return updated;
}

export function draw(ctx: CanvasRenderingContext2D, state: SnakeState, width: number, height: number) {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, width, height);

  const cellW = width / state.cols;
  const cellH = height / state.rows;

  ctx.strokeStyle = "rgba(148,163,184,0.18)";
  for (let c = 0; c <= state.cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, height);
    ctx.stroke();
  }
  for (let r = 0; r <= state.rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(width, r * cellH);
    ctx.stroke();
  }

  ctx.fillStyle = "#f97316";
  ctx.fillRect(state.food.x * cellW + 2, state.food.y * cellH + 2, cellW - 4, cellH - 4);

  ctx.fillStyle = "#22d3ee";
  state.snake.forEach((seg, idx) => {
    ctx.fillStyle = idx === 0 ? "#67e8f9" : "#22d3ee";
    ctx.fillRect(seg.x * cellW + 2, seg.y * cellH + 2, cellW - 4, cellH - 4);
  });

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`SCORE ${state.score}`, 10, 20);

  if (state.gameOver) {
    ctx.fillStyle = "rgba(15,23,42,0.8)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText("GAME OVER", width / 2 - 74, height / 2 - 8);
  }
}
