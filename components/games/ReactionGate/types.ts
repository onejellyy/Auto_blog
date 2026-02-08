export type RoundPhase = "waiting" | "signal" | "clicked" | "false-start";

export interface ReactionState {
  width: number;
  height: number;
  running: boolean;
  round: number;
  phase: RoundPhase;
  timerMs: number;
  signalStartMs: number;
  results: number[];
  gameOver: boolean;
}
