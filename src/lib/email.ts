import { Resend } from "resend";

// Constructed lazily (not at module load) so this file can be imported
// during Next's build-time page-data collection, before env vars like
// RESEND_API_KEY are necessarily present.
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface ReceiptEmailParams {
  to: string;
  name: string | null;
  courseTitle: string;
  amountPaise: number;
  paymentId: string;
  orderId: string;
}

export async function sendReceiptEmail({
  to,
  name,
  courseTitle,
  amountPaise,
  paymentId,
  orderId,
}: ReceiptEmailParams) {
  const amountInr = (amountPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const html = `
  <div style="background:#0B0E14;padding:32px 16px;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#121620;border:1px solid #1E2433;border-radius:16px;padding:32px;color:#F5F5F7;">
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;">
        Indian <span style="color:#10B981;">Nifty</span> Trader
      </h1>
      <p style="margin:0 0 24px;color:#9CA3AF;font-size:13px;">Payment receipt</p>

      <p style="font-size:15px;">Hi ${name ?? "there"},</p>
      <p style="font-size:15px;line-height:1.6;">
        Thanks for enrolling! Your payment has been confirmed and you now have
        access to <strong style="color:#10B981;">${courseTitle}</strong>.
      </p>

      <table style="width:100%;margin-top:24px;border-collapse:collapse;font-size:13px;">
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;border-top:1px solid #1E2433;">Course</td>
          <td style="padding:8px 0;text-align:right;border-top:1px solid #1E2433;">${courseTitle}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;border-top:1px solid #1E2433;">Amount paid</td>
          <td style="padding:8px 0;text-align:right;border-top:1px solid #1E2433;font-weight:700;color:#10B981;">${amountInr}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;border-top:1px solid #1E2433;">Order ID</td>
          <td style="padding:8px 0;text-align:right;border-top:1px solid #1E2433;font-family:monospace;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9CA3AF;border-top:1px solid #1E2433;">Payment ID</td>
          <td style="padding:8px 0;text-align:right;border-top:1px solid #1E2433;font-family:monospace;">${paymentId}</td>
        </tr>
      </table>

      <p style="margin-top:24px;font-size:12px;color:#6B7280;">
        Questions about this order? Just reply to this email.
      </p>
    </div>
  </div>`;

  return getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Receipt: ${courseTitle} enrollment confirmed`,
    html,
  });
}
