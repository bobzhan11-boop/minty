import Link from "next/link";
import Image from "next/image";
import { cn, fromPrice } from "@/lib/utils";

export interface ProductCardData {
  slug: string;
  name: string;
  moq: number;
  category: string;
  image: string;
  /** A second angle shown on hover (from the product gallery), if available. */
  hoverImage?: string;
  priceTiers: { qty: number; price: number }[] | null;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={cn(
            "object-cover transition duration-500 group-hover:scale-105",
            p.hoverImage && "group-hover:opacity-0",
          )}
        />
        {p.hoverImage && (
          <Image
            src={p.hoverImage}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-soft shadow-sm">
          {p.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-ink group-hover:text-brand-700">
          {p.name}
        </h3>
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
