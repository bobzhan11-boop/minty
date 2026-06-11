"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send, X } from "lucide-react";
import { CtaLink } from "@/components/cta-link";
import { whatsappUrl } from "@/lib/constants";
import { trackEvent } from "@/lib/track";

/** Hero data shape (mirrors the `hero` home-module in the DB). */
export interface HeroData {
  slogan: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  bgImage: string;
}

interface ChatMessage {
  from: "clerk" | "user";
  text: string;
}

const CLERK_NAME = "Mia";

/** Poster shown until the digital-human loop (/digital-clerk.mp4) plays — a frame from the video. */
const CLERK_POSTER = "/digital-clerk-poster.jpg";

const WELCOME = `Hi! I'm ${CLERK_NAME}, your apparel concierge. 👋 Ask me anything — pricing, MOQ, samples or shipping.`;

const QUICK_REPLIES = [
  "MOQ & pricing",
  "Custom POD options",
  "Request a sample",
  "Shipping & lead time",
];

/** Readable one-line intro sentences that flow behind the figure (full-bleed). */
const MARQUEE_PHRASES = [
  "Minty Apparel — your factory-direct custom apparel partner",
  "Premium Print-On-Demand · tees, hoodies, caps & activewear",
  "Flexible MOQ · worldwide shipping · full customization",
  "DTG · screen print · embroidery · private label",
  "From first sample to six-figure production runs",
  "Send your specs — get a quote within 6 hours",
];

/** Lightweight keyword-matched canned replies — front-end only, no backend AI. */
function getReply(input: string): string {
  const t = input.toLowerCase();
  if (/(price|pricing|cost|quote|quotation)/.test(t))
    return "Pricing depends on the style, fabric and quantity. Tell me the product and your target quantity — or tap “Get a Quote” and our team replies within 6 hours.";
  if (/(moq|minimum|how many|quantity)/.test(t))
    return "Our MOQ is flexible — as low as 50 pcs for many blanks, with better tiers as volume grows. Which style are you looking at?";
  if (/(sample|prototype|proof)/.test(t))
    return "Yes — we make pre-production samples so you approve fit and print before bulk. Share your design or a reference and we'll sample it.";
  if (/(ship|shipping|delivery|lead time|how long)/.test(t))
    return "We ship worldwide with DDP options. Typical lead time is 12–20 days after sample approval.";
  if (/(pod|print|custom|design|embroider|dtg|logo)/.test(t))
    return "We're a Print-On-Demand factory — DTG, screen print, embroidery and more. Upload your artwork on the quote form and we'll handle production end to end.";
  if (/(hoodie|t-?shirt|tee|cap|hat|activewear|apparel|clothing)/.test(t))
    return "Great choice — we produce that in-house with full customization. Want a quick quote, or to browse the catalog first?";
  if (/(hi|hello|hey|good (morning|afternoon|evening))/.test(t))
    return `Hi there! 😊 How can I help with your custom apparel today — pricing, MOQ, samples or shipping?`;
  return "Got it! I'll pass this to our team. For the fastest response, tap “Get a Quote” or chat on WhatsApp — we usually reply within 6 hours.";
}

export function HeroConcierge({ hero }: { hero: HeroData | null }) {
  const slogan = hero?.slogan ?? "Custom Apparel, Factory-Direct";
  const subtitle =
    hero?.subtitle ??
    "Premium Print-On-Demand manufacturing for global brands. Flexible MOQ · Worldwide shipping · Full customization.";
  const primaryCta = hero?.primaryCta ?? { label: "Get a Quote", href: "/contact" };
  const secondaryCta = hero?.secondaryCta ?? { label: "View Products", href: "/products" };

  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: "clerk", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  // Keep the chat thread scrolled to the latest message.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const value = text.trim();
    if (!value || typing) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text: value }]);
    trackEvent("cta_click", { button_text: "concierge_send", position: "hero_concierge" });
    setTyping(true);
    const reply = getReply(value);
    window.setTimeout(() => {
      setMessages((m) => [...m, { from: "clerk", text: reply }]);
      setTyping(false);
    }, 750);
  }

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
          <div
            role="button"
            tabIndex={0}
            aria-label={`Talk to ${CLERK_NAME}, your apparel concierge`}
            aria-expanded={active}
            onMouseEnter={() => setActive(true)}
            onClick={() => setActive(true)}
            onFocus={() => setActive(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActive(true);
            }}
            className={`group relative w-72 cursor-pointer outline-none transition-transform duration-500 ${
              active ? "" : "hover:scale-[1.02]"
            }`}
          >
            {/* soft glow */}
            <div className="absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-300/40 blur-3xl" />

            {/* figure */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
              <video
                className="h-full w-full object-cover"
                style={{
                  WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                }}
                poster={CLERK_POSTER}
                autoPlay
                muted
                loop
                playsInline
                aria-label={`${CLERK_NAME}, digital apparel concierge`}
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
          </div>

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
              <div ref={threadRef} className="max-h-48 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                    <p
                      className={
                        m.from === "user"
                          ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-sm text-white"
                          : "max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2 text-sm text-ink"
                      }
                    >
                      {m.text}
                    </p>
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
                  aria-label="Chat with the apparel concierge"
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
