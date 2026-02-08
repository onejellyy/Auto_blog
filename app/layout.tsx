import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
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
        <div className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 md:px-8">
          <header className="mb-10 flex items-center justify-between border-b border-border pb-4">
            <Link className="text-lg font-semibold" href="/">
              Engineering Notes
            </Link>
            <nav className="text-sm text-muted">
              <Link href="/">Home</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
