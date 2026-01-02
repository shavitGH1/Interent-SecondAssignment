const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    sender_id: { type: Number, required: true, unique: true },
    content: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
