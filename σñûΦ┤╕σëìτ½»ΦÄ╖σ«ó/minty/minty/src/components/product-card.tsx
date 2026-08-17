"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn, fromPrice } from "@/lib/utils";

export interface ProductCardData {
  slug: string;
  name: string;
  moq: number;
  category: string;
  image: string;
  /** Material family label (e.g. "Genuine Leather"), shown as a badge. */
  material?: string;
  /** All gallery image urls (primary first) — cycled in a loop on hover. */
  images?: string[];
  priceTiers: { qty: number; price: number }[] | null;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const gallery = p.images && p.images.length > 1 ? p.images : null;
  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  const enter = () => {
    if (!gallery) return;
    setHovered(true);
    setIdx(0);
    stop();
    // loop through every photo while the mouse stays over the card
    timer.current = setInterval(() => setIdx((i) => (i + 1) % gallery.length), 750);
  };
  const leave = () => {
    stop();
    setHovered(false);
    setIdx(0);
  };
  useEffect(() => () => stop(), []);

  return (
    <Link
      href={`/products/${p.slug}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {/* primary (always mounted so there's no load flash on hover) */}
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={cn(
            "object-cover transition-opacity duration-500 group-hover:scale-105",
            hovered && idx !== 0 ? "opacity-0" : "opacity-100",
          )}
        />
        {/* remaining gallery frames — mounted on hover, revealed as the loop reaches them */}
        {gallery &&
          hovered &&
          gallery.map((src, i) =>
            i === 0 ? null : (
              <Image
                key={src}
                src={src}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-opacity duration-500 group-hover:scale-105",
                  i === idx ? "opacity-100" : "opacity-0",
                )}
              />
            ),
          )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-soft shadow-sm">
          {p.category}
        </span>
        {p.material && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
            {p.material}
          </span>
        )}
        {/* progress dots when cycling */}
        {gallery && hovered && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {gallery.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition",
                  i === idx ? "bg-white" : "bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-ink group-hover:text-brand-700">{p.name}</h3>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-ink-muted">MOQ {p.moq.toLocaleString()} pcs</span>
          <span className="font-semibold text-brand-700">{fromPrice(p.priceTiers)}</span>
        </div>
        <span className="mt-3 inline-block text-sm font-medium text-brand-600 group-hover:underline">
          Inquire Now →
        </span>
      </div>
    </Link>
  );
}
