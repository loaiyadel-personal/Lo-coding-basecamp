const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  order:        { type: Number, default: 0 },
  title:        { type: String, required: true },
  icon:         { type: String, default: '⚡' },   // emoji displayed in card icon box
  description:  { type: String, default: '' },
  deliverables: [String],                           // bullet list items shown on CV
  active:       { type: Boolean, default: true },  // toggle visibility on live CV
}, { timestamps: true });

ServiceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
