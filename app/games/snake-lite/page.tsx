import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { SnakeLiteGame } from "@/components/games/SnakeLite/Game";

export const metadata: Metadata = {
  title: "Snake Lite",
  description: "간소화된 스네이크 캔버스 게임",
};

export default function SnakeLitePage() {
  return (
    <main className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Snake Lite</h1>
        <p className="text-sm text-muted">방향키/WASD 또는 스와이프로 뱀 방향을 바꿔 먹이를 먹고 점수를 올리세요.</p>
      </section>

      <SnakeLiteGame />

      <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <h2 className="mb-2 text-base font-semibold text-fg">컨트롤 안내</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>키보드: 방향키 또는 WASD</li>
          <li>터치: 캔버스에서 스와이프</li>
          <li>점수 증가에 따라 이동 속도가 점진적으로 빨라집니다</li>
        </ul>
      </section>

      <AdSlot className="w-full" slot="GAMES_BOTTOM" />

      <Link className="inline-flex rounded-md border border-border px-4 py-2" href="/games">
        다른 게임 보기
      </Link>
    </main>
  );
}
