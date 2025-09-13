const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const findOrCreate = require('mongoose-findorcreate'); // ✅ Optional plugin if needed

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },

  // 🛡️ Role-based access
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },

  avatar: { type: String },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Method to compare password
AdminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Optional plugin
AdminSchema.plugin(findOrCreate);

// ✅ Export the compiled model
module.exports = mongoose.model('Admin', AdminSchema);