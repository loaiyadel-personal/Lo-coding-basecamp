const Message = require('../models/Message');
const { sendNewMessageNotification, sendAutoReply } = require('../services/mailer');

// POST /api/contact
const submitMessage = async (req, res, next) => {
  try {
    const { name, email, subject, body } = req.body;

    // Basic validation
    if (!name || !email || !body) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and body are required',
      });
    }

    // 1. Save to DB
    const message = await Message.create({
      name,
      email,
      subject,
      body,
      ip: req.ip,
    });

    // 2. Respond immediately — don't make the user wait for emails
    res.status(201).json({
      success: true,
      message: 'Message received — thank you!',
      id: message._id,
    });

    // 3. Fire both emails in the background (non-blocking)
    //    Errors are caught and logged so a mail failure never affects the API.
    Promise.allSettled([
      sendNewMessageNotification({
        name,
        email,
        subject,
        body,
        createdAt: message.createdAt,
      }),
      sendAutoReply({ name, email, subject }),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const label = i === 0 ? 'Notification' : 'Auto-reply';
          console.error(`❌ ${label} email failed:`, r.reason?.message || r.reason);
        }
      });
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { submitMessage };
