import { z } from "zod";

/** Inquiry submission payload — mirrors the Contact form fields in the spec (§2.7). */
export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  interestedProducts: z.array(z.string().max(80)).max(20).optional().default([]),
  estimatedQuantity: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  productId: z.number().int().positive().optional(),
  // Attribution
  sourcePage: z.string().max(300).optional().or(z.literal("")),
  utmSource: z.string().max(120).optional().or(z.literal("")),
  utmMedium: z.string().max(120).optional().or(z.literal("")),
  utmCampaign: z.string().max(120).optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Tracking event payload — POST /api/v1/events (§3.4.1). */
export const trackEventSchema = z.object({
  eventName: z.string().min(1).max(80),
  params: z.record(z.any()).optional().default({}),
  sessionId: z.string().max(120).optional(),
  referrer: z.string().max(500).optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
