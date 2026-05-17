const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // We will NEVER save the real password here, only the scrambled hash!
});

module.exports = mongoose.model('Admin', adminSchema);