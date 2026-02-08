"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialState, draw, jump, step } from "./engine";
import type { RunnerState } from "./types";
import { fitCanvasToContainer } from "@/components/games/shared/canvas";
import { loadBestNumber, saveBestNumber } from "@/components/games/shared/storage";
import { useVisibilityPause } from "@/components/games/shared/useVisibilityPause";

const WIDTH = 720;
const HEIGHT = 360;
const GAME_ID = "tiny-runner";

export function TinyRunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<RunnerState>(createInitialState(WIDTH, HEIGHT));
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [running, setRunning] = useState(true);
  const [distance, setDistance] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => setBest(loadBestNumber(GAME_ID, 0)), []);

  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = Math.min(WIDTH, canvas.parentElement?.clientWidth ?? WIDTH);
    const height = Math.round((width / WIDTH) * HEIGHT);
    fitCanvasToContainer(canvas, width, height);
    stateRef.current = createInitialState(width, height);
    setDistance(0);
    setRunning(true);
  }, []);

  useEffect(() => {
    syncCanvas();
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, [syncCanvas]);

  const pause = useCallback(() => setRunning(false), []);
  useVisibilityPause(pause);

  const doJump = useCallback(() => {
    if (!running) return;
    stateRef.current = jump(stateRef.current);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = () => doJump();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        doJump();
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [doJump]);

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

      const dist = Math.floor(stateRef.current.distance);
      setDistance(dist);

      if (stateRef.current.gameOver && running) {
        setRunning(false);
        if (dist > best) {
          setBest(dist);
          saveBestNumber(GAME_ID, dist);
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
        <span>거리 {distance}m</span>
        <span>최고기록 {best}m</span>
        <span>{running ? "러닝 중" : stateRef.current.gameOver ? "게임 오버" : "일시정지"}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <canvas
          ref={canvasRef}
          aria-label="Tiny Runner 게임 캔버스"
          className="mx-auto block max-w-full touch-none rounded-lg"
          height={HEIGHT}
          width={WIDTH}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-md bg-accent px-4 py-2 font-medium text-white" onClick={doJump} type="button">
          점프
        </button>
        <button className="rounded-md border border-border px-4 py-2" onClick={syncCanvas} type="button">
          Restart
        </button>
      </div>
    </section>
  );
}
