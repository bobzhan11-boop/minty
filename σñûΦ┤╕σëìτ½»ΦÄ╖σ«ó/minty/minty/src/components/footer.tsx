import Link from "next/link";
import { Leaf } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function Footer() {
  const year = 2026; // build-time constant; avoids hydration drift

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            {SITE.name}
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">{SITE.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/about" className="hover:text-brand-700">About & Factory</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-700">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-700">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>{process.env.INQUIRY_NOTIFY_EMAIL ?? "hello@minty.dev"}</li>
            <li><Link href="/contact" className="font-medium text-brand-700 hover:underline">Request a quote →</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <p>Built for global B2B apparel sourcing.</p>
        </div>
      </div>
    </footer>
  );
}
