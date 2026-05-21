const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  page:        { type: String, default: '/' },
  ip:          { type: String },
  userAgent:   { type: String },
  referrer:    { type: String, default: '' },
  visitorId:   { type: String },   // stable UUID from visitor's localStorage
  isUnique:    { type: Boolean, default: false }, // first visit in 24h window
  // ── Parsed from user-agent ─────────────────────────────
  device:      { type: String },   // desktop | mobile | tablet
  browser:     { type: String },   // Chrome | Firefox | Safari | Edge | …
  os:          { type: String },   // Windows | macOS | Android | iOS | Linux | …
  // ── Geo from IP (filled async after save) ──────────────
  country:     { type: String },
  countryCode: { type: String },   // 2-letter ISO e.g. "EG"
  city:        { type: String },
  region:      { type: String },
}, { timestamps: true });

VisitSchema.index({ createdAt: 1 });
VisitSchema.index({ visitorId: 1, createdAt: 1 });  // fast dedup lookups

module.exports = mongoose.model('Visit', VisitSchema);
