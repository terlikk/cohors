"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps server-rendered data live: re-fetches the current route on an
 * interval while the tab is visible. Lightweight alternative to a socket
 * for a single-user local app.
 */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
