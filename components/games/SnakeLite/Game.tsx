"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialState, draw, queueDirection, step } from "./engine";
import type { Dir, SnakeState } from "./types";
import { fitCanvasToContainer, getPointerPosition } from "@/components/games/shared/canvas";
import { loadBestNumber, saveBestNumber } from "@/components/games/shared/storage";
import { useVisibilityPause } from "@/components/games/shared/useVisibilityPause";

const WIDTH = 720;
const HEIGHT = 420;
const GAME_ID = "snake-lite";

export function SnakeLiteGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SnakeState>(createInitialState());
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => setBest(loadBestNumber(GAME_ID, 0)), []);

  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = Math.min(WIDTH, canvas.parentElement?.clientWidth ?? WIDTH);
    const height = Math.round((width / WIDTH) * HEIGHT);
    fitCanvasToContainer(canvas, width, height);
    stateRef.current = createInitialState();
    setScore(0);
    setRunning(true);
  }, []);

  useEffect(() => {
    syncCanvas();
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, [syncCanvas]);

  const pause = useCallback(() => setRunning(false), []);
  useVisibilityPause(pause);

  const setDir = useCallback((dir: Dir) => {
    stateRef.current = queueDirection(stateRef.current, dir);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) setDir("up");
      if (["ArrowDown", "s", "S"].includes(e.key)) setDir("down");
      if (["ArrowLeft", "a", "A"].includes(e.key)) setDir("left");
      if (["ArrowRight", "d", "D"].includes(e.key)) setDir("right");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setDir]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      swipeStart.current = getPointerPosition(canvas, e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      const start = swipeStart.current;
      if (!start) return;
      const end = getPointerPosition(canvas, e.clientX, e.clientY);
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      if (Math.abs(dx) + Math.abs(dy) < 16) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
      else setDir(dy > 0 ? "down" : "up");
      swipeStart.current = null;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [setDir]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const frame = (ts: number) => {
      const prev = lastRef.current || ts;
      const delta = Math.min(40, ts - prev);
      lastRef.current = ts;

      if (running) stateRef.current = step(stateRef.current, delta);
      draw(ctx, stateRef.current, Number(canvas.style.width.replace("px", "")) || WIDTH, Number(canvas.style.height.replace("px", "")) || HEIGHT);
      setScore(stateRef.current.score);

      if (stateRef.current.gameOver && running) {
        setRunning(false);
        if (stateRef.current.score > best) {
          setBest(stateRef.current.score);
          saveBestNumber(GAME_ID, stateRef.current.score);
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
        <span>점수 {score}</span>
        <span>최고기록 {best}</span>
        <span>{running ? "플레이 중" : stateRef.current.gameOver ? "게임 오버" : "일시정지"}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <canvas
          ref={canvasRef}
          aria-label="Snake Lite 게임 캔버스"
          className="mx-auto block max-w-full touch-none rounded-lg"
          height={HEIGHT}
          width={WIDTH}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["up", "left", "down", "right"] as Dir[]).map((dir) => (
          <button key={dir} className="rounded-md border border-border px-3 py-2 text-sm" onClick={() => setDir(dir)} type="button">
            {dir.toUpperCase()}
          </button>
        ))}
        <button className="rounded-md bg-accent px-3 py-2 text-sm text-white" onClick={syncCanvas} type="button">
          Restart
        </button>
      </div>
    </section>
  );
}
