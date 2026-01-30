const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Username
  password: { type: String, required: true }, // Password 
  role: { type: String, default: 'admin' } // 'admin' / 'user' 
});

module.exports = mongoose.model('User', UserSchema);