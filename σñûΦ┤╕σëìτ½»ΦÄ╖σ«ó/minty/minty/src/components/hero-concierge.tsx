"use client";

import { ArrowRight, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CtaLink } from "@/components/cta-link";
import { MiaThread } from "@/components/mia-thread";
import { useMiaChat } from "@/components/use-mia-chat";
import { whatsappUrl } from "@/lib/constants";
import { trackEvent } from "@/lib/track";
import { CLERK_NAME, CLERK_POSTER, QUICK_REPLIES } from "@/lib/mia";

/** Hero data shape (mirrors the `hero` home-module in the DB). */
export interface HeroData {
  slogan: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  bgImage: string;
}

/** Readable one-line intro sentences that flow behind the figure (full-bleed). */
const MARQUEE_PHRASES = [
  "Minty — your factory-direct custom bag & leather-goods partner",
  "Women's & kids' bags · backpacks, crossbody, totes & more",
  "Wholesale MOQ · worldwide shipping · full customization",
  "PU & genuine leather · custom hardware · private label",
  "From first sample to full production runs",
  "Send your specs — get a quote within 6 hours",
];

/** Tracks the user's `prefers-reduced-motion` setting (client-side). */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

export function HeroConcierge({ hero }: { hero: HeroData | null }) {
  const slogan = hero?.slogan ?? "Custom Bags & Leather Goods, Factory-Direct";
  const subtitle =
    hero?.subtitle ??
    "Women's & kids' bags for global brands. Wholesale MOQ · Worldwide shipping · Full OEM/ODM customization.";
  const primaryCta = hero?.primaryCta ?? { label: "Get a Quote", href: "/contact" };
  const secondaryCta = hero?.secondaryCta ?? { label: "View Products", href: "/products" };

  const [active, setActive] = useState(false);
  const { messages, input, setInput, typing, send } = useMiaChat("hero_concierge");

  // Respect prefers-reduced-motion: don't autoplay the clerk video; show its poster.
  const reduceMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion) v.pause();
    else void v.play().catch(() => {});
  }, [reduceMotion]);

  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-white">
      {/* ===== full-bleed flowing brand copy ===== */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 flex flex-col justify-around overflow-hidden py-4 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const text = MARQUEE_PHRASES[i % MARQUEE_PHRASES.length];
          const left = i % 2 === 0;
          return (
            <div
              key={i}
              className={`flex w-max whitespace-nowrap ${left ? "marquee-track" : "marquee-track-rev"}`}
              style={{ animationDuration: `${24 + (i % 4) * 5}s` }}
            >
              {/* duplicated twice for a seamless loop */}
              {[0, 1].map((g) => (
                <span
                  key={g}
                  className="px-8 text-2xl font-semibold tracking-tight text-ink/[0.13] sm:text-3xl lg:text-4xl"
                >
                  {`${text}   ·   `.repeat(3)}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      {/* soft brand wash behind the figure */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/30 blur-[120px]" />

      <div className="container w-full">
        <div
          className={`mx-auto grid items-center justify-items-center gap-8 transition-all duration-700 ease-out lg:gap-12 ${
            active ? "lg:max-w-6xl lg:grid-cols-[22rem_30rem]" : "lg:max-w-[22rem] lg:grid-cols-[22rem_0rem]"
          }`}
        >
          {/* ===== Digital clerk (hover / tap to activate) ===== */}
          <button
            type="button"
            aria-label={`Talk to ${CLERK_NAME}, your bag concierge`}
            aria-expanded={active}
            onMouseEnter={() => setActive(true)}
            onClick={() => setActive(true)}
            onFocus={() => setActive(true)}
            className={`group relative block w-72 cursor-pointer text-left outline-none transition-transform duration-500 ${
              active ? "" : "hover:scale-[1.02]"
            }`}
          >
            {/* soft glow */}
            <div className="absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/40 blur-3xl" />

            {/* figure */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                style={{
                  WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                }}
                poster={CLERK_POSTER}
                autoPlay={!reduceMotion}
                muted
                loop
                playsInline
                aria-label={`${CLERK_NAME}, digital bag concierge`}
              >
                <source src="/digital-clerk.mp4" type="video/mp4" />
              </video>
            </div>

            {/* projection light cone */}
            <div
              className="absolute -bottom-5 left-1/2 -z-10 h-24 w-3/4 -translate-x-1/2 bg-gradient-to-t from-brand-400/40 to-transparent blur-2xl"
              style={{ clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0% 100%)" }}
            />

            {/* floating particles */}
            <span className="absolute left-1 top-1/3 h-2 w-2 animate-float rounded-full bg-brand-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
            <span className="absolute right-2 bottom-1/3 h-2.5 w-2.5 animate-float rounded-full bg-brand-300 shadow-[0_0_10px_2px_rgba(110,231,183,0.6)] [animation-delay:0.8s]" />

            {/* identity + invite hint (hidden once active) */}
            <div className={`mt-6 text-center transition-opacity duration-300 ${active ? "opacity-0" : "opacity-100"}`}>
              <div className="flex items-center justify-center gap-2 text-brand-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.35em]">Online</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-ink">{CLERK_NAME}</p>
              <p className="mt-1 animate-pulse text-xs text-ink-muted">Hover or tap to chat →</p>
            </div>
          </button>

          {/* ===== Chat console (revealed on activate) ===== */}
          <div
            className={`w-full overflow-hidden transition-all duration-700 ease-out ${
              active
                ? "max-h-[80vh] translate-y-0 opacity-100 lg:w-[30rem]"
                : "pointer-events-none max-h-0 translate-y-4 opacity-0 lg:max-h-[80vh]"
            }`}
          >
            <div className="card overflow-hidden shadow-xl">
              {/* header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-brand-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={CLERK_POSTER} alt={CLERK_NAME} className="h-full w-full object-cover" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-ink">{CLERK_NAME}</p>
                  <p className="flex items-center gap-1 text-[11px] text-brand-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Online · replies instantly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(false)}
                  aria-label="Close chat"
                  className="ml-auto grid h-7 w-7 place-items-center rounded-full text-ink-muted transition hover:bg-slate-100 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* brand intro */}
              <div className="border-b border-slate-100 px-4 py-4">
                <h1 className="text-xl font-bold leading-snug text-ink">{slogan}</h1>
                <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CtaLink
                    href={primaryCta.href}
                    event={{ button_text: primaryCta.label, position: "hero_primary" }}
                    className="btn-primary px-4 py-2 text-xs"
                  >
                    {primaryCta.label} <ArrowRight className="h-3.5 w-3.5" />
                  </CtaLink>
                  <CtaLink
                    href={secondaryCta.href}
                    event={{ button_text: secondaryCta.label, position: "hero_secondary" }}
                    className="btn-secondary px-4 py-2 text-xs"
                  >
                    {secondaryCta.label}
                  </CtaLink>
                </div>
              </div>

              {/* thread */}
              <MiaThread messages={messages} typing={typing} className="max-h-48 px-4 py-4" />

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
                  placeholder={`Message ${CLERK_NAME}…`}
                  aria-label="Chat with the bag concierge"
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

              {/* WhatsApp funnel */}
              <div className="border-t border-slate-100 px-3 py-2.5">
                <a
                  href={whatsappUrl(`Hi Minty! I just chatted with ${CLERK_NAME} on your homepage.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { button_location: "hero_concierge" })}
                  className="block rounded-full border border-[#25D366] px-3 py-2 text-center text-xs font-semibold text-[#1ebe5b] transition hover:bg-[#25D366]/10"
                >
                  Continue on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
