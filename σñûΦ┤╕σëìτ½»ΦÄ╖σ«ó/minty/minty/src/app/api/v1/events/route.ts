import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { trackEventSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

/**
 * POST /api/v1/events — self-hosted event log (§3.4.1).
 * Accepts both fetch JSON and sendBeacon Blob payloads. Best-effort: returns 200
 * even on minor issues so analytics never disrupts the client.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  // Generous limit — events are high-volume but we still cap abuse.
  const rl = rateLimit(`events:${ip}`, 300, 60 * 1000);
  if (!rl.ok) return fail(429, "Rate limit exceeded");

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const parsed = trackEventSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Validation failed", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  try {
    await prisma.trackingEvent.create({
      data: {
        eventName: d.eventName,
        params: JSON.stringify(d.params ?? {}),
        sessionId: d.sessionId ?? null,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") ?? null,
        referrer: d.referrer ?? null,
      },
    });
  } catch (err) {
    // Swallow — never surface analytics failures to the client.
    console.error("[events] write failed", err);
  }

  return ok({ received: true });
}
