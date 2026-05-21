const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  name:        { type: String, required: true },   // e.g. "Arabic"
  level:       { type: String, required: true },   // e.g. "Native" / "C2/Professional"
  proficiency: { type: Number, min: 1, max: 5 },   // Numeric score for dot display
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Language', LanguageSchema);
