import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "미니게임 허브",
  description: "가볍게 즐기는 웹 미니게임 모음",
};

const games = [
  {
    href: "/games/dodge-dots",
    title: "Dodge Dots",
    desc: "사방에서 오는 점을 피하며 생존 시간을 늘려보세요.",
    icon: "●",
    status: "PLAYABLE",
  },
  {
    href: "/games/asteroid-click",
    title: "Asteroid Click",
    desc: "60초 동안 빠르게 운석을 클릭해 점수를 올립니다.",
    icon: "◎",
    status: "PLAYABLE",
  },
  {
    href: "/games/snake-lite",
    title: "Snake Lite",
    desc: "클래식 스네이크를 모바일 친화적으로 간소화했습니다.",
    icon: "▦",
    status: "PLAYABLE",
  },
  {
    href: "/games/reaction-gate",
    title: "Reaction Gate",
    desc: "신호가 뜨는 순간 반응 속도를 측정합니다.",
    icon: "⚡",
    status: "PLAYABLE",
  },
  {
    href: "/games/tiny-runner",
    title: "Tiny Runner",
    desc: "점프 타이밍으로 장애물을 피하는 러너 게임입니다.",
    icon: "▭",
    status: "PLAYABLE",
  },
];

export default function GamesHubPage() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">미니게임</h1>
        <p className="text-sm text-muted">
          짧게 즐길 수 있는 캔버스 기반 게임입니다. 광고는 플레이 화면을 가리지 않는 하단에만 배치됩니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {games.map((game) => (
          <article
            key={game.href}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl leading-none" aria-hidden>
                  {game.icon}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{game.title}</h2>
              </div>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">{game.status}</span>
            </div>
            <p className="text-sm text-muted">{game.desc}</p>
            <Link className="mt-auto inline-flex w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" href={game.href}>
              게임 열기
            </Link>
          </article>
        ))}
      </section>

      <section aria-label="게임 페이지 광고 영역" className="pt-2">
        <AdSlot className="w-full" slot="GAMES_BOTTOM" />
      </section>
    </main>
  );
}
