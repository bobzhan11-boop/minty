// Inquiry email notification (§3.4 / M2).
// If RESEND_API_KEY is set, sends via Resend's REST API; otherwise logs to the
// server console so the local flow stays fully functional without a provider.

interface InquiryEmailData {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  country?: string | null;
  message?: string | null;
  sourcePage?: string | null;
}

export async function notifyNewInquiry(data: InquiryEmailData): Promise<void> {
  const to = process.env.INQUIRY_NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  const subject = `New inquiry #${data.id} from ${data.name}`;
  const text = [
    `A new inquiry was submitted.`,
    ``,
    `Name:     ${data.name}`,
    `Email:    ${data.email}`,
    `Company:  ${data.company ?? "-"}`,
    `Country:  ${data.country ?? "-"}`,
    `Source:   ${data.sourcePage ?? "-"}`,
    ``,
    `Message:`,
    data.message ?? "(none)",
  ].join("\n");

  if (!apiKey || !to) {
    // Local/dev fallback — keep the flow observable.
    console.info(`[email:fallback] ${subject}\n${text}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Minty Notifications <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("[email] send error", err);
  }
}
