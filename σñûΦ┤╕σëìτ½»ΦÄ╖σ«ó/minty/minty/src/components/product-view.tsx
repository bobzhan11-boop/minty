"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/track";

interface Props {
  productId: number;
  productName: string;
  category: string;
  images: { url: string; alt: string }[];
  primaryUrl: string;
}

/** Image gallery + emits `product_view` on mount (§3.4.1). */
export function ProductView({ productId, productName, category, images, primaryUrl }: Props) {
  const [active, setActive] = useState(primaryUrl || images[0]?.url || "");

  useEffect(() => {
    trackEvent("product_view", { product_id: productId, product_name: productName, category });
  }, [productId, productName, category]);

  if (images.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        {active && (
          <Image src={active} alt={productName} fill priority sizes="(max-width:768px) 100vw, 60vw" className="object-cover" />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {images.map((img) => (
            <button
              key={img.url}
              onClick={() => setActive(img.url)}
              className={cn(
                "relative h-20 w-20 overflow-hidden rounded-lg border-2 transition",
                active === img.url ? "border-brand-600" : "border-transparent hover:border-slate-300",
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
