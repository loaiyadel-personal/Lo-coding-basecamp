/**
 * mailer.js — Resend transactional email service
 *
 * Emails go through Resend's infrastructure (not your personal Gmail).
 * The "from" address is a dedicated sender you configure — completely
 * separate from your personal email account.
 *
 * Required env vars (add to .env + Render dashboard):
 *   RESEND_API_KEY   API key from resend.com (free account, no card needed)
 *   MAIL_FROM        Sending address shown to recipients
 *                    → With your own domain:  noreply@yourdomain.com
 *                    → Without a domain yet:  onboarding@resend.dev  (testing only)
 *   NOTIFY_EMAIL     Where new-message alerts are delivered (your personal email)
 *
 * Setup guide is at the bottom of this file.
 */
const { Resend } = require('resend');

// ── Client ───────────────────────────────────────────────────────────────────
let _resend = null;
function getClient() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null;
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const FROM_ADDR = () =>
  process.env.MAIL_FROM || 'onboarding@resend.dev';

const NOTIFY_TO = () =>
  process.env.NOTIFY_EMAIL || 'loaiy.adel@gmail.com';

function cairoTime(date) {
  return new Date(date || Date.now()).toLocaleString('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' (Cairo time)';
}

// ── 1. New-message notification to Loaiy ─────────────────────────────────────
async function sendNewMessageNotification({ name, email, subject, body, createdAt }) {
  const client = getClient();
  if (!client) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping notification email');
    return;
  }

  const subj    = subject || '(no subject)';
  const dateStr = cairoTime(createdAt);

  const { error } = await client.emails.send({
    from:    `CV Contact Bot <${FROM_ADDR()}>`,
    to:      [NOTIFY_TO()],
    subject: `📬 New CV message: ${subj}`,
    reply_to: email,   // reply directly to the sender from your inbox
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:580px;margin:0 auto;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0">

    <div style="background:#0272c0;padding:20px 28px">
      <h2 style="margin:0;color:#fff;font-size:18px;font-weight:700">📬 New message from your CV</h2>
    </div>

    <div style="padding:24px 28px 8px;background:#fff">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;width:90px">From</td>
          <td style="padding:10px 0;color:#0f172a;font-size:15px;font-weight:600">${name}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:10px 0;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Email</td>
          <td style="padding:10px 0"><a href="mailto:${email}" style="color:#0272c0;text-decoration:none;font-size:15px">${email}</a></td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:10px 0;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Subject</td>
          <td style="padding:10px 0;color:#0f172a;font-size:15px">${subj}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:10px 0;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Received</td>
          <td style="padding:10px 0;color:#475569;font-size:13px">${dateStr}</td>
        </tr>
      </table>
    </div>

    <div style="padding:4px 28px 28px;background:#fff">
      <div style="border-top:2px solid #e2e8f0;padding-top:20px">
        <p style="margin:0 0 10px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Message</p>
        <p style="margin:0;color:#1e293b;font-size:15px;line-height:1.8;white-space:pre-wrap">${body}</p>
      </div>
    </div>

    <div style="background:#f8fafc;padding:18px 28px;border-top:1px solid #e2e8f0;text-align:center">
      <a href="https://loaiy-cv-api.onrender.com/admin"
         style="display:inline-block;background:#0272c0;color:#fff;text-decoration:none;padding:11px 26px;border-radius:7px;font-size:14px;font-weight:600">
        Open Admin Panel →
      </a>
    </div>

  </div>
</body>
</html>`,
    text: `New CV message\n\nFrom:     ${name}\nEmail:    ${email}\nSubject:  ${subj}\nReceived: ${dateStr}\n\n---\n\n${body}\n\n---\nAdmin: https://loaiy-cv-api.onrender.com/admin`,
  });

  if (error) throw new Error(`Resend notification error: ${error.message}`);
  console.log(`📧 Notification sent to ${NOTIFY_TO()} for message from ${email}`);
}

// ── 2. Auto-reply to the person who filled in the form ───────────────────────
async function sendAutoReply({ name, email, subject }) {
  const client = getClient();
  if (!client) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping auto-reply');
    return;
  }

  const { error } = await client.emails.send({
    from:     `Loaiy Adel <${FROM_ADDR()}>`,
    to:       [email],
    reply_to: 'loaiy.adel@gmail.com',   // replies land in Loaiy's inbox
    subject:  `Re: ${subject || 'Your message'}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0">

    <!-- Dark branded header -->
    <div style="background:#0c1a2e;padding:28px">
      <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800;letter-spacing:-.01em">Loaiy Adel</h1>
      <p style="margin:0;color:#94a3b8;font-size:13px">Senior Scrum Master · Agile Coach · Transformation Consultant</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;background:#fff">
      <p style="margin:0 0 20px;color:#1e293b;font-size:15px;line-height:1.8">Hi <strong>${name}</strong>,</p>

      <p style="margin:0 0 20px;color:#1e293b;font-size:15px;line-height:1.8">
        Thank you for reaching out! Your message has been received and I'll reply
        to you personally within <strong>1–2 business days</strong>.
      </p>

      <p style="margin:0 0 32px;color:#1e293b;font-size:15px;line-height:1.8">
        In the meantime, feel free to connect with me on LinkedIn — I'm always happy
        to discuss Agile transformations, Scrum coaching, and delivery leadership opportunities.
      </p>

      <div style="text-align:center;margin-bottom:32px">
        <a href="https://www.linkedin.com/in/loaiy-adel/"
           style="display:inline-block;background:#0272c0;color:#fff;text-decoration:none;
                  padding:13px 30px;border-radius:7px;font-size:14px;font-weight:700">
          Connect on LinkedIn
        </a>
      </div>

      <p style="margin:0;color:#1e293b;font-size:15px;line-height:1.8">
        Warm regards,<br>
        <strong>Loaiy Adel</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7">
        Senior Scrum Master · Agile Coach · Transformation Consultant · Cairo, Egypt<br>
        <a href="mailto:loaiy.adel@gmail.com" style="color:#0272c0;text-decoration:none">loaiy.adel@gmail.com</a>
        &nbsp;·&nbsp;
        <a href="https://www.linkedin.com/in/loaiy-adel/" style="color:#0272c0;text-decoration:none">linkedin.com/in/loaiy-adel</a>
      </p>
    </div>

  </div>
</body>
</html>`,
    text: `Hi ${name},\n\nThank you for reaching out! Your message has been received and I'll reply to you personally within 1–2 business days.\n\nFeel free to connect on LinkedIn:\nhttps://www.linkedin.com/in/loaiy-adel/\n\nWarm regards,\nLoaiy Adel\nSenior Scrum Master · Agile Coach · Transformation Consultant`,
  });

  if (error) throw new Error(`Resend auto-reply error: ${error.message}`);
  console.log(`📧 Auto-reply sent to ${email}`);
}

module.exports = { sendNewMessageNotification, sendAutoReply };

/*
 * ══════════════════════════════════════════════════════════════
 *  SETUP GUIDE — one-time, takes about 5 minutes
 * ══════════════════════════════════════════════════════════════
 *
 *  1. Create a FREE Resend account at https://resend.com
 *     (no credit card required)
 *
 *  2. Go to API Keys → Create API Key → copy it
 *     Add to Render env vars:  RESEND_API_KEY = re_xxxxxxxxxxxx
 *
 *  3. MAIL_FROM — choose one:
 *
 *     A) You own a domain (loaiyadel.com etc.)
 *        → Resend dashboard → Domains → Add Domain → follow DNS steps (5 min)
 *        → Set MAIL_FROM = noreply@yourdomain.com
 *        → Emails will show "Loaiy Adel <noreply@yourdomain.com>"
 *
 *     B) No domain yet
 *        → Set MAIL_FROM = onboarding@resend.dev
 *        → This works for testing; to send to real visitors you'll need option A
 *        → Domains start from ~$10/yr at Cloudflare, Namecheap, etc.
 *
 *  4. Add to Render dashboard (Environment tab):
 *       RESEND_API_KEY   re_your_key_here
 *       MAIL_FROM        noreply@yourdomain.com   (or onboarding@resend.dev)
 *       NOTIFY_EMAIL     loaiy.adel@gmail.com     (where YOU get notified)
 *
 * ══════════════════════════════════════════════════════════════
 */
