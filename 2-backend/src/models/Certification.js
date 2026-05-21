const mongoose = require('mongoose');

const CertificationSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  issuer:       { type: String, required: true },
  issueDate:    { type: String },              // e.g. "Nov 2025"
  expiryDate:   { type: String },
  credentialUrl:{ type: String },
  logo:         { type: String },              // URL of issuer logo
  order:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Certification', CertificationSchema);
