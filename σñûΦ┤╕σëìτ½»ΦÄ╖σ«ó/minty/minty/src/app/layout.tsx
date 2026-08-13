import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { MiaWidget } from "@/components/mia-widget";
import { Analytics } from "@/components/analytics";
import { PageViewTracker } from "@/components/page-view-tracker";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  // NOTE: no site-wide `alternates.canonical` here — a static value would make every
  // page canonicalize to the homepage. Each route sets its own self-referential canonical.
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: "/products/HJ-BW100001.jpg", width: 800, height: 800, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/products/HJ-BW100001.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Analytics />
        <PageViewTracker />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MiaWidget />
      </body>
    </html>
  );
}
