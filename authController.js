const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      } else {
        // Resend OTP for unverified user
        user.otp = generateOtp();
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail(user.email, 'Your OTP Resend', `Your new OTP is: ${user.otp}`);

        return res.status(200).json({ message: 'OTP resent to your email' });
      }
    }

    // New user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user = new User({ email, password: hashedPassword, otp, otpExpires });
    await user.save();

    await sendEmail(email, 'Verify your Email OTP', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    console.log("Stored OTP:", user.otp);
    console.log("Received OTP:", otp);
    console.log("Match:", user.otp === otp);
    if (!user) return res.status(400).json({ message: 'Invalid email' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) return res.status(400).json({ message: 'OTP expired' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Email verified, please login', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};
