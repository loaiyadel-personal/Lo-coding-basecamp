const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const Message = require('../models/Message');

// Models map for dynamic CV section updates
const modelMap = {
  profile:        require('../models/Profile'),
  experience:     require('../models/Experience'),
  education:      require('../models/Education'),
  skills:         require('../models/Skill'),
  certifications: require('../models/Certification'),
  languages:      require('../models/Language'),
};

// ─── Auth ────────────────────────────────────────────────────────────────────

// POST /api/auth/login
// Body: { password }
const login = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Compare against hashed password stored in env or a simple plaintext check for dev
    const isValid = password === process.env.ADMIN_PASSWORD;

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ success: true, token });
  } catch (err) {
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
  login,
  getMessages, markRead, deleteMessage,
  updateCVItem, addCVItem, deleteCVItem,
};
