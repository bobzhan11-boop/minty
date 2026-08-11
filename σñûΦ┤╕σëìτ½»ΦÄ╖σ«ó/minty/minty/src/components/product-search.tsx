"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { trackEvent } from "@/lib/track";

/** Visible catalog search box. Submits to /products?q=… (preserving category). */
export function ProductSearch({
  initialQuery,
  category,
}: {
  initialQuery: string;
  category?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function go(q: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    if (q.trim()) trackEvent("search", { search_term: q.trim(), position: "catalog" });
    router.push(qs ? `/products?${qs}` : "/products");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
      role="search"
      className="flex w-full max-w-xl items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search bags — e.g. backpack, crossbody, pink, kids…"
          aria-label="Search bags"
          className="field w-full pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              go("");
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button type="submit" className="btn-primary shrink-0">Search</button>
    </form>
  );
}
