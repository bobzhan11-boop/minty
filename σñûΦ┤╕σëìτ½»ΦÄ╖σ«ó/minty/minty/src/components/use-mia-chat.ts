"use client";

import { useCallback, useState } from "react";
import { trackEvent } from "@/lib/track";
import {
  WELCOME,
  getReply,
  looksSearchable,
  searchProducts,
  searchReply,
  type ChatMessage,
} from "@/lib/mia";

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/**
 * Shared chat state + send logic for Mia. On every user message Mia first tries
 * her product-search skill; if nothing matches she falls back to a canned reply.
 *
 * @param position  analytics label for where the chat lives (e.g. "hero_concierge").
 */
export function useMiaChat(position: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: "clerk", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || typing) return;
      setInput("");
      setMessages((m) => [...m, { from: "user", text: value }]);
      trackEvent("cta_click", { button_text: "concierge_send", position });
      setTyping(true);

      let reply: ChatMessage;
      if (looksSearchable(value)) {
        const hits = await searchProducts(value);
        if (hits.length) {
          trackEvent("search", { search_term: value, results: hits.length, position });
          reply = { from: "clerk", text: searchReply(value, hits.length), products: hits };
        } else {
          await wait(400);
          reply = { from: "clerk", text: getReply(value) };
        }
      } else {
        await wait(500);
        reply = { from: "clerk", text: getReply(value) };
      }

      setMessages((m) => [...m, reply]);
      setTyping(false);
    },
    [typing, position],
  );

  return { messages, input, setInput, typing, send };
}
