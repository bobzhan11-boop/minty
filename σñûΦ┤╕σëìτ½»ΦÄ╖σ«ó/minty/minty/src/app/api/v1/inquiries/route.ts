import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, methodNotAllowed } from "@/lib/api";
import { inquirySchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { notifyNewInquiry } from "@/lib/email";

export const runtime = "nodejs";

/**
 * POST /api/v1/inquiries — submit an inquiry (§5.2).
 * - Validates payload (zod)
 * - Rate limits per IP (§3.6: max 5 / hour)
 * - Upserts a lightweight customer record by email
 * - Persists the inquiry and fires an email notification
 */
export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions / hour / IP
  const ip = clientIp(req.headers);
  const rl = rateLimit(`inquiry:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return fail(429, "Too many submissions. Please try again later.");
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const parsed = inquirySchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Validation failed", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  try {
    // Upsert customer by email (§3.3.1: inquiry submissions feed the CRM).
    const customer = await prisma.customer.upsert({
      where: { email: d.email },
      update: {
        name: d.name || undefined,
        company: d.company || undefined,
        country: d.country || undefined,
        phone: d.phone || undefined,
      },
      create: {
        email: d.email,
        name: d.name,
        company: d.company || null,
        country: d.country || null,
        phone: d.phone || null,
        sourceChannel: d.sourcePage || d.utmSource || "website",
        status: "new",
      },
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        customerId: customer.id,
        productId: d.productId,
        name: d.name,
        email: d.email,
        company: d.company || null,
        country: d.country || null,
        phone: d.phone || null,
        interestedProducts: JSON.stringify(d.interestedProducts ?? []),
        estimatedQuantity: d.estimatedQuantity || null,
        message: d.message || null,
        sourcePage: d.sourcePage || null,
        utmSource: d.utmSource || null,
        utmMedium: d.utmMedium || null,
        utmCampaign: d.utmCampaign || null,
        channel: "form",
        status: "pending",
      },
    });

    // Fire-and-forget email notification (don't block the response).
    void notifyNewInquiry({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      country: inquiry.country,
      message: inquiry.message,
      sourcePage: inquiry.sourcePage,
    });

    return ok({ id: inquiry.id }, "Inquiry received");
  } catch (err) {
    console.error("[inquiries] create failed", err);
    return fail(500, "Failed to save inquiry");
  }
}

// Wrong-method requests get the { code, message, data } envelope, not an empty 405.
export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
