"use client";

import { usePathname } from "next/navigation";
import { whatsappUrl } from "@/lib/constants";
import { trackEvent } from "@/lib/track";

/**
 * Global floating WhatsApp button (§2.7).
 * Per spec: a WhatsApp click fires a `whatsapp_click` event but does NOT create
 * an inquiry record (the user leaves the site).
 */
export function WhatsAppButton() {
  const pathname = usePathname();

  const handleClick = () => {
    trackEvent("whatsapp_click", { button_location: "float", page_path: pathname });
  };

  return (
    <a
      href={whatsappUrl(`Hi Minty! I'm interested in custom bags. (from ${pathname})`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5b]"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M16.04 4C9.4 4 4 9.4 4 16.04c0 2.12.56 4.18 1.6 6L4 28l6.1-1.6a12 12 0 0 0 5.94 1.52h.01c6.64 0 12.04-5.4 12.04-12.04C28.09 9.4 22.69 4 16.04 4Zm0 21.92h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.62.95.96-3.53-.24-.36a9.86 9.86 0 0 1-1.51-5.25c0-5.46 4.45-9.9 9.92-9.9 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.9 7.01c0 5.46-4.44 9.9-9.93 9.9Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="hidden sm:inline">Chat</span>
    </a>
  );
}
