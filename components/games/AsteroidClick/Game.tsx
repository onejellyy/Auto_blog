"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialState, draw, onHit, onMissTap, step } from "./engine";
import type { AsteroidState } from "./types";
import { fitCanvasToContainer, getPointerPosition } from "@/components/games/shared/canvas";
import { loadBestNumber, saveBestNumber } from "@/components/games/shared/storage";
import { useVisibilityPause } from "@/components/games/shared/useVisibilityPause";

const WIDTH = 720;
const HEIGHT = 420;
const GAME_ID = "asteroid-click";

export function AsteroidClickGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<AsteroidState>(createInitialState(WIDTH, HEIGHT));
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState("0.0");
  const [best, setBest] = useState(0);

  useEffect(() => setBest(loadBestNumber(GAME_ID, 0)), []);

  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = Math.min(WIDTH, parent?.clientWidth ?? WIDTH);
    const height = Math.round((width / WIDTH) * HEIGHT);
    fitCanvasToContainer(canvas, width, height);
    stateRef.current = createInitialState(width, height);
    setScore(0);
    setAccuracy("0.0");
  }, []);

  useEffect(() => {
    syncCanvas();
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, [syncCanvas]);

  const pause = useCallback(() => setRunning(false), []);
  useVisibilityPause(pause);

  const restart = useCallback(() => {
    syncCanvas();
    setRunning(true);
  }, [syncCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hitTest = (x: number, y: number) => {
      const state = stateRef.current;
      if (!state.target) {
        stateRef.current = onMissTap(state);
        return;
      }

      const dx = x - state.target.x;
      const dy = y - state.target.y;
      const hit = dx * dx + dy * dy <= state.target.r * state.target.r;
      stateRef.current = hit ? onHit(state) : onMissTap(state);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!running) return;
      const p = getPointerPosition(canvas, e.clientX, e.clientY);
      hitTest(p.x, p.y);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    return () => canvas.removeEventListener("pointerdown", onPointerDown);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const frame = (ts: number) => {
      const prev = lastRef.current || ts;
      const delta = Math.min(40, ts - prev);
      lastRef.current = ts;

      if (running) stateRef.current = step(stateRef.current, delta);
      draw(ctx, stateRef.current);

      const s = stateRef.current;
      setScore(s.score);
      const total = s.hits + s.misses;
      setAccuracy(total > 0 ? ((s.hits / total) * 100).toFixed(1) : "0.0");

      if (s.gameOver && running) {
        setRunning(false);
        if (s.score > best) {
          setBest(s.score);
          saveBestNumber(GAME_ID, s.score);
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [best, running]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
        <span className="font-semibold">점수 {score}</span>
        <span>정확도 {accuracy}%</span>
        <span>최고기록 {best}</span>
        <span>{running ? "플레이 중" : stateRef.current.gameOver ? "결과 화면" : "일시정지"}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <canvas
          ref={canvasRef}
          aria-label="Asteroid Click 게임 캔버스"
          className="mx-auto block max-w-full touch-none rounded-lg"
          height={HEIGHT}
          width={WIDTH}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-md bg-accent px-4 py-2 font-medium text-white" onClick={() => setRunning((v) => !v)} type="button">
          {running ? "일시정지" : "재개"}
        </button>
        <button className="rounded-md border border-border px-4 py-2" onClick={restart} type="button">
          Restart
        </button>
      </div>
    </section>
  );
}
