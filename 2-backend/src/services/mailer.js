/**
 * mailer.js — Nodemailer transporter + two email helpers:
 *   sendNewMessageNotification  →  email to Loaiy when contact form fires
 *   sendAutoReply               →  confirmation email to the sender
 *
 * Required env vars (add to .env + Render dashboard):
 *   MAIL_USER     Gmail address to send FROM  (e.g. loaiy.adel@gmail.com)
 *   MAIL_PASS     Google App Password (16 chars, NOT your login password)
 *   NOTIFY_EMAIL  Where to send new-message alerts (defaults to MAIL_USER)
 */
const nodemailer = require('nodemailer');

// ── Transporter ──────────────────────────────────────────────────────────────
// Created lazily so the server still boots if env vars are missing,
// but emails will gracefully log a warning instead of crashing.
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return null;           // missing config — emails will be skipped
    }
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return _transporter;
}

// ── Helper: format Cairo time ─────────────────────────────────────────────────
function cairoTime(date) {
  return new Date(date || Date.now()).toLocaleString('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
  }) + ' (Cairo)';
}

// ── 1. Notification to Loaiy ─────────────────────────────────────────────────
async function sendNewMessageNotification({ name, email, subject, body, createdAt }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('⚠️  MAIL_USER / MAIL_PASS not set — skipping notification email');
    return;
  }

  const to      = process.env.NOTIFY_EMAIL || process.env.MAIL_USER;
  const dateStr = cairoTime(createdAt);
  const subj    = subject || '(no subject)';

  await transport.sendMail({
    from:    `"CV Contact Bot" <${process.env.MAIL_USER}>`,
    to,
    subject: `📬 New CV message: ${subj}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0">

    <!-- Header -->
    <div style="background:#0272c0;padding:20px 28px">
      <h2 style="color:#fff;margin:0;font-size:18px;font-weight:700">📬 New message from your CV</h2>
    </div>

    <!-- Details table -->
    <div style="padding:24px 28px 8px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:9px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;width:90px">From</td>
          <td style="padding:9px 0;color:#0f172a;font-size:15px;font-weight:600">${name}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:9px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Email</td>
          <td style="padding:9px 0"><a href="mailto:${email}" style="color:#0272c0;text-decoration:none;font-size:15px">${email}</a></td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:9px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Subject</td>
          <td style="padding:9px 0;color:#0f172a;font-size:15px">${subj}</td>
        </tr>
        <tr style="border-top:1px solid #f1f5f9">
          <td style="padding:9px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.04em">Received</td>
          <td style="padding:9px 0;color:#0f172a;font-size:13px">${dateStr}</td>
        </tr>
      </table>
    </div>

    <!-- Message body -->
    <div style="padding:4px 28px 28px">
      <div style="border-top:1px solid #e2e8f0;padding-top:20px">
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Message</p>
        <p style="margin:0;color:#1e293b;font-size:15px;line-height:1.75;white-space:pre-wrap">${body}</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="background:#f8fafc;padding:18px 28px;text-align:center;border-top:1px solid #e2e8f0">
      <a href="https://loaiy-cv-api.onrender.com/admin" style="display:inline-block;background:#0272c0;color:#fff;text-decoration:none;padding:11px 26px;border-radius:7px;font-size:14px;font-weight:600">Open Admin Panel →</a>
    </div>

  </div>
</body>
</html>`,
    text: `New CV message\n\nFrom:     ${name}\nEmail:    ${email}\nSubject:  ${subj}\nReceived: ${dateStr}\n\n---\n\n${body}\n\n---\nOpen admin: https://loaiy-cv-api.onrender.com/admin`,
  });

  console.log(`📧 Notification sent to ${to} for message from ${email}`);
}

// ── 2. Auto-reply to the sender ───────────────────────────────────────────────
async function sendAutoReply({ name, email, subject }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('⚠️  MAIL_USER / MAIL_PASS not set — skipping auto-reply');
    return;
  }

  const subj = subject || 'Your message';

  await transport.sendMail({
    from:    `"Loaiy Adel" <${process.env.MAIL_USER}>`,
    to:      email,
    replyTo: process.env.MAIL_USER,
    subject: `Re: ${subj}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0">

    <!-- Dark header -->
    <div style="background:#0c1a2e;padding:26px 28px">
      <h1 style="margin:0 0 4px;color:#fff;font-size:22px;font-weight:800">Loaiy Adel</h1>
      <p style="margin:0;color:#94a3b8;font-size:13px">Senior Scrum Master · Agile Coach · Transformation Consultant</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px;background:#fff">
      <p style="margin:0 0 18px;color:#1e293b;font-size:15px;line-height:1.75">Hi <strong>${name}</strong>,</p>

      <p style="margin:0 0 18px;color:#1e293b;font-size:15px;line-height:1.75">
        Thank you for getting in touch! Your message has been received and I'll
        get back to you personally within <strong>1–2 business days</strong>.
      </p>

      <p style="margin:0 0 28px;color:#1e293b;font-size:15px;line-height:1.75">
        In the meantime, feel free to connect with me on LinkedIn — I'm always
        happy to discuss Agile transformations, Scrum coaching, and delivery leadership opportunities.
      </p>

      <!-- LinkedIn CTA -->
      <div style="text-align:center;margin-bottom:32px">
        <a href="https://www.linkedin.com/in/loaiy-adel/"
           style="display:inline-block;background:#0272c0;color:#fff;text-decoration:none;padding:13px 30px;border-radius:7px;font-size:14px;font-weight:700">
          Connect on LinkedIn
        </a>
      </div>

      <p style="margin:0 0 6px;color:#1e293b;font-size:15px;line-height:1.75">
        Warm regards,<br>
        <strong>Loaiy Adel</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0">
      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
        Senior Scrum Master · Agile Coach · Transformation Consultant<br>
        Cairo, Egypt &nbsp;·&nbsp;
        <a href="mailto:loaiy.adel@gmail.com" style="color:#0272c0;text-decoration:none">loaiy.adel@gmail.com</a> &nbsp;·&nbsp;
        <a href="https://www.linkedin.com/in/loaiy-adel/" style="color:#0272c0;text-decoration:none">linkedin.com/in/loaiy-adel</a>
      </p>
    </div>

  </div>
</body>
</html>`,
    text: `Hi ${name},\n\nThank you for getting in touch! Your message has been received and I'll get back to you personally within 1–2 business days.\n\nFeel free to connect with me on LinkedIn:\nhttps://www.linkedin.com/in/loaiy-adel/\n\nWarm regards,\nLoaiy Adel\nSenior Scrum Master · Agile Coach · Transformation Consultant\nCairo, Egypt`,
  });

  console.log(`📧 Auto-reply sent to ${email}`);
}

module.exports = { sendNewMessageNotification, sendAutoReply };
