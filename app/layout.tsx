import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://onejelly02.vercel.app";
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Engineering Notes",
    template: "%s | Engineering Notes",
  },
  description: "실무 중심 개발 블로그",
  openGraph: {
    title: "Engineering Notes",
    description: "실무 중심 개발 블로그",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {adsenseClient ? (
          <Script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            strategy="afterInteractive"
          />
        ) : null}
        <div className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 md:px-8">
          <header className="mb-10 flex items-center justify-between border-b border-border pb-4">
            <Link className="text-lg font-semibold" href="/">
              Engineering Notes
            </Link>
            <nav className="text-sm text-muted">
              <div className="flex items-center gap-4">
                <Link href="/">Home</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/ads">Ads</Link>
              </div>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
