const jwt           = require('jsonwebtoken');
const bcrypt        = require('bcryptjs');
const Message       = require('../models/Message');
const AdminSettings = require('../models/AdminSettings');
const { sendPasswordResetEmail } = require('../services/mailer');

// Models map for dynamic CV section updates
const modelMap = {
  profile:        require('../models/Profile'),
  experience:     require('../models/Experience'),
  education:      require('../models/Education'),
  skills:         require('../models/Skill'),
  certifications: require('../models/Certification'),
  languages:      require('../models/Language'),
  services:       require('../models/Service'),
};

// ─── Auth ────────────────────────────────────────────────────────────────────

// POST /api/admin/login
const login = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

    // Check DB-stored hash first (set via password reset), fall back to env var
    let isValid = false;
    const settings = await AdminSettings.findOne().lean();
    if (settings?.passwordHash) {
      isValid = await bcrypt.compare(password, settings.passwordHash);
    } else {
      isValid = password === process.env.ADMIN_PASSWORD;
    }

    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid password' });

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/forgot-password  (public)
const forgotPassword = async (req, res, next) => {
  try {
    const resetToken = jwt.sign({ role: 'reset' }, process.env.JWT_SECRET, { expiresIn: '30m' });
    await sendPasswordResetEmail(resetToken);
    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/reset-password  (public, token in body)
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'reset') throw new Error('Invalid token type');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await AdminSettings.findOneAndUpdate({}, { passwordHash }, { upsert: true, new: true });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }
    next(err);
  }
};

// ─── Messages ────────────────────────────────────────────────────────────────

// GET /api/admin/messages
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/messages/:id/read
const markRead = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/messages/:id
const deleteMessage = async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── CV Section Updates ───────────────────────────────────────────────────────

// PUT /api/admin/cv/:section/:id  — update a single document
const updateCVItem = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    const Model = modelMap[section];

    if (!Model) {
      return res.status(400).json({ success: false, message: `Unknown section: ${section}` });
    }

    const updated = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/cv/:section  — add a new item to a section
const addCVItem = async (req, res, next) => {
  try {
    const { section } = req.params;
    const Model = modelMap[section];

    if (!Model) {
      return res.status(400).json({ success: false, message: `Unknown section: ${section}` });
    }

    const item = await Model.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/cv/:section/:id
const deleteCVItem = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    const Model = modelMap[section];

    if (!Model) {
      return res.status(400).json({ success: false, message: `Unknown section: ${section}` });
    }

    await Model.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login, forgotPassword, resetPassword,
  getMessages, markRead, deleteMessage,
  updateCVItem, addCVItem, deleteCVItem,
};
