const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  page:       { type: String, default: '/' },
  ip:         { type: String },
  userAgent:  { type: String },
  referrer:   { type: String, default: '' },
  visitorId:  { type: String },   // stable UUID from visitor's localStorage
  isUnique:   { type: Boolean, default: false }, // first visit in 24h window
}, { timestamps: true });

VisitSchema.index({ createdAt: 1 });
VisitSchema.index({ visitorId: 1, createdAt: 1 });  // fast dedup lookups

module.exports = mongoose.model('Visit', VisitSchema);
