const mongoose = require('mongoose');

const StatSchema = new mongoose.Schema({
  value: { type: String, required: true },  // e.g. "11+"
  label: { type: String, required: true },  // e.g. "Years Experience"
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  title:      { type: String, required: true },   // Main role headline
  subtitle:   { type: String },                    // Secondary role line
  bio:        { type: String, required: true },
  phone:      { type: String },
  email:      { type: String },
  location:   { type: String },
  linkedin:   { type: String },
  statusChip:  { type: String },                    // e.g. "Open to Senior Agile & Delivery Roles"
  contactNote: { type: String },                    // Subtitle shown in the contact section
  photo:       { type: String },                    // URL or base64
  stats:       [StatSchema],
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
