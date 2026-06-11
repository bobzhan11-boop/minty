import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safe JSON parse that returns a fallback instead of throwing. */
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Format a price tier list like "From $4.20". */
export function fromPrice(tiers: { qty: number; price: number }[] | null): string {
  if (!tiers || tiers.length === 0) return "Contact for pricing";
  const min = Math.min(...tiers.map((t) => t.price));
  return `From $${min.toFixed(2)}`;
}
