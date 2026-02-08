"use client";

import { useEffect } from "react";

export function useVisibilityPause(onPause: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "hidden") onPause();
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onPause]);
}
