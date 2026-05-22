/**
 * mailer.js — Resend transactional email service
 *
 * Required env vars:
 *   RESEND_API_KEY   API key from resend.com
 *   MAIL_FROM        noreply@yourdomain.com  (or onboarding@resend.dev for testing)
 *   NOTIFY_EMAIL     Your personal email for new-message alerts
 */
const { Resend } = require('resend');

let _resend = null;
function getClient() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null;
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDR  = () => process.env.MAIL_FROM    || 'onboarding@resend.dev';
const NOTIFY_TO  = () => process.env.NOTIFY_EMAIL || 'loaiy.adel@gmail.com';

function cairoTime(date) {
  return new Date(date || Date.now()).toLocaleString('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday:  'long',
    year:     'numeric',
    month:    'long',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
  }) + ' · Cairo';
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared layout shell — wraps both emails
   ───────────────────────────────────────────────────────────────────────────── */
function shell(content) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Loaiy Adel</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#eef2f7;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%">
        ${content}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ═════════════════════════════════════════════════════════════════════════════
   EMAIL 1 — New-message notification to Loaiy
   ═════════════════════════════════════════════════════════════════════════════ */
async function sendNewMessageNotification({ name, email, subject, body, createdAt }) {
  const client = getClient();
  if (!client) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping notification email');
    return;
  }

  const subj    = subject || '(no subject)';
  const dateStr = cairoTime(createdAt);

  const html = shell(`

    <!-- ── Header ── -->
    <tr><td style="background:#0c1a2e;border-radius:12px 12px 0 0;padding:28px 36px">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td>
            <!-- Brand mark -->
            <span style="display:inline-block;width:40px;height:40px;border-radius:10px;
                         background:linear-gradient(135deg,#0272c0,#0ea5e9);
                         text-align:center;line-height:40px;
                         font-size:16px;font-weight:800;color:#fff;
                         font-family:-apple-system,Arial,sans-serif;
                         vertical-align:middle;margin-right:12px">LA</span>
            <span style="color:#94a3b8;font-size:13px;vertical-align:middle">Loaiy Adel · CV Dashboard</span>
          </td>
          <td align="right">
            <span style="display:inline-block;background:rgba(16,185,129,0.15);
                         color:#34d399;border:1px solid rgba(52,211,153,0.3);
                         border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600">
              ● New Message
            </span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── Blue accent strip ── -->
    <tr><td style="background:linear-gradient(90deg,#0272c0,#0ea5e9);height:3px"></td></tr>

    <!-- ── Sender card ── -->
    <tr><td style="background:#fff;padding:32px 36px 0">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <!-- Avatar -->
          <td width="56" valign="top" style="padding-right:16px">
            <div style="width:52px;height:52px;border-radius:50%;
                        background:linear-gradient(135deg,#0272c0 0%,#7c3aed 100%);
                        text-align:center;line-height:52px;
                        font-size:20px;font-weight:700;color:#fff;
                        font-family:-apple-system,Arial,sans-serif">
              ${name.charAt(0).toUpperCase()}
            </div>
          </td>
          <td valign="top">
            <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:#0f172a">${name}</p>
            <p style="margin:0;font-size:14px;color:#64748b">${email}</p>
          </td>
          <td align="right" valign="top">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:right">${dateStr}</p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── Meta row ── -->
    <tr><td style="background:#fff;padding:20px 36px">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tr>
          <td style="padding:14px 20px;border-right:1px solid #e2e8f0;width:33%">
            <p style="margin:0 0 3px;font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:.07em;color:#94a3b8">Subject</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b">${subj}</p>
          </td>
          <td style="padding:14px 20px;border-right:1px solid #e2e8f0;width:33%">
            <p style="margin:0 0 3px;font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:.07em;color:#94a3b8">Reply to</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#0272c0">${email}</p>
          </td>
          <td style="padding:14px 20px;width:33%">
            <p style="margin:0 0 3px;font-size:11px;font-weight:700;text-transform:uppercase;
                      letter-spacing:.07em;color:#94a3b8">Via</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b">CV Contact Form</p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── Message body ── -->
    <tr><td style="background:#fff;padding:0 36px 32px">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                letter-spacing:.07em;color:#94a3b8">Message</p>
      <div style="background:#f8fafc;border-left:3px solid #0272c0;
                  border-radius:0 8px 8px 0;padding:20px 24px">
        <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.8;white-space:pre-wrap">${body}</p>
      </div>
    </td></tr>

    <!-- ── Action buttons ── -->
    <tr><td style="background:#fff;padding:0 36px 32px;text-align:center">
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto">
        <tr>
          <td style="padding-right:12px">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subj)}"
               style="display:inline-block;background:#0272c0;color:#fff;text-decoration:none;
                      padding:13px 28px;border-radius:8px;font-size:14px;font-weight:700;
                      font-family:-apple-system,Arial,sans-serif">
              Reply to ${name.split(' ')[0]} →
            </a>
          </td>
          <td>
            <a href="https://loaiy-cv-api.onrender.com/admin"
               style="display:inline-block;background:#f8fafc;color:#475569;text-decoration:none;
                      padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;
                      border:1px solid #e2e8f0;font-family:-apple-system,Arial,sans-serif">
              Admin Panel
            </a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── Footer ── -->
    <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;
                   border-radius:0 0 12px 12px;padding:18px 36px;text-align:center">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
        This notification was generated automatically by your CV contact form.<br>
        <a href="https://loaiy-cv-api.onrender.com/admin" style="color:#0272c0;text-decoration:none">loaiy-cv-api.onrender.com/admin</a>
      </p>
    </td></tr>

  `);

  const { error } = await client.emails.send({
    from:     `Loaiy Adel CV <${FROM_ADDR()}>`,
    to:       [NOTIFY_TO()],
    reply_to: email,
    subject:  `📬 ${name} sent you a message — "${subj}"`,
    html,
    text: `New message from ${name} <${email}>\nSubject: ${subj}\nReceived: ${dateStr}\n\n${body}\n\n---\nAdmin: https://loaiy-cv-api.onrender.com/admin`,
  });

  if (error) throw new Error(`Resend notification error: ${error.message}`);
  console.log(`📧 Notification sent to ${NOTIFY_TO()} (from ${email})`);
}

/* ═════════════════════════════════════════════════════════════════════════════
   EMAIL 2 — Auto-reply to the contact form sender
   ═════════════════════════════════════════════════════════════════════════════ */
async function sendAutoReply({ name, email, subject }) {
  const client = getClient();
  if (!client) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping auto-reply');
    return;
  }

  const firstName = name.split(' ')[0];

  const html = shell(`

    <!-- ── Hero header ── -->
    <tr><td style="border-radius:12px 12px 0 0;overflow:hidden;
                   background:linear-gradient(160deg,#0c1a2e 0%,#0d2040 60%,#0f2850 100%);
                   padding:40px 36px 36px">

      <!-- Brand monogram -->
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px">
        <tr>
          <td style="width:52px;height:52px;border-radius:12px;
                     background:linear-gradient(135deg,#0272c0,#0ea5e9);
                     text-align:center;line-height:52px;
                     font-size:20px;font-weight:800;color:#fff;
                     font-family:-apple-system,Arial,sans-serif">LA</td>
        </tr>
      </table>

      <!-- Name + title -->
      <h1 style="margin:0 0 6px;color:#fff;font-size:26px;font-weight:800;
                 letter-spacing:-.02em;font-family:-apple-system,Arial,sans-serif">Loaiy Adel</h1>
      <p style="margin:0 0 20px;color:#7dd3fc;font-size:13px;font-weight:500;letter-spacing:.02em">
        Senior Scrum Master &nbsp;·&nbsp; Agile Coach &nbsp;·&nbsp; Transformation Consultant
      </p>

      <!-- Divider -->
      <div style="width:40px;height:2px;background:linear-gradient(90deg,#0272c0,#0ea5e9);
                  border-radius:2px;margin-bottom:20px"></div>

      <p style="margin:0;color:#94a3b8;font-size:13px">Cairo, Egypt &nbsp;·&nbsp; Available for global engagements</p>
    </td></tr>

    <!-- ── Blue accent line ── -->
    <tr><td style="background:linear-gradient(90deg,#0272c0,#0ea5e9);height:3px"></td></tr>

    <!-- ── Body ── -->
    <tr><td style="background:#fff;padding:40px 36px">

      <p style="margin:0 0 22px;font-size:16px;color:#1e293b;line-height:1.7;
                font-family:-apple-system,Arial,sans-serif">
        Hi <strong>${firstName}</strong>,
      </p>

      <p style="margin:0 0 22px;font-size:15px;color:#334155;line-height:1.8;
                font-family:-apple-system,Arial,sans-serif">
        Thank you for reaching out — I really appreciate you taking the time to get in touch.
        Your message has landed safely in my inbox, and I personally read and respond to every
        single one.
      </p>

      <!-- Highlighted promise box -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="margin-bottom:28px">
        <tr>
          <td style="background:linear-gradient(135deg,rgba(2,114,192,0.06),rgba(14,165,233,0.06));
                     border:1px solid rgba(2,114,192,0.18);border-radius:10px;padding:20px 24px">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:22px;padding-right:14px;vertical-align:top;line-height:1">⏱</td>
                <td>
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0272c0;
                             font-family:-apple-system,Arial,sans-serif">You can expect a reply within</p>
                  <p style="margin:0;font-size:22px;font-weight:800;color:#0c1a2e;
                             font-family:-apple-system,Arial,sans-serif">1 – 2 business days</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 32px;font-size:15px;color:#334155;line-height:1.8;
                font-family:-apple-system,Arial,sans-serif">
        While you wait, feel free to browse my full profile or connect with me on LinkedIn —
        I'm always open to conversations about Agile transformation, coaching, and delivery leadership.
      </p>

      <!-- LinkedIn CTA -->
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:36px">
        <tr>
          <td style="border-radius:8px;background:#0272c0">
            <a href="https://www.linkedin.com/in/loaiy-adel/"
               style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;
                      color:#fff;text-decoration:none;border-radius:8px;
                      font-family:-apple-system,Arial,sans-serif">
              Connect on LinkedIn →
            </a>
          </td>
          <td style="padding-left:12px">
            <a href="https://loaiyadel-personal.github.io/Lo-coding-basecamp/1-frontend/html-css-base/"
               style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:600;
                      color:#475569;text-decoration:none;border-radius:8px;
                      border:1px solid #e2e8f0;background:#f8fafc;
                      font-family:-apple-system,Arial,sans-serif">
              View My CV
            </a>
          </td>
        </tr>
      </table>

      <!-- Signature -->
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding-right:14px;vertical-align:top">
            <div style="width:44px;height:44px;border-radius:50%;
                        background:linear-gradient(135deg,#0c1a2e,#0272c0);
                        text-align:center;line-height:44px;font-size:16px;
                        font-weight:800;color:#fff;font-family:-apple-system,Arial,sans-serif">LA</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f172a;
                      font-family:-apple-system,Arial,sans-serif">Loaiy Adel</p>
            <p style="margin:0;font-size:13px;color:#64748b;
                      font-family:-apple-system,Arial,sans-serif">
              Senior Scrum Master &amp; Agile Coach
            </p>
          </td>
        </tr>
      </table>

    </td></tr>

    <!-- ── Certifications strip ── -->
    <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 36px">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <span style="display:inline-block;margin:0 8px;font-size:12px;color:#64748b;
                         font-family:-apple-system,Arial,sans-serif">
              🏅 CSM® Certified ScrumMaster
            </span>
            <span style="display:inline-block;margin:0 8px;font-size:12px;color:#64748b;
                         font-family:-apple-system,Arial,sans-serif">
              📋 ITIL® 4 Foundation
            </span>
            <span style="display:inline-block;margin:0 8px;font-size:12px;color:#64748b;
                         font-family:-apple-system,Arial,sans-serif">
              ☁️ Capgemini Certified
            </span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── Footer ── -->
    <tr><td style="background:#0c1a2e;border-radius:0 0 12px 12px;padding:22px 36px">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td>
            <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;
                      font-family:-apple-system,Arial,sans-serif">
              <a href="mailto:loaiy.adel@gmail.com"
                 style="color:#7dd3fc;text-decoration:none">loaiy.adel@gmail.com</a>
              &nbsp;·&nbsp;
              <a href="https://www.linkedin.com/in/loaiy-adel/"
                 style="color:#7dd3fc;text-decoration:none">LinkedIn</a>
              &nbsp;·&nbsp; Cairo, Egypt
            </p>
            <p style="margin:0;font-size:11px;color:#475569;
                      font-family:-apple-system,Arial,sans-serif">
              This is an automated confirmation. Please do not reply directly to this email —
              Loaiy will reach out to you from his personal inbox.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>

  `);

  const { error } = await client.emails.send({
    from:     `Loaiy Adel <${FROM_ADDR()}>`,
    to:       [email],
    reply_to: 'loaiy.adel@gmail.com',
    subject:  `Got your message, ${firstName} — I'll be in touch soon`,
    html,
    text: `Hi ${firstName},\n\nThank you for reaching out! Your message has landed safely in my inbox and I personally read and respond to every one.\n\nYou can expect a reply within 1–2 business days.\n\nIn the meantime, feel free to connect with me on LinkedIn:\nhttps://www.linkedin.com/in/loaiy-adel/\n\nWarm regards,\nLoaiy Adel\nSenior Scrum Master · Agile Coach · Transformation Consultant\nCairo, Egypt`,
  });

  if (error) throw new Error(`Resend auto-reply error: ${error.message}`);
  console.log(`📧 Auto-reply sent to ${email}`);
}

module.exports = { sendNewMessageNotification, sendAutoReply };
