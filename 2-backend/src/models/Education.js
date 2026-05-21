const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  degree:      { type: String, required: true },   // e.g. "BSc Computer Science"
  institution: { type: String, required: true },
  location:    { type: String },
  startYear:   { type: Number },
  endYear:     { type: Number },
  joint:       { type: Boolean, default: false },  // Joint program badge
  partner:     { type: String },                   // Partner institution name
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Education', EducationSchema);
