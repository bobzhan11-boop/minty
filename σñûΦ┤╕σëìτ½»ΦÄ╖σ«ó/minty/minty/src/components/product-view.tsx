"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/track";

interface Props {
  productId: number;
  productName: string;
  category: string;
  images: { url: string; alt: string }[];
  primaryUrl: string;
}

/** Image gallery (thumbnails + arrows + keyboard + zoom lightbox); emits `product_view`. */
export function ProductView({ productId, productName, category, images, primaryUrl }: Props) {
  const initial = images.findIndex((i) => i.url === primaryUrl);
  const [idx, setIdx] = useState(initial < 0 ? 0 : initial);
  const [zoom, setZoom] = useState(false);
  const count = images.length;

  useEffect(() => {
    trackEvent("product_view", { product_id: productId, product_name: productName, category });
  }, [productId, productName, category]);

  const go = useCallback((delta: number) => setIdx((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") setZoom(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (!zoom) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  if (count === 0) return null;
  const active = images[idx] ?? images[0];

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
      {/* Thumbnails: below on mobile, left rail on desktop */}
      {count > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:max-h-[32rem] sm:flex-col sm:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`View image ${i + 1} of ${count}`}
              aria-current={i === idx}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition sm:h-20 sm:w-20",
                i === idx ? "border-brand-600" : "border-transparent hover:border-slate-300",
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="order-1 sm:order-2">
        <div className="group relative aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
          <Image
            src={active.url}
            alt={active.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="cursor-zoom-in object-contain"
            onClick={() => setZoom(true)}
          />
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Zoom image"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink-soft opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {count > 1 && (
            <>
              <GalleryArrow dir="left" onClick={() => go(-1)} />
              <GalleryArrow dir="right" onClick={() => go(1)} />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                {idx + 1} / {count}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} — enlarged image ${idx + 1} of ${count}`}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={active.url} alt={active.alt} fill sizes="90vw" className="object-contain" />
            {count > 1 && (
              <>
                <GalleryArrow dir="left" onClick={() => go(-1)} light />
                <GalleryArrow dir="right" onClick={() => go(1)} light />
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white">
                  {idx + 1} / {count}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  dir,
  onClick,
  light,
}: {
  dir: "left" | "right";
  onClick: () => void;
  light?: boolean;
}) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={dir === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full transition",
        dir === "left" ? "left-3" : "right-3",
        light ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/85 text-ink-soft shadow-sm hover:bg-white",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
