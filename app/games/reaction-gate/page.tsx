import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { ReactionGateGame } from "@/components/games/ReactionGate/Game";

export const metadata: Metadata = {
  title: "Reaction Gate",
  description: "반응속도 측정 게임",
};

export default function ReactionGatePage() {
  return (
    <main className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Reaction Gate</h1>
        <p className="text-sm text-muted">신호가 뜬 뒤 즉시 클릭/탭 또는 스페이스를 눌러 반응 속도를 측정합니다.</p>
      </section>

      <ReactionGateGame />

      <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <h2 className="mb-2 text-base font-semibold text-fg">컨트롤 안내</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>키보드: Space / Enter</li>
          <li>터치/마우스: 캔버스 탭/클릭</li>
          <li>너무 빨리 누르면 해당 라운드는 실패 처리됩니다</li>
        </ul>
      </section>

      <AdSlot className="w-full" slot="GAMES_BOTTOM" />

      <Link className="inline-flex rounded-md border border-border px-4 py-2" href="/games">
        다른 게임 보기
      </Link>
    </main>
  );
}
