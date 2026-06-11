"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, getUtm } from "@/lib/track";

/** Fires a `page_view` event on every client-side route change (§3.4.1). */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { page_path: pathname, ...getUtm() });
  }, [pathname]);

  return null;
}
