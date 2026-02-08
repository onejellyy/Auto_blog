import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "광고 및 제휴 고지",
  description: "Engineering Notes 광고 및 제휴 고지",
};

export default function AdsNoticePage() {
  return (
    <main className="prose prose-neutral max-w-none">
      <h1>광고 및 제휴 고지</h1>
      <p>본 사이트는 Google AdSense를 포함한 광고 서비스를 사용할 수 있습니다.</p>

      <h2>광고 고지</h2>
      <ul>
        <li>광고는 자동 또는 수동으로 배치될 수 있습니다.</li>
        <li>광고 클릭/노출에 따라 운영 수익이 발생할 수 있습니다.</li>
        <li>광고 내용에 대한 최종 책임은 각 광고 제공자에게 있습니다.</li>
      </ul>

      <h2>제휴 링크 안내</h2>
      <p>
        일부 게시글에는 제휴 링크가 포함될 수 있으며, 사용자가 링크를 통해 상품이나 서비스를 이용할 경우
        사이트 운영에 필요한 수수료가 발생할 수 있습니다.
      </p>
    </main>
  );
}
