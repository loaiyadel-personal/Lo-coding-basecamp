const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, lowercase: true, trim: true },
  subject:   { type: String, trim: true },
  body:      { type: String, required: true, trim: true },
  ip:        { type: String },
  read:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
