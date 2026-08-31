// Inquiry email notification (§3.4 / M2).
// Delivery priority: SMTP (nodemailer — works without a domain, e.g. QQ Mail) ->
// Resend REST API -> console log fallback (so the flow stays functional locally).
import nodemailer from "nodemailer";

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

  if (!to) {
    console.info(`[email:fallback] ${subject}\n${text}`);
    return;
  }

  // 1) SMTP (QQ Mail / any SMTP host) — works without owning a domain.
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const port = Number(SMTP_PORT) || 465;
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465, // 465 = implicit TLS (QQ), 587 = STARTTLS
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: SMTP_FROM || `Minty Inquiries <${SMTP_USER}>`,
        to,
        subject,
        text,
        replyTo: data.email || undefined, // reply goes straight to the customer
      });
      return;
    } catch (err) {
      console.error("[email] SMTP send error", err);
      // fall through to Resend / console
    }
  }

  // 2) Resend REST API.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
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
      return;
    } catch (err) {
      console.error("[email] Resend send error", err);
    }
  }

  // 3) Local/dev fallback — keep the flow observable.
  console.info(`[email:fallback] ${subject}\n${text}`);
}
