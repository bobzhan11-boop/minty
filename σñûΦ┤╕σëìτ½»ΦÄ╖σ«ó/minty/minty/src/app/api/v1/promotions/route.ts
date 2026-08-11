import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/promotions — active promotions.
 * No promotions engine yet, so this returns an empty list (200) rather than a
 * 501, so any consumer degrades gracefully.
 */
export async function GET() {
  return ok({ items: [] });
}
