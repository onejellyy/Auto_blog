import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { AsteroidClickGame } from "@/components/games/AsteroidClick/Game";

export const metadata: Metadata = {
  title: "Asteroid Click",
  description: "60초 운석 클릭 게임",
};

export default function AsteroidClickPage() {
  return (
    <main className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Asteroid Click</h1>
        <p className="text-sm text-muted">60초 안에 나타나는 운석을 빠르게 클릭/터치해 점수와 정확도를 올리세요.</p>
      </section>

      <AsteroidClickGame />

      <section className="rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <h2 className="mb-2 text-base font-semibold text-fg">컨트롤 안내</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>터치/마우스: 목표 원 클릭</li>
          <li>60초 타임어택으로 결과(점수/정확도) 확인</li>
        </ul>
      </section>

      <AdSlot className="w-full" slot="GAMES_BOTTOM" />

      <Link className="inline-flex rounded-md border border-border px-4 py-2" href="/games">
        다른 게임 보기
      </Link>
    </main>
  );
}
