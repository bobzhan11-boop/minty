import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, methodNotAllowed } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(200),
});

/**
 * POST /api/v1/newsletter/subscribe — validate + accept a newsletter signup.
 * There is no ESP integration yet, so we validate and acknowledge (200) without
 * persistence rather than returning 501. Wire a provider (Mailchimp, etc.) here.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(400, parsed.error.issues[0]?.message ?? "Invalid email");
  }
  // TODO: forward parsed.data.email to the email provider / store.
  return ok({ subscribed: true, email: parsed.data.email }, "Subscribed");
}

// Wrong-method requests get the { code, message, data } envelope, not an empty 405.
export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
