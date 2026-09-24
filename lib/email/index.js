import nodemailer from 'nodemailer';

/**
 * Nodemailer transport built only from server-side environment variables.
 * SMTP_PASS is never imported by browser code.
 */
function getTransporter() {
  if (!globalThis.__sscMailer) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env.local.');
    }
    globalThis.__sscMailer = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_SECURE) === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return globalThis.__sscMailer;
}

export async function sendMail({ to, subject, html, text, replyTo }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  return getTransporter().sendMail({
    from: `"Siva Sarvesh Crackers" <${from}>`,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}

/** Sends without throwing - used for notifications that must not break the main flow. */
export async function sendMailSafely(message, label) {
  try {
    await sendMail(message);
    return true;
  } catch (error) {
    console.error(`[email] Failed to send ${label}:`, error.message);
    return false;
  }
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL || process.env.SMTP_USER;
}
