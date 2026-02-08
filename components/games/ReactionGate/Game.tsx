"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { average, createInitialState, draw, onPress, step } from "./engine";
import type { ReactionState } from "./types";
import { fitCanvasToContainer } from "@/components/games/shared/canvas";
import { loadBestNumber, saveBestNumber } from "@/components/games/shared/storage";
import { useVisibilityPause } from "@/components/games/shared/useVisibilityPause";

const WIDTH = 720;
const HEIGHT = 420;
const GAME_ID = "reaction-gate";

export function ReactionGateGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<ReactionState>(createInitialState(WIDTH, HEIGHT));
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [running, setRunning] = useState(true);
  const [results, setResults] = useState<number[]>([]);
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
    setResults([]);
    setRunning(true);
  }, []);

  useEffect(() => {
    syncCanvas();
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, [syncCanvas]);

  const pause = useCallback(() => setRunning(false), []);
  useVisibilityPause(pause);

  const press = useCallback(() => {
    if (!running) return;
    stateRef.current = onPress(stateRef.current);
    setResults([...stateRef.current.results]);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = () => press();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        press();
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [press]);

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

      if (stateRef.current.gameOver && running) {
        setRunning(false);
        const avg = average(stateRef.current.results);
        setResults([...stateRef.current.results]);
        if (avg > 0 && (best === 0 || avg < best)) {
          setBest(avg);
          saveBestNumber(GAME_ID, avg);
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [best, running]);

  const avg = useMemo(() => average(results), [results]);
  const shareText = useMemo(() => {
    if (!avg) return "";
    return `Reaction Gate 평균 반응속도 ${avg.toFixed(1)}ms 기록`; 
  }, [avg]);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-3 text-sm">
        <p>라운드 결과: {results.length > 0 ? results.map((v) => `${v.toFixed(0)}ms`).join(", ") : "아직 없음"}</p>
        <p>평균 반응속도: {avg ? `${avg.toFixed(1)}ms` : "-"}</p>
        <p>최고기록(낮을수록 좋음): {best ? `${best.toFixed(1)}ms` : "-"}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-2">
        <canvas
          ref={canvasRef}
          aria-label="Reaction Gate 게임 캔버스"
          className="mx-auto block max-w-full touch-none rounded-lg"
          height={HEIGHT}
          width={WIDTH}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-md bg-accent px-4 py-2 font-medium text-white" onClick={press} type="button">
          지금 누르기
        </button>
        <button className="rounded-md border border-border px-4 py-2" onClick={syncCanvas} type="button">
          Restart 5라운드
        </button>
      </div>

      {shareText ? (
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted">공유 문구: {shareText}</p>
      ) : null}
    </section>
  );
}
