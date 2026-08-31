import { ok, methodNotAllowed } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/promotions — active promotions.
 * No promotions engine yet, so this returns an empty list (200) rather than a
 * 501, so any consumer degrades gracefully.
 */
export async function GET() {
  return ok({ items: [] });
}

// Wrong-method requests get the { code, message, data } envelope, not an empty 405.
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
