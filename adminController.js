const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 Admin Registration
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin = new Admin({ email, password: hashedPassword, role });
    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
};

// 🔐 Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, message: 'Admin login successful' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

exports.verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid email' });
    if (admin.isVerified) return res.status(400).json({ message: 'Admin already verified' });

    if (String(admin.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > admin.otpExpires) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({ message: 'Admin verified successfully', token });
  } catch (error) {
    console.error('Admin OTP verification error:', error.stack || error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// 🛡️ Protected Admin Dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    res.status(200).json({ message: `Welcome ${req.user.role} to the admin dashboard` });
  } catch (error) {
    res.status(500).json({ message: 'Error loading dashboard' });
  }
};