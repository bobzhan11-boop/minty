"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Send, X } from "lucide-react";
import { CLERK_NAME, CLERK_POSTER, QUICK_REPLIES } from "@/lib/mia";
import { useMiaChat } from "./use-mia-chat";
import { MiaThread } from "./mia-thread";
import { trackEvent } from "@/lib/track";

/**
 * Floating Mia concierge for product pages (§ product-page assistant).
 *
 * Collapsed it sits above the WhatsApp button as a small avatar icon; hovering
 * (or tapping on touch) expands it into a chat panel where the visitor can type
 * keywords to search the catalog or ask questions. It only renders on /products.
 */
export function MiaWidget() {
  const pathname = usePathname();
  const onProductPage = pathname?.startsWith("/products");

  const [open, setOpen] = useState(false);
  const { messages, input, setInput, typing, send } = useMiaChat("product_widget");

  if (!onProductPage) return null;

  function expand() {
    if (!open) {
      setOpen(true);
      trackEvent("cta_click", { button_text: "mia_widget_open", position: "product_widget" });
    }
  }

  return (
    <div
      className="fixed bottom-24 right-5 z-50 flex flex-col items-end"
      onMouseEnter={expand}
    >
      {/* ===== Chat panel ===== */}
      <div
        className={`mb-3 w-[20rem] origin-bottom-right overflow-hidden rounded-2xl transition-all duration-300 ease-out sm:w-[22rem] ${
          open
            ? "max-h-[70vh] scale-100 opacity-100"
            : "pointer-events-none max-h-0 scale-90 opacity-0"
        }`}
      >
        <div className="card flex flex-col overflow-hidden shadow-2xl">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-brand-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CLERK_POSTER} alt={CLERK_NAME} className="h-full w-full object-cover" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">{CLERK_NAME}</p>
              <p className="flex items-center gap-1 text-[11px] text-brand-600">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Online · ask or search
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto grid h-7 w-7 place-items-center rounded-full text-ink-muted transition hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* thread */}
          <MiaThread messages={messages} typing={typing} className="max-h-[40vh] px-4 py-4" />

          {/* quick replies (only before the user has spoken) */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-brand-400 hover:text-brand-700"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search products or ask a question…"
              aria-label="Search products or chat with Mia"
              className="field flex-1"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || typing}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ===== Collapsed avatar icon ===== */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : expand())}
        onFocus={expand}
        aria-label={`Chat with ${CLERK_NAME}, your apparel concierge`}
        aria-expanded={open}
        className={`group relative h-14 w-14 overflow-hidden rounded-full shadow-lg ring-2 ring-white transition hover:scale-105 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CLERK_POSTER} alt={CLERK_NAME} className="h-full w-full object-cover" />
        {/* online dot */}
        <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500" />
        </span>
      </button>
    </div>
  );
}
