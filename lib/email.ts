// Email service for Strata.
//
// If RESEND_API_KEY is set, this sends real transactional email via Resend.
// If not set, it logs the email to the server console — perfect for local dev
// and for a Vercel deploy that hasn't been configured with an email provider yet.
//
// Get a free API key at https://resend.com and add it as an env var.

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Strata <onboarding@resend.dev>";

export async function sendEmail({ to, subject, text, html }: SendEmailArgs): Promise<{ delivered: boolean; via: "resend" | "console" }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.log(
      `\n[email:console]\n  to:      ${to}\n  from:    ${FROM_ADDRESS}\n  subject: ${subject}\n  body:    ${text.replace(/\n/g, "\n           ")}\n`
    );
    return { delivered: true, via: "console" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to,
        subject,
        text,
        html: html ?? `<pre style="font-family: system-ui, sans-serif">${escapeHtml(text)}</pre>`,
      }),
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`[email:resend] failed ${res.status}: ${await res.text()}`);
      return { delivered: false, via: "resend" };
    }
    return { delivered: true, via: "resend" };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[email:resend] error", err);
    return { delivered: false, via: "resend" };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
