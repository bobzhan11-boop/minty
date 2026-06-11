"use client";

// Unified front-end event reporter (§3.4.1).
// Every event is sent to BOTH GA4 (gtag) and the self-hosted log API.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const SESSION_KEY = "minty_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = window.localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/** Read UTM params from the current URL (for attribution). */
export function getUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get("utm_source") ?? undefined,
    utmMedium: p.get("utm_medium") ?? undefined,
    utmCampaign: p.get("utm_campaign") ?? undefined,
  };
}

/**
 * Track a business event. Fire-and-forget — never blocks the UI.
 * @example trackEvent("product_view", { product_id: 12, category: "tees" })
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // 1) GA4
  try {
    window.gtag?.("event", name, params);
  } catch {
    /* noop */
  }

  // 2) Self-hosted log
  const body = JSON.stringify({
    eventName: name,
    params: { ...params, page_path: window.location.pathname },
    sessionId: getSessionId(),
    referrer: document.referrer || undefined,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/v1/events", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* swallow — analytics must never break UX */
  }
}
