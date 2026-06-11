import { fail } from "@/lib/api";

// Reserved for Phase 2 (§3.5) — newsletter subscription (Mailchimp etc.).
export async function POST() {
  return fail(501, "Not Implemented");
}
