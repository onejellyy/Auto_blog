"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { draw, step, createInitialState } from "./engine";
import type { DodgeState, InputState } from "./types";
import { fitCanvasToContainer, getPointerPosition } from "@/components/games/shared/canvas";
import { loadBestNumber, saveBestNumber } from "@/components/games/shared/storage";
import { useVisibilityPause } from "@/components/games/shared/useVisibilityPause";

const GAME_ID = "dodge-dots";
const WIDTH = 720;
const HEIGHT = 420;

const defaultInput: InputState = { up: false, down: false, left: false, right: false };

export function DodgeDotsGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<InputState>({ ...defaultInput });
  const stateRef = useRef<DodgeState>(createInitialState(WIDTH, HEIGHT));
  const lastTsRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
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
  }, []);

  useEffect(() => {
    syncCanvas();
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, [syncCanvas]);

  const reset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = Number(canvas.style.width.replace("px", "")) || WIDTH;
    const h = Number(canvas.style.height.replace("px", "")) || HEIGHT;
    stateRef.current = createInitialState(w, h);
    setScore(0);
    setRunning(true);
  }, []);

  const pause = useCallback(() => setRunning(false), []);
  useVisibilityPause(pause);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) inputRef.current.up = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) inputRef.current.down = true;
      if (["ArrowLeft", "a", "A"].includes(e.key)) inputRef.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) inputRef.current.right = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) inputRef.current.up = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) inputRef.current.down = false;
      if (["ArrowLeft", "a", "A"].includes(e.key)) inputRef.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) inputRef.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointer = (clientX: number, clientY: number) => {
      const p = getPointerPosition(canvas, clientX, clientY);
      const state = stateRef.current;
      const dx = p.x - state.player.x;
      const dy = p.y - state.player.y;
      inputRef.current = {
        up: dy < -6,
        down: dy > 6,
        left: dx < -6,
        right: dx > 6,
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      onPointer(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if ((e.buttons & 1) === 1) onPointer(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      inputRef.current = { ...defaultInput };
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = (ts: number) => {
      const prevTs = lastTsRef.current || ts;
      const delta = Math.min(40, ts - prevTs);
      lastTsRef.current = ts;

      if (running) {
        stateRef.current = step(stateRef.current, inputRef.current, delta);
      }

      const current = stateRef.current;
      draw(ctx, current);
      if (current.score !== score) setScore(current.score);

      if (current.gameOver && running) {
        setRunning(false);
        if (current.score > best) {
          setBest(current.score);
          saveBestNumber(GAME_ID, current.score);
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [best, running, score]);

  const statusText = useMemo(() => {
    if (running) return "플레이 중";
    if (stateRef.current.gameOver) return "게임 오버";
    return "일시정지";
  }, [running]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm">
        <span className="font-semibold">상태: {statusText}</span>
        <span>점수: {score}</span>
        <span>최고기록: {best}</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <canvas
          ref={canvasRef}
          aria-label="Dodge Dots 게임 캔버스"
          className="mx-auto block max-w-full touch-none rounded-lg"
          height={HEIGHT}
          width={WIDTH}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-md bg-accent px-4 py-2 font-medium text-white"
          onClick={() => setRunning((v) => !v)}
          type="button"
        >
          {running ? "일시정지" : "재개"}
        </button>
        <button className="rounded-md border border-border px-4 py-2" onClick={reset} type="button">
          Restart
        </button>
      </div>
    </section>
  );
}
