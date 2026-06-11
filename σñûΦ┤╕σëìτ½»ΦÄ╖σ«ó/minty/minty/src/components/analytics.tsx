import Script from "next/script";

/**
 * GA4 loader (§3.4.1). Renders nothing unless NEXT_PUBLIC_GA4_MEASUREMENT_ID is
 * set, so local dev stays clean while production gets full gtag.js.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
