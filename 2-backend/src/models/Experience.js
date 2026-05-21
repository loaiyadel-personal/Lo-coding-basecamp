const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company:     { type: String, required: true },
  logo:        { type: String },              // URL or SVG string
  logoColor:   { type: String },              // Background color for logo box
  role:        { type: String, required: true },
  location:    { type: String },
  startDate:   { type: String, required: true },  // e.g. "June 2023"
  endDate:     { type: String, default: 'Present' },
  isCurrent:   { type: Boolean, default: false },
  bullets:     [{ type: String }],            // Achievement bullet points
  order:       { type: Number, default: 0 },  // Display order (lower = newer)
}, { timestamps: true });

module.exports = mongoose.model('Experience', ExperienceSchema);
