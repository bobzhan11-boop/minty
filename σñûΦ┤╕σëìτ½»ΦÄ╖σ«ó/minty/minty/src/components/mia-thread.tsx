"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { fromPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/track";
import type { ChatMessage, ProductHit } from "@/lib/mia";

/** A clickable product result Mia surfaced from a search. */
function ProductHitCard({ p }: { p: ProductHit }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      onClick={() => trackEvent("cta_click", { button_text: "mia_product_hit", product_slug: p.slug })}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-brand-400 hover:shadow-sm"
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {p.image && (
          <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
        <span className="block text-xs text-ink-muted">
          {p.category} · MOQ {p.moq}
        </span>
        <span className="block text-xs font-semibold text-brand-700">{fromPrice(p.priceTiers)}</span>
      </span>
    </Link>
  );
}

/** Scrollable chat thread, shared by the hero concierge and the floating widget. */
export function MiaThread({
  messages,
  typing,
  className = "",
}: {
  messages: ChatMessage[];
  typing: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
      aria-label="Chat conversation with Mia"
      className={`space-y-3 overflow-y-auto ${className}`}
    >
      {messages.map((m, i) => (
        <div key={i} className={m.from === "user" ? "flex justify-end" : "flex flex-col items-start"}>
          <p
            className={
              m.from === "user"
                ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-sm text-white"
                : "max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2 text-sm text-ink"
            }
          >
            {m.text}
          </p>
          {m.products && m.products.length > 0 && (
            <div className="mt-2 w-full max-w-[90%] space-y-2">
              {m.products.map((p) => (
                <ProductHitCard key={p.slug} p={p} />
              ))}
            </div>
          )}
        </div>
      ))}
      {typing && (
        <div className="flex justify-start">
          <span className="inline-flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
          </span>
        </div>
      )}
    </div>
  );
}
