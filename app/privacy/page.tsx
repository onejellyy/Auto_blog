import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Engineering Notes 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="prose prose-neutral max-w-none">
      <h1>개인정보처리방침</h1>
      <p>Engineering Notes는 서비스 운영 및 분석을 위해 최소한의 정보를 처리할 수 있습니다.</p>

      <h2>수집 가능한 정보</h2>
      <ul>
        <li>브라우저/기기 정보, 접속 기록, 쿠키 정보</li>
        <li>방문 통계 및 성능 분석을 위한 비식별 정보</li>
      </ul>

      <h2>이용 목적</h2>
      <ul>
        <li>서비스 품질 개선 및 트래픽 분석</li>
        <li>광고 노출 최적화 및 부정 이용 방지</li>
      </ul>

      <h2>쿠키 및 광고</h2>
      <p>
        본 사이트는 Google AdSense 등 제3자 광고 서비스를 사용할 수 있으며, 맞춤형 광고 제공을 위해
        쿠키가 사용될 수 있습니다.
      </p>

      <h2>문의</h2>
      <p>정책 관련 문의는 사이트 운영자에게 전달해 주시기 바랍니다.</p>
    </main>
  );
}
