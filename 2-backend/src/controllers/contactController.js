const Message = require('../models/Message');

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

    const message = await Message.create({
      name,
      email,
      subject,
      body,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Message received — thank you!',
      id: message._id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitMessage };
