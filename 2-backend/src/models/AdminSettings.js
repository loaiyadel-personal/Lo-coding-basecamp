const mongoose = require('mongoose');
const schema = new mongoose.Schema({ passwordHash: String }, { timestamps: true });
module.exports = mongoose.model('AdminSettings', schema);
