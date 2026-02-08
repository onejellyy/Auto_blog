"use client";

import { useEffect } from "react";
import clsx from "clsx";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSlotProps {
  slot: string;
  className?: string;
}

const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7094140389853787";

export function AdSlot({ slot, className }: AdSlotProps) {
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!isProd) return;
    if (typeof window === "undefined") return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate or blocked ad initialization errors.
    }
  }, [isProd]);

  if (!isProd) {
    return (
      <div
        aria-label="광고 자리 표시자"
        className={clsx(
          "flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-card text-sm text-muted",
          className,
        )}
      >
        Ad Placeholder ({slot})
      </div>
    );
  }

  return (
    <div className={clsx("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <ins
        className="adsbygoogle block"
        data-ad-client={adClient}
        data-ad-format="auto"
        data-ad-slot={slot}
        data-full-width-responsive="true"
        style={{ display: "block", minHeight: 96 }}
      />
    </div>
  );
}
