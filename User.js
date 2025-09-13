const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate'); // ✅ Import the plugin

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // ✅ Added username field
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String }, // ✅ Added phone number field
  googleId: { type: String },
  avatar: { type: String },
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Attach the plugin to the schema
UserSchema.plugin(findOrCreate);

// ✅ Export the compiled model
module.exports = mongoose.model('User', UserSchema);