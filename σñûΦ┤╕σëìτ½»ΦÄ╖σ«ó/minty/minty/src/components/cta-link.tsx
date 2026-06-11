"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/track";

/** A Link that emits a `cta_click` event (§3.4.1) — usable inside server pages. */
export function CtaLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  event: Record<string, unknown>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackEvent("cta_click", event)}>
      {children}
    </Link>
  );
}
