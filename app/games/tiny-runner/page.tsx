import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { TinyRunnerGame } from "@/components/games/TinyRunner/Game";

export const metadata: Metadata = {
  title: "Tiny Runner",
  description: "점프 타이밍 러너 게임",
};

export default function TinyRunnerPage() {
  return (
    <main className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Tiny Runner</h1>
        <p className="text-sm text-muted">자동 전진하며 장애물을 피하세요. 스페이스/탭으로 점프할 수 있습니다.</p>
      </section>

      <TinyRunnerGame />

      <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <h2 className="mb-2 text-base font-semibold text-fg">컨트롤 안내</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>키보드: Space 또는 ↑</li>
          <li>터치/마우스: 캔버스 탭/클릭</li>
          <li>시간이 지날수록 이동 속도가 빨라집니다</li>
        </ul>
      </section>

      <AdSlot className="w-full" slot="GAMES_BOTTOM" />

      <Link className="inline-flex rounded-md border border-border px-4 py-2" href="/games">
        다른 게임 보기
      </Link>
    </main>
  );
}
