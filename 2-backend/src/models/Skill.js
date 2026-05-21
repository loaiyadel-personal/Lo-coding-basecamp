const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  category: { type: String, required: true },  // e.g. "Agile & Delivery Frameworks"
  items:    [{ type: String }],                // e.g. ["Scrum", "SAFe", "LeSS"]
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
