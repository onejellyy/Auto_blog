import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { DodgeDotsGame } from "@/components/games/DodgeDots/Game";

export const metadata: Metadata = {
  title: "Dodge Dots",
  description: "점 피하기 캔버스 게임",
};

export default function DodgeDotsPage() {
  return (
    <main className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Dodge Dots</h1>
        <p className="text-sm text-muted">방향키/WASD 또는 터치 드래그로 플레이어를 움직여 장애물 점을 피하세요.</p>
      </section>

      <DodgeDotsGame />

      <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <h2 className="mb-2 text-base font-semibold text-fg">컨트롤 안내</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>키보드: 방향키 또는 WASD</li>
          <li>터치/마우스: 캔버스를 누른 뒤 이동 방향으로 드래그</li>
          <li>브라우저 탭이 비활성화되면 자동 일시정지됩니다</li>
        </ul>
      </section>

      <section aria-label="게임 상세 하단 광고 영역">
        <AdSlot className="w-full" slot="GAMES_BOTTOM" />
      </section>

      <div>
        <Link className="inline-flex rounded-md border border-border px-4 py-2" href="/games">
          다른 게임 보기
        </Link>
      </div>
    </main>
  );
}
