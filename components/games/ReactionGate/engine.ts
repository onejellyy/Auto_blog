import type { ReactionState } from "./types";

const TOTAL_ROUNDS = 5;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function createInitialState(width: number, height: number): ReactionState {
  return {
    width,
    height,
    running: true,
    round: 1,
    phase: "waiting",
    timerMs: rand(1200, 2800),
    signalStartMs: 0,
    results: [],
    gameOver: false,
  };
}

function nextRound(state: ReactionState): ReactionState {
  const nextRoundNumber = state.round + 1;
  if (nextRoundNumber > TOTAL_ROUNDS) {
    return { ...state, running: false, gameOver: true, phase: "clicked" };
  }

  return {
    ...state,
    round: nextRoundNumber,
    phase: "waiting",
    timerMs: rand(1200, 2800),
    signalStartMs: 0,
  };
}

export function step(state: ReactionState, deltaMs: number): ReactionState {
  if (!state.running || state.gameOver) return state;

  if (state.phase === "waiting") {
    const timerMs = state.timerMs - deltaMs;
    if (timerMs <= 0) {
      return {
        ...state,
        phase: "signal",
        timerMs: 0,
        signalStartMs: performance.now(),
      };
    }
    return { ...state, timerMs };
  }

  return state;
}

export function onPress(state: ReactionState): ReactionState {
  if (!state.running || state.gameOver) return state;

  if (state.phase === "waiting") {
    const failed: ReactionState = {
      ...state,
      phase: "false-start",
      results: [...state.results, 1000],
    };
    return nextRound(failed);
  }

  if (state.phase === "signal") {
    const reaction = Math.max(50, performance.now() - state.signalStartMs);
    const clicked: ReactionState = {
      ...state,
      phase: "clicked",
      results: [...state.results, reaction],
    };
    return nextRound(clicked);
  }

  return state;
}

export function average(results: number[]): number {
  if (results.length === 0) return 0;
  return results.reduce((sum, cur) => sum + cur, 0) / results.length;
}

export function draw(ctx: CanvasRenderingContext2D, state: ReactionState) {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`ROUND ${Math.min(state.round, 5)} / 5`, 12, 20);

  if (state.gameOver) {
    const avg = average(state.results);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.fillText("완료", state.width / 2 - 28, state.height / 2 - 18);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(`평균 반응 속도 ${avg.toFixed(1)}ms`, state.width / 2 - 80, state.height / 2 + 8);
    return;
  }

  if (state.phase === "waiting") {
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText("기다리세요...", state.width / 2 - 74, state.height / 2);
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("너무 빨리 누르면 해당 라운드는 실패 처리됩니다.", state.width / 2 - 132, state.height / 2 + 28);
    return;
  }

  if (state.phase === "signal") {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(state.width / 2 - 110, state.height / 2 - 50, 220, 100);
    ctx.fillStyle = "#052e16";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText("지금!", state.width / 2 - 40, state.height / 2 + 10);
  }
}
