const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  page:      { type: String, default: '/' },
  ip:        { type: String },
  userAgent: { type: String },
  referrer:  { type: String },
}, { timestamps: true });

// Index for fast date-range queries
VisitSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Visit', VisitSchema);
